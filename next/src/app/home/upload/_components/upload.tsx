'use client'

import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {v4} from "uuid"

export default function Upload() {

    const [file, setFile] = useState<File | null>(null)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (file) {
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
            <input type="file" accept=".wav" onChange={handleChange} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}