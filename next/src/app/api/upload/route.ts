import { env } from "@/lib/env";
import axios from "axios";
import { log } from "console";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
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
    if (!session) {
        return new NextResponse("no session", {status: 500})
    }
    
    axios.post(`${env.FLASK_URL}/react_uploads`, await req.formData())
    return new NextResponse("ok")
}