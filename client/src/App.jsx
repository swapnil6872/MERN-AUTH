import React from 'react'
import { Routes ,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer} from 'react-toastify';
import axios from 'axios';


export const App = () => {
  // Set this globally so every request includes the cookie
   axios.defaults.withCredentials = true;
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/email-verify' element={<EmailVerify/>} />
        <Route path='/Reset-password' element={<ResetPassword/>} />
      </Routes>

    </div>
  )
}

export default App
