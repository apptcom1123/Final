'use client'

import { Data } from "@/lib/type";
import axios from "axios";
import Link from "next/link";
import { type ReactElement, useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import { FaRegTrashCan, FaSpinner } from "react-icons/fa6";

export default function HistoryCard({item, fetchData}: {
    item: Data,
    fetchData: ()=>void
}) {

    const [downloadIcon, setDownloadIcon] = useState<ReactElement>(<FaFileDownload />)
    const [deleteIcon, setDeleteIcon] = useState<ReactElement>(<FaRegTrashCan/>)

    const handleDeleteOne = async (_id:string, docID:string) => {
        if (confirm("Delete?")) {
            setDeleteIcon(<FaSpinner className="spinning-icon" />)
            axios.delete(`/api/database?_id=${_id}&docID=${docID}&action=deleteOne`).then(()=>{
                fetchData()
            }).catch(err=>alert(err))
        }
    }

    const handleDownload = async (docID: string, docName: string) => {
        setDownloadIcon(<FaSpinner className="spinning-icon" />)
        fetch(`/api/download?docID=${docID}&docName=${docName}`).then((res)=>{
            if (res.statusText === "not available") {
                setDownloadIcon(<FaFileDownload />)
                throw "download is currently not available"
            }
            return res.blob()
        }).then(blob=>{
            setDownloadIcon(<FaFileDownload />)
            const url = window.URL.createObjectURL(blob);
            const fileLink = document.createElement("a");
            fileLink.href = url;
            fileLink.download = `cover_${docName}`;
            document.body.appendChild(fileLink); 
            fileLink.click();
            fileLink.remove();
        }).catch(err=>alert(err))
    }

    return (
        <div className="history-card" key={item._id}>
            <Link id="history-card-docName" href={`/home/history/${item.docID}`}>
                <span>{item.docName}</span>
            </Link>
            <div id="history-card-operation">
                <button id="delete" onClick={()=>{handleDeleteOne(item._id, item.docID)}}>{deleteIcon}</button>
                <button id="download" onClick={()=>handleDownload(item.docID, item.docName)}>{downloadIcon}</button> 
            </div>
        </div>
    )
}