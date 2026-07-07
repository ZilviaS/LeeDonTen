function Contact(){
    return(
        <>
            <section className='flex w-full justify-center pt-5 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900'>
                <section className='md:w-[70%] w-90% min-h-screen'>
                    <div className='flex justify-between bg-pink-300 p-2 rounded-t'>
                        <div>
                            <a className="KoHo text-2xl font-bold text-pink-700" href="/">LeeDonTen</a>
                        </div>
                    </div>
                    <div className='h-[80%] bg-white flex-col flex items-center rounded-b'>
                        <div className='flex justify-center py-5'>
                            <p className='KoHo font-semibold text-xl'>ติดต่อ</p>
                        </div>
                        <div className="KoHo">
                            <p>Email : <span className="font-semibold">prepatjarundechakorn@gmail.com</span></p>
                            <p>Github : <a className="font-semibold hover:underline" href="https://github.com/ZilviaS">https://github.com/ZilviaS</a></p>
                            <p>Linkedin : <a className="font-semibold hover:underline" href="https://www.linkedin.com/in/พีรพัฒน์-จรัลเดชากร-9458553ba/">https://www.linkedin.com/in/พีรพัฒน์-จรัลเดชากร-9458553ba/</a></p>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default Contact