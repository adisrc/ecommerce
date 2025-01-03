import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Badge } from '@mui/material';
import SearchBar from './SearchBar';

const pages = ['home', 'collection', 'about','contact'];
const settings = ['profile', 'orders', 'logout'];


function Pages({ handleCloseNavMenu }) {
  const location = useLocation();
  return (
    <>
      {pages.map((page) => {
        const isActive = location.pathname === `/${page}`; // Check if current path matches
        return (
          <MenuItem key={page} onClick={handleCloseNavMenu}>
            <Link
              to={`/${page}`}
              style={{
                textDecoration: "none",
              }}
            >
              <Typography
                sx={{
                  fontWeight: isActive ? 700 : 500, // Bold text for active route
                  textTransform: "uppercase",
                  color: isActive ? "#DFFF00" : "white", // Set color based on active route
                  padding: isActive ? "0.3rem 0.6rem" : "0", // Padding for active state
                  borderRadius: "5px", // Rounded corners for the active state
                  "&:hover": {
                    color: "#DFFF00",
                  },
                  transition: "all 0.3s ease", // Smooth transition for all properties
                }}
              >
                {page}
              </Typography>
            </Link>
          </MenuItem>
        );
      })}
    </>
  );
}

function ResponsiveAppBar() {

    const {
      showSearch,
      setShowSearch,
      getCartCount,
      navigate,
      token,
      setToken,
      setCartItems,
      userData,
    } = React.useContext(ShopContext);

  const location = useLocation();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken(""); 
    setCartItems({});
  };

  return (
    <AppBar position="static" sx={{ marginTop: 0, backgroundColor: "black" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  backgroundColor: "black", // Menu background color
                },
              }}
            >
              <Pages handleCloseNavMenu={handleCloseNavMenu} />
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              textDecoration: "none",
              "&:hover": {
                color: "#DFFF00",
              },
            }}
          >
            Sarky
          </Typography>

         
          {!showSearch&&
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Pages handleCloseNavMenu={handleCloseNavMenu} />
          </Box>}

          {token ? (
            <Box sx={{ flexGrow: 0, display:"flex"}}> 
             <SearchBar/>
            <IconButton
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
                onClick={() => navigate("/cart")}
              >
                <Badge badgeContent={getCartCount()} color="error">
                  <LocalMallIcon />
                </Badge>
              </IconButton>

              <Tooltip title="Open Menu">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  {userData && (
                    <Avatar
                      className="ml-4"
                      alt="Profile"
                      src={userData.photoURL || "/static/images/avatar/2.jpg"}
                    />
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                sx={{
                  mt: "45px",
                  "& .MuiPaper-root": {
                    backgroundColor: "black",
                  },
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => {
                  const isActive = location.pathname === `/${setting}`;
                  const isLogout = setting.toLowerCase() === "logout";

                  return (
                    <MenuItem
                      component={!isLogout ? Link : "div"} // Use Link for navigation, div for logout
                      to={!isLogout ? `/${setting}` : undefined} // Only set `to` if not logout
                      onClick={() => {
                        if (isLogout) {
                          logout(); // Call logout function for "logout"
                        }
                        handleCloseUserMenu(); // Close the menu in both cases
                      }}
                      key={setting}
                    >
                      <Typography
                        sx={{
                          textAlign: "center",
                          textTransform: "capitalize",
                          fontWeight: isActive ? 700 : 500, // Bold for active menu item
                          color: isActive ? "#DFFF00" : "gray", // White for active menu item
                          "&:hover": {
                            color: "#DFFF00",
                          },
                          transition: "color 0.3s ease, transform 0.3s ease",
                          cursor: "pointer",
                          width: "100px",
                        }}
                      >
                        {setting}
                      </Typography>
                    </MenuItem>
                  );
                })}

                {/*  */}
              </Menu>
            </Box>
          ) : (
            <Link to={"/login"}>Login</Link>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
