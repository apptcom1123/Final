import { getServerSession } from "next-auth";
import Upload from "./_components/upload";
import { NavBar } from "./_components/NavBar";
import { redirect } from "next/navigation";
import "./Home.css"

export default async function Home() {

    const session = await getServerSession()
    if (!session) {
        redirect("/")
    }

    return (
        
        <div className="home">
            <h1>Upload file</h1>
            <Upload />
        </div>
        
    )
}