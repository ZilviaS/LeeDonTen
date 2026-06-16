import * as signalR from "@microsoft/signalr"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";

function MusicianUi(){

    const navigate = useNavigate()

    const [ connectionStatus, setConnectionStatus ] = useState("disconnected")

    const API = import.meta.env.VITE_API

    const [ donation, setDonations ] = useState([]);

    const [ user , setUser ] = useState({
        Username : "",
        UserId : ""
    })

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
        if (!user.UserId) return
        console.log(signalR.VERSION)
        const token = localStorage.getItem('token')
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API}/donationHub`, {
                accessTokenFactory: ()=> {
                    console.log("sending token", token);
                    return token}
            })
            .withAutomaticReconnect()
            .build();

        connection.onreconnected(()=>{
            setConnectionStatus("connected");
        })

        connection.onclose(()=>{
            setConnectionStatus("disconnected")
        })

        async function start(){
            try{
                await connection.start()
                console.log("SignalR Connected")
                setConnectionStatus("connected")

                await connection.invoke("JoinGroup", user.UserId)

            } catch(err){
                console.log(err)
                setConnectionStatus("disconnected")
            }
        }
        start()

        connection.on("NewDonation", (data)=>{
            console.log("New donation!", data);
            setDonations(prev => [data, ...prev]);
        })
        return ()=>{
            connection.stop();
        }
    }, [user.UserId])

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
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>หน้าต่าง Donate (นักดนตรี)</p>
                        </div>
                        <div className="w-full flex justify-end px-10">
                            <p className="text-xs">status : </p>
                            <p className={`text-xs ${
                                connectionStatus === 'disconnected' ? 'text-yellow-500' :
                                connectionStatus == 'reconnecting' ? 'text-yellow-500' :
                                connectionStatus == 'disconnected' ? 'text-red-500' :
                                'text-green-500' }`}>{connectionStatus}</p>
                        </div>
                        <div className="w-full flex justify-center gap-2">
                            <div className="w-[45%] bg-white border-gray-100 border-1 h-100">
                                {donation.map((item, index)=>(
                                    <div key={index} className="w-full border-gray-300 border-1 px-3">
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
                                            <button className="px-2 bg-green-500 rounded text-sm text-white">เข้าคิว</button>
                                            <button className="px-2 bg-red-500 rounded text-sm text-white">ยกเลิก</button>
                                        </div>
                                    </div>

                                ))}
                            </div>
                            <div className="w-[45%] bg-white border-gray-200 border-1 h-100">

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

export default MusicianUi