import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function MusicianUi(){

    const navigate = useNavigate()

    const [ connectionStatus, setConnectionStatus ] = useState("disconnected")

    const API = import.meta.env.VITE_API

    const [ donation, setDonations ] = useState([]);

    const [queue, setQueue] = useState([])

    const [ nowPlay , setNowPlay ] = useState([]);

    const [ user , setUser ] = useState({
        Username : "",
        UserId : ""
    })

    const [ onlineToggle, setOnlineToggle ] = useState(false)

    const handleDonationStatus = async()=>{
        const token = localStorage.getItem('token')
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
            setOnlineToggle(data.isOpenDonation)
        }
        
    }

    const handleAddQueue = (item)=>{
        setQueue(prev => [...prev, item])

        setDonations(prev => prev.filter(d=> d.id !== item.id))
    }

    const handlePlayRequest = async (item)=>{
        const res = await fetch(`${API}/api/donate/update/${item.id}/play`,{
            method : 'PUT'
        })
        const data = await res.json()
        if(!res.ok){
            console.log(data.message)
        }else{
            console.log("request has been played")
            setDonations(prev => prev.filter(d => d.id !== item.id))
            setQueue(prev => prev.filter(d => d.id !== item.id))
            setNowPlay(item)
        }
    }

    const handleCancelRequest = async (item)=>{
        const res = await fetch(`${API}/api/donate/update/${item.id}/cancel`,{
            method : 'PUT'
        })
        const data = await res.json()
        if(!res.ok){
            console.log(data.message)
        }else{
            console.log("request has been cancel")
            setDonations(prev => prev.filter(d => d.id !== item.id))
            setQueue(prev => prev.filter(d => d.id !== item.id))
        }
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
        const getConnectionStatus = async()=>{
            const res = await fetch(`${API}/api/user/donation`,{
                method : 'GET',
                headers : {
                    'Authorization' : `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok){
                console.log(data.message)
            }else{
                setOnlineToggle(data.isOpenDonation)
            }
        }
        getConnectionStatus()
    },[])

    useEffect(()=>{

        const eventSource = new EventSource(
            `${API}/api/events`
        );


        eventSource.onopen = ()=>{
            console.log("SSE Connected");
            setConnectionStatus("connected");
        };


        eventSource.onmessage = (event)=>{
            console.log("Raw:", event.data);

            if(event.data === "Connected"){
                return;
            }

            const data = JSON.parse(event.data);
            console.log("Donation:", data);
            setDonations(prev => [
                data,
                ...prev
            ]);
        };


        eventSource.onerror = (error)=>{
            console.log("SSE Error", error);
            setConnectionStatus("disconnected");
        };


        return ()=>{
            console.log("Closing SSE connection");
            eventSource.close();
        }

    },[])

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='md:w-[70%] w-[90%] min-h-screen rounded'>
                    <div className='h-[80%] bg-white flex-col flex items-center rounded-b windows'>
                        <div className='flex w-full justify-between bg-[#00007D] px-2'>
                            <div>
                                <Link className="W-95 text-md py-1 text-white" to="/">LeeDonTen</Link>
                            </div>
                        </div>
                        <div className='flex justify-center py-3'>
                            <p className='KoHo font-semibold text-xl'>หน้าต่าง Donate (นักดนตรี)</p>
                        </div>
                        <div className="w-full flex justify-between px-10 pb-1 items-baseline">
                            <div className="flex items-center gap-1 mx-1">
                                <button className={`toggle-btn ${onlineToggle ? "toggled" : ""}`} onClick={()=> handleDonationStatus()}>
                                    <div className="thumb"></div>
                                </button>
                                <p className={`text-xs ${onlineToggle? "text-[#017C7E]" : "text-gray-500"}`}>{onlineToggle? "เปิดรับ Donate" : "ปิดรับ Donate"}</p>
                            </div>
                            <div className="flex W-95 gap-1">
                                <p className="text-xs">status : </p>
                                <p className={`text-xs ${
                                    connectionStatus === 'disconnected' ? 'text-yellow-500' :
                                    connectionStatus == 'reconnecting' ? 'text-yellow-500' :
                                    connectionStatus == 'disconnected' ? 'text-red-500' :
                                    'text-[#017C7E]' }`}>{connectionStatus}</p>
                            </div>
                        </div>
                        <div className="w-full flex flex-col md:flex-row justify-between px-10 h-100">
                            <div className="md:w-[48%] w-full bg-white  h-full overflow-y-scroll windows-in">
                                {donation.map((item)=>(
                                    <div key={item.id} className="w-full border-gray-300 border-1 px-3">
                                        <div className="flex gap-2 items-baseline">
                                            <p className="KoHo">{item.donor}</p>
                                            <p className="text-pink-500 KoHo font-semibold">donate</p>
                                            <p className="KoHo text-sm">{item.amount} บาท</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <p className="text-pink-500 KoHo font-semibold">ขอเพลง</p>
                                            <p className="KoHo">{item.song}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm text-wrap">{item.message}</p>
                                        </div>
                                        <div className="flex gap-2 mt-1 mb-2">
                                            <button onClick={()=>handleAddQueue(item)} className="px-2 bg-green-500 windows-button text-sm text-white">เข้าคิว</button>
                                            <button onClick={()=>handleCancelRequest(item)} className="px-2 bg-red-500 text-sm windows-button text-white">ยกเลิก</button>
                                        </div>
                                    </div>

                                ))}
                            </div>
                            <div className="md:w-[48%] w-full h-full">
                                <div className="bg-white border-gray-300 border-1 h-[85%] overflow-y-scroll windows-in">
                                    {queue.map((item)=>(
                                        <div key={item.id} className="w-full border-gray-300 border-1 px-3">
                                            <div className="flex gap-2 items-baseline">
                                                <p className="KoHo">{item.donor}</p>
                                                <p className="text-pink-500 KoHo font-semibold">donate</p>
                                                <p className="KoHo text-sm">{item.amount} บาท</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <p className="text-pink-500 KoHo font-semibold">ขอเพลง</p>
                                                <p className="KoHo">{item.song}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">{item.message}</p>
                                            </div>
                                            <div className="flex gap-2 mt-1 mb-2">
                                                <button onClick={()=>handlePlayRequest(item)} className="px-2 bg-green-500 windows-button text-sm text-white">เล่น</button>
                                                <button onClick={()=>handleCancelRequest(item)} className="px-2 bg-red-500 windows-button text-sm text-white">ยกเลิก</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="">
                                    {nowPlay.amount? <>
                                        <p className="text-sm KoHo">now playing : <span className="KoHO text-xl text-pink-500 font-bold">{nowPlay.song}</span></p>
                                        <p className="text-xs KoHo">โดย <span className=" KoHo text-sm text-blue-600 font-bold">{nowPlay.donor}</span> ได้โดเนท <span className="KoHo text-sm text-green-600 font-bold">{nowPlay.amount}</span> บาท</p>
                                    </>: <>
                                    </>}
                                </div>
                            </div>
                        </div>
                        <div className='w-full flex justify-center gap-3 mb-3 mt-3'>
                            <Link className='text-xs text-gray-500 hover:underline hover:cursor-pointer' to="/policy">นโยบายข้อมูลส่วนบุคคล</Link>
                            <Link className='text-xs text-gray-500 hover:underline hover:cursor-pointer' to="/terms">ข้อตกลงการใช้งาน</Link>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default MusicianUi