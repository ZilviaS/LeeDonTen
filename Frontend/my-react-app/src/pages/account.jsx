import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Account(){

    const navigate = useNavigate()

    const API = import.meta.env.VITE_API

    const [ balance , setBalance ] = useState(0)

    const [ withdrawInfo , setWithdrawInfo] = useState([])
    const [ errorLog, setErrorLog ] = useState('');

    const [ withdrawReqeust , setWithdrawRequets ] = useState({
        Fname : '',
        Lname : '',
        PaymentOption : '',
        AccountNumber : '',
        Amount : 0
    })

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

    const handleWithdrawRequest = async()=>{
        console.log(withdrawReqeust)
        const token = localStorage.getItem("token")
        console.log(withdrawReqeust.Amount)
        console.log(balance)
        if (withdrawReqeust.Amount > balance){
            setErrorLog(`you dont't have enough money`)
        }else{
            const res = await fetch(`${API}/api/withdraw`,{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                body : JSON.stringify(withdrawReqeust)
            })
            const data = await res.json()
            if(res.ok){
                window.location.reload()
            }else{
                setErrorLog(data.message)
            }
        }
        

    }

    useEffect(()=>{
        const token = localStorage.getItem("token")
        if (!token){
            navigate('/login')
        }
        const handleAmount = async()=>{
            const res = await fetch(`${API}/api/user/balance`,{
                headers:{
                    'Authorization' : `Bearer ${token}`
                }})
            const data = await res.json()
            if(!res.ok){
                console.log(data.message)
            }else{
                setBalance(data.total)
            }
        }
        const handleWithdrawInfo = async()=>{
            const res = await fetch(`${API}/api/withdraw/user`,{
                headers : {
                    'Authorization' : `Bearer ${token}`
                }
            })
            const data = await res.json()
            if(res.ok){
                setWithdrawInfo(data)
                console.log(data)
            }
        }

        handleWithdrawInfo()

        
        handleAmount()
    },[])

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='w-[70%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    <div className='h-[80%] bg-white flex-col flex items-center'>
                        <div className='flex justify-center mt-5 mb-3'>
                            <p className='KoHo font-semibold text-xl'>บัญชีผู้ใช้</p>
                        </div>
                        <div className="">
                            <p className="text-sm text-gray-500 font-light my-1">ข้อมูลคำร้องขอถอนเงิน</p>
                            <div className="flex gap-1 my-2">
                                <p className="text-sm">ขื่อ</p>
                                <input onChange={(e)=>{setWithdrawRequets({...withdrawReqeust, Fname : e.target.value})}} value={withdrawReqeust.Fname} type="text" className="bg-gray-100 px-1 text-sm border-1 border-gray-200 rounded"/>
                                <p className="text-sm">นามสกุล</p>
                                <input onChange={(e)=>{setWithdrawRequets({...withdrawReqeust, Lname : e.target.value})}} value={withdrawReqeust.Lname} type="text" className="bg-gray-100 px-1 text-sm border-1 border-gray-200 rounded"/>
                            </div>
                            <div className="flex gap-1 my-2">
                                <p className="text-sm">ธุรกรรม </p>
                                <select value={withdrawReqeust.PaymentOption} onChange={(e)=>{setWithdrawRequets({...withdrawReqeust, PaymentOption : e.target.value})}} name="" id="" className="text-sm  bg-gray-100 px-1 rounded border-1 border-gray-200">
                                    <option value="" className="text-gray-500">--เลือก--</option>
                                    <option value="Krungsri">กรุงศรี</option>
                                    <option value="Kasikorn">กสิกร</option>
                                    <option value="Krungthai">กรุงไทย</option>
                                    <option value="SCB">ไทยพานิจ</option>
                                    <option value="Promptpay">promptpay</option>
                                </select>
                                <input onChange={(e)=>{setWithdrawRequets({...withdrawReqeust, AccountNumber : e.target.value})}} type="text" className="bg-gray-100 text-sm text-light px-1 border-1 border-gray-200 rounded w-full" placeholder="เลขบัญชี/เลขพร้อมเพย์"/>
                            </div>
                            <div className="flex mt-2 gap-2">
                                <p className="text-sm">ยอดการถอน</p>
                                <input value={withdrawReqeust.Amount} onChange={(e)=>{setWithdrawRequets({...withdrawReqeust, Amount : e.target.value})}} type="number" className="bg-gray-100 border-1 border-gray-200 text-sm px-1"/>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <button onClick={handleWithdrawRequest} className="text-sm px-5 bg-yellow-500 rounded text-gray-800 hover:cursor-pointer">ถอน</button>
                                <p className="text-xs text-red-500">{errorLog}</p>
                            </div>
                            
                            
                        </div>
                        <p className="text-sm text-gray-600">ยอดเงินรวม : <span className="text-green-600">{balance}</span> บาท</p>
                        <div className="mt-3 h-70 overflow-y-scroll bg-gray-100 w-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-sm bg-pink-300">
                                        <td className="px-2 border-1">หมายเลขคำร้อง</td>
                                        <td className="px-2 border-1">รูปแบบธุรกรรม</td>
                                        <td className="px-2 border-1">บัญชี</td>
                                        <td className="px-2 border-1">ชื่อเจ้าของบัญชี</td>
                                        <td className="px-2 border-1">ยอดการถอน</td>
                                        <td className="px-2 border-1">วันที่</td>
                                        <td className="px-2 border-1">สถานะ</td>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {withdrawInfo.map((item)=>(
                                        <tr key={item.id} className="text-sm bg-white">
                                            <td className="border-1 px-1">{item.id}</td>
                                            <td className="border-1 px-1">{paymentStatusHandle(item.paymentOption)}</td>
                                            <td className="border-1 px-1">{item.accountNumber}</td>
                                            <td className="border-1 px-1">{item.accountName}</td>
                                            <td className="border-1 px-1">{item.amount}</td>
                                            <td className="border-1 px-1">{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                            <td className="border-1 px-1">{statusHandle(item.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default Account