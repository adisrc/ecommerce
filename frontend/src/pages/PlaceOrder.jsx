import React, { useContext, useEffect, useRef } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios' 
import {load} from '@cashfreepayments/cashfree-js';
import CircularProgress from '@mui/material/CircularProgress'
import { Box, Button, FormControlLabel, MenuItem, Select, Switch, Typography } from '@mui/material'

import AddressFormDialog from '../components/AddressFormDialog'

const PlaceOrder = () => {

  const {navigate, backendUrl, token, cartItems, setCartItems,setSelectedAddress, addresses,addressFormSubmitted, setAddressFormSubmitted,
         getCartAmount, delivery_fee, products,selectedAddress,open,setOpen} = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [cod, setCod] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState({id:"001",name:"Default",cost:delivery_fee});

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

    const verifyAddress = async () => {
      setLoading(true)
      const data = {
        country: selectedAddress.country,
        pincode: selectedAddress.pincode,
        weight: 500,
        cod: cod,
      };
      const response = await axios.post(
        backendUrl + "/api/address/servicability",
        { data: data },
        { headers: { token } }
      );
      console.log(response.data);
      if (response.data.success && printroveItems.length > 0) {
        setCouriers(response.data.message.couriers);
        setSelectedCourier(response.data.message.couriers[0])
      } setLoading(false)
    }

    useEffect(() => {
      
      verifyAddress()      
    }, [cartItems,selectedAddress,addressFormSubmitted])



  let cashfree;
  let initializeSDK = async function () {
    cashfree = await load({
      mode: import.meta.env.VITE_CASHFREE_MODE // or production
    });
  }
  initializeSDK();
  const returnURL = import.meta.env.VITE_CASHFREE_MODE==="sandbox"?"http://localhost:5173":"https://adityatrend.vercel.app";
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      setLoading(true);
      selectedAddress.courier=selectedCourier;
      let orderData = {
        address: selectedAddress,
        items:orderItems,
        printroveItems:printroveItems,
        amount:getCartAmount()+delivery_fee,
      }
      const handleCashfree = async () => {   
        setLoading(true)
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
          toast.error(error.message)
        }
      };
      
      switch (cod) {
         //API Calls for COD
         case true:
          console.log("ORDERING VIA COD");
          
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
          case false: 
            if(token)
             handleCashfree();
            else{
              toast.error("Login First");
              navigate('/login');
            }break;
          default:
            break;
      }
      setLoading(false);
    } 
    catch (error) {
      console.log(error);
    }
  }

  const handleChange = (event) => {
    const selectedId = event.target.value;
    const courier = couriers.find((courier) => courier.id === selectedId);
    setSelectedCourier(courier)
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div
        className={`flex flex-col gap-6 w-full sm:max-w-[480px] ${
          addresses.length === 0 && !addressFormSubmitted ? "hidden" : ""
        }`}
      >
        <div
          className="text-xl sm:text-2xl my-6" >
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <AddressFormDialog
          addressFormSubmitted={addressFormSubmitted}
          setAddressFormSubmitted={setAddressFormSubmitted}
        />

        {/* Courier Selection */}
        {couriers.length > 0 && (
          <Select
            value={selectedCourier?.id || ""}
            onChange={handleChange}
            displayEmpty
            fullWidth
            className="flex justify-between p-2 rounded-md border border-gray-300"
          >
            {couriers.map((courier) => (
              <MenuItem key={courier.id} value={courier.id}>
                <Box className="flex items-center justify-between w-full">
                  <span>{courier.name}</span>
                  <span>₹{courier.cost}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        )}
      </div>

      {/* Right Side */}
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <div
            className={`border-2 rounded-full flex justify-center items-center transition-colors duration-300 
          ${
            cod ? "border-green-500 bg-green-100" : "border-black bg-white"
          } p-2`}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={cod}
                  onChange={(e) => setCod(e.target.checked)}
                  color="success"
                />
              }
              label={"Cash on Delivery"}
            />
          </div>

          <div className="w-full flex sm:justify-end justify-center mt-8">
            {addresses.length === 0 && !addressFormSubmitted ? (
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
                variant="contained"
                disabled={addresses.length > 0 && addressFormSubmitted}
                size="large"
                onClick={() => setOpen(true)}
              >
                Add address
              </Button>
            ) : (
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
                disabled={
                  loading || (addresses.length === 0 && !addressFormSubmitted)
                }
                size="large"
              >
                {addresses.length === 0 && !addressFormSubmitted ? (
                  "Select Address"
                ) : loading ? (
                  <CircularProgress color="inherit" />
                ) : (
                  "PLACE ORDER"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default PlaceOrder