import React, { useState } from "react";

import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Sheet,
  Stack,
} from "@mui/joy";
import { Inbox, Mail } from "@mui/icons-material";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ManualCarItemsList from "./components/ManualCar/ManualCarItemsList";
import CreateManualCarItem from "./components/ManualCar/CreateManualCarItem";
import UpdateManualCarItem from "./components/ManualCar/UpdateManualCarItem";
import UpdateCounterpartyItem from "./components/Counterparty/UpdateCounterpartyItem";
import UpdateAutoCarItem from "./components/AutoCar/UpdateAutoCarItem";
import CreateCounterpartyItem from "./components/Counterparty/CreateCounterpartyItem";
import CreateAutoCarItem from "./components/AutoCar/CreateAutoCarItem";
import CounterpartyItemsList from "./components/Counterparty/CounterpartyItemsList";
import AutoCarItemsList from "./components/AutoCar/AutoCarItemsList";
import { DefPortPage } from "./components/Port/PortPage";

import { invoke } from "@tauri-apps/api/core";
import {
  requestPermission,
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import PortList from "./PortPageV2";
import CameraManager from "./CameraPageV2";


const drawerWidth = 240;
const App = () => {
  const [streams, setStreams] = useState([]);
  const sendNotification1 = async () => {
    let permissionGranted = await isPermissionGranted();
    console.log(permissionGranted);
    // If not we need to request it
    if (!permissionGranted) {
      const permission = await requestPermission();
      console.log(permission);
      permissionGranted = permission === "granted";
    }

    // Once permission has been granted we can send the notification
    if (permissionGranted) {
      sendNotification({ title: "Tauri", body: "Tauri is awesome!" });
    }
  };

  // React.useEffect(() => {
  //   invoke("start_monitoring");
  // }, []);

  const navigate = useNavigate();
  return (

      <Box sx={{ display: "flex" }}>
        {/* <AppBar
                    position="fixed"

                    sx={{width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, boxShadow: '0'}}
                >
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            CRUD Dashboard
                        </Typography>
                        <Button color="inherit" component={Link} to="/">Home</Button>
                        <Button color="inherit" component={Link} to="/create">Create</Button>
                    </Toolbar>
                </AppBar> */}
        <Sheet  sx={{ p: 2, height: "100vh",  }} variant="soft">
          
            <List  size="md"
          sx={{
            width: "200px",
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}>
              <ListItem>
                <ListItemButton onClick={() => navigate("/auto")} variant={window.location.pathname === "/auto" ? "solid" : ""}   color="primary">
                  <ListItemDecorator>
                    <Inbox />
                  </ListItemDecorator>
                  Взвешивания
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("/manual")}  variant={window.location.pathname === "/manual" ? "solid" : ""}   color="primary">
                  <ListItemDecorator>
                    <Mail />
                  </ListItemDecorator>
                  Весовая
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("/counterparty")} variant={window.location.pathname === "/counterparty" ? "solid" : ""}  color="primary">
                  <ListItemDecorator>
                    <Mail />
                  </ListItemDecorator>
                  Контрагенты
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton onClick={() => navigate("/ports")} variant={window.location.pathname === "/ports" ? "solid" : ""}   color="primary">
                  <ListItemDecorator>
                    <Inbox />
                  </ListItemDecorator>
                  КОМ порты
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton  onClick={() => navigate("/cameras")} variant={window.location.pathname === "/cameras" ? "solid" : ""}  color="primary">
                  <ListItemDecorator>
                    <Inbox />
                  </ListItemDecorator>
                  Камеры
                </ListItemButton>
              </ListItem>
            </List>
           
        
        </Sheet>
        <Box sx={{ width: "100%" }}>
          <Box mt={0}>
            <Routes>
              <Route path="/ports" element={<PortList />} />
              <Route
                path="/cameras"
                element={
                  <CameraManager
                  
                  />
                }
              />
              <Route path="/manual" element={<ManualCarItemsList />} />
              <Route path="/auto" element={<AutoCarItemsList />} />
              <Route path="/counterparty" element={<CounterpartyItemsList />} />

              <Route path="/create-manual" element={<CreateManualCarItem />} />
              <Route path="/create-auto" element={<CreateAutoCarItem />} />
              <Route
                path="/create-counterparty"
                element={<CreateCounterpartyItem />}
              />

              <Route
                path="/update-manual/:id"
                element={<UpdateManualCarItem />}
              />
              <Route path="/update-auto/:id" element={<UpdateAutoCarItem />} />
              <Route
                path="/update-counterparty/:id"
                element={<UpdateCounterpartyItem />}
              />
            </Routes>
          </Box>
        </Box>
      </Box>

  );
};

export default App;
