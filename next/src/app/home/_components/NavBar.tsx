'use client'
import { signOut, useSession } from "next-auth/react"
import {FaRegCircleUser, FaRobot} from "react-icons/fa6"
import { RxExit } from "react-icons/rx";
import { IoMenu, IoClose } from "react-icons/io5";
import "./NavBar.css"
import NavLink from "./NavLink";
import { useEffect, useState } from "react";
import setTheme from "@/lib/changeTheme";

export function NavBar() {

    const session = useSession()
    const [open, setOpen] = useState(false)
    
    const closeNav = () => { setOpen(false) }
    const openNav = () => { setOpen(true) }
    const isOpen = () => { return  (open ? "open" : "close") }

    useEffect(()=>{
        const theme = localStorage.getItem("theme")
        if (theme === "dark") {
            setTheme("dark")
        } else {
            setTheme("light")
        }

    }, [])

    return (
        <>
            <div className={`black ${isOpen()}`}>
                <div className="touchtoclose" onClick={closeNav}>Touch to close nav bar</div>
            </div>
            <div className="nav-head">
                <span className="menu" onClick={openNav}><IoMenu /></span>
                <div className="navlogo">
                    <h1>AI Cover<span><FaRobot /></span></h1>
                </div>
            </div>
            <nav className={`${isOpen()}`} id="nav">
                <div className="navlogo">
                    <h1>AI Cover<span><FaRobot /></span></h1>
                </div>
                <div className="navlist">
                    <NavLink href={"/home"}  onClick={closeNav}>Home</NavLink>
                    <NavLink href={"/home/upload"} onClick={closeNav}>Upload</NavLink>
                    <NavLink href={"/home/history"} onClick={closeNav}>History</NavLink>
                    <NavLink href={"/home/profile"} onClick={closeNav}>Profile</NavLink>
                </div>
                <div className="signOut">
                    <span><span><FaRegCircleUser /></span>{session.data?.user?.name}</span>
                    <button onClick={()=>{signOut()}}><span><RxExit /></span></button>
                </div>
            </nav>
        </>
    )
}