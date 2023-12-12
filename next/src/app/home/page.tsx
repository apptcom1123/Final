import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import "./Home.css"

export default async function Home() {

    const session = await getServerSession()
    if (!session) {
        redirect("/")
    }

    return (
        
        <div className="home">
            
        </div>
        
    )
}