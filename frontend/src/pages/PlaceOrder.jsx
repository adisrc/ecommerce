import React, { useContext } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios' 
import {load} from '@cashfreepayments/cashfree-js';
import CircularProgress from '@mui/material/CircularProgress'
import { Button, FormControlLabel, Switch } from '@mui/material'

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [method,setMethod] = useState('cashfree');
  const{navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products} = useContext(ShopContext);

  const handleChange = (event)=>{
    setChecked(event.target.checked);
       if(event.target.checked){
        setMethod('cod');
       }else{
        setMethod('cashfree')
       }
  }
  let cashfree;
  let initializeSDK = async function () {
    cashfree = await load({
      mode: import.meta.env.VITE_CASHFREE_MODE // or production
    });
  }
  initializeSDK();
  const returnURL = import.meta.env.VITE_CASHFREE_MODE==="sandbox"?"http://localhost:5173":"https://adityatrend.vercel.app";
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    number:'',
    address1:'',
    pincode:'',
    city:'',
    state:'',
    country:''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({...data,[name]:value}))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      setLoading(true);
      let orderItems = []
      let printroveItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];

              if (itemInfo.printrove) {
                itemInfo.variantID = itemInfo.variants[item]; // Dynamically assign variantId
                printroveItems.push(itemInfo); // Add to printroveItems array
              } else {
                orderItems.push(itemInfo); // Add to orderItems array
              }
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items:orderItems,
        printroveItems:printroveItems,
        amount:getCartAmount()+delivery_fee,
      }
      const handleCashfree = async () => {   
        try { 
          const { data } = await axios.post(backendUrl+"/api/order/cashfree", orderData, {
            headers: { token },
          });          
      
          if (!data || !data.paymentId || !data.orderId) {
            throw new Error("Invalid payment data received from the server.");
          }
      
          const paymentId = data.paymentId;
      
          // Prepare Cashfree checkout options
          const checkoutOptions = {
            paymentSessionId: paymentId,
            redirectTarget: '_modal', // Correct typo
            returnUrl: returnURL+"/verify?order_id={order_id}&method=cashfree",
          };
      
          // Start Cashfree checkout process
          cashfree.checkout(checkoutOptions).then(async(result) => {            
            if (result.error) {
              console.error("Cashfree Checkout Error:", result.error.message);
              const response = await axios.post(backendUrl + '/api/order/verifyCashfree',{ order_id:data.orderId });
              toast.error(`Payment Error: ${result.error.message}`);
              toast.error(response.data.message);
            } else if (result.redirect) {
              console.log("Redirection in process");
            } else {
              console.log("Payment Completed Successfully", result);
          //Verify cashfree Payment
            const response = await axios.post(backendUrl + '/api/order/verifyCashfree',{ order_id:data.orderId });
            console.log(response.data);
            if (response.data.success) {
              toast.success(response.data.message);
                setCartItems({})
                navigate('/orders')
            }else{
              toast.error(response.data.message)
                navigate('/cart')
            }
            }
          });
        } catch (error) {
          console.error("Error during payment processing:", error.message);
          alert("An error occurred while processing your payment. Please try again.");
        }
      };
      
      switch (method) {
         //API Calls for COD
         case 'cod':
          const response = await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}});
          console.log(response.data)
          if (response.data.success) {
            setCartItems({})
            navigate('/orders')
          } else {
            toast.error(response.data.message);
          }
          break;
          case 'stripe':
            const responseStripe = await axios.post(backendUrl+'/api/order/stripe',orderData,{headers:{token}})
            if (responseStripe.data.success) {
              const {session_url} = responseStripe.data
              window.location.replace(session_url)
            }else{
              toast.error(responseStripe.data.message)
            }
          break;
          case 'cashfree': 
            if(token)
             handleCashfree();
            else{
              toast.error("Login First");
              navigate('/login');
            }
              
              break;
          default:
            break;
      }
      setLoading(false);
    } 
    catch (error) {
      console.log(error);
    }
  }
  
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/*-------------- Left Side ---------------*/}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="name"
            value={formData.name}
            className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email Address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="address1"
          value={formData.address1}
          className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Address"
        />
        {/* <input required onChange={onChangeHandler} name='name' value={formData.name} className='border border-grey-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First Name' /> */}
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="pincode"
            value={formData.pincode}
            className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Pincode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>

        <input
          required
          onChange={onChangeHandler}
          name="number"
          value={formData.number}
          className="border border-grey-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>

      {/* --------Right Side ---------------- */}

      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          {/* -------------Payment Method Selection */}
          <div   className={`border-2 rounded-full flex justify-center items-center transition-colors duration-300 
          ${checked ? 'border-green-500 bg-green-100' : 'border-black bg-white'}`}>
          <FormControlLabel
            control={
              <Switch
                checked={checked}
                onChange={handleChange}
                color="success" // Customize the switch color
              />
            }
            label={ 
                "Cash on Delivery"
            }
          />
          </div>

          <div className="w-full flex sm:justify-end justify-center mt-8">
            <Button
              sx={{
                width: "200px",
                height: "56px",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "black", 
                color: "white", 
                "&:hover": {
                  backgroundColor: "gray", 
                },
              }}
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress color="inherit" /> : "PLACE ORDER"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder