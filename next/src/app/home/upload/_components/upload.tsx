'use client'

import axios from "axios"
import { useRouter } from "next/navigation"
import { type ReactElement, useState } from "react"
import { MuiFileInput } from 'mui-file-input'
import {v4} from "uuid"
import { FaSpinner } from "react-icons/fa6"

export default function Upload() {

    const [file, setFile] = useState<File | null>(null)
    const [uploadText, setUploadText] = useState<string | ReactElement>("Submit")
    const router = useRouter()

    const handleSubmit = async () => {
        if (file) {
            setUploadText(<FaSpinner className="spinning-icon" />)
            const docID = v4()
            const data = new FormData()
            const docName = file.name
            data.append("file", file, `${docID}.wav `)
            console.log(data);            
            axios.post(`/api/upload?docID=${docID}&docName=${docName}`, data).then(()=>{router.push(`/home/history/${docID}`)}).catch(err => alert(err));
        }
    }

    return (
        <div>
            <h1>Upload file</h1>
            <MuiFileInput className="file-input" placeholder="Upload a .wav file" value={file} onChange={(e)=>setFile(e)} />
            {(()=>{
                if (file) {
                    return <button className="submit" onClick={handleSubmit}>{uploadText}</button>
                }
            })()}
        </div>  
    )
}