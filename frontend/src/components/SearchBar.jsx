import React, { useState, useContext, useEffect, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(true);
  const inputRef = useRef(null);
  const searchBarRef = useRef(null); // Reference for the whole search bar
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes('collection')) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  // Focus input when search bar is visible
  useEffect(() => {
    if (visible && showSearch && inputRef.current) {
      inputRef.current.focus(); // Focus the input field
    }
  }, [visible, showSearch]);

  // Close search when clicked outside of the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }} ref={searchBarRef}>
      {showSearch ? (
        <>
          <div>
            <input type='text'
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              style={{
                backgroundColor: "gray",
                borderRadius: "50px",
                paddingLeft: "20px",
                color: "white"
              }}
            />
          </div>
          <IconButton
            color="inherit"
            onClick={() => setShowSearch(false)}
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </>
      ) : (
        <IconButton
          color="inherit"
          onClick={() => {
            if (location.pathname !== '/collection') navigate('/collection');
            setShowSearch(true);
          }}
          sx={{ ml: 1 }}
        >
          <SearchIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default SearchBar;