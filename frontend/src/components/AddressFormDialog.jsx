import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  Typography,
  ButtonGroup,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { ShopContext } from '../context/ShopContext';
import AddressCard from './AddressCard';
import { AddressForm } from './AddressForm';


export default function AddressFormDialog() {
  
  const {
    selectedCourier,
    setSelectedCourier,
    couriers, 
    setAddressFormSubmitted,
    open,
    setOpen, 
    token,
    selectedAddress,
    setSelectedAddress,
    showAddresses,
    setShowAddresses,
    addresses,
    defaultAddress,
    loadAddressData,
    addressFormSubmitted,
  } = useContext(ShopContext);
 

 
  useEffect(() => {
    if(open){
       setAddressFormSubmitted(false)
       setSelectedAddress({
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
      }
  }, [open])

  useEffect(() => {
    if (token) loadAddressData();
  }, [token]);

  useEffect(() => {
    if(!open)
    setToDefaultAddress()
  }, [defaultAddress,open])

  const setToDefaultAddress = () => {
    setSelectedAddress({
      ...selectedAddress,
      ...defaultAddress, // Overwrites selectedAddress with defaultAddress values
    });
  };

  const handleCourierChange = (event) => {
    const selectedId = event.target.value;
    const courier = couriers.find((courier) => courier.id === selectedId);
    setSelectedCourier(courier)
  };

  return (
    <div className={`flex flex-col `}>
      {/* Only this logic is working to show address form when no address is added */}
      {addresses.length === 0 && !addressFormSubmitted && <AddressForm />}

      {(addresses.length > 0 || addressFormSubmitted) && !open && (
        <>
          <AddressCard address={selectedAddress} />

          <div className="flex p-2 justify-center m-2">
            <ButtonGroup variant="outlined" aria-label="Compact button group">
              <Button onClick={() => setShowAddresses(true)}>
                <HomeIcon className="mr-1" />
                Select Address
              </Button>
              <Button onClick={() => setOpen(true)}>
                <AddIcon className="" />
                Add
              </Button>
            </ButtonGroup>
          </div>
        </>
      )}

      {/* Courier Selection */}
      {couriers.length > 0 &&
        (addresses.length > 0 || addressFormSubmitted) &&
        !open && (
          <Select
            value={selectedCourier?.id || ""}
            onChange={handleCourierChange}
            displayEmpty
            fullWidth
            className="flex justify-between p-2 rounded-md border border-gray-300"
          >
            {couriers.map((courier) => (
              <MenuItem key={courier.id} value={courier.id}>
                <Box className="flex items-center justify-between w-full">
                  <span className="flex items-center space-x-2">
                    <LocalShippingIcon className={`${courier.id==selectedCourier.id?"text-gray-600":"text-gray-300"}`} />
                    <span className="font-medium text-gray-800">
                      {courier.name}
                    </span>
                  </span>{" "}
                  <span>₹{courier.cost}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        )}

      {/* Add New Address */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}

      >
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <AddressForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Different Address */}
      <Dialog
        open={showAddresses}
        onClose={() => setShowAddresses(false)}
        maxWidth="lg" // Increase dialog size
        fullWidth
        fullScreen={window.innerWidth < 600}  // Make dialog full-screen on small devices (like phones)
        className="rounded-lg shadow-xl" 
      >
        <DialogTitle className="text-base font-semibold text-gray-800 border-b pb-2">
          Select an Address
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4" >
            {/* Add Address */}
            <Card
              onClick={() => {
                setShowAddresses(false);
                setOpen(true);
              }}
              className="cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md overflow-hidden border"
              sx={{
                height: "230px", // Fixed height
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AddBoxIcon fontSize="large" color="primary" />
              <Typography variant="body2" className="text-gray-600 text-md">
                {" "}
                Add Address
              </Typography>
            </Card>

            {addresses.map((address, index) => (
              <AddressCard key={address.id || index} address={address} />
            ))}
          </div>
        </DialogContent>
        <DialogActions className="border-t pt-2">
          <Button
            onClick={() => setShowAddresses(false)}
            color="secondary"
            className="text-gray-600 text-sm"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


 