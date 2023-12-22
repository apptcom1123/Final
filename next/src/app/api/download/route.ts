import { env } from "@/lib/env";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const session = getServerSession()
    if (!session) {return new NextResponse("no session")}

    const docID = req.nextUrl.searchParams.get("docID")
    const docName = req.nextUrl.searchParams.get("docName")
    const response = await fetch(`${env.FLASK_URL}/download/${docID}`)

    return new NextResponse(response.body, {
        headers: {
            ...response.headers,
            "content-disposition": `attachment; filename="${docName}"`
        }
    })
}