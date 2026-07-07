import { useParams } from "react-router-dom"
import { useEffect, useState } from 'react'
import QRCode from "react-qr-code";
import wrong from "../assets/wrong.png"
import exclamation from "../assets/exclamation.png"

function Donate(){

    const API = import.meta.env.VITE_API

    const { Username } = useParams()

    const [ pageState, setPageState ] = useState('donate')

    const [paymentUrl, setPaymentUrl] = useState("");

    const [ request, setRequest ] = useState({
        UserId : '',
        DonorName : '',
        SongName : '',
        Message : '',
        Amount : 0
    })
    
    const [ errorLog , setErrorLog ] = useState('')

    const [ paymentReference, setPaymentReference ] = useState('')

    const handleDonate = async()=>{
        if(request.UserId == null){
            setErrorLog("something went wrong")
        }else{
            const res = await fetch(`${API}/api/donate`,{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(request)
            })
            const data = await res.json()
            console.log(data)
            if(!res.ok){
                setErrorLog(data.message)
            }else{
                setPageState('pending')
                console.log(data)
                setPaymentReference(data.reference)
                setPaymentUrl(data.paymentUrl)
            }
        }
    }

    useEffect(()=>{
        const handleUserId = async()=>{
            const res = await fetch(`${API}/api/user/${Username}/id`)
            const data = await res.json()
            console.log(data)
            if (!res.ok){
                setRequest({...request , UserId : null})
                setErrorLog(data.message)
            }else{
                setRequest({...request, UserId : data.userId})
            }
        }

        handleUserId()
    },[])

    useEffect(()=>{
        if (pageState !== "pending") return;

        let count = 0

        const interval = setInterval(async ()=>{
        try {
            const res = await fetch(`${API}/api/donate/status/${paymentReference}`);

            if (!res.ok) {
                clearInterval(interval);
                return;
            }

            const data = await res.json();

            count++;

            console.log("sending : ",count)
            console.log(data)

            if (count >= 20) {
                clearInterval(interval);
                setPageState("timeout");
                return;
            }

            if (data.status == 1) {
                clearInterval(interval);
                setPageState("success");
            }

            if (data.status == 2) {
                clearInterval(interval);
                setPageState("fail");
            }

        } catch {
            clearInterval(interval);
            setPageState("error");
        }
        }, 5000);

        return () => clearInterval(interval)

    }, [ pageState, paymentReference ])

    return(
        <>
            <section className='flex w-full justify-center pt-5 windows-background'>
                <section className='md:w-[70%] w-[90%] min-h-screen'>
                    {pageState == 'donate' ? <>
                        <div className='h-[80%] bg-white flex-col flex items-center rounded-b windows'>
                            <div className='flex justify-between w-full bg-[#00007D] windows-border px-2'>
                                <div>
                                    <a className="W-95 text-xl py-0.5 font-bold text-white" href="/">LeeDonTen</a>
                                </div>
                            </div>
                            <div className='flex justify-center py-5'>
                                <p className='KoHo font-semibold text-xl'>ขอเพลงกับ ({Username})</p>
                            </div>
                            <div className='w-full grid mb-2 gap-3 justify-center'>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ชื่อคนขอเพลง*</p>
                                    <input onChange={(e)=>{setRequest({...request, DonorName : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ชื่อเพลง*</p>
                                    <input onChange={(e)=>{setRequest({...request, SongName : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ข้อความถึงนักดนตรี</p>
                                    <textarea onChange={(e)=>{setRequest({...request, Message : e.target.value})}} type="text" className='px-1 w-full min-h-40 bg-gray-100 windows-search W-95'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>จำนวนเงิน*</p>
                                    <input value={request.Amount} onChange={(e)=>{setRequest({...request, Amount : e.target.value})}} type="number" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                                </div>
                                <div>
                                    <p className="w-full text-red-500 text-sm">{errorLog}</p>
                                    <button onClick={handleDonate} className='roboto-mono w-80 bg-pink-500 text-center windows-button px-2 py-1 rounded text-white hover:cursor-pointer'>ส่งข้อความ</button>
                                </div>
                            </div>
                            <div className='w-full flex justify-center gap-3 mb-3'>
                                <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/policy">นโยบายข้อมูลส่วนบุคคล</a>
                                <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/terms">ข้อตกลงการใช้งาน</a>
                            </div>
                        </div>
                    </>  : pageState == 'pending' ?
                    <>
                        <div className='h-[80%] bg-white rounded-b'>
                            <div className="flex flex-col items-center">
                                <p className="text-xl font-bold pt-5 pb-3 KoHo">Scan to Pay</p>
                                <QRCode className="h-50 w-50" value={paymentUrl} />
                                <p>or open</p>
                                <a href={paymentUrl} className="text-sm underline hover:cursor-pointer">Open Payment Page</a>
                            </div>
                        </div>
                    </> : pageState == 'success' ? <>
                        <div className='h-[80%] bg-white flex-col flex justify-center rounded-b'>
                                <p className="w-full text-center text-5xl">🙏</p>
                                <p className="w-full text-center KoHo font-semibold">ขอบคุณ {request.DonorName} สำหรับการโดเนต</p>
                                <div className="w-full flex justify-center gap-2 mt-2">
                                    <button onClick={()=>{window.location.reload()}} className="px-2 py-1 bg-green-500 text-white windows-button hover:cursor-pointer ">Donate ใหม่</button>
                                    <a href="/" className="px-2 py-1 bg-pink-500 text-white windows-button hover:cursor-pointer ">กลับหน้า Menu</a>
                                </div>

                        </div>
                    </> : pageState == 'fail' ? <>
                        <div className='h-[80%] bg-white flex-col flex justify-center rounded-b'>
                            <div className="w-full flex justify-center">
                                <img className="w-50" src={wrong}></img>
                            </div>
                            <p className="w-full text-center KoHo mt-5 font-semibold">เกิดข้อผิดพลาด</p>
                            <div className="w-full flex justify-center gap-2 mt-2">
                                    <button onClick={()=>{window.location.reload()}} className="px-2 py-1 bg-green-500 text-white windows-button hover:cursor-pointer ">Donate ใหม่</button>
                                    <a href="/" className="px-2 py-1 bg-pink-500 text-white windows-button hover:cursor-pointer ">กลับหน้า Menu</a>
                                </div>

                        </div>
                    </> : pageState == 'timeout' ? <>
                        <div className='h-[80%] bg-white flex-col flex justify-center rounded-b'>
                            <div className="w-full flex justify-center">
                                <img className="w-50" src={exclamation}></img>
                            </div>
                            <p className="w-full text-center KoHo mt-5 font-semibold">เกิดข้อผิดพลาด หมดเวลาตรวจสอบ</p>
                            <p className="w-full text-center KoHo text-xs font-light text-red-500">*ผู้ใช้ยังสามารถจ่ายได้ตามปรกติ</p>
                            <div className="w-full flex justify-center gap-2 mt-2">
                                <button onClick={()=>{window.location.reload()}} className="px-2 py-1 bg-green-500 text-white windows-button hover:cursor-pointer ">Donate ใหม่</button>
                                <a href="/" className="px-2 py-1 bg-pink-500 text-white windows-button hover:cursor-pointer ">กลับหน้า Menu</a>
                            </div>
                        </div>
                    </> : <></>
                    }
                    
                </section>
            </section>
        </>
    )
}

export default Donate