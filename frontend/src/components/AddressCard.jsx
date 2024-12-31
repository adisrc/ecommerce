import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddressCard = ({address}) => {

      const {token,backendUrl,selectedAddress,setSelectedAddress, setShowAddresses,loadAddressData} = useContext(ShopContext);
    
    const handleCardClick = (address) => {
        setSelectedAddress({
          ...selectedAddress,
          ...address,  
        });
        setShowAddresses(false)
      };
      const handleAddressDelete = async (address) => {
        if(!address.save){
          toast.error("Address Not Saved")
          return;
        }
        const response = await axios.post(backendUrl+'/api/address/delete',{addressId:address._id},{headers:{token}})
        if(response.data.success) toast.success(response.data.message)
        else toast.error(response.data.message)
        loadAddressData()
      }    
  return (
    <div>
        <Card
                className="cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md overflow-hidden border"
                sx={{
                  border: address.default
                    ? "1px solid black"
                    : "1px solid #e0e0e0",
                  height: "230px", // Fixed height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
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
                <Box className="p-2 flex justify-end items-center gap-2">
                  {address.default ? (
                    <Typography
                      variant="body2"
                      className="font-medium text-blue-600 text-xs"
                    >
                      Default Address
                    </Typography>
                  ) : (
                    <Button
                      onClick={() => handleSetDefault(address)}
                      variant="outlined"
                      color="primary"
                      className="text-white"
                      sx={{
                        fontSize: "0.7rem", // Smaller font size
                        padding: "4px 10px",
                      }}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    onClick={() => handleAddressDelete(address)}
                    variant="outlined"
                    color="error"
                    sx={{
                      fontSize: "0.7rem", // Smaller font size
                      padding: "4px 10px",
                    }}
                  >
                    <DeleteOutlineIcon />
                  </Button>
                </Box>
              </Card>
    </div>
  )
}

export default AddressCard