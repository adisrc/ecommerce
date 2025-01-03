import React, { useContext, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios' 
import {load} from '@cashfreepayments/cashfree-js';
import CircularProgress from '@mui/material/CircularProgress'
import {Fab,useMediaQuery } from '@mui/material'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography'; 
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; 
import AddressFormDialog from '../components/AddressFormDialog'
import { useTheme } from '@emotion/react'
import Cart from './Cart'

const PlaceOrder = () => {

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    addresses,
    addressFormSubmitted,
    selectedCourier,
    setSelectedCourier,
    couriers,
    setCouriers,
    getCartAmount,
    delivery_fee,
    products,
    selectedAddress,
    open,
    setOpen,
  } = useContext(ShopContext);
  
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [printroveItems, setPrintroveItems] = useState([]); 
  const [method,setMethod] = useState('upi');
  const [paymentLinks, setPaymentLinks] = useState({});


        const populateItems = () => {
        const tempOrderItems = [];
        const tempPrintroveItems = [];
    
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
                  itemInfo.variantID = itemInfo.variants[item]; // Assign variantId dynamically
                  tempPrintroveItems.push(itemInfo); // Add to printroveItems
                } else {
                  tempOrderItems.push(itemInfo); // Add to orderItems
                }
              }
            }
          }
        }
        setOrderItems(tempOrderItems);
        setPrintroveItems(tempPrintroveItems);
      };

      const getCouriers = async () => { 
      if(printroveItems.length>0){
      setLoading(true)
      const data = {
        country: selectedAddress.country,
        pincode: selectedAddress.pincode,
        weight: 500,
        cod: (method=='cod')?true:false,
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
    }else{
      setCouriers([{ id: "-1", name: "Default", cost: 0 },])
      setSelectedCourier(couriers[0])
    }
    }

    useEffect(() => {
      populateItems();
    }, [cartItems, products]);

    useEffect(() => {
      getCouriers()      
    }, [cartItems,selectedAddress,addressFormSubmitted,printroveItems,orderItems])



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
            returnUrl: returnURL+"/home",
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


      const handleUPI = async () => {

        try {
          const { data } = await axios.post(backendUrl+"/api/order/cashfree", orderData, {
            headers: { token },
          });                    
      
          if (!data || !data.paymentId || !data.orderId) {
            throw new Error("Invalid payment data received from the server.");
          }

          const paymentId = data.paymentId;

          const upiresponse = await axios.post(backendUrl+'/api/order/upi',{paymentId},{headers:{token}});
          if(upiresponse.data.success)
          setPaymentLinks(upiresponse.data.payload)
         else toast.error(upiresponse.data.message)

        } catch (error) {
          toast.error(error.message);
        }

      }
      
      switch (method) {
         case 'upi':
          console.log("Paying via UPI");
          if(token) handleUPI();
          else toast.error("Login to Continue");
          
          break;
         case 'cod':
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
          case 'cashfree': 
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
  useEffect(() => {
    console.log(selectedAddress);    
  }, [selectedAddress])

  const theme = useTheme(); // Access the theme
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Check if screen is smaller than 'sm'

 
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}

      <div className="flex flex-col gap-6 w-full sm:max-w-[480px]"> 
        <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />} >
          <Typography component="span">Delivering to {selectedAddress.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <AddressFormDialog />

        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />} >
          <Typography component="span">Items</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Cart/>

        </AccordionDetails>
      </Accordion>


      </div>

      {/* Right Side */}
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-8">

      <Title text1={'PAYMENT'} text2={'METHOD'}/>

          {/* -------------Payment Method Selection */} 

          <div>
      {/* <button onClick={handleUPI}>Create Payment Session</button> */}

      {Object.keys(paymentLinks).length > 0 && (
        <div>
          <h3>Select a Payment Method:</h3>
          {Object.entries(paymentLinks).map(([key, url]) => (
            <button
              key={key}
              onClick={() => window.open(url, '_blank')}
              style={{
                margin: '5px',
                padding: '10px',
                backgroundColor: 'blue',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Pay with {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
          {/*  */}

          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={()=>setMethod('upi')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='upi'?'bg-green-400':''}`}>
              </p>
              <p className='text-gray-500 text-sm font-medium mx-4'>PAY USING UPI</p>

            </div>
            <div onClick={()=>setMethod('cashfree')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='cashfree'?'bg-green-400':''}`}>

              </p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASHFREE</p>

            </div>
            <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='cod'?'bg-green-400':''}`}>

              </p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>

            </div>
          </div>


        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12"> 

          <div className="w-full flex sm:justify-end justify-center mt-8">
            {<Fab 
            onClick={onSubmitHandler} 
            sx={{
              position: isSmallScreen ? 'fixed' : 'static', // Use 'static' when it's not a small screen
              bottom: isSmallScreen ? '16px' : 'auto', // Only apply bottom when it's a small screen
              left: isSmallScreen ? '50%' : 'auto', // Only apply left when it's a small screen
              transform: isSmallScreen ? 'translateX(-50%)' : 'none', // Only apply translateX on small screen
              zIndex: 50,
              width: '200px', // Same width as Button
              height: '56px', // Same height as Button
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'black', // Same background color as Button
              color: 'white', // Same text color as Button
              '&:hover': {
                backgroundColor: 'gray', // Same hover effect as Button
              },
            }}
      variant="extended"
      color="primary"
      disabled={loading || (addresses.length === 0 && !addressFormSubmitted)}
    >
      {loading ? (
        <CircularProgress color="inherit" size={24} />
      ) : addresses.length === 0 && !addressFormSubmitted ? (
        "Select Address"
      ) : (
        "PLACE ORDER"
      )}
    </Fab>}

          </div>
        </div>
      </form>
    </div>
  );
}

export default PlaceOrder