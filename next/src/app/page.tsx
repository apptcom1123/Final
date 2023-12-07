import { getServerSession } from "next-auth"
import { SignInForm } from "./_components/SignInForm"
import { redirect } from "next/navigation"

export default async function Home() {

  const session = await getServerSession()
  if (session) {
    redirect("/home")
  }

  return (
    <div className="signIn">
      Sign In
      <SignInForm />
    </div>
  )
}