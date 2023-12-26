'use client'

import { Data } from "@/lib/type"
import { type ReactElement, useEffect, useState } from "react"
import { FaRegTrashCan, FaSpinner } from "react-icons/fa6";
import { FaFileDownload } from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import HistoryCard from "./HistoryCard";
import Loading from "@/app/_components/Loading";

export default function GetHistory() {
    const [history, setHistory] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    const [downloadIcon, setDownloadIcon] = useState<ReactElement>(<FaFileDownload />)
    const [deleteIcon, setDeleteIcon] = useState<ReactElement>(<FaRegTrashCan/>)

    const fetchData = async () => {
        setLoading(true);
        fetch("/api/database?action=getAll").then(res=>res.json()).then((res)=>{              
            setHistory(res)
            setLoading(false)
        }).catch(err=>alert(err))
    }

    useEffect(()=>{
        fetchData()
    }, [])

    return (
        <>
            {loading ? <Loading /> : 
            (()=>{
                if (history.length) { return (
                    <div className="history-list">
                        {history.map((item, index)=>{
                            return (
                                <>
                                    {index ? <hr className="divider" /> : ""}
                                    <HistoryCard fetchData={fetchData} item={item} />
                                </>
                            )
                        })}
                    </div>
                )} else {
                    return (
                    <div id="no-history">
                        <h1>No History Yet</h1>
                        <p>Create your cover <Link href={`/home/upload`}>HERE</Link></p>
                    </div>)
                }
            })()}
        </>
    )
}