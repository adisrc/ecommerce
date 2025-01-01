import axios from 'axios';
import addressModel from '../models/addressModel.js';

//Verify PINCODE from printrove API
export const checkPincode = async (req, res) => {
    try { 
        const response = await axios.get(
          `https://api.printrove.com/api/external/pincode/${req.params.pincode}`,
          {
            headers: {
              "Authorization": `Bearer ${process.env.PRINTROVE_AUTH_TOKEN}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
          }
        );
            if(response && response.data)
            res.json({success:true,message:response.data});
        else throw new Error('No valid response data from the external API');
    } catch (error) { 
        res.json({success:false,message:"INVALID PIN CODE"})
      }
  };

  //Check printrove servicability
  export const printroveServicability = async (req,res) => {
    const {data} = req.body;
    try { 
      const url = new URL(
        "https://api.printrove.com/api/external/serviceability"
    ); 
    Object.keys(data)
        .forEach(key => url.searchParams.append(key, data[key]));
        let headers = {
          'Authorization': `Bearer ${process.env.PRINTROVE_AUTH_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
      }; 
      const response = await axios.get(url.toString(), { headers });
      if(response && response.data)
          res.json({success:true,message:response.data});
      else throw new Error('No valid response data from the external API');
  } catch (error) { 
      res.json({success:false,message:error.message})
    }
    
  }

  //Save new Address
  export const saveAddress = async (req, res) => {
    try {
      const { userId, newAddress } = req.body;
      newAddress.userId = userId;
  
      if (newAddress.default) {
        await addressModel.updateMany(
          { userId, default: true }, 
          { $set: { default: false } }  
        );
      }
      
      const newAddressData = new addressModel(newAddress);
      await newAddressData.save();
  
      if (newAddressData.default)
      res.json({ success: true, message: "Address Saved as Default" });
    else
      res.json({ success: true, message: "Address Saved" });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: "Error Saving Address" });
    }
  };
  

  export const getUserAddresses = async (req, res) => {
    try {
      const { userId } = req.body; 
      let addresses = await addressModel.find({ userId }); 
      let defaultAddress = addresses.find(address => address.default === true);
      if (!defaultAddress && addresses.length > 0) { 
        defaultAddress = addresses[0];
        defaultAddress.default = true;
        await defaultAddress.save(); 
      }
      if (defaultAddress) {
        addresses = addresses.filter(address => address._id !== defaultAddress._id);
        addresses.unshift(defaultAddress);
      } 
      res.json({
        success: true,
        addresses,
        defaultAddress: defaultAddress || null,
      });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

  export const deleteAddress = async (req,res) => {
    const {addressId} = req.body;  
    try {
        if(addressId){
            await addressModel.findByIdAndDelete(addressId);
            res.json({success:true,message:"Address Deleted"})
        }else res.json({success:false,message:"Address Not Found"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }

  }
  