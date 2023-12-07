'use client'

import { signOut } from "next-auth/react"

export function SignOutButton() {
    const handleClick = () => {
        signOut({callbackUrl: "/"})
    }

    return <button className="signout" onClick={handleClick}>Sign Out</button>
}