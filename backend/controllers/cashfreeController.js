import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();  // Load .env file
import { Cashfree } from "cashfree-pg"; 

Cashfree.XClientId = process.env.CASHFREE_MODE=='production'?process.env.CASHFREE_CLIENT_ID:process.env.CASHFREE_CLIENT_ID_TEST;
Cashfree.XClientSecret = process.env.CASHFREE_MODE=='production'?process.env.CASHFREE_SECRET_KEY:process.env.CASHFREE_SECRET_KEY_TEST;
Cashfree.XEnvironment = process.env.CASHFREE_MODE=='production'? Cashfree.Environment.PRODUCTION:Cashfree.Environment.SANDBOX;


const currency = 'inr'
const deliveryCharge = 10

export const placeOrderCashfree = async (req, res) => {
    const { address, items, printroveItems, amount, userId } = req.body;
  
    // Validate required fields
    if (!address || !items || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: address, items, amount, or userId.",
      });
    }
  
    try {
      // Create order data
      const orderData = {
        userId,
        items,
        printroveItems,
        address,
        amount,
        paymentMethod: "Cashfree",
        PAID: false,
        date: Date.now(),
      };
  
      // Save order to database
      const newOrder = new orderModel(orderData);
      const savedOrder = await newOrder.save();
  
      if (!savedOrder) {
        throw new Error("Failed to save the order.");
      }
  
      // Prepare data for Cashfree
      const data = {
        order_amount: amount,
        order_currency: currency.toUpperCase(),
        order_id: savedOrder._id,
        customer_details: {
          customer_id: userId,
          customer_name: address.name,
          customer_email: address.email,
          customer_phone: address.number,
        },
        order_meta: {
          return_url: "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
        },
      };
  
      // Send request to Cashfree
      Cashfree.PGCreateOrder("2022-09-01", data).then((response) => {
        console.log('Order Created successfully:',response.data)
        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            orderId: savedOrder._id,
            paymentId: response.data.payment_session_id,
          });
    }).catch((error) => {
        console.error('Error:', error.response.data.message);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the order.",
            error: error.response.data.message, // Include error details in development if needed
          });
    });

    } catch (error) {
      console.error("Error in placeOrderCashfree:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the order.",
        error: error.message, // Include error details in development if needed
      });
    }
  };
  
  export const verifyCashfree = async (req, res) => {
    const { order_id } = req.body;
  
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }
    try {
      const response = await Cashfree.PGFetchOrder("2022-09-01", order_id);
      if (!response || !response.data) {
        throw new Error('Invalid response received from Cashfree API.');
      }
  
      if (response.data.order_status === "PAID") {
        const updatedOrder = await orderModel.findByIdAndUpdate(order_id, { PAID: true }, { new: true });
        if (!updatedOrder) {
          return res.status(404).json({
            success: false,
            message: "Order not found.",
          });
        }
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
        return res.json({
          success: true,
          message: "Payment verified and order updated.",
        });
      } else {
        // Delete order if payment is not successful
        await orderModel.findByIdAndDelete(order_id);
  
        return res.status(200).json({
          success: false,
          message: "Payment not completed. Order has been deleted.",
        });
      }
    } catch (error) {
      console.error("Error in verifying Cashfree payment:", error.message);
  
      return res.status(500).json({
        success: false,
        message: "An error occurred while verifying payment.",
        error: error.message, // Include error details in development if needed
      });
    }
  };
  