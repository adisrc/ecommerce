import { createContext,useEffect,useState } from "react";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import axios from'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props)=>{
    
    const currency ='₹';
    const delivery_fee =0;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const printroveKey = import.meta.env.VITE_PRINTROVE_AUTH_TOKEN;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState("");
    const [showGoToCart, setShowGoToCart] = useState(false);
    const [userData, setUserData] = useState({});
    //Addresses
    const [showAddresses, setShowAddresses] = useState(false);
    const [addressFormSubmitted, setAddressFormSubmitted] = useState(false);
    const [couriers, setCouriers] = useState([
      { id: "-1", name: "Default", cost: 0 },
    ]);
    const [selectedCourier, setSelectedCourier] = useState(couriers[0]);
    const [open, setOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [defaultAddress, setDefaultAddress] = useState({});
    const [selectedAddress, setSelectedAddress] = useState({
      name: "",
      email: "",
      number: "",
      address1: "",
      pincode: "",
      city: "",
      state: "",
      country: "",
      save: true,
      default: true,
    });

    const navigate = useNavigate();


      const loadAddressData = async () => {
        try {
          const response = await axios.post(
            `${backendUrl}/api/address/user-address`,
            {},
            { headers: { token } }
          );
          if (response.data.success) {
            setAddresses(response.data.addresses);
            setDefaultAddress(response.data.defaultAddress)
          } else {
            toast.error(response.data.message || 'Failed to fetch addresses.');
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          toast.error('Failed to fetch addresses.');
        }
      };


    const addToCart= async (itemId,size)=>{
        if(!size){
          toast.warn('Select Product Size');
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
        setShowGoToCart(true);
        if (token) {
          try {
            await axios.post(backendUrl+"/api/cart/add",{itemId,size},{headers:{token}}); 
          } catch (error) {
            console.log(error);
            toast.warn(error.message);
            
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
        if(response.data.success){
          setProducts(response.data.mergedProducts);          
        }
        else{
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        
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

    const getUserData = async (params) => {
      try {
        const response = await axios.post(backendUrl+'/api/user/get',{},{headers:{token}}); 
        setUserData(response.data.userDetails); 
      } catch (error) {
        console.log(error.message); 
      } 
    }
    
    useEffect(() => {
      getProductsData(); 
      getUserData();
    }, [token])

    useEffect(() => {
      if(!token&&localStorage.getItem('token')){
        setToken(localStorage.getItem('token'));
        getUserCart(localStorage.getItem('token'));
      }
    }, [])

    const value = {
      products, currency, delivery_fee,userData, setUserData,getUserData,
      search, setSearch, showSearch, setShowSearch,
      cartItems,addToCart,getCartCount,updateQuantity,
      getCartAmount,navigate,backendUrl,printroveKey,
      setToken,token,setCartItems,showGoToCart, setShowGoToCart,selectedAddress,setSelectedAddress,
      showAddresses, setShowAddresses,addresses, setAddresses,defaultAddress,setDefaultAddress,loadAddressData,
      open,setOpen,addressFormSubmitted, setAddressFormSubmitted,
      selectedCourier, setSelectedCourier,couriers,setCouriers
    }

    return (
            <ShopContext.Provider value={value}>
                {props.children}
            </ShopContext.Provider>
    )
}

export default ShopContextProvider;