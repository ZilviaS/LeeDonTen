import tutorial_1 from "../assets/tutorial_1.png"
import tutorial_2 from "../assets/tutorial_2.png"
import tutorial_3 from "../assets/tutorial_3.png"
import tutorial_4 from "../assets/tutorial_4.png"
import { useState } from "react"

function Tutorial(){

    const [ imageRoll, setImageRoll ] = useState(0)
    const image = [
        tutorial_1, tutorial_2, tutorial_3, tutorial_4
    ]

    return(
        <>
        <section className='flex w-full justify-center pt-5 bg-[#017C7E]'>
                <section className='lg:w-[70%] min-h-screen'>
                    <div className='bg-white flex-col flex items-center windows'>
                        <div className='flex w-full justify-between bg-[#00007D] px-2'>
                            <div>
                                <a className="W-95 text-md py-1 text-white" href="/">LeeDonTen</a>
                            </div>
                        </div>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>วิธีใช้งาน</p>
                        </div>
                        <div className="w-full flex justify-center">
                            <div className="w-3/4">
                                <img className="windows-in" src={image[imageRoll]} alt="" />
                                <div className="w-full flex mt-2 justify-between">
                                    <button onClick={()=>{
                                        if(imageRoll > 0){
                                            setImageRoll(imageRoll-1)
                                        }
                                    }} className="p-1 px-3 windows-button flex items-center h-5">
                                        <p className="text-xs">&lt;</p>
                                    </button>
                                    <p className="text-sm W-95 mb-1">{imageRoll + 1}/{image.length}</p>
                                    <button onClick={()=>{
                                        if(imageRoll < image.length-1){
                                            setImageRoll(imageRoll+1)
                                        }
                                        
                                    }} className="p-1 px-3 windows-button flex items-center h-5">
                                        <p className="text-xs">&gt;</p>
                                    </button>
                                </div>
                            </div>
                            
                            {/* <div className="">
                                <img src={tutorial_1} className="w-full block" alt="" />
                                <img src={tutorial_2} className="w-full block" alt="" />
                                <img src={tutorial_3} className="w-full block" alt="" />
                                <img src={tutorial_4} className="w-full block" alt="" />
                            </div> */}
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