import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true},
    number:{type:String,required:true},
    address1:{type:String,required:true},
    pincode:{type:String,required:true},
    city:{type:String,required:true},
    state:{type:String,required:true},
    country:{type:String,required:true},
    default: { type: Boolean, default: false }, // Corrected: set default value
})
const addressModel = mongoose.models.address||mongoose.model('address',addressSchema);
export default addressModel;  