import { useEffect, useState } from "react"
import nullProfile from "../assets/nulll_profile.jpg"
import { useNavigate } from "react-router-dom"


function User(){
    const [ file, setFile ] = useState()
    const API = import.meta.env.VITE_API
    const navigate = useNavigate()
    
    function handleFileChange(e) {
        if (!e.target.files?.length) return;

        console.log('file set!')
        setFile(e.target.files[0])
    }

    useEffect(()=>{
        const token = localStorage.getItem("token")
        if (!token){
            navigate('/login')
        }
    },[])

    const handleUpdateUserImage = async()=>{
        const token = localStorage.getItem("token")
        if (!file) return ;
        const formData = new FormData()
        formData.append("image", file);
        const res = await fetch(`${API}/api/user/update-profile-image`,{
            method: "PUT",
            headers: {
                Authorization : `Bearer ${token}`
            },
            body: formData
        })
        const data = await res.json()
        if(res.ok){
            console.log("updated")
        }else{
            console.log("fail")
        }
        console.log(data)
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
                            <p className='KoHo font-semibold text-xl'>ตั้งค่าผู้ใช้ (นักดนตรี)</p>
                        </div>
                        <div className='w-full grid mb-2 gap-3 justify-center px-1'>
                            <div>
                                <div className="h-20 w-20 windows-in">
                                    <img src={file? URL.createObjectURL(file) : nullProfile} className="w-full h-full" alt="" />
                                </div>
                                <input id="profile-file-input" type="file" className="text-sm bg-red-200" style={{ display: 'none'}} onChange={handleFileChange}/>
                                <label htmlFor="profile-file-input" className="windows-button px-1 pb-1 text-xs">Upload รูปภาพ</label>    
                            </div>
                            <p>คำขอบคุณผู้ใช้ :</p>
                            <textarea className="windows-in bg-white px-1" name="" id=""></textarea>
                            <button onClick={handleUpdateUserImage} className='roboto-mono w-80 bg-blue-500 text-center windows-button px-2 py-1 rounded text-white hover:cursor-pointer'>บันทึก</button>
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

export default User