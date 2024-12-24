import express from 'express';
import {placeOrder,placeOrderRazorpay,placeOrderStripe,userOrders,updateStatus, allOrders, verifyStripe, verifyRazorpay, placeOrderCashfree, verifyCashfree } from '../controllers/orderController.js'; 
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js';
const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus);

//Payment Features
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe',authUser,placeOrderStripe);
orderRouter.post('/razorpay',authUser,placeOrderRazorpay);
orderRouter.post('/cashfree',authUser,placeOrderCashfree)

//User Feature
orderRouter.post('/userOrders',authUser,userOrders);

orderRouter.post('/verifyStripe',authUser,verifyStripe);
orderRouter.post('/verifyRazorpay',authUser,verifyRazorpay);
orderRouter.post('/verifyCashfree',authUser,verifyCashfree);



export default orderRouter;

