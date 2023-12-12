import { NavBar } from "./_components/NavBar"
import "./layout.css"

export default function Layout({children}:{children: React.ReactNode}) {
    return (
        <main>
            <NavBar />
            <div>
                {children}
            </div>
        </main>
    )
}