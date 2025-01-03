import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();  // Load .env file


const handlePrintroveOrder = async (printroveItems,address,newOrder,method) => {
    const totalAmount = printroveItems.reduce( (total, item) => total + item.quantity * item.price,0);        
        const order_products = printroveItems.map((item) => ({
          quantity: item.quantity,
          variant_id: item.variantID,
        }));
        const printroveOrderData = {
          reference_number: newOrder._id.toString(),
          retail_price: totalAmount,
          customer: address,
          order_products,
          courier_id: address.courier.id,
          cod: method,
        };
    try {
        const printrove_response = await axios.post(
            'https://api.printrove.com/api/external/orders',
            printroveOrderData,
            {headers:{ 'Authorization': `Bearer ${process.env.PRINTROVE_AUTH_TOKEN}`}})
            // console.log(printrove_response.status);
            // await newOrder.save()
            // await userModel.findByIdAndUpdate(userId,{cartData:{}});
            return({success:true, message:"Order Placed"})
    } catch (error) {
        if (error.response) {
            console.log("Error:",error.response.data);
            return {
                success: false,
                message: error.response.data.message,
                error:error.response.data.errors
              };
        } else if (error.request) {
            console.error("No response received:", error.request);
            return;
        }
        console.log(error.message);
        return ({success:false, message:error.message})
    }          
}

//Placing orders using cod method  


const placeOrder = async (req,res) => {
    
    try { 
        const {userId,items,printroveItems, amount,address} = req.body;
        const orderData = {
            userId,
            items,
            printroveItems,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()
        }
        //PRINTROVE ORDER
        const newOrder = new orderModel(orderData);

        if(printroveItems.length > 0){
            const response =await handlePrintroveOrder(printroveItems,address,newOrder,true);
            if(!response.success)
            return res.json(response);        
        }
        await newOrder.save()
        await userModel.findByIdAndUpdate(userId,{cartData:{}});
        res.json({success:true, message:"Order Placed"})
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//All Orders data for admin panel

const allOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({})
        res.json({success:true,orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//user order data for frontend

const userOrders = async (req,res) => {
    try {
        const {userId} = req.body

        const orders = await orderModel.find({userId});
        res.json({success:true,orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//update order status from admin panel

const updateStatus = async (req,res) => {
    try {
        const {orderId, status} = req.body;
        await orderModel.findByIdAndUpdate(orderId,{status});
        res.json({success:true, message:'Status Updated'})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

export {placeOrder,allOrders,userOrders,updateStatus}