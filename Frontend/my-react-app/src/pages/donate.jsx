import { useParams } from "react-router-dom"
import { useEffect, useState } from 'react'
import QRCode from '../assets/Rickrolling_QR_code.png'

function Donate(){

    const API = import.meta.env.VITE_API

    const { Username } = useParams()

    const [ pageState, setPageState ] = useState('donate')

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
                setPageState('pay')
                console.log(data)
                setPaymentReference(data.reference)
            }
        }
    }

    const handlePay = async()=>{
        const payload = {
            PaymentReference : paymentReference,
            Status: 1
        }
        console.log("pay",paymentReference)
        const res = await fetch(`${API}/api/donate/webhook`,{
            method : 'POST',
            headers : {
                'content-type' : 'application/json'
            },
            body : JSON.stringify(payload)
        })
        if (res.ok){
            setPageState('success')
        }
    }

    const handleNotPay = async()=>{
        const payload = {
            PaymentReference : paymentReference,
            Status: 0
        }
        console.log("not")
        const res = await fetch(`${API}/api/donate/webhook`,{
            method : 'POST',
            headers : {
                'content-type' : 'application/json'
            },
            body : JSON.stringify(payload)
        })
        if (res.ok){
            setPageState('success')
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

    useEffect(()=>console.log(pageState),[pageState])

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='w-[70%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    {pageState == 'donate' ? <>
                        <div className='h-[80%] bg-white flex-col flex items-center'>
                            <div className='flex justify-center py-5'>
                                <p className='KoHo font-semibold text-xl'>ขอเพลงกับ ({Username})</p>
                            </div>
                            <div className='w-full grid mb-2 gap-3 justify-center'>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ชื่อคนขอเพลง*</p>
                                    <input onChange={(e)=>{setRequest({...request, DonorName : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 rounded border-1 border-gray-300'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ชื่อเพลง*</p>
                                    <input onChange={(e)=>{setRequest({...request, SongName : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 rounded border-1 border-gray-300'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>ข้อความถึงนักดนตรี</p>
                                    <textarea onChange={(e)=>{setRequest({...request, Message : e.target.value})}} type="text" className='px-1 w-full min-h-40 bg-gray-100 rounded border-1 border-gray-300'/>
                                </div>
                                <div className='w-full'>
                                    <p className='text-sm KoHo text-gray-500'>จำนวนเงิน*</p>
                                    <input value={request.Amount} onChange={(e)=>{setRequest({...request, Amount : e.target.value})}} type="number" className='px-1 w-full bg-gray-100 rounded border-1 border-gray-300'/>
                                </div>
                                <div>
                                    <p className="w-full text-red-500 text-sm">{errorLog}</p>
                                    <button onClick={handleDonate} className='roboto-mono w-80 bg-pink-500 text-center hover:bg-pink-700 px-2 py-1 rounded text-white hover:cursor-pointer'>ส่งข้อความ</button>
                                </div>
                            </div>
                            <div className='w-full flex justify-center gap-3 mb-3'>
                                <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/policy">นโยบายข้อมูลส่วนบุคคล</a>
                                <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/terms">ข้อตกลงการใช้งาน</a>
                            </div>
                        </div>
                    </> : pageState == 'success' ? <>
                        <div className='h-[80%] bg-white flex-col flex justify-center'>
                                <p className="w-full text-center text-5xl">🙏</p>
                                <p className="w-full text-center KoHo font-semibold">ขอบคุณ {request.DonorName} สำหรับการโดเนต</p>
                                <div className="w-full flex justify-center gap-2 mt-2">
                                    <button onClick={()=>{window.location.reload()}} className="px-2 py-1 bg-green-500 text-white rounded hover:cursor-pointer hover:bg-green-700">Donate ใหม่</button>
                                    <a href="/" className="px-2 py-1 bg-pink-500 text-white rounded hover:cursor-pointer hover:bg-pink-700">กลับหน้า Menu</a>
                                </div>

                        </div>
                    </> : pageState == 'pay' ?
                    <>
                        <div className='h-[80%] bg-white'>
                            <div className="flex flex-col items-center">
                                <p className="text-xl font-bold pt-5 pb-3 KoHo">QR Code</p>
                                <img className="h-50 w-50" src={QRCode} alt="" />
                                <div className="flex gap-3 mt-5">
                                    <button onClick={()=>handlePay()} className="px-4 bg-green-500 text-white rounded hover:cursor-pointer">จ่าย</button>
                                    <button onClick={()=>handleNotPay()} className="px-4 bg-red-500 text-white rounded hover:cursor-pointer">ติดใว้ก่อน</button>
                                </div>
                                
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