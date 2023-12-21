'use client'

import { Data } from "@/lib/type"
import { useEffect, useState } from "react"

export default function GetHistory() {
    const [history, setHistory] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        const fetchData = async () => {
            fetch("/api/database").then(res=>res.json()).then((res)=>{              
                setHistory(res)
                setLoading(false)
            }).catch(err=>alert(err))
        }
        fetchData()
    }, [])

    return (
        <>
            <div>
                {loading ? <div className="loader"></div> : JSON.stringify(history)}
            </div>
        </>
    )
}