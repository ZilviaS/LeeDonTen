import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Cell } from "recharts";
import arrowheadIcon from '../assets/arrowhead.svg'
import downloadIcon from '../assets/download-minimalistic-svgrepo-com.svg'

function DonateHistory(){

    const API = import.meta.env.VITE_API

    const navigate = useNavigate()

    const [ user, setUser ] = useState([])

    const [ searchTerm , setSearchTerm ] = useState('')

    const [ unpaidBlind , setUnpaidBlind ] = useState(false)

    const [ donateInfo, setDonateInfo ] = useState([])

    const dateFormatHandle = (data)=>{
        const date = new Date(data)
        const formatted = date.toLocaleString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        return formatted
    }

    const handleStatusCheck = (status)=>{
        if (status == 0){
            return 'pending'
        }else if (status == 1){
            return 'paid'
        }else if (status == 2){
            return 'unpaid'
        }else if (status == 3){
            return 'played'
        }else if (status == 4){
            return 'cancelled'
        }else {
            return 'unknown'
        }
    }

    const [ sortBy, setSortBy ] = useState('date')
    const [sortOrder, setSortOrder] = useState("desc");

    const searchedList = donateInfo.filter((info)=>{
        const keyword = searchTerm.toLowerCase()

        const matchSearch = (
            (info.id.toString().includes(keyword) ||
            info.donorName?.toLowerCase().includes(keyword) ||
            info.songName?.toLowerCase().includes(keyword) ||
            info.message?.toLowerCase().includes(keyword) ||
            info.statusText?.toLowerCase().includes(keyword) ||
            info.formattedDate?.toLowerCase().includes(keyword))
        )

        const passUnpaidFilter = unpaidBlind || info.statusText !== 'unpaid'

        return matchSearch && passUnpaidFilter
    }).sort((a,b) => {
        if (sortBy == 'date'){
            return sortOrder === "desc"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        }
        
        if (sortBy == 'amount'){
            return sortOrder === "desc"
                ? b.amount - a.amount
                : a.amount - b.amount;
        }
        return 0;

    }
    )

    const dailyData = Object.values(
        donateInfo.filter(item => item.status != 2).reduce((acc, item)=>{
            const date = item.createdAt.split("T")[0]

            if(!acc[date]){
                acc[date] = {
                    date,
                    amount: 0
                }
            }
            acc[date].amount += item.amount

            return acc
        }, {})
    )

    const donorDataChartsColor = [
        "#ec4899",
        "#8b5cf6",
        "#3b82f6",
        "#10b981",
        "#f59e0b"
    ]
    const donorData = Object.values(
        donateInfo.filter(item => item.status != 2).reduce((acc, item)=>{
            if (!acc[item.donorName]) {
                acc[item.donorName] = {
                    donor : item.donorName,
                    amount : 0
                }
            }

            acc[item.donorName].amount += item.amount

            return acc
        }, {})
    ).sort((a,b) => b.amount - a.amount).slice(0,5)

    const exportToCSV = () => {
        const headers = [
            "ID",
            "Donor Name",
            "Song Name",
            "Amount",
            "Message",
            "Status",
            "Date"
        ]

        const rows = searchedList.map(item => [
            item.id,
            item.donorName,
            item.songName,
            item.amount,
            item.message,
            item.statusText,
            item.formattedDate
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row =>
                row.map(field => `"${field ?? ""}"`).join(",")
            )
        ].join("\n")

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        )

        const url = window.URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `donation-history-${new Date().toISOString().split("T")[0]}.csv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.URL.revokeObjectURL(url)
    }

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
        const handleDonationSetup = async()=>{
            const token = localStorage.getItem("token")
            console.log(token)
            const res = await fetch(`${API}/api/donate/info`,{
                method : 'GET',
                headers:{
                        'Authorization' : `Bearer ${token}`
                    }
            })
            const data = await res.json()
            if(!res.ok){
                console.log(data.message)
            }else{
                console.log(data)
                const formattedData = data.map(item => ({
                    ...item,
                    statusText: handleStatusCheck(item.status),
                    formattedDate: dateFormatHandle(item.createdAt)
                }))
                setDonateInfo(formattedData)
            }
        }
        handleDonationSetup()
    },[])

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='w-[85%] min-h-screen rounded'>
                    <div className='lg:h-[80%] bg-white flex-col flex items-center windows'>
                        <div className='flex w-full justify-between windows-border bg-[#00007D] px-2'>
                            <div>
                                <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                            </div>
                        </div>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>Donate History ({user.Username})</p>
                        </div>
                        <div className="flex w-full flex-col lg:flex-row justify-center px-3 gap-5">
                            <div className="">
                                <div className="flex justify-between mb-1 md:flex-row flex-col">
                                    <div className="flex pb-1 gap-3 items-center ">
                                        <input onChange={(e)=>{setSearchTerm(e.target.value)}} value={searchTerm} type="text" className="bg-gray-100 windows-search px-1 text-sm" placeholder="ค้นหา"/>
                                        <div className="flex gap-1">
                                            <input type="checkbox" defaultChecked checked={unpaidBlind} onChange={(e) => setUnpaidBlind(e.target.checked)}/>
                                            <p className="text-xs font-light">แสดงข้อมูลที่จ่ายไม่สำเร็จ</p>
                                        </div>
                                    </div>
                                    <div className="px-1 windows-button hover:cursor-pointer">
                                        <div onClick={()=>exportToCSV()} className="flex gap-1 px-1 items-center">
                                            <img className="w-4" src={downloadIcon} alt="" />
                                            <p className="W-95 text-sm">save to csv</p>
                                        </div>
                                    </div>
                                    
                                    
                                </div>
                                <div className="h-100 rounded overflow-y-scroll md:overflow-auto overflow-x-scroll w-full md:w-180 sm:w-130 bg-gray-100 border-gray-200">
                                    <table className="border-1 w-full ">
                                        <thead className="bg-[#c0c0c0]">
                                            <tr>
                                                <td className="px-2 border-1">Id</td>
                                                <td className="px-2 border-1">ชื่อผู้โดเนท</td>
                                                <td className="px-2 border-1">เพลง</td>
                                                <td className="px-2 border-1 windows-button"><button onClick={() => {
                                                        if (sortBy !== "amount") {
                                                            setSortBy("amount");
                                                            setSortOrder("desc");
                                                        } else {
                                                            setSortOrder(prev => prev === "desc" ? "asc" : "desc");
                                                        }
                                                    }} className="w-full text-left hover:cursor-pointer flex justify-between">จำนวน<img className={` w-3 ${sortBy == 'amount' ? 'rotate-180' : ''}`} src={arrowheadIcon} alt="" /></button></td>
                                                <td className="px-2 border-1">ข้อความ</td>
                                                <td className="px-2 border-1">สถานะ</td>
                                                <td className="px-2 border-1 windows-button"><button onClick={() => {
                                                    if (sortBy !== "date") {
                                                        setSortBy("date");
                                                        setSortOrder("desc");
                                                    } else {
                                                        setSortOrder(prev => prev === "desc" ? "asc" : "desc");
                                                    }
                                                }} className="w-full text-left hover:cursor-pointer flex justify-between">วันที่<img className={`w-3 ${sortBy == 'date' ? 'rotate-180' : ''} `} src={arrowheadIcon} alt="" /></button></td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchedList.map((item)=>(
                                                <tr key={item.id}>
                                                    <td className="KoHo text-sm px-2 border-1">{item.id}</td>
                                                    <td className="KoHo text-sm px-2 border-1">{item.donorName}</td>
                                                    <td className="KoHo text-sm px-2 border-1">{item.songName}</td>
                                                    <td className="KoHo text-sm px-2 border-1">{item.amount} บาท</td>
                                                    <td className="KoHo text-sm px-2 border-1 w-40">{item.message}</td>
                                                    <td className="KoHo text-sm px-2 border-1">{item.statusText}</td>
                                                    <td className="KoHo text-sm px-2 border-1">{item.formattedDate}</td>
                                                </tr>
                                            ))}  
                                        </tbody>
                                    </table>
                                </div>
                                
                            </div>
                            <div className="lg:w-80 w-full windows-in bg-white pr-5 py-2">
                                <div>
                                    <p className="w-full text-right text-xs text-gray-500 pr-1 ">ยอด Donate ต่อวัน</p>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={dailyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }}/>
                                            <YAxis tick={{ fontSize: 12 }}/>
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#ec4899"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div><p className="w-full text-right text-xs text-gray-500 pr-1">Top Donate</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart
                                        
                                        data={donorData}
                                    >
                                        <XAxis dataKey="donor" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }}/>
                                        <Tooltip />
                                        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                                            {donorData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={donorDataChartsColor[index % donorDataChartsColor.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>

                                </ResponsiveContainer>
                            </div>
                            
                        </div>
                        
                        <div className='w-full flex justify-center gap-3 mb-3 mt-1'>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/policy">นโยบายข้อมูลส่วนบุคคล</a>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/terms">ข้อตกลงการใช้งาน</a>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default DonateHistory