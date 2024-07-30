import React, { useState } from "react";

import {
  Home,
  Settings,
  Info,
  ArrowForwardIos,
  ArrowBackIos,
  Build,
  Camera,
  DirectionsCar,
  Group,
  Add,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography,
  useColorScheme,
} from "@mui/joy";

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button
      variant="outlined"
      color="neutral"
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
    >
      {mode === "dark" ? "Turn light" : "Turn dark"}
    </Button>
  );
}

const Sidebar = () => {
  const [mini, setMini] = useState(false);

  const toggleMini = () => {
    setMini(!mini);
  };

  const menuItems = [
    { text: "Главная", icon: <Home />, path: "/" },
    { text: "Порты", icon: <Build />, path: "/ports" },
    { text: "Камеры", icon: <Camera />, path: "/cameras" },
    { text: "Весовая", icon: <DirectionsCar />, path: "/manual" },
    { text: "Авто-взвешивание", icon: <DirectionsCar />, path: "/auto" },
    { text: "Контрагенты", icon: <Group />, path: "/counterparty" },
    { text: "Камеры 2", icon: <Camera />, path: "/cameras2" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        width: mini ? "60px" : "300px",
        transition: "all 0.3s",
        height: "100vh",
        bgcolor: "background.paper",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: mini ? "center" : "flex-start",
        borderRight: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <IconButton
        onClick={toggleMini}
        size="sm"
        sx={{
          alignSelf: mini ? "center" : "flex-end",
          m: 1,
          position: "absolute",
          right: "-1.75rem",
          top: "1rem",
          backgroundColor: "#fff",
          zIndex: 1000,
        }}
      >
        {mini ? <ArrowForwardIos /> : <ArrowBackIos />}
      </IconButton>

      <List sx={{ width: "100%" }}>
        {menuItems.map((item, index) => (
          <ListItem key={index}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              color="primary"
              variant={location.pathname === item.path ? "solid" : "plain"}
            >
              <ListItemDecorator>{item.icon}</ListItemDecorator>
              {!mini && <ListItemContent>{item.text} </ListItemContent>}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
