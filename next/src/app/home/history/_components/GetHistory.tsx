'use client'

import { Data } from "@/lib/type"
import { useEffect, useState } from "react"
import { FaRegTrashCan } from "react-icons/fa6";
import { FaFileDownload } from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GetHistory() {
    const [history, setHistory] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const handleDeleteOne = async (_id:string, docID:string) => {
        setLoading(true);
        axios.delete(`/api/database?_id=${_id}&docID=${docID}&action=deleteOne`).then(()=>{
            fetchData()
        }).catch(err=>alert(err))
    }

    const fetchData = async () => {
        fetch("/api/database?action=getAll").then(res=>res.json()).then((res)=>{              
            setHistory(res)
            setLoading(false)
        }).catch(err=>alert(err))
    }

    const handleDownload = async (docID: string, docName: string) => {
        fetch(`/api/download?docID=${docID}&docName=${docName}`).then((res)=>res.blob()).then(blob=>{
            const url = window.URL.createObjectURL(blob);
            const fileLink = document.createElement("a");
            fileLink.href = url;
            fileLink.download = docName;
            document.body.appendChild(fileLink); 
            fileLink.click();
            fileLink.remove();
        }).catch(err=>alert(err))
    }

    useEffect(()=>{
        fetchData()
    }, [])

    return (
        <>
            {loading ? <div className="loader"></div> : 
            (()=>{
                if (history.length) { return (
                    <div className="history-list">
                        {history.map((item, index)=>{
                            return (
                                <>
                                    {index ? <hr className="divider" /> : ""}
                                    <div className="history-card" key={item._id}>
                                        <Link id="history-card-docName" href={`/home/history/${item.docID}`}>
                                            <span>{item.docName}</span>
                                        </Link>
                                        <div id="history-card-operation">
                                            <button id="delete" onClick={()=>{handleDeleteOne(item._id, item.docID)}}><FaRegTrashCan /></button>
                                            <button id="download" onClick={()=>handleDownload(item.docID, item.docName)}><FaFileDownload /></button> 
                                        </div>
                                    </div>
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