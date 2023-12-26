import { env } from "@/lib/env";
import axios from "axios";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import type { InsertData } from "@/lib/type";
import {NextResponse} from 'next/server'

export async function GET(_req: NextRequest, _res:NextResponse) {
    const session = await getServerSession()
    if (session) {
        return new NextResponse("ok")
    }
    return new NextResponse("no session")
}

export async function POST(req: NextRequest, _res:NextResponse) {
    const session = await getServerSession()
    if (!session || !session.user?.email) {
        return new NextResponse("no session", {status: 500})
    }

    const docID = req.nextUrl.searchParams.get("docID")
    const docName = req.nextUrl.searchParams.get("docName")
    if (!docID || !docName) {
        return new NextResponse("no docID or docName", {status: 500})
    }
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const db = client.db("wp_final")
    const collection = db.collection("data")
    const data:InsertData = {
        "userEmail": session.user.email,
        docID,
        docName,
        "done": false
    }
    await collection.insertOne(data)

    const file = await req.formData()
    axios.post(`${env.FLASK_URL}/react_uploads`, file)
    return new NextResponse("ok")
}