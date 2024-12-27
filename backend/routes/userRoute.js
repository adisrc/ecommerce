import express from 'express'
import { loginUser, registerUser, adminLogin, getUserDetails, updateUserDetails, continueWithGoogle} from '../controllers/userController.js'
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/admin',adminLogin);
userRouter.post('/get',authUser,getUserDetails);
userRouter.post('/update',authUser,updateUserDetails);
userRouter.post('/google',continueWithGoogle);



export default userRouter;