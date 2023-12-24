'use client'
import { useEffect, useRef, useState } from "react"
import "./DocPage.css"
import { Data } from "@/lib/type"
import axios from "axios"
import { useRouter } from "next/navigation"
import { RiArrowGoBackFill } from "react-icons/ri";
import Link from "next/link"

type Props = {
    params: {
        docID: string
    }
}
export default function DocPage(props: Props) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Data>()
    const [editMode, setEditMode] = useState(false)
    const router = useRouter()
    const docID = useRef(props.params.docID)
    const _id = data?._id ?? ""

    const handleDeleteOne = async () => {
        setLoading(true);
        axios.delete(`/api/database?_id=${_id}&docID=${docID.current}&action=deleteOne`).then(()=>{
            router.push("/home/history")
        }).catch(err=>alert(err))
    }

    const fetchData = async () => {
        fetch(`/api/database?action=getOne&docID=${docID.current}`).then(res=>res.json()).then((res)=>{              
            setData(res)
            setLoading(false)
        }).catch(err=>alert(err))
    }

    const handleDownload = async () => {
        if (!data) {return}
        fetch(`/api/download?docID=${docID.current}&docName=${data.docName}`).then((res)=>res.blob()).then(blob=>{
            const url = window.URL.createObjectURL(blob);
            const fileLink = document.createElement("a");
            fileLink.href = url;
            fileLink.download = data.docName;
            document.body.appendChild(fileLink); 
            fileLink.click();
            fileLink.remove();
        }).catch(err=>alert(err))
    }

    useEffect(()=>{
        fetchData()
    }, [])

    return (
        <div className="docpage">
            {loading ? <div className="loader"></div> : (()=>{
                if (!editMode && data) {
                    return (
                    <div className="doc-content">
                        <div className="doc-goback">
                            <Link href={`/home/history`}><span><RiArrowGoBackFill /></span>Back</Link>
                        </div>
                        <div className="doc-head">
                            <h3>{data.docName}</h3>
                            <div>
                                <button id="delete" onClick={()=>handleDeleteOne()}>Delete</button>
                                <button id="regenerate">Regenerate</button>
                                <button id="download" onClick={()=>handleDownload()}>Download</button>
                            </div>
                        </div>
                    </div>)
                }
            })()}
        </div>
    )
}