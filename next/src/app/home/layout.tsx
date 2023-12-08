import { NavBar } from "./_components/NavBar"

export default function Layout({children}:{children: React.ReactNode}) {
    return (
        <main>
            <NavBar />
            {children}
        </main>
    )
}