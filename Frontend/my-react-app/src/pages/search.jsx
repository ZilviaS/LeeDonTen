import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Search(){

    const navigate = useNavigate()

    const API = import.meta.env.VITE_API

    const [ musicianName , setMusicianName ] = useState('')
    const [ errorLog, setErrrLog ] = useState('')

    const handleSearch = async()=>{
        const res = await fetch(`${API}/api/user/check/${musicianName}`)
        const data = await res.json()
        if (!res.ok){
            console.log(data.message)
            setErrrLog(data.message)
        }else{
            navigate(`/donate/${data.message}`)
        }
        
    }

    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='md:w-[70%] w-[90%] min-h-screen'>
                    <div className='h-[80%] windows flex-col flex items-center '>
                        <div className='flex w-full justify-between bg-[#00007D] px-2 '>
                            <div>
                                <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                            </div>
                        </div>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>ระบบ Donate</p>
                        </div>
                        <div className='w-full grid mb-2 gap-3 justify-center'>
                            <div className='w-full'>
                                <p className='text-sm W-95 text-gray-800'>ใส่ชื่อนักดนตรี</p>
                                <input onChange={(e)=>setMusicianName(e.target.value)} type="text" className='px-1 w-full W-95 windows-search bg-gray-100 '/>
                                <p className="text-sm W-95 text-red-600">{errorLog}</p>
                            </div>
                            <button onClick={handleSearch} className='W-95 w-80 text-center windows-button text-white bg-[#0000FF]'>ดำเนินการต่อ</button>
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

export default Search