import { getServerSession } from "next-auth";
import Upload from "./_components/upload";
import { redirect } from "next/navigation";
import { SignOutButton } from "./_components/SignOutButton";

export default async function Home() {

    const session = await getServerSession()
    if (!session) {
        redirect("/")
    }

    return (
        <div className="home">
            <h1>Upload file</h1>
            <Upload />
            <SignOutButton />
        </div>
    )
}