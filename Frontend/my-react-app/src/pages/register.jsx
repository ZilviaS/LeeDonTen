import { useState } from 'react'
import '../App'
import eyeIcon from '../assets/eye.svg'
import eyeSlashIcon from '../assets/eye-slash.svg'
import { useNavigate } from 'react-router-dom'


function Register(){

    const API = import.meta.env.VITE_API

    const navigate = useNavigate()

    const [ registerData, setRegisterData ] = useState({
        Username : "",
        Email : "",
        Password : "",
        ConfirmPassword : "",
        Agree : false
    })

    const [ passwordLookupToggle, setPasswordLookupToggle ] = useState(false)
    const [ conPasswordLookupToggle, setConPasswordLookupToggle ] = useState(false)

    const handleChange = (e) => {
        setRegisterData({... registerData , Agree : e.target.checked}); 
    };

    const handleRegister = async ()=>{
        const res = await fetch(`${API}/api/user/register`,
            {
                method : 'POST',
                headers : {
                    'content-type' : 'application/json'
                },
                body : JSON.stringify(registerData)
            }
        )
        const resData = await res.json()
        if(res.ok){
            console.log(resData.token)
            localStorage.setItem("token",resData.token)
            navigate('/musician')
        }
    }


    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='w-[70%] min-h-screen'>
                    <div className='h-[80%] bg-white flex-col flex items-center windows'>
                        <div className='flex w-full justify-between bg-[#00007D] px-2'>
                            <div>
                                <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                            </div>
                        </div>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>สมัครสมาชิก (นักดนตรี)</p>
                        </div>
                        <div className='w-[80%] grid mb-2 gap-3 justify-center'>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Username</p>
                                <input onChange={(e)=>{setRegisterData({...registerData,Username : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                            </div>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>E-mail</p>
                                <input onChange={(e)=>{setRegisterData({...registerData,Email : e.target.value})}} type="text" className='px-1 w-full bg-gray-100 windows-search W-95'/>
                            </div>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Password</p>
                                <div className='flex'>
                                    <input onChange={(e)=>{setRegisterData({...registerData,Password : e.target.value})}} type={!passwordLookupToggle? "Password" : 'Text'} className='px-1 w-full windows-search W-95'/>
                                    <img onClick={()=>setPasswordLookupToggle(!passwordLookupToggle)} className={`w-5 mx-1 hover:cursor-pointer ${!passwordLookupToggle ? 'windows-button' : 'windows-button-press'}`} src={passwordLookupToggle ? eyeIcon : eyeSlashIcon} alt="" />
                                </div>
                                <p className={`text-xs KoHo ${registerData.Password.length >=6 ? `text-green-500` : 'text-red-500'} wrap-break-word`}>Passwords must be at least 6 characters.</p>
                                <p className={`text-xs KoHo ${/[^a-zA-Z0-9]/.test(registerData.Password) ? `text-green-500` : 'text-red-500'} wrap-break-word`}>Passwords must have at least one non alphanumeric character.</p>
                                <p className={`text-xs KoHo ${/\d/.test(registerData.Password) ? `text-green-500` : 'text-red-500'} wrap-break-word`}>Passwords must have at least one digit ('0'-'9').</p>
                                <p className={`text-xs KoHo ${/[A-Z]/.test(registerData.Password) ? `text-green-500` : 'text-red-500'} wrap-break-word`}>Passwords must have at least one uppercase ('A'-'Z').</p>
                            </div>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Confirm Password</p>
                                <div className='flex'>
                                    <input onChange={(e)=>{setRegisterData({...registerData, ConfirmPassword : e.target.value})}} type={!conPasswordLookupToggle? "Password" : 'Text'} className='px-1 w-full windows-search W-95'/>
                                    <img onClick={()=>setConPasswordLookupToggle(!conPasswordLookupToggle)} className={`w-5 mx-1 hover:cursor-pointer ${!conPasswordLookupToggle ? 'windows-button' : 'windows-button-press'}`} src={conPasswordLookupToggle ? eyeIcon : eyeSlashIcon} alt="" />
                                </div>
                                
                            </div>
                            <div className='flex gap-1'>
                                <input type="checkbox" checked={registerData.Agree} onChange={handleChange}/>
                                <label className='text-xs text-gray-500'>ยินยอมการให้ข้อมูล</label>
                            </div>
                            
                            <button onClick={()=>{handleRegister()}} className='roboto-mono w-80 bg-pink-500 text-center windows-button px-2 py-1  text-white hover:cursor-pointer'>สมัครสมาชิก</button>
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

export default Register