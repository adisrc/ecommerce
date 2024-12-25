import { createContext,useEffect,useState } from "react";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import axios from'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props)=>{
    
    const currency ='₹';
    const delivery_fee =0;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token,setToken] = useState(''); 
    const [showGoToCart, setShowGoToCart] = useState(false);

    const navigate= useNavigate();


    const addToCart= async (itemId,size)=>{
        if(!size){
          toast.error('Select Product Size');
          return;
        }
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
          if(cartData[itemId][size]){
            cartData[itemId][size] +=1;
          }
          else{
            cartData[itemId][size]=1;
          }
        }else{
          cartData[itemId] = {};
          cartData[itemId][size]=1;
        }
        setCartItems(cartData);

        if (token) {
          try {
            await axios.post(backendUrl+"/api/cart/add",{itemId,size},{headers:{token}});
            setShowGoToCart(true);
          } catch (error) {
            console.log(error);
            toast.error(error.message);
            
          }
        }

    }

    const getCartCount=()=>{
      let totalCount = 0;
      for(const items in cartItems){
        for(const item in cartItems[items]){
          try {
            if(cartItems[items][item]>0){
              totalCount+=cartItems[items][item];
            }
            
          } catch (error) {
            console.log(error);
            
            
          }
        }
      }
      return totalCount;
    }

    const updateQuantity = async(itemId,size,quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId][size]=quantity;
        setCartItems(cartData);

        if (token) {
          try {
            await axios.post(backendUrl+'/api/cart/update',{itemId,size,quantity},{headers:{token}})
          } catch (error) {
            console.log(error);
            toast.error(error.message);
          }
        }
    }
    const getCartAmount=() =>{
      let totalAmount=0;
      for(const items in cartItems){
        let itemInfo = products.find((product)=>product._id===items);
        for(const item in cartItems[items]){
          try {
            if(cartItems[items][item]>0){
              totalAmount += itemInfo.price* cartItems[items][item];
            }
          } catch (error) {
            
          }
        }
      }
      return totalAmount;
    }
     
    const getProductsData = async () => {
      try {
        const response = await axios.get(backendUrl+'/api/product/list');
        
        const apiKey = import.meta.env.VITE_PRINTROVE_AUTH_TOKEN 

        const printrove_response = await axios.get('https://api.printrove.com/api/external/products',{headers:{ 'Authorization': `Bearer ${apiKey}`}})
        
        const mergedProducts = [...response.data.products, ...printrove_response.data.products.map(product => ({
          _id: product.id.toString(),
          bestseller: true,  
          category: "Men", // Change as needed
          description: `This is a ${product.product.name} with a cool debug theme.`, // Modify as needed
          image: [product.mockup.front_mockup, product.mockup.back_mockup], // Use the front mockup as the main image
          name: product.name,
          price: 349, // Example price, modify as required
          sizes: ["M", "L", "XL"], // Modify based on available sizes from Printrove if needed
          subCategory: "Topwear", // Modify as required
        }))];        
        
        if(response.data.success){
          setProducts(mergedProducts);
        }
        else{
          toast.error(response.data.message);
        }
        
      } catch (error) {
        console.log(error);
        toast.error(response.data.message);
        
      }
    }

    const getUserCart = async (token) => {
      try {
        const response = await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}});
        if(response.data.success){
          setCartItems(response.data.cartData); 
        }
      } catch (error) {
        console.log(error);
        toast.error(response.data.message);
      }
    }
    
    useEffect(() => {
      getProductsData(); 
    }, [])

    useEffect(() => {
      if(!token&&localStorage.getItem('token')){
        setToken(localStorage.getItem('token'));
        getUserCart(localStorage.getItem('token'));
      }
    }, [])

    const value = {
      products, currency, delivery_fee,
      search, setSearch, showSearch, setShowSearch,
      cartItems,addToCart,getCartCount,updateQuantity,
      getCartAmount,navigate,backendUrl,
      setToken,token,access_token, setAccessToken,setCartItems,showGoToCart, setShowGoToCart
    }

    return (
            <ShopContext.Provider value={value}>
                {props.children}
            </ShopContext.Provider>
    )
}

export default ShopContextProvider;