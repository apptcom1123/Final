import { env } from "@/lib/env";
import { log } from "console";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const session = getServerSession()
    if (!session) {return new NextResponse("no session")}

    const docID = req.nextUrl.searchParams.get("docID")
    const docName = req.nextUrl.searchParams.get("docName")
    const response = await fetch(`${env.FLASK_URL}/download/${docID}`)

    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const db = client.db("wp_final")
    const collection = db.collection("data")
    const isAvailable = (await collection.findOne({docID}))?.done
    await client.close()

    if (isAvailable) {
        return new NextResponse(response.body, {
            headers: {
                ...response.headers,
                "content-disposition": `attachment; filename="cover_${docName}"`
            }
        })
    }

    return NextResponse.json({error: "not available"}, {  statusText: "not available"})
}