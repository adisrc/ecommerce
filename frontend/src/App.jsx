import React from 'react'
import {Routes , Route, Navigate} from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import AddressFormDialog from './components/AddressFormDialog';
import ResponsiveAppBar from './components/ResponsiveAppBar';
const App = () => {
  return (
    <div className="relative">
      <div className="w-full fixed top-0 left-0 z-50">
        <ResponsiveAppBar />
      </div>
      <div className="py-[56px] px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<AddressFormDialog />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App