import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import Register from './pages/register'
import Login from './pages/login'
import Musician from './pages/musician'
import User from './pages/user'
import Search from './pages/search'
import Donate from './pages/donate'
import MusicianUi from './pages/musicianUI'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/musician' element={<Musician/>}></Route>
        <Route path='/musician/donation' element={<MusicianUi></MusicianUi>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/user/:Username' element={<User/>}>{}</Route>
        <Route path='/search' element={<Search/>}></Route>
        <Route path='/donate/:Username' element={<Donate/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
