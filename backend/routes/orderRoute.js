import express from 'express';
import {placeOrder,userOrders,updateStatus, allOrders } from '../controllers/orderController.js'; 
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js';
import { placeOrderCashfree, placeOrderUpi, verifyCashfree } from '../controllers/cashfreeController.js';
const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus);

//Payment Features
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/upi',authUser,placeOrderUpi);
orderRouter.post('/cashfree',authUser,placeOrderCashfree)

//User Feature
orderRouter.post('/userOrders',authUser,userOrders);
orderRouter.post('/verifyCashfree',verifyCashfree);



export default orderRouter;

