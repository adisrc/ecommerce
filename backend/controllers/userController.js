import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from "cloudinary"

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET);
}
// Route to get user details
const getUserDetails = async (req, res) => {
    const { userId } = req.body;  
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Return user details (excluding password for security)
        const { password, ...userDetails } = user.toObject();
        return res.json({ success: true, userDetails });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}


// Route for user Login
const loginUser = async (req,res) => {
   try {
     const {email,password} = req.body;
     const user = await userModel.findOne({email});
     if(!user){
        return res.json({success:false, message: "User does not exist with this email"})
     }
     const isMatch = await bcrypt.compare(password, user.password);
     
     if(isMatch){
        const token = createToken(user._id);
        res.json({success:true,token,email})
     }else{
        res.json({success:false, message:"Incorrect Password!"})
     }

   } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message})
   }
}
//Route for user Registration
const registerUser = async (req,res) => {
    try {
       const {name,email,password} = req.body;
       //checking user already exists or not
       const exists = await userModel.findOne({email});
       if(exists){
           return res.json({success:false, message:"Email already in use!"})
       }
       //validating email format & strong password
       if (!validator.isEmail(email)) {
        return res.json({success:false, message:"Please enter valid Email!"})
       }
       if (password.length<8) {
        return res.json({success:false, message:"Password is too short!"})
       }
        // hasing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        })
        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success:true, token})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//RESET passowrd
const resetPassword = async (req,res) => {
  try {
    const {password, userId} = req.body;
    if (password.length<8) {
      return res.json({success:false, message:"Password is too short!"})
     }
      // hasing user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
    const user = await userModel.findByIdAndUpdate(userId,{password:hashedPassword});
    if(!user) return res.json({success:false, message:"User not found!"});
    res.json({success:true,message:"Hi, "+user.name+" Passowrd updated successfully!"})
  } catch (error) {
    res.json({success:false,message:error.message})
  } 
}
//Continue with GOOGLE
const continueWithGoogle = async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) { 
      if(!existingUser.photoURL){
        await userModel.updateOne(
          { email }, // Match the user by email
          { $set: { photoURL: photoURL } } // Update the photoURL field
        );
      }
      const token = createToken(existingUser._id);
      return res.json({ success: true, token, email });
    }
    // Generate a random password
    const password = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      photoURL,
    });
    const savedUser = await newUser.save();

    // Generate a token for the new user
    const token = createToken(savedUser._id);

    res.json({ success: true, token, email });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


//Route for Updating userDetails
const updateUserDetails = async (req, res) => {
    try {
      const { userId, name,gender, email, phone } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if(gender) updateData.gender = gender;
      if (email && !validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid Email!" });
    }
      if (email) updateData.email = email;
      if (phone && /^[0-9]{10}$/.test(phone)) {
        updateData.phone = phone;
      } else if (phone) {
        return res.json({ success: false, message: "Please enter a valid 10-digit phone number!" });
      } 
  
      if (Object.keys(updateData).length === 0) {
        return res.json({ success: false, message: "No fields to update" });
      }
  
      // Update the user with the provided data
      const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (!updatedUser) {
        return res.json({ success: false, message: "User not found" });
      }
  
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ success: false, message: "Error updating user" });
    }
  };
  
//Route for profile photo upload
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.photoURL && user.photoURL.includes("res.cloudinary.com")) {
      const publicId = user.photoURL.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });
    user.photoURL = result.secure_url;
    await user.save();
    res.json({
      success: true,
      message: "Image uploaded successfully",
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteProfilePhoto = async (req,res) => {
try {
  const {image, userId} = req.body;
  if (image && image.includes("res.cloudinary.com")) {
    const publicId = image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  }
  const user = await userModel.findByIdAndUpdate(userId,{photoURL:null},{new:true})
  res.json({success:true,photoURL:user.photoURL}) 
} catch (error) {
  res.json({success:false, message:error.message})
}
}

//Route for admin login
const adminLogin = async (req,res) => {
    try {
        const {email, password} = req.body;

        if(email===process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true, token})
        } else {
            res.json({success:false, message:"Invalid Credentials"});
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

export { loginUser, registerUser, adminLogin, getUserDetails, updateUserDetails, continueWithGoogle, resetPassword};