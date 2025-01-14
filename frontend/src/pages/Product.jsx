import React, {useState, useContext, useEffect} from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import {LinearProgress, Popover, useMediaQuery, useTheme } from '@mui/material';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ResponsiveBottomNavigation from '../components/ResponsiveBottomNav';

const Product = () => {
  const {productId} = useParams();
  const {products,currency, addToCart,navigate,showGoToCart,setShowGoToCart} = useContext(ShopContext);
  const [productData,setProductData] = useState(false);
  const [image,setImage]= useState('');
  const [size, setSize] = useState('');
  const [open, setOpen] = useState(false); // State to control the dialog
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));


  const fetchProductData = async()=>{
   products.map((item)=>{
      if(item._id===productId){
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products,size])

  const location = useLocation();

  useEffect(() => {
    setShowGoToCart(false);
  }, [location.pathname, setShowGoToCart]); // Depend on the path and setter function
  
  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* --------------------Product Data--------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* --------------Product Images ----------------*/}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>
        {/* -----------Product Info ----------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {" "}
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {!isSmallScreen && (
            <div>
              <button
                onClick={() => {
                  showGoToCart
                    ? navigate("/cart")
                    : addToCart(productData._id, size);
                }}
                className="bg-black w-120 text-white border-2 border-gray-200 rounded-full px-8 py-3 text-sm active:bg-gray-700 m-2 w-42"
              >
                {showGoToCart ? "GO TO CART" : "ADD TO CART"}
              </button>
            </div>
          )}

          <div>
            <ResponsiveBottomNavigation>
              {!showGoToCart ? (
                <button
                  onClick={(event) => {
                    if (!size) setOpen(true);
                    setAnchorEl(event.currentTarget);
                    addToCart(productData._id, size);
                  }}
                  className="w-full bg-[#dfff00] text-black cursor-pointer flex items-center justify-center"
                >
                  <LocalMallIcon className="mx-2" /> Add to Cart
                </button>
              ) : (
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full bg-[#dfff00] text-black cursor-pointer flex items-center justify-center"
                >
                  <LocalMallIcon className="mx-2" /> Go to Cart
                </button>
              )}
            </ResponsiveBottomNavigation>

            <Popover
              open={open}
              anchorEl={anchorEl} // Element to which the popover is anchored
              onClose={() => setOpen(false)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              sx={{ mt: -8 }}
            >
              <div className="p-2">
                <p>Select Size</p>
                <div className="flex gap-2 p-4">
                  {productData.sizes.map((item, index) => (
                    <button
                      onClick={() => {
                        setOpen(false);
                        setSize(item);
                        addToCart(productData._id, item);
                      }}
                      className={`border py-2 px-4 bg-gray-100 ${
                        item === size ? "border-orange-500" : ""
                      }`}
                      key={index}
                    >
                      {" "}
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </Popover>
          </div>

          <hr className="mt-8 sm:w-4/5" />

          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery availaible on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      {/* Description and review section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">DESCRIPTION</b>
          <p className="border px-5 py-3 text-sm">Reviews(122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium
            at minus repudiandae quia aliquid deleniti aliquam reiciendis
            veniam. Hic est ipsum repudiandae modi illo cumque blanditiis ipsa
            quisquam accusamus aperiam!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure vel
            inventore fugit commodi doloremque omnis impedit quaerat officiis
            libero eveniet perspiciatis consequatur voluptates quos enim
            repudiandae, quo deleniti aut provident?
          </p>
        </div>
      </div>

      {/* Display related products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <LinearProgress color="inherit" />
  );
}

export default Product