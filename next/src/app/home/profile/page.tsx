"use client"

import { useSession } from "next-auth/react"
import { Button } from "@mui/material"
import "./Profile.css"
import { type ReactElement, useState } from "react"
import axios from "axios"
import { FaSpinner } from "react-icons/fa6"

export default function Profile() {

    const session = useSession()
    const [clean, setClean] = useState<string | ReactElement>("CLEAN")
    const handleClean = async () => {
        if (confirm("Delete all data")) {
            setClean(<FaSpinner className="spinning-icon" />)
            axios.delete("/api/database?action=deleteAll").then(()=>{
                setClean("CLEAN")
                alert("OK")
            }).catch(err=>alert(err))
        }
    }

    return (
        <div className="profile">
            <div className="profile-des">
                <h3>{`Hello, ${session.data?.user?.name}`}</h3>
                <p>This is your profile page. Unfortunately, we have not yet decided what to put here.</p>
                <p>However, if you want to delete all of your data at once, please click the button below. We would delete the data for you.</p>
            </div>
            <div className="clean-all-data">
                <div className="clean-all-data-field">
                    <h3>DELETE ALL DATA</h3>
                    <Button variant="outlined" onClick={handleClean}>{clean}</Button>
                </div>
            </div>
        </div>
    )
}