import { getServerSession } from "next-auth"
import { SignInForm } from "./_components/SignInForm"
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
          <h1>Nice to meet you!</h1>
          <p>Want an AI to cover your favorite song? Join us!</p>
        </div>
      </div>
    </main>
  )
}