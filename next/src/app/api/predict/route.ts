import { env } from "@/lib/env";
import axios from "axios";
import { log } from "console";
import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    const session = getServerSession()
    if (!session) {return new NextResponse("no session")}
    
    const docID = req.nextUrl.searchParams.get("docID")
    const tone = req.nextUrl.searchParams.get("tone")
    const f0 = req.nextUrl.searchParams.get("f0")

    if (docID === "" || tone === "" || f0 === "") {return new NextResponse("no docID/ tone/ f0")}
    axios.post(`${env.FLASK_URL}/react_predict?tone=${tone}&f0=${f0}`, {"docID": docID}).then(()=>{}).catch(err=>log(err))

    return new NextResponse("OK")
}