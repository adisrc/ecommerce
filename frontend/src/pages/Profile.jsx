import { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { Avatar, Skeleton } from "@mui/material";

function Profile() {
  const {
    backendUrl,
    token,
    userData,
    setUserData,
    navigate
  } = useContext(ShopContext);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState("Personal Information");
  const [visible, setVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(undefined);

  const fileRef = useRef(null)

  // Update Profile API Call
  const updateProfile = async () => {
    try {
      const { name,gender, email, phone } = selectedAddress;

      // Check for unchanged fields
      if (name === userData.name && email === userData.email && phone === userData.phone && gender===userData.gender) {
        toast.warn("No changes made to update!");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/user/update`,
        { name,gender, email, phone },
        { headers: { token } }
      );

      if (response.data.success) {
        setUserData(response.data.user);
        setIsEditing(false);
        toast.success(`Hi ${response.data.user.name}, Profile updated!`);
      } else {
        toast.warn(response.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Something went wrong! Please try again.");
    }
  };

  const resetPassword = async () => {
   try {
    const response =await axios.post(backendUrl+'/api/user/resetpass',{password:newPassword},{headers:{token}}); 
    if(response.data.success){
      toast.success(response.data.message);
    }else{
      toast.warn(response.data.message);
    } 
   } catch (error) {
    console.log(error.message);
    toast.error(error.message);
   }
  }

  // Handle outside click to close the sidebar
  useEffect(() => {
    const handleOutsideClick = (event) => {
       setVisible(false); 
    }; 
    document.addEventListener("mousedown", handleOutsideClick); 
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []); 

  useEffect(() => {
    if(profilePhoto){ 
      handleImageUpload(); }
  }, [profilePhoto])

  useEffect(() => {
    if (!userData) {
      toast.warn("Please login to access the profile page.");
      navigate("/login");
    }
  }, [userData, navigate]);

  if (!userData) return null;


  const handleImageUpload = async (todo) => {
    try { 
      setPhotoLoading(true);
      const selectedAddress = new selectedAddress();
      selectedAddress.append('image', profilePhoto); 
      const response = await axios.post(backendUrl+"/api/user/upload-photo",selectedAddress,{headers:{token}});
      if(response.data.success){ 
        setUserData((prevData) => ({
          ...prevData, 
          photoURL: response.data.photoURL,
        }));
        toast.success("Profile Photo Updated!")
      }
      setPhotoLoading(false)
    } catch (error) {
      setPhotoLoading(false)
      console.log(error);
      toast.error(error.message)
    }
  }
  const handleImageDelete = async () => {
    try {
      setPhotoLoading(true);
      const image = userData.photoURL;
      const response = await axios.post(backendUrl+"/api/user/delete-photo",{image},{headers:{token}});
      if(response.data.success){ 
        setUserData((prevData) => ({
          ...prevData, 
          photoURL: response.data.photoURL,
        }));
        toast.success("Profile Photo Deleted!")
      } 
      setPhotoLoading(false)
    } catch (error) {
      setPhotoLoading(false)
      console.log(error.message);
      toast.error(error.message)
    }
  }

  const handleInputChange = (field, value) => {
    setSelectedAddress((prev) => ({ ...prev, [field]: value }));
  };

  const renderPersonalInfo = () => {
    
    if (isEditing) {
      return (
        <>
          <div className="md:flex md:space-x-2">
            <input
              value={selectedAddress.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="md:w-2/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
              type="text"
              placeholder={userData.name || "Enter Your Name"}
            />
            <select
              value={selectedAddress.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="md:w-1/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
            >
              <option value="">
                {"Select Gender"}
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input
            value={selectedAddress.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
            type="email"
            placeholder={userData.email || "username@example.com"}
          />
          <input
            value={selectedAddress.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Restrict to digits only
              if (value.length <= 10) handleInputChange("phone", value);
            }}
            className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
            type="text"
            placeholder={userData.phone || "99XXXXXX00"}
          />
          <div className="flex">
            <button
              className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 px-2 mr-2"
              onClick={updateProfile}
            >
              Update
            </button>
            <button
              className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 px-2"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </>
      );
    }
    if(isResettingPass){
      return (
        <>
          <div className="relative w-full">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2 w-full pr-12"
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 px-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <img className="w-7 pt-2" src={showPassword?assets.hidepass:assets.showpass} alt="" />
            </button>
          </div>
          <div className="flex">
            <button
              className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 px-2 mr-2"
              onClick={resetPassword}
            >
              Reset
            </button>
            <button
              className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 px-2"
              onClick={() => setIsResettingPass(false)}
            >
              Cancel
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="md:flex md:space-x-2">
        <h1 className="md:w-2/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2">
          Name: <span className="font-normal">{userData.name}</span>
        </h1>
        <h1 className="md:w-1/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2">
          Gender: <span className="font-normal">{userData.gender}</span>
        </h1>
        </div>
        <h1 className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2">
          Email: <span className="font-normal">{userData.email}</span>
        </h1>
        <h1 className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2">
          Phone:{" "}
          <span className="font-normal">
            {userData.phone || "Update Profile to add phone"}
          </span>
        </h1>
        <div className="flex">
        <button
          className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 mx-2"
          onClick={() => {
            setSelectedAddress({
              name: userData.name,
              gender:userData.gender||"N/A",
              email: userData.email,
              phone: userData.phone || "",
            });
            setIsEditing(true);
          }}
        >
          Update Profile
        </button>
        <button
          className="bg-gray-800 h-10 rounded-lg w-1/2 text-white mt-4 mx-2"
          onClick={() => { setIsResettingPass(true) }}
        >
          Reset Password
        </button>
        </div>
      </>
    );
  };

  return (
    <div>
      <>
        <Title text1="PROFILE" text2="PAGE" />
        <h1 className="text-sm">User ID: {userData._id}</h1>
        <br />
        <button
          onClick={() => setVisible(!visible)}
          className="border-white border-2 bg-gray-400 rounded-r text-4xl w-8 text-center pb-1 absolute left-0 sm:hidden"
        >
          {" "}
          ≡
        </button>
        <div className="flex">
          <div
            className={` absolute top-0 left-0 bottom-0 overflow-hidden bg-white sm:border-gray-300 border-2 transition-all 
          ${visible ? "w-3/4" : "w-0"}
               sm:w-1/2 sm:relative sm:rounded-lg sm: mr-2`}
          >
            <input
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
            />

            <div className="group mx-auto mt-4 flex items-center flex-col">
              {
                <div
                  className="cursor-pointer h-20 transition-transform duration-300 ease-in-out hover:scale-105"
                  onClick={() => fileRef.current.click()}
                >
                  {photoLoading ? (
                    <Skeleton variant="circular">
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          border: "2px solid lightgreen",
                          transition:
                            "transform 0.3s ease-in-out, filter 0.3s ease-in-out",
                          "&:hover": {
                            filter: "brightness(80%)",
                          },
                        }}
                        alt="Profile"
                        src={userData.photoURL || assets.profile2}
                      />
                    </Skeleton>
                  ) : (
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        border: "2px solid lightgreen",
                      }}
                      alt="Profile"
                      src={userData.photoURL || assets.profile2}
                    />
                  )}
                </div>
              }

              {userData.photoURL && (
                <button
                  className=" bg-black text-white text-xs z-10
                    rounded-full w-[30px] h-[30px] hover:bg-gray-600
                    sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1"
                  onClick={handleImageDelete}
                >
                  ╳
                </button>
              )}
            </div>

            <h1 className="text-center p-3 font-semibold">
              Hi, {userData.name}
            </h1>
            <ul className="text-gray-600 bg-white border-gray-200">
              <hr />
              <li
                onClick={() => setTab("Personal Information")}
                className={`${
                  tab === "Personal Information" ? "bg-gray-200 text-black" : ""
                } pl-3 hover:text-black cursor-pointer p-1`}
              >
                Personal Information
              </li>
              <hr />
              <li
                onClick={() => setTab("Manage Addresses")}
                className={`${
                  tab === "Manage Addresses" ? "bg-gray-200 text-black" : ""
                } pl-3 hover:text-black cursor-pointer p-1`}
              >
                {" "}
                Manage Addresses
              </li>
              <hr />
              <li
                onClick={() => setTab("Your Reviews")}
                className={`${
                  tab === "Your Reviews" ? "bg-gray-200 text-black" : ""
                } pl-3 hover:text-black cursor-pointer p-1`}
              >
                Your Reviews
              </li>
              <hr />
            </ul>
          </div>
          <div className="p-5 bg-gray-200 flex flex-col w-full rounded-lg my-auto">
            <h1 className="text-sm">{tab}</h1>
            {tab === "Personal Information" ? (
              renderPersonalInfo()
            ) : (
              <div>Content for {tab}</div>
            )}
          </div>
        </div>
      </>
    </div>
  );
}

export default Profile;
