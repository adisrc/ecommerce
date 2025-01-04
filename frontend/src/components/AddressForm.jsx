import axios from 'axios';
import { useState,useContext } from 'react';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ShopContext } from '../context/ShopContext';


export const AddressForm = () => {
    const { backendUrl, selectedAddress, setSelectedAddress,addressFormSubmitted,setAddressFormSubmitted,open,setOpen,token,loadAddressData} = useContext(ShopContext);
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
        handleFormSubmit(selectedAddress);
      }
    };
  
    const handleFormSubmit = async (selectedAddress) => {
     
      event.preventDefault();
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
          width:'100%',
          maxWidth: 480,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          rowGap: 2,
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
            label="Save"
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
            label="Default"
          />
        </div>
        <Button
          type={pincodeChecked ? 'submit' : 'button'}
          variant={pincodeChecked ? 'contained' : 'outlined'}
          onClick={pincodeChecked ? null : checkPincode}
        >
          {pincodeChecked ? 'Select Address' : 'Check Pincode Availability'}
        </Button>
      </Box>
    );
  };