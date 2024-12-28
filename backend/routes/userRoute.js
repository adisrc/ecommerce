import express from 'express'
import { loginUser, registerUser, adminLogin, getUserDetails, updateUserDetails, continueWithGoogle, resetPassword, uploadProfilePhoto, deleteProfilePhoto} from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/admin',adminLogin);
userRouter.post('/get',authUser,getUserDetails);
userRouter.post('/update',authUser,updateUserDetails);
userRouter.post('/google',continueWithGoogle);
userRouter.post('/resetpass',authUser,resetPassword);
userRouter.post('/upload-photo',upload.single('image'),authUser,uploadProfilePhoto);
userRouter.post('/delete-photo',authUser,deleteProfilePhoto);



export default userRouter;