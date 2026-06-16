import '../App'
import AeroheadLogo from '../assets/arrowhead.svg'

function Home(){

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
                        <div className='bg-white rounded w-[90%] h-10 shadow px-2 flex justify-between items-center hover:cursor-pointer'>
                            <p className='KoHo font-semibold '>อะไรคือ LeeDonTen</p>
                            <img className='w-4' src={AeroheadLogo} alt="" />
                        </div>

                        <div className='bg-white rounded w-[90%] h-10 shadow px-2 flex justify-between items-center mt-5 hover:cursor-pointer'>
                            <p className='KoHo font-semibold '>ติดต่อ LeeDonTen</p>
                            <img className='w-4' src={AeroheadLogo} alt="" />
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default Home