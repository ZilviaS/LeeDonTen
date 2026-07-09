import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login(){

    const API = import.meta.env.VITE_API

    const [ userForm, setUserForm ] = useState({
        Username : "",
        Password : ""
    })

    const navigate = useNavigate()

    const handleLogin = async ()=>{
        const res = await fetch(`${API}/api/user/login`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(userForm)
        })

        const resData = await res.json()
        if (res.ok){
            console.log(resData);
            localStorage.setItem("token",resData.token)
            navigate('/musician')
        }else{
            console.log(resData)
        }
    }

    return(
        <>
            <section className='flex w-full justify-center pt-5  bg-[#017C7E]'>
                <section className='md:w-[70%] w-90% min-h-screen '>
                    <div className='h-[80%] bg-white flex-col flex items-center windows'>
                        <div className='flex w-full justify-between bg-[#00007D] px-2'>
                            <div>
                                <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                            </div>
                        </div>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>เข้าสู่ระบบ (นักดนตรี)</p>
                        </div>
                        <div className='w-full grid mb-2 gap-3 justify-center px-1'>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Username</p>
                                <input onChange={(e)=>{setUserForm({...userForm, Username : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                            </div>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Password</p>
                                <input onChange={(e)=>{setUserForm({...userForm, Password : e.target.value})}} type="Password" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                            </div>
                            <button onClick={handleLogin} className='roboto-mono w-80 bg-[#FF00FF] text-center windows-button px-2 py-1  text-white hover:cursor-pointer'>เข้าสู่ระบบ</button>
                            <div className="flex items-center w-80">
                            <div className="flex-1 h-px bg-gray-300"></div>

                                <span className="px-3 text-xs text-gray-500">
                                    หรือ
                                </span>

                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            <a href="/register" className='roboto-mono w-80 bg-blue-500 text-center windows-button px-2 py-1 rounded text-white hover:cursor-pointer'>สมัครสมาชิก</a>
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

export default Login