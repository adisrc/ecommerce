import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from 'axios';
import Stripe from 'stripe'
import dotenv from 'dotenv';
dotenv.config();  // Load .env file

 
//global varibales
const currency = 'inr'
const deliveryCharge = 10

//initializing gateway
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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


//Placing orders using stripe

const placeOrderStripe = async (req,res) => {
    try {
        const {userId,items,amount,address} = req.body;
        const {origin} = req.headers
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date:Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save()

        const line_items = items.map((item)=>({
            price_data:{
                currency:currency,
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))
        line_items.push({
            price_data:{
                currency:currency,
                product_data:{
                    name:'Delivery Charges'
                },
                unit_amount:deliveryCharge*100
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            success_url:`${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode:'payment',

        })
        res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//Verify Stripe
const verifyStripe = async (req,res) => {
    const {orderId, success, userId} = req.body
    
    try {
        if (success=='true') {            
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({success:true})
        }else{
            
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
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

export {placeOrder,placeOrderStripe,allOrders,userOrders,updateStatus,verifyStripe}