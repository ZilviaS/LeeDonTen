import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminManage(){

    const API = import.meta.env.VITE_API

    const navigate = useNavigate()

    const [ requestInfo, setRequestInfo ] = useState([])

    const [ errorLog, setErrorLog ] = useState('')

    const handleLogout = ()=>{
        localStorage.removeItem('token')
        navigate('/')
    }

    const statusHandle = (status)=>{
        switch (status){
            case 0:
                return <p className="text-yellow-700 font-semibold">pending</p>
            case 1:
                return <p className="text-green-700 font-semibold">success</p>
            case 2:
                return <p className="text-red-700 font-semibold">reject</p>
            default:
                return null
        }
    }

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
            if (!(res.ok && data.role == 'Admin')){
                navigate('/')
            }
        } 
        handleRoleCheck()
        
    },[])

    const paymentStatusHandle = (status)=>{
        switch (status){
            case 0:
                return <p>Krungsri</p>
            case 1:
                return <p>Kasikorn</p>
            case 2:
                return <p>Krungthai</p>
            case 3:
                return <p>SCB</p>
            case 4:
                return <p>PromptPay</p>
        }
    } 

    const RequestGrantedHandle = async(Id)=>{
        const token = localStorage.getItem("token")
        const res = await fetch(`${API}/api/withdraw/${Id}/success`,{
            method : 'POST',
            headers : {
                'Authorization' : `Bearer ${token}`
            }
        })
        if(res.ok){
            window.location.reload()
        }else{
            const data = await res.json()
            console.log(data)
            setErrorLog(data.message)
        }
    }

    useEffect(()=>{
        const handleRequest = async ()=>{
            const token = localStorage.getItem("token")
            const res = await fetch(`${API}/api/withdraw/all`,{
                method : 'GET',
                headers : {
                    'Authorization' : `Bearer ${token}`
                }
            })
            const data = await res.json()
            if(res.ok){
                setRequestInfo(data)
                console.log(data)
            }
        } 
        handleRequest()
    },[])

    return (
        <>
            <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='w-[70%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2 items-center'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                        <div>
                            <button onClick={handleLogout} className="items-baseline text-sm text-red-900 hover:cursor-pointer">ลงชื่อออก</button>
                        </div>
                    </div>
                    <div className='h-[80%] bg-white flex-col flex items-center'>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>ระบบจัดการ Request (Admin)</p>
                        </div>
                        <div className="flex justify-center">
                            <p>{errorLog}</p>
                        </div>
                        <div className="flex justify-between h-100">
                            <div className="overflow-y-scroll">
                                <table>
                                    <thead>
                                        <td className="px-2 border-1 text-sm">รหัสคำขอ</td>
                                        <td className="px-2 border-1 text-sm">รูปแบบธุรกรรม</td>
                                        <td className="px-2 border-1 text-sm">ขื่อผู้ใช้</td>
                                        <td className="px-2 border-1 text-sm">บัญชี</td>
                                        <td className="px-2 border-1 text-sm">ชื่อ</td>
                                        <td className="px-2 border-1 text-sm">ยอดการถอน</td>
                                        <td className="px-2 border-1 text-sm">วันที่</td>
                                        <td className="px-2 border-1 text-sm">สถานะ</td>
                                        <td className="px-2 border-1 text-sm"></td>
                                    </thead>
                                    <tbody>
                                        {requestInfo.map((item)=>(
                                            <tr key={item.id}>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{item.id}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{item.userName}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{paymentStatusHandle(item.paymentOption)}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{item.accountNumber}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{item.accountName}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{item.amount} บาท</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">{statusHandle(item.status)}</td>
                                                <td className="text-right bg-white border-1 px-1 text-sm">
                                                    {item.status == 0 ? <>
                                                        <div className="flex gap-2">
                                                            <button onClick={()=>{RequestGrantedHandle(item.id)}} className="bg-green-500 text-sm text-white rounded px-1 my-1 hover:cursor-pointer">อนุมัติ</button>
                                                            <button className="bg-red-500 text-sm text-white rounded px-1 my-1 hover:cursor-pointer">ปฏิเสธ</button>
                                                        </div> 
                                                    </> : <></>}

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div>

                            </div>
                        </div>
                        
                        <div className='w-full flex justify-center gap-3 mb-3'>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/policy">นโยบายข้อมูลส่วนบุคคล</a>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/terms">ข้อตกลงการใช้งาน</a>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default AdminManage