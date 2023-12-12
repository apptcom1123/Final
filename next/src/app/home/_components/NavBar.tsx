'use client'
import { signOut, useSession } from "next-auth/react"
import {FaRegCircleUser, FaRobot} from "react-icons/fa6"
import { RxExit } from "react-icons/rx";
import "./NavBar.css"
import NavLink from "./NavLink";

export function NavBar() {

    const session = useSession()

    return (
        <nav>
            <div className="navlogo">
                <h1>AI Cover<span><FaRobot /></span></h1>
            </div>
            <div className="navlist">
                <NavLink href={"/home"}>Home</NavLink>
                <NavLink href={"/home/upload"}>Upload</NavLink>
                <NavLink href={"/home/history"}>History</NavLink>
                <NavLink href={"/home/profile"}>Profile</NavLink>
            </div>
            <div className="signOut">
                <span><span><FaRegCircleUser /></span>{session.data?.user?.name}</span>
                <button onClick={()=>{signOut()}}><span><RxExit /></span></button>
            </div>
        </nav>
    )
}