import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from 'axios';
import Stripe from 'stripe'
import razorpay from 'razorpay'
import dotenv from 'dotenv';
dotenv.config();  // Load .env file

 
//global varibales
const currency = 'inr'
const deliveryCharge = 10

//initializing gateway
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// const razorpayInstance = new razorpay({
//     key_id:process.env.RAZORPAY_KEY_ID,
//     key_secret:process.env.RAZORPAY_KEY_SECRET,
// })



//Placing orders using cod method  


const placeOrder = async (req,res) => {
    
    try { 
        const {userId,items,amount,address} = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}});
        res.json({success:true, message:"Order Placed"})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
        
    }
} 
const headers = {
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
    'Accept':'application/json'
  };

//   --------CASHFREEEEEEEEE_____________________________*******
const placeOrderCashfree = async (req,res) =>{

    const {address,items,amount,userId} = req.body;  
    try {
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Cashfree",
            payment:false,
            date:Date.now()
        }
        const newOrder = new orderModel(orderData);
        const savedOrder = await newOrder.save()
      
          const data = { 
            order_amount: amount,
            order_currency: currency.toUpperCase(),
            order_id:savedOrder._id,
            customer_details: {
              customer_id: userId,
              customer_name: address.firstName+" "+address.lastName,
              customer_email: address.email,
              customer_phone:  address.phone,
            },
            order_meta: {
              return_url: 'https://www.yourwebsite.com/payment-response',
            },
          };
            const response = await axios.post('https://api.cashfree.com/pg/orders', data, { headers }); 
            
            
            res.json({success:true, message:"Order Created",orderId:savedOrder._id, paymentId:response.data.payment_session_id })
         
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message});
    }
}

const verifyCashfree = async (req,res)=>{

    const { order_id } = req.body;
    try {  
        
             try {
                const response = await axios.get(`https://api.cashfree.com/pg/orders/${order_id}`, { headers }); 
                if (response.data.order_status==="PAID") {            
                   const updatedOrder = await orderModel.findByIdAndUpdate(order_id, {payment:true});
                   const userId = updatedOrder.userId;
                   await userModel.findByIdAndUpdate(userId,{cartData:{}})
                    res.json({success:true})
                }else{
                    
                    await orderModel.findByIdAndDelete(order_id)
                    res.json({success:false})
                }
            } catch (error) {
                console.log(error.message);
                res.json({success:false, message:error.message});
            }
         
    } catch (error) {
        console.log(error.message);
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

//Placing orders using RazorPay

const placeOrderRazorpay = async (req,res) => {

    try {
        const {userId,items,amount,address} = req.body;
            const orderData = {
                userId,
                items,
                address,
                amount,
                paymentMethod:"Razorpay",
                payment:false,
                date:Date.now()
            }
            const newOrder = new orderModel(orderData);
            await newOrder.save()

            const options = {
                amount:amount*100,
                currency:currency.toUpperCase(),
                receipt:newOrder._id.toString()
            }

            await razorpayInstance.orders.create(options,(error,order)=>{
                   if(error){
                    console.log(error);
                    return res.json({success:false, message:error})
                   }
                   res.json({success:true,order})
            })
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
    
}

const verifyRazorpay = async (req,res) => {
    try {
        const {userId, razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
       if (orderInfo.status==='paid') {
        await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
        await userModel.findByIdAndUpdate(userId, {cartData:{}})
        res.json({success:true, message:"Payment Successful"})
       }else{
        res.json({success:false, message:'Payment Failed'})
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

export {placeOrder,placeOrderCashfree,placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus,verifyStripe,verifyRazorpay,verifyCashfree}