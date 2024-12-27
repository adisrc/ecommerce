import { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";

function Profile() {
  const {
    backendUrl,
    token,
    userData,
    setUserData,
    navigate,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState("Personal Information");
  const [visible, setVisible] = useState(false);

  // Update Profile API Call
  const updateProfile = async () => {
    try {
      const { name,gender, email, phone } = formData;

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderPersonalInfo = () => {
    
    if (isEditing) {
      return (
        <>
          <div className="md:flex md:space-x-2">
            <input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="md:w-2/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
              type="text"
              placeholder={userData.name || "Enter Your Name"}
            />
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="md:w-1/3 font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
            >
              <option value="" disabled>
                {userData.gender || "Select Gender"}
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="font-bold px-4 bg-white rounded-lg mt-2 text-gray-800 p-2"
            type="email"
            placeholder={userData.email || "username@example.com"}
          />
          <input
            value={"+91 "+formData.phone}
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
              className="bg-black rounded-lg w-1/2 text-white mt-4 px-2 mr-2"
              onClick={updateProfile}
            >
              Update
            </button>
            <button
              className="bg-black rounded-lg w-1/2 text-white mt-4 px-2"
              onClick={() => setIsEditing(false)}
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
        <button
          className="bg-black rounded-lg w-1/2 text-white mt-4"
          onClick={() => {
            setFormData({
              name: userData.name,
              gender:userData.gender||"Not Specified",
              email: userData.email,
              phone: userData.phone || "",
            });
            setIsEditing(true);
          }}
        >
          Update Profile
        </button>
      </>
    );
  };

  return (
    <div>
      {userData ? (
        <>
          <Title text1="PROFILE" text2="PAGE" />
          <h1 className="text-sm">User ID: {userData._id}</h1>
          <br />
          <button
            onClick={() => setVisible(!visible)}
            className="border-white border-2 bg-gray-400 rounded-r text-4xl w-8 text-center pb-1 absolute left-0 sm:hidden"
          > ≡
          </button>
          <div className="flex">

          <div className={` absolute top-0 left-0 bottom-0 overflow-hidden bg-white sm:border-gray-300 border-2 transition-all 
          ${visible ? "w-3/4" : "w-0" }
               sm:w-1/2 sm:relative sm:rounded-lg sm: mr-2`}
          > 
          <img className="w-[100px] rounded-full mx-auto mt-4 border-green-400 border-2" src={userData.photoURL||assets.profile2} alt="" />
            <h1 className="text-center p-3 font-semibold">Hi, {userData.name}</h1>
            <ul className="text-gray-600 bg-white border-gray-200">
              <hr /><li
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
              > Manage Addresses
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
          <div className="p-5 bg-gray-200 flex flex-col w-full rounded-lg">
            <h1 className="text-sm">{tab}</h1>
            {tab === "Personal Information" ? renderPersonalInfo() : <div>Content for {tab}</div>}
          </div>
          </div>
        </>
      ) : (
        <h1>Please Login</h1>
      )}
    </div>
  );
}

export default Profile;
