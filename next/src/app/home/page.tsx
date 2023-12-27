import Link from "next/link"
import "./Home.css"

export default async function Home() {

    return (
        
        <div className="home">
            <div>
                <h1>AI歌手翻唱</h1>
                <h3>使用說明</h3>
                <p>進入<Link href={`/home/upload`}>Upload</Link>頁面上傳想要翻唱的歌曲，上傳成功後便可以調整參數進行轉換，並下載至你的設備。</p>
                <p>若想要管理之前的上傳紀錄，可以到<Link href={`/home/history`}>History</Link>查看並編輯。</p>
            </div>
        </div>
        
    )
}