import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

//musician's menu
function Musician(){

    const API = import.meta.env.VITE_API
    const navigate = useNavigate()
    const [ user , setUser ] = useState({
        Username : "",
        UserId : ""
    })
    const [ donateStatus , setDonateStatus ] = useState()

    const [ cookieChecking , setCookieChecking] = useState(true)

    //handle user's donation status
    const handleDonationStatus = async()=>{
        const res = await fetch(`${API}/api/user/donation/toggle`,{
            method : 'PUT',
            credentials : "include"
        })
        const data = await res.json()
        if (!res.ok){
            console.log(data.message)
        }else{
            setDonateStatus(data.isOpenDonation)
        }
        
    }

    useEffect(()=>{
        // get current user's donation status
        const getConnectionStatus = async()=>{
            if (user){
                const res = await fetch(`${API}/api/user/donation`,{
                    method : 'GET',
                    credentials: "include"
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
        getConnectionStatus()
    },[])

    useEffect(()=>{
        // get user's information
        const getUser = async ()=>{
            const res = await fetch(`${API}/api/user/me`,{
                credentials : 'include'
            })
            if(!res.ok){
                navigate('/login')
                return;
            }
            const data = await res.json()
            if(data){
                setCookieChecking(false)
            }
            setUser({
                Username : data.username,
                UserId : data.userId
            })
        }
        getUser()

        //get user's role
        const handleRoleCheck = async ()=>{
            const res = await fetch(`${API}/api/user/role`,{
                method : 'GET',
                credentials : 'include'
            })
            const data = await res.json()
            if (res.ok && data.role == 'Admin'){
                navigate("/admin")
            }
        } 
        handleRoleCheck()
    },[])

    //logout
    const handleLogout = async()=>{
        const res = await fetch(`${API}/api/user/logout`,{
            method : 'POST',
            credentials : "include"
            }
        )
        if (res.ok){
            navigate('/')
        }
    }

    return(
        <>
            <section className='flex w-full justify-center pt-5  bg-[#017C7E]'>
                <section className='md:w-[70%] w-[90%] min-h-screen rounded'>
                
                    {!cookieChecking?  <>
                        <div className='h-[80%] windows flex flex-col bg-white rounded-b'>
                            <div className='flex w-full justify-between bg-[#00007D] px-2'>
                                <div>
                                    <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between h-full gap-10 p-2">
                                <div className="w-full flex gap-2 items-baseline justify-between">
                                    <div className="flex">
                                        <div className="flex items-center gap-1 mx-1">
                                            <button className={`toggle-btn ${donateStatus ? "toggled" : ""}`} onClick={()=> handleDonationStatus()}>
                                                <div className="thumb"></div>
                                            </button>
                                            <p className={`text-sm ${donateStatus? "text-white" : "text-gray-500"}`}>{donateStatus? "เปิดรับ Donate" : "ปิดรับ Donate"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="KoHo">สวัสดีคุณ,</p>
                                        {/* <a href={`/user/${user.Username}`} className="W-95 text-2xl hover:underline hover:cursor-pointer">{user.Username}</a> */}
                                        <p className="W-95 text-2xl">{user.Username}</p>
                                        <button onClick={handleLogout} className="underline W-95 text-sm hover:cursor-pointer hover:text-red-600">logout</button>
                                    </div>
                                    
                                </div>
                                <div className="w-full items-center pb-5">
                                    <p className="w-full text-center KoHo text-3xl font-semibold">หน้าต่างใช้งาน</p>
                                    <div className="flex justify-center w-full mt-5">
                                        <div className="grid gap-3">
                                            <a href="/user/donation" className="text-center windows-button W-95 bg-[#018281]  hover:cursor-pointer  px-3 py-2 text-white">หน้าต่าง Donate</a>
                                            <a href={`/user/${user.Username}/account`} className="text-center windows-button W-95 bg-red-500 hover:cursor-pointer px-3 py-2 text-white ">จัดการบัญชี</a>
                                            <a href={`/user/${user.Username}/history`} className="text-center windows-button W-95 bg-yellow-500 hover:cursor-pointer  px-3 py-2 text-white">ประวัติการ Donate</a>
                                            <a href={`/user/tutorial`} className="text-center bg-blue-500 windows-button W-95  hover:cursor-pointer px-3 py-2 text-white" >วิธีการใช้งาน LeeDonTen</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    <a href="/contact" className="KoHo text-gray-500 text-sm items-baseline hover:underline">ติดต่อ LeeDonTen</a>
                                </div>
                            </div>
                            
                        </div>
                    </> : <>
                        <div className='h-[80%] windows flex flex-col bg-white rounded-b'>
                            <div className='flex w-full justify-between bg-[#00007D] px-2'>
                                <div>
                                    <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between h-full gap-10 p-2">
                                <div className="W-95">please, wait...</div>
                            </div>
                            
                        </div>
                    </>}

                </section>
            </section>
        </>
    )
}

export default Musician