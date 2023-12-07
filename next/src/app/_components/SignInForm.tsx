'use client'

import { signIn } from "next-auth/react"

export function SignInForm() {

    const handleClick = () => {
        signIn("github", {
            callbackUrl: "/home"
        })
    }

    return (
        <div className="signIn">
            <button onClick={handleClick}>Github</button>
        </div>
    )

}