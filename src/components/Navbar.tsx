import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Link as MaterialLink } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "./AuthStore";
import { logoutApi } from "../api";

import { otherColors } from "../theme";

const MobileBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.up("sm")]: {
    display: "none",
  },
}));

const NonMobileBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export default function MenuAppBar() {
  const [auth, setAuth] = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<Element | undefined>();
  const [roles, setRoles] = useState<string[] | undefined>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [menuType, setMenuType] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      try {
        let roles = auth.roles;
        let isAdmin = roles.includes("ADMIN");
        setRoles(roles);
        setIsAdmin(isAdmin);
      } catch (err) {
        console.error(err);
        setRoles([]);
        setIsAdmin(false);
      }
    }
  }, [auth]);

  const handleAppMenu = (event: React.SyntheticEvent) => {
    setMenuType("APP_MENU");
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenu = (event: React.SyntheticEvent) => {
    setMenuType("USER_MENU");
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleLogin = () => {
    handleClose();
    navigate("/login/true");
  };

  const handleLogout = () => {
    handleClose();
    navigate("/exit");
    setAuth?.(null);
    setRoles([]);
    setIsAdmin(false);
    logoutApi();
  };

  const handleProfile = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
    navigate("/profile");
  };

  const handleHome = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
    navigate("/home");
  };

  const handleAbout = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
    navigate("/about");
  };

  
  const handleUsers = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
    navigate("/users");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" sx={{ boxShadow: 0 }}>
        <Toolbar sx={{ bgcolor: otherColors.darkestBlue }}>
          <MobileBox onClick={handleAppMenu}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl) && menuType === "APP_MENU"}
                onClose={handleClose}
              >
                <MenuItem onClick={handleHome}>Home</MenuItem>
                {roles && roles.length > 0 ? (
                  <MenuItem onClick={handleAbout}>About</MenuItem>
                ) : null}
                {roles && roles.length > 0 ? (
                  <MenuItem onClick={handleUsers}>Users</MenuItem>
                ) : null}
                {roles && roles.length > 0 ? (
                  <MenuItem onClick={handleProfile}>Profile</MenuItem>
                ) : null}
              </Menu>
            </Box>
          </MobileBox>
          <Typography variant="h6" component="span" sx={{ mr: 2 }}>
            App
          </Typography>
          <NonMobileBox>
            <MaterialLink
              component={RouterLink}
              to="/home"
              sx={{ flexGrow: 1, ml: 1, mr: 1, color: "#FFFFFF" }}
            >
              Home
            </MaterialLink>
            <MaterialLink
              component={RouterLink}
              to="/about"
              sx={{ flexGrow: 1, ml: 1, mr: 1, color: "#FFFFFF" }}
            >
              About
            </MaterialLink>
            {isAdmin ? (
              <MaterialLink
                component={RouterLink}
                to="/users"
                sx={{ flexGrow: 1, ml: 1, mr: 1, color: "#FFFFFF" }}
              >
                Users
              </MaterialLink>
            ) : null}
            {isAdmin ? (
              <MaterialLink
                component={RouterLink}
                to="/dbeditor"
                sx={{ flexGrow: 1, ml: 1, mr: 1, color: "#FFFFFF" }}
              >
                DB Editor
              </MaterialLink>
            ) : null}
            {roles && roles.length > 0 ? (
              <MaterialLink
                component={RouterLink}
                to="/profile"
                sx={{ flexGrow: 1, ml: 1, mr: 1, color: "#FFFFFF" }}
              >
                Profile
              </MaterialLink>
            ) : null}
          </NonMobileBox>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleUserMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl) && menuType === "USER_MENU"}
              onClose={handleClose}
            >
              {!roles || roles.length === 0 ? (
                <MenuItem onClick={handleLogin}>Login</MenuItem>
              ) : null}
              {roles && roles.length > 0 ? (
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              ) : null}
              {roles && roles.length > 0 ? (
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
              ) : null}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
