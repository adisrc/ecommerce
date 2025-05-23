// npm i cors dotenv express jsonwebtoken mongoose multer nodemon validator cloudinary bcrypt
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import addressRouter from './routes/addressRoute.js';

//App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//Middlewares 
app.use(express.json());
app.use(cors());

//API endpoints
app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/address',addressRouter);

app.get('/',(req,res)=>{
    res.send("API WORKING");
})


app.listen(port,()=>console.log("Server Started on PORT : "+ port));
