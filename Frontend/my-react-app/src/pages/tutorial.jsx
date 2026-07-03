import tutorial_1 from "../assets/tutorial_1.png"
import tutorial_2 from "../assets/tutorial_2.png"
import tutorial_3 from "../assets/tutorial_3.png"
import tutorial_4 from "../assets/tutorial_4.png"

function Tutorial(){
    return(
        <>
        <section className='flex w-full justify-center pt-5 bg-neutral-800'>
                <section className='w-[70%] min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    <div className='bg-white flex-col flex items-center'>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>วิธีใช้งาน</p>
                        </div>
                        <div className="w-full flex justify-center">
                            <div className="">
                                <img src={tutorial_1} className="w-full block" alt="" />
                                <img src={tutorial_2} className="w-full block" alt="" />
                                <img src={tutorial_3} className="w-full block" alt="" />
                                <img src={tutorial_4} className="w-full block" alt="" />
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

export default Tutorial