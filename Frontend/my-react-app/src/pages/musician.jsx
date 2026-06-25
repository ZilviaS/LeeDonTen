import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"

function Musician(){

    const API = import.meta.env.VITE_API
    const navigate = useNavigate()
    const [ user , setUser ] = useState({
        Username : "",
        UserId : ""
    })
    const [ donateStatus , setDonateStatus ] = useState()

    const handleDonationStatus = async()=>{
        const token = localStorage.getItem('token')
        if(!token){
            navigate('/login')
        }
        const res = await fetch(`${API}/api/user/donation/toggle`,{
            method : 'PUT',
            headers : {
                'Authorization' : `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok){
            console.log(data.message)
        }else{
            setDonateStatus(data.isOpenDonation)
        }
        
    }

    useEffect(()=>{
        const token = localStorage.getItem('token')
        const getConnectionStatus = async()=>{
            if (user){
                const res = await fetch(`${API}/api/user/donation`,{
                    method : 'GET',
                    headers : {
                        'Authorization' : `Bearer ${token}`
                    }
                })
                const data = await res.json()
                console.log(data)
                if (!res.ok){
                    console.log(data.message)
                }else{
                    setDonateStatus(data.isOpenDonation)
                }
            }
        }
        if(token){
            getConnectionStatus()
        }
    },[])

    useEffect(()=>{
        const token = localStorage.getItem('token')
        if (!token){
            navigate('/login')
        }else{
            try{
                const decode = jwtDecode(token)
                console.log(decode)
                setUser({
                    Username : decode["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                    UserId : decode["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
                })
            }catch{
                console.log('error token missing')
            }
        }
    },[])

    useEffect(()=>{
        const token = localStorage.getItem('token')
        const handleRoleCheck = async ()=>{
            const res = await fetch(`${API}/api/user/role`,{
                method : 'GET',
                headers : {
                    'Authorization' : `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok && data.role == 'Admin'){
                navigate("/admin")
            }
        } 
        handleRoleCheck()
        
    },[user])

    

    const handleLogout = ()=>{
        localStorage.removeItem('token')
        navigate('/')
    }

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='w-[70%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    {user?  <>
                        <div className='h-[80%] bg-white p-3 flex flex-col justify-between'>
                            <div className="w-full flex gap-2 items-baseline justify-between">
                                <div className="flex ">
                                    <div className="flex items-center gap-1 mx-1">
                                        <button className={`toggle-btn ${donateStatus ? "toggled" : ""}`} onClick={()=> handleDonationStatus()}>
                                            <div className="thumb"></div>
                                        </button>
                                        <p className={`text-xs ${donateStatus? "text-green-500" : "text-gray-500"}`}>{donateStatus? "เปิดรับ Donate" : "ปิดรับ Donate"}</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="KoHo">สวัสดีคุณ,</p>
                                    <p className="KoHo text-2xl">{user.Username}</p>
                                    <button onClick={handleLogout} className="underline text-sm hover:cursor-pointer hover:text-red-600">logout</button>
                                </div>
                                
                            </div>
                            <div className="w-full items-center pb-5">
                                <p className="w-full text-center KoHo text-3xl font-semibold">หน้าต่างใช้งาน</p>
                                <div className="flex justify-center w-full mt-5">
                                    <div className="grid gap-3">
                                        <a href="/musician/donation" className="text-center bg-green-500 hover:bg-green-700 hover:cursor-pointer rounded px-3 py-2 text-white">เปิดการ donate</a>
                                        <a href={`/user/${user.Username}/account`} className="text-center bg-red-500 hover:bg-red-700 hover:cursor-pointer px-3 py-2 text-white rounded">จัดการบัญชี</a>
                                        <a href={`/user/${user.Username}/history`} className="text-center bg-yellow-500 hover:bg-yellow-700 hover:cursor-pointer rounded px-3 py-2 text-white">ประวัติการ Donate</a>
                                        <a href={`/user/${user.Username}/account`} className="text-center bg-blue-500 hover:bg-blue-700 hover:cursor-pointer px-3 py-2 text-white rounded" >วิธีการใช้งาน LeeDonTen</a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex">
                                <a href="/contact" className="KoHo text-gray-500 text-sm items-baseline hover:underline">ติดต่อ LeeDonTen</a>
                            </div>
                        </div>
                    </> : <>
                        <div className='h-[80%] bg-white flex-col flex items-center justify-center'>
                            <div className='flex justify-center pb-5'>
                                <p className='KoHo font-semibold text-2xl'>มีบัญชีผู้ใช้รึยัง?</p>
                            </div>
                            <div className="w-full flex justify-center gap-3 items-center pb-5">
                                <a href="/login" className='roboto-mono bg-blue-500 hover:bg-blue-700 text-center px-5 py-1 rounded text-white hover:cursor-pointer'>เข้าสู่ระบบ</a>
                                <p className="KoHo">หรือ</p>
                                <a href="/register" className='roboto-mono bg-pink-500 text-center hover:bg-pink-700 px-5 py-1 rounded text-white hover:cursor-pointer'>สมัครสมาชิก</a>
                            </div>
                        </div>
                    </>}

                </section>
            </section>
        </>
    )
}

export default Musician