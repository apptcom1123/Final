import { env } from "@/lib/env";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import {NextResponse} from "next/server"

export async function POST(req:NextRequest, _res:NextResponse) {

    const session = await getServerSession()
    if (!session) { return new NextResponse("no session") }

    return new NextResponse("ok")
}

export async function GET() {

    const session = await getServerSession()
    if (!session) { return new NextResponse("no session") }

    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const db = client.db("wp_final")
    const collection = db.collection("data")
    const data = await collection.find().toArray()

    return NextResponse.json(data)
}