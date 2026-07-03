import { useEffect, useState } from 'react'
import '../App'

function Home(){

    const API = import.meta.env.VITE_API
    const [ serverStatus, setServerStatus ] = useState('offline')

    useEffect(()=>{
        const serverStatusHandler = async()=>{
            setServerStatus('pending')
            try{
                const res = await fetch(`${API}/api/server`)
                if(res.ok){
                    setServerStatus('online')
                }else{
                    setServerStatus('offline')
                }
            }catch{
                setServerStatus('offline')
            }
        }
        serverStatusHandler()
    },[])

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='md:w-[70%] w-[90%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    <div className='h-[80%] bg-white flex-col flex items-center'>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>สามารถโดเนทให้กับนักดนตรีได้ที่นี่เลย!</p>
                        </div>
                        <div className='w-full grid mb-2 gap-3 justify-center'>
                            <a href='/search' className='roboto-mono w-80 bg-blue-500 hover:bg-blue-700 text-center px-2 py-1 rounded text-white hover:cursor-pointer'>สำหรับผู้ใช้ทั่วไป (Audience)</a>
                            <a href='/musician' className='roboto-mono w-80 bg-pink-500 text-center hover:bg-pink-700 px-2 py-1 rounded text-white hover:cursor-pointer'>สำหรับนักดนตรี (Musician)</a>
                        </div>
                        <div className='w-full flex justify-center gap-3 mb-3'>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/policy">นโยบายข้อมูลส่วนบุคคล</a>
                            <a className='text-xs text-gray-500 hover:underline hover:cursor-pointer' href="/terms">ข้อตกลงการใช้งาน</a>
                        </div>
                        <div className='bg-white w-[90%] shadow rounded mt-3'>
                            <div className='bg-gray-200 w-full h-10 px-2 flex justify-between items-center hover:cursor-pointer'>
                                <p className='KoHo font-semibold '>อะไรคือ LeeDonTen</p>
                            </div>
                            <p className='px-2 text-md  my-1'>
                                LeeDonTen เป็นผู้ให้บริการที่เชื่อมระหว่างนักดนตรีและผู้ชม เพื่อให้ผู้ชมสามารถบริจาคเงินให้กับนักดนตรี พร้อมกับส่งข้อความและขอเพลงไปด้วยได้ รวมไปถึงนักดนตรีก็สามารถรับรายได้จากการบริจาคจากผู้ชมได้อีกด้วย 
                                <br />
                                โดยในฝั่งนักดนตรีจะมีหน้ารายงานสดสำหรับดูยอดการโดเนตและข้อความจากคนดูได้ระหว่างแสดงสด และเมื่อจบโชว์ก็สามารถดูสถิติรวมได้ที่ Dashboard ของระบบ
                            </p>
                        </div>
                    </div>
                    <footer className='flex justify-between bg-gray-100 p-1'>
                        <p className='text-sm text-gray-800'>สามารถติดต่อได้ที่ E-MAIL: prepatjarundechakorn@gmail.com</p>
                        <div className='flex items-baseline '>
                            <p className='text-sm text-gray-800 pr-1'>server:</p>
                            <div className={`h-2 w-2 rounded-full ${serverStatus == 'online' ? "bg-green-700" : serverStatus == 'pending'? "bg-yellow-500" : "bg-red-500"}`}/>
                            <p className='text-sm text-gray-800 pl-1'>{serverStatus}</p>
                        </div>
                    </footer>
                </section>
            </section>
        </>
    )
}

export default Home