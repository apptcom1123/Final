'use client'
import { signOut, useSession } from "next-auth/react"
import {FaRegCircleUser, FaRobot} from "react-icons/fa6"
import { RxExit } from "react-icons/rx";
import "./NavBar.css"
import Link from "next/link";

export function NavBar() {

    const session = useSession()

    return (
        <nav>
            <div className="navlogo">
                <h1>AI Cover<span><FaRobot /></span></h1>
            </div>
            <div className="navlist">
                <span><Link href={"/"}>Overview</Link></span>
                <span><Link href={"/"}>Upload</Link></span>
                <span><Link href={"/"}>History</Link></span>
                <span><Link href={"/"}>Profile</Link></span>
            </div>
            <div className="signOut">
                <span><span><FaRegCircleUser /></span>{session.data?.user?.name}</span>
                <button onClick={()=>{signOut()}}><span><RxExit /></span></button>
            </div>
        </nav>
    )
}