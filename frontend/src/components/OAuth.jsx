import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import {GoogleAuthProvider, signInWithPopup, getAuth} from 'firebase/auth';
import { app } from '../firebase';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios'
import { toast } from 'react-toastify';

const OAuth = () => {
    const {backendUrl,token,setToken} = useContext(ShopContext);
    const handleGoogleClick = async () => {
        try {
            if(token) return;
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth,provider); 
            const response = await axios.post(backendUrl + "/api/user/google", {
              name: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
            });
            if (response.data.success) {
              setToken(response.data.token);
              localStorage.setItem("token", response.data.token);
            } else {
              toast.error(response.data.message);
            } 
        } catch (error) {
            console.error("Error while continuing with Google:", error.message);
            toast.error("Unable to sign in with Google. Please try again.");
        }
    }
  return (
    <div>
    <button onClick={handleGoogleClick} className='p-1 mx-auto border-2 border-blue-500 rounded-full flex m-4'> 
      <img className='px-1 w-[30px] my-auto' src={assets.google} alt="" /> 
      <span className='my-auto px-1'>Continue With Google</span>
    </button>
    </div>
  )
}

export default OAuth