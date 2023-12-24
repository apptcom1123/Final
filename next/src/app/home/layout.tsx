import { getServerSession } from "next-auth"
import { NavBar } from "./_components/NavBar"
import "./layout.css"
import { redirect } from "next/navigation"

export default async function Layout({children}:{children: React.ReactNode}) {
    const session = await getServerSession()
    if (!session) {
        redirect("/")
    }
    return (
        <main>
            <NavBar />
            <div className="main">
                {children}
            </div>
        </main>
    )
}