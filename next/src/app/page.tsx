import { getServerSession } from "next-auth"
import { SignInForm } from "./_components/SignInForm"
import {RightIntroBox} from "./_components/RightIntroBox"
import { redirect } from "next/navigation"
import './app.css'

export default async function Home() {

  const session = await getServerSession()
  if (session) {
    redirect("/home")
  }

  return (
    <main>
      <div className="Intro">
        <div className="left">
          <SignInForm />
        </div> 
        <div className="right">
          <RightIntroBox />
        </div>
      </div>
    </main>
  )
}