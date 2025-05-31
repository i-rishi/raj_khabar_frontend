/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import {
  MdOutlineMenuOpen,
  MdOutlineMenu,
  MdOutlineLightMode,
  MdOutlineDarkMode
} from "react-icons/md";
import { SearchBox } from "../SearchBox/SearchBox";
import { Box } from "@mui/material";
import logo from "../../assets/images/rajkhabar.png";

import { useState } from "react";

//imports for menu
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";

export function Header({ onMenuClick, isDrawerOpen }) {
  const userProfile = "https://shorturl.at/8WzQY";
  const userName = "Rishi Sharma";
  const userRole = "Admin";

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid w-100">
          <div className="d-flex align-items-center ">
            <div className="col-sm-2 part_1">
              <Link to={"/"} className="d-flex align-items-center">
                <img src={logo} className="logo" />
              </Link>
            </div>
            <div className="col-sm-3 d-flex align-items-center part_2 pl-4">
              <Button
                onClick={onMenuClick}
                className="rounded-circle"
                sx={{ marginRight: "16px" }}
              >
                {isDrawerOpen ? <MdOutlineMenuOpen /> : <MdOutlineMenu />}
              </Button>
              <SearchBox />
            </div>
            <div className="col-sm-7 d-flex align-items-center justify-content-end part_2 pl-4">
              <div className="myAccWrapper">
                <Button
                  className="myAcc d-flex align-items-center"
                  onClick={handleClick}
                >
                  <div className="userImg">
                    <span className="rounded-circle">
                      <img src={userProfile} alt="User" />
                    </span>
                  </div>
                  <div className="userInfo ">
                    <h4>{userName}</h4>
                    <p className="mb-0">{userRole}</p>
                  </div>
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        backgroundColor: "#ffffff",
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1
                        },
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0
                        }
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleClose}>
                    <Avatar src={userProfile} /> Profile
                  </MenuItem>
                  <Box display="flex" justifyContent="center">
                    <Divider
                      sx={{
                        width: "80%",
                        borderColor: "#800000"
                      }}
                    />
                  </Box>
                  <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
