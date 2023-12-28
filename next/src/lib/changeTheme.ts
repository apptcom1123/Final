

export default function setTheme(params: string) {
    if (params === "dark") {
        document.documentElement.style.setProperty("--text-color", "white")
        document.documentElement.style.setProperty("--main-background-color", "var(--gunmetal-color)")
        document.documentElement.style.setProperty("--doc-background-color", "var(--onyx-color)")
        document.documentElement.style.setProperty("--border-outline", "5px solid #F2F2F2")
    } else {
        document.documentElement.style.setProperty("--text-color", "black")
        document.documentElement.style.setProperty("--main-background-color", "#F2F2F2")
        document.documentElement.style.setProperty("--doc-background-color", "white")
        document.documentElement.style.setProperty("--border-outline", "none")
    }
}