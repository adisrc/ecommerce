import React, { useContext, useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  CardContent,
  Card,
  Typography,
  ButtonGroup,
} from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddressCard from './AddressCard';

const AddressForm = ({ onSubmit, selectedAddress, setSelectedAddress }) => {
  const { backendUrl } = useContext(ShopContext);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const checkPincode = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/address/check-pincode/${selectedAddress.pincode}`
      );
      if (response.data.success) {
        setPincodeChecked(true);
        setSelectedAddress((prev) => ({
          ...prev,
          city: response.data.message.city,
          state: response.data.message.state,
          country: response.data.message.country,
        }));
      } else {
        toast.error(response.data.message);
        setPincodeChecked(false);
      }
    } catch (error) {
      console.error('Error fetching pincode:', error);
      toast.error('Something went wrong while checking the pincode.');
      setPincodeChecked(false);
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setSelectedAddress((prev) => ({ ...prev, [name]: value }));
    if (name === 'pincode') {
      setPincodeChecked(false);
      setSelectedAddress((prev) => ({
        ...prev,
        city: '',
        state: '',
        country: '',
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0 || !pincodeChecked) {
      setErrors(fieldErrors);
    } else {
      setErrors({});
      onSubmit(selectedAddress);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!selectedAddress.name.trim()) newErrors.name = 'Name is required';
    if (!selectedAddress.email.trim() || !/\S+@\S+\.\S+/.test(selectedAddress.email))
      newErrors.email = 'Valid email is required';
    if (!selectedAddress.number.trim() || !/^\d{10}$/.test(selectedAddress.number))
      newErrors.number = 'Valid 10-digit phone number is required';
    if (!selectedAddress.address1.trim()) newErrors.address1 = 'Address is required';
    if (!selectedAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
    return newErrors;
  };



  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        maxWidth: 480,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
      }}
    >
      <TextField
        required
        label="Name"
        name="name"
        value={selectedAddress.name}
        onChange={onChangeHandler}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
      />
      <TextField
        required
        label="Email Address"
        name="email"
        value={selectedAddress.email}
        onChange={onChangeHandler}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
      />
      <TextField
        required
        label="Phone Number"
        name="number"
        value={selectedAddress.number}
        onChange={onChangeHandler}
        error={!!errors.number}
        helperText={errors.number}
        fullWidth
      />
      <TextField
        required
        label="Address"
        name="address1"
        value={selectedAddress.address1}
        onChange={onChangeHandler}
        error={!!errors.address1}
        helperText={errors.address1}
        fullWidth
      />
      <TextField
        required
        label="Pincode"
        name="pincode"
        value={selectedAddress.pincode}
        onChange={onChangeHandler}
        error={!pincodeChecked && !!errors.pincode}
        helperText={
          pincodeChecked
            ? `${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
            : errors.pincode || 'Check Availability'
        }
        color={pincodeChecked ? 'success' : 'primary'}
        fullWidth
      />
      <div className="flex justify-between">
        <FormControlLabel
          control={
            <Checkbox
              onChange={(e) =>
                setSelectedAddress((prev) => ({
                  ...prev,
                  save: e.target.checked,
                  default:e.target.checked,
                }))
              }
              defaultChecked
            />
          }
          label="Save Address"
        />
        <FormControlLabel
          control={
            <Checkbox
              onChange={(e) =>
                setSelectedAddress((prev) => ({
                  ...prev,
                  default: e.target.checked,
                }))
              }
              disabled={selectedAddress.save ? false : true}
              defaultChecked
            />
          }
          label="Set as Default Address"
        />
      </div>
      <Button
        type={pincodeChecked ? 'submit' : 'button'}
        variant={pincodeChecked ? 'contained' : 'outlined'}
        onClick={pincodeChecked ? null : checkPincode}
      >
        {pincodeChecked ? 'Continue' : 'Check Pincode Availability'}
      </Button>
    </Box>
  );
};

export default function AddressFormDialog() {
  
  const {addressFormSubmitted, setAddressFormSubmitted,open,setOpen, backendUrl, token,selectedAddress,setSelectedAddress,showAddresses, setShowAddresses,addresses,defaultAddress,loadAddressData} = useContext(ShopContext);
 
  useEffect(() => {
    if(open) setAddressFormSubmitted(false)
  }, [open])
  const handleFormSubmit = async (selectedAddress) => {
   
    event.preventDefault()
    event.stopPropagation(); 

    if(selectedAddress.save){
      try {
        const response = await axios.post(
          `${backendUrl}/api/address/save-address`,
          { newAddress: selectedAddress },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          setOpen(false);
          loadAddressData();
          setAddressFormSubmitted(true)
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('Error saving address:', error);
        toast.error('Failed to save address.');
      }
    }else{setAddressFormSubmitted(true); setOpen(false);}
  };

  useEffect(() => {
    if (token) loadAddressData();
  }, [token]);
  useEffect(() => {
    setToDefaultAddress()
  }, [defaultAddress])

  const setToDefaultAddress = () => {
    setSelectedAddress({
      ...selectedAddress,
      ...defaultAddress, // Overwrites selectedAddress with defaultAddress values
    });
  };

  return (
<div className={`flex flex-col `}>
              <AddressCard address={selectedAddress} />
            <div className="flex p-2 justify-end">
              <ButtonGroup
                variant="outlined"
                aria-label="Compact button group"
              >
                  <Button onClick={() => setShowAddresses(true)}>
                    <HomeIcon className='mr-1'/>
                    Select Address
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedAddress({
                        default: true,
                        save: true,
                      });
                      setOpen(true);
                    }}
                  >
                    <AddIcon className=''/>Add
                  </Button>
              </ButtonGroup>
      </div>

      {/* Add New Address */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <AddressForm
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            onSubmit={handleFormSubmit}
          />
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
        className="rounded-lg shadow-xl"
      >
        <DialogTitle className="text-base font-semibold text-gray-800 border-b pb-2">
          Select an Address
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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


 