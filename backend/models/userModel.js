import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photoURL:{type:String},
    email: { type: String, required: true, unique: true },
    gender:{type:String},
    phone:{type:String},
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user|| mongoose.model("user",userSchema);

export default userModel;
