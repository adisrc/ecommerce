import express from 'express';
import {placeOrder,placeOrderStripe,userOrders,updateStatus, allOrders, verifyStripe } from '../controllers/orderController.js'; 
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js';
import { placeOrderCashfree, verifyCashfree } from '../controllers/cashfreeController.js';
const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus);

//Payment Features
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe',authUser,placeOrderStripe);
orderRouter.post('/cashfree',authUser,placeOrderCashfree)

//User Feature
orderRouter.post('/userOrders',authUser,userOrders);

orderRouter.post('/verifyStripe',authUser,verifyStripe);
orderRouter.post('/verifyCashfree',verifyCashfree);



export default orderRouter;

