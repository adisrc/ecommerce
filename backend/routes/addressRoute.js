import express from'express';
import { checkPincode, deleteAddress, getUserAddresses, printroveServicability, saveAddress } from '../controllers/addressController.js';
import authUser from '../middleware/auth.js';

const addressRouter = express.Router()


addressRouter.get('/check-pincode/:pincode',checkPincode);
addressRouter.post('/save-address',authUser,saveAddress);
addressRouter.post('/user-address',authUser,getUserAddresses);
addressRouter.post('/delete',authUser,deleteAddress);
addressRouter.post('/servicability',authUser,printroveServicability);


export default addressRouter
