import { env } from "@/lib/env";
import { MongoClient, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import {NextResponse} from "next/server"

export async function POST() {

    const session = await getServerSession()
    if (!session) { return new NextResponse("no session") }

    return new NextResponse("ok")
}

export async function GET(req:NextRequest) {

    const session = await getServerSession()
    if (!session || !session.user?.email) { return new NextResponse("no session") }
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const db = client.db("wp_final")
    const collection = db.collection("data")
    const action = req.nextUrl.searchParams.get("action")
    if (action=="getAll") {
        const data = await collection.find({"userEmail": `${session.user.email}`}).toArray()
        await client.close()
        return NextResponse.json(data)
    }
    else if (action=="getOne") {
        const docID = req.nextUrl.searchParams.get("docID")
        const data = await collection.findOne({"docID": `${docID}`})
        await client.close()
        return NextResponse.json(data)
    }
    return new NextResponse("unknown action")
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession()
    if (!session || !session.user?.email) { return new NextResponse("no session") }

    const action = req.nextUrl.searchParams.get("action")
    if (!action) { return new NextResponse("no action type provided") }

    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const db = client.db("wp_final")
    const collection = db.collection("data")
    const userEmail = session.user.email

    if (action === "deleteOne") {
        const docID = req.nextUrl.searchParams.get("docID")
        const _id = req.nextUrl.searchParams.get("_id")
        if (!docID || !_id) { return new NextResponse("no docID or _id") }
        collection.deleteOne({
            "_id": new ObjectId(_id),
            userEmail,
            docID,
        }).then(async ()=>{
            await client.close()
            return new NextResponse("OK")
        })
    }
    return new NextResponse("unknown action")
}