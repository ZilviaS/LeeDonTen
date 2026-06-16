import { useParams } from "react-router-dom"

function User(){

    const { Username } = useParams()

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
                            <p className='KoHo font-semibold text-xl'>{Username} (นักดนตรี)</p>
                        </div>
                        <div className='w-full grid mb-2 gap-3 justify-center'>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Username</p>
                                <input type="text" className='px-1 w-full bg-gray-100 rounded border-1 border-gray-300'/>
                            </div>
                            <div className='w-full'>
                                <p className='text-sm KoHo text-gray-500'>Password</p>
                                <input type="Password" className='px-1 w-full bg-gray-100 rounded border-1 border-gray-300'/>
                            </div>
                            <button className='roboto-mono w-80 bg-pink-500 text-center hover:bg-pink-700 px-2 py-1 rounded text-white hover:cursor-pointer'>เข้าสู่ระบบ</button>
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