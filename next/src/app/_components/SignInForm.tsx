'use client'

import { signIn } from "next-auth/react"
import { FaRegCircleUser } from "react-icons/fa6";

export function SignInForm() {

    const handleClick = () => {
        signIn("github", {
            callbackUrl: "/home"
        })
    }

    return (
        
        <div className="signIn">
            <span id="icon">
                <FaRegCircleUser />
            </span>
            Sign In
            <button onClick={handleClick}>Github</button>
        </div>
        
    )

}