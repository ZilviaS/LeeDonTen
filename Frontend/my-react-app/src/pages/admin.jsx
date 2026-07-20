import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminManage(){

    const API = import.meta.env.VITE_API

    const navigate = useNavigate()

    const [ requestInfo, setRequestInfo ] = useState([])

    const [ errorLog, setErrorLog ] = useState('')

    const [ showRejectModel, setShowRejectModel ] = useState(false)
    const [ selectedRequestId, setSelectedRequestId ] = useState(null);
    const [ remark, setRemark ] = useState("")

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

    const RequestDeniedHandle = async(Id,remark)=>{
        const token = localStorage.getItem("token")
        const res = await fetch(`${API}/api/withdraw/${Id}/reject`,{
            method : 'POST',
            headers : {
                'Authorization' : `Bearer ${token}`,
                'content-type' : 'application/json'
            },
            body : JSON.stringify(remark)
        })

        if (res.ok){
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
            <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='w-[70%] min-h-screen'>
                    <div className='h-[80%] bg-white flex-col flex items-center windows'>
                        <div className='flex justify-between windows-border bg-[#00007D] px-2 items-center w-full'>
                            <div>
                                <a className="KoHo text-2xl font-bold text-white" href="/">LeeDonTen</a>
                            </div>
                            <div>
                                <button onClick={handleLogout} className="items-baseline text-sm text-white hover:underline hover:cursor-pointer">ลงชื่อออก</button>
                            </div>
                        </div>
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
                                                            <button onClick={()=>{RequestGrantedHandle(item.id)}} className="bg-green-500 text-sm text-white px-1 my-1 windows-button">อนุมัติ</button>
                                                            <button onClick={()=>{
                                                                setSelectedRequestId(item.id)
                                                                setShowRejectModel(true)
                                                            }} className="bg-red-500 text-sm text-white px-1 my-1 windows-button">ปฏิเสธ</button>
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
            {showRejectModel && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white w-[350px] windows border">
                            <div className="bg-[#00007D] text-white px-2 flex justify-between items-center">
                                <p className="KoHo font-bold">Reject Request</p>
                                <button onClick={()=>{setShowRejectModel(false) }} className="text-white windows-button px-1 h-7 bg-red-500"> ✕ </button>
                            </div>
                            <div className="p-4">
                                <p className="KoHo mb-2 text-sm font-semibold"> เหตุผลที่ปฏิเสธ </p>
                                <textarea className="border w-full h-24 p-2 text-sm windows-search" value={remark} onChange={(e)=>setRemark(e.target.value)} placeholder="กรอกเหตุผล..."/>
                                <div className="flex justify-end gap-2 mt-3">
                                    <button className="windows-button px-3" onClick={()=>{
                                            setShowRejectModel(false);
                                            setRemark("");
                                        }}>
                                        ยกเลิก
                                    </button>
                                    <button className=" px-3 windows-button" onClick={()=>{
                                        RequestDeniedHandle(selectedRequestId,{remark: remark});
                                        setShowRejectModel(false);
                                        setRemark("");
                                    }}> ยืนยัน</button>
                                </div>

                            </div>

                        </div>

                    </div>

            )}
        </>
    )
}

export default AdminManage