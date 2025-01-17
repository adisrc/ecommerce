import React from "react";
import { BottomNavigation } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const ResponsiveBottomNavigation = ({children}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  if (!isSmallScreen) return null;

  return (
    <BottomNavigation
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        backgroundColor: "black",
      }}
    > {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          sx: { 
            width: '100%',  // Make each child take full width
            backgroundColor: '#DFFF00',  // Example background color
            ...child.props.sx, // Merge any existing sx props from children
          },
        })
      )}
    </BottomNavigation>
  );
};

export default ResponsiveBottomNavigation;