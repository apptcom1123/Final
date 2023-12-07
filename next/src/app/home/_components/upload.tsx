'use client'

import axios from "axios"
import { useState } from "react"

export default function Upload() {

    const [file, setFile] = useState<File | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (file) {
            const data = new FormData()
            data.append("file", file)
            console.log(data);            
            axios.post("/api/upload", data).then(()=>{console.log("ok")}).catch(err => alert(err));
        }
    }

    return (
        <div>
            <input type="file" onChange={handleChange} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}