
import {v2 as cloudinary} from "cloudinary"
import productModel from "../models/productModel.js";
import axios from 'axios'
//function for adding product
const addProduct = async (req,res) => {
    try {
        const {name,description,price,category,subCategory,sizes,bestseller} = req.body;
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
       
        const images = [image1,image2,image3,image4].filter((item)=>item!==undefined)
  
        let imagesUrl = await Promise.all( 
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                return result.secure_url;
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller:bestseller==="true"?"true":false,
            sizes:JSON.parse(sizes),
            image:imagesUrl,
            date: Date.now()
        }

        console.log(productData);
        const product = new productModel(productData);
        await product.save();

        res.json({success:true, message:"Product Added"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//function for list product
const listProducts = async (req,res)=>{
    try {
        const products = await productModel.find({});
        const printrove_response = await axios.get('https://api.printrove.com/api/external/products',{headers:{ 'Authorization': `Bearer ${process.env.PRINTROVE_AUTH_TOKEN}`}})
      
        const mergedProducts = [...products, ...printrove_response.data.products.map(product => {

            let category = product.name.includes("Men") ? "Men" :
                 product.name.includes("Women") ? "Women" :
                 product.name.includes("Kids") ? "Kids" : "None";
            let subCategory = product.name.includes("T-Shirt") ? "Topwear" :
                 product.name.includes("Lower") ? "Bottomwear" :
                 product.name.includes("Winter") ? "Winterwear" : "None";

           return{ _id: product.id.toString(),
            bestseller: true,  
            category: category,
            description: `This is a ${product.product.name} with a cool theme "${product.name}"`,
            image: [product.mockup.front_mockup, product.mockup.back_mockup],
            name: product.name,
            price: 349,  
            sizes: ["M", "L", "XL"],
            subCategory: subCategory,
            printrove:true,
          }})]; 

        res.json({success:true, mergedProducts});
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

//function for removing product
const removeProduct = async(req,res)=>{ 
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Products removed"})
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

//function for single product info
const singleProduct = async (req,res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({success:true, product})
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

export {addProduct, listProducts,removeProduct, singleProduct}