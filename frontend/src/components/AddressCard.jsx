import { Box, Button, Card, CardContent, Typography, ButtonGroup, useTheme } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddressCard = ({ address }) => {
  const [loading, setLoading] = useState(false);

  const { addresses, token, backendUrl, selectedAddress, setSelectedAddress, setShowAddresses, loadAddressData, setAddressFormSubmitted } = useContext(ShopContext);

  const handleCardClick = (address) => {
    setSelectedAddress({
      ...selectedAddress,
      ...address,
    });
    setShowAddresses(false);
  };

  const handleAddressDelete = async (address) => {
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/address/delete', { addressId: address._id }, { headers: { token } });
      if (response.data.success)
        toast.success(response.data.message);
      else toast.error("Select Address");

      if (addresses.length < 2)
        setAddressFormSubmitted(false);
      setSelectedAddress({
        name: '',
        email: '',
        number: '',
        address1: '',
        pincode: '',
        city: '',
        state: '',
        country: '',
        save: true,
        default: true,
      });

      await loadAddressData();
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }; 
  return (
    <div>
      <Card
        className="cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md border"
        sx={{
          height: "230px", // Fixed height
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: address.default ? "2px solid #D9F0D7" : "",
        }}
      >
        <CardContent
          onClick={() => handleCardClick(address)}
          className="p-4 flex-grow"
        >
          <Typography
            variant="subtitle1"
            className="font-medium text-gray-900 text-sm"
          >
            {address.name}
          </Typography>
          <Typography variant="body2" className="text-gray-600 text-xs">
            {address.email}
          </Typography>
          <Typography variant="body2" className="text-gray-600 text-xs">
            {address.number}
          </Typography>
          <Typography variant="body2" className="text-gray-500 text-xs">
            {address.address1}
          </Typography>
          <Typography variant="body2" className="text-gray-500 text-xs">
            {address.city}, {address.state}, {address.pincode}
          </Typography>
        </CardContent>
        <Box
          className="p-2 flex justify-end items-center gap-2"
          style={{ position: "relative", height: "100%" }}
        >
          <ButtonGroup
            variant="outlined"
            color="primary"
            sx={{
              height: "40px",
              position: "absolute",
              bottom: "16px", // Position 16px from the bottom
              left: "50%",
              transform: "translateX(-50%)", // Center horizontally
              zIndex: 10, // Ensures the ButtonGroup is on top
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Elevation shadow
              backgroundColor: "white", // Background color for elevation
              borderRadius: "8px", // Optional: Rounded corners for aesthetics
            }}
          >
            {/* Default tag display */}
            {address.default && (
              <Typography
              sx={{
                width: "74px",
                 marginX: 3,
                display: "flex",         // Align the content horizontally
                alignItems: "center",    // Vertically align the icon and text
                justifyContent: "center" // Center content horizontally
              }}
              variant="body2"
              className="font-medium text-green-600 text-xs mb-2"
            >
              <RadioButtonCheckedIcon sx={{ marginRight: 1 }} /> {/* Optional: Add margin to space the icon and text */}
              DEFAULT
            </Typography>
            )}
            {!address.default && (
              <Button
                sx={{ width: "110px" }}
                onClick={() => handleSetDefault(address)}
                className={`text-xs font-medium px-3 py-1.5`}
              ><RadioButtonUncheckedIcon className='mr-2'/>{" "}
                 <span>Default</span> 
              </Button>
            )}

            <Button
              onClick={() => handleCardClick(address)} // You can change this to open edit form if needed
              className="text-xs font-medium px-3 py-1.5"
            >
              <EditIcon sx={{ fontSize: "16px" }} />
            </Button>
            <Button
              onClick={() => handleAddressDelete(address)}
              className="text-xs font-medium px-3 py-1.5"
            >
              <DeleteOutlineIcon sx={{ fontSize: "16px" }} />
            </Button>
          </ButtonGroup>
        </Box>
      </Card>
    </div>
  );
}

export default AddressCard;