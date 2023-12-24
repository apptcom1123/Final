'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"


export default function NavLink({href, children, onClick}: {href: string, children: React.ReactNode, onClick: ()=>void}) {

    const path = usePathname()
    console.log(path);
    
    const active = () => {
        if (path===href) {
            return "active"
        }
        return ""
    }

    return (
        <Link href={href} className={active()} onClick={onClick}>{children}</Link>
    )
}