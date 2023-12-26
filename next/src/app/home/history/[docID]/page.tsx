'use client'
import { type ReactElement, useEffect, useRef, useState } from "react"
import "./DocPage.css"
import { Data } from "@/lib/type"
import axios from "axios"
import { useRouter } from "next/navigation"
import { RiArrowGoBackFill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa6";
import Link from "next/link"
import Loading from "@/app/_components/Loading"
import { Slider, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from "@mui/material"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"

type Props = {
    params: {
        docID: string
    }
}

export default function DocPage(props: Props) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Data>()
    const [tone, setTone] = useState(0);
    const [f0state, setF0] = useState(false)
    const [regenerate, setRegenerate] = useState<string | ReactElement>("Regenerate")
    const [download, setDownload] = useState<string | ReactElement>("Download")
    const [deleteText, setDeleteText] = useState<string | ReactElement>("Delete")
    const [openRegPopup, setOpenRegPopup] = useState(false);
    const [openDownloadPopup, setOpenDownloadPopup] = useState(false)
    const [showDownload, setShowDownload] = useState("flex")
    const router = useRouter()
    const docID = useRef(props.params.docID)
    const _id = data?._id ?? ""

    const handleDeleteOne = async () => {
        
        if (confirm("Delete this project?")) {
            setDeleteText(<FaSpinner className="spinning-icon" />)
            axios.delete(`/api/database?_id=${_id}&docID=${docID.current}&action=deleteOne`).then(()=>{
                router.push("/home/history")
            }).catch(err=>alert(err))
        }
    
    }

    const fetchData = async () => {
        fetch(`/api/database?action=getOne&docID=${docID.current}`).then(res=>res.json()).then((res)=>{              
            setData(res)
            setLoading(false)
            if (res["config"]) {
                setTone(res.config.tone)
                if (res.config.f0) {setF0(true)}
            }
            if (!res["config"]) {
                setRegenerate("Generate")
                setShowDownload("none")
            }
        }).catch(err=>alert(err))
    }

    const handleDownload = async () => {
        if (!data) {return}
        setDownload(<FaSpinner className="spinning-icon" />)
        fetch(`/api/download?docID=${docID.current}&docName=${data.docName}`).then(async(res)=>{
            if (res.statusText === "not available") {
                setDownload("Download")
                setOpenDownloadPopup(true)
                throw "download is currently not available"
            }
            return res.blob()
        }).then(blob=>{
            setDownload("Download")
            const url = window.URL.createObjectURL(blob);
            const fileLink = document.createElement("a");
            fileLink.href = url;
            fileLink.download = `cover_${data.docName}`;
            document.body.appendChild(fileLink); 
            fileLink.click();
            fileLink.remove();
        }).catch(err=>alert(err))
        
    }

    const handleRegenerate = async () => {
        let f0 = 0
        if (!f0state) { f0 = 0} else { f0 = 1}
        setRegenerate(<FaSpinner className="spinning-icon" />)
        axios.post(`/api/predict?docID=${docID.current}&tone=${tone}&f0=${f0}`).then(()=>{
            setOpenRegPopup(true)
            setRegenerate("Regenerate")
            setShowDownload("flex")
        }).catch(err=>alert(err))   
    }

    useEffect(()=>{
        fetchData()
    }, [])

    return (
        <div className="docpage">
            <Dialog open={openRegPopup}>
                <DialogTitle>
                    Generating
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Generating process usually takes 30s to a couple minutes based on the file size.
                        Please wait for a moment.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={()=>setOpenRegPopup(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDownloadPopup}>
                <DialogTitle>
                    Unavailable
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {"Sorry, download is currently not available. That's because the generating process is not done / not start yet."} 
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={()=>setOpenDownloadPopup(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            {loading ? <Loading /> : (()=>{
            if (data) {
            return (
            <div className="doc-content">
                <div className="doc-goback">
                    <Link href={`/home/history`}><span><RiArrowGoBackFill /></span>Back</Link>
                </div>
                <div className="doc-head">
                    <h3>{data.docName}</h3>
                    <div>
                        <button id="delete" onClick={()=>handleDeleteOne()}>{deleteText}</button>
                        <button id="regenerate" onClick={()=>handleRegenerate()}>{regenerate}</button>
                        <button id="download" style={{display: showDownload}} onClick={()=>handleDownload()}>{download}</button>
                    </div>
                </div>
                <div className="doc-config">
                    <div id="tone">
                        <h3>Tone {`(-12~12)`}</h3>
                        <div className="slider">
                            <Slider min={-12} max={12} step={1} valueLabelDisplay="on" value={tone} onChange={(_e, value)=>{setTone(()=>{
                                if (typeof value !== "number") return 0
                                return value
                            })}} />
                        </div>
                    </div>
                    <div id="f0">
                        <h3>f0</h3>
                        <Checkbox checked={f0state} onChange={()=>{setF0((prev)=>{return !prev})}} />
                    </div>
                </div>
            </div>)
            }
            })()}
        </div>
    )
}