'use client'

import { signIn } from "next-auth/react"
import { FaRegCircleUser, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa6";
import './SignInForm.css'

export function SignInForm() {

    const handleGithub = () => {
        signIn("github", {
            callbackUrl: "/home"
        })
    }

    return (
        
        <div className="signIn">
            <span id="icon">
                <FaRegCircleUser />
            </span>
            <h3>Sign In / Sign Up</h3>
            <div className="signInWays">
                <button onClick={handleGithub}>GitHub<span><FaGithub /></span></button>
            </div>
        </div>
        
    )

}