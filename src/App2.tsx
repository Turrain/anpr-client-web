import React, { useState } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
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

import PortList from "./PortPageV2";
import CameraManager from "./CameraPageV2";
import CameraPage from "./refactored/Camera";
import Sidebar from "./refactored/Sidebar";

const drawerWidth = 240;
const App = () => {
  // React.useEffect(() => {
  //   invoke("start_monitoring");
  // }, []);

  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ width: "100%" }}>
        <Box mt={0}>
          <Routes>
            <Route path="/ports" element={<PortList />} />
            <Route path="/cameras" element={<CameraManager />} />
            <Route path="/manual" element={<ManualCarItemsList />} />
            <Route path="/auto" element={<AutoCarItemsList />} />
            <Route path="/counterparty" element={<CounterpartyItemsList />} />
            <Route path="/cameras2" element={<CameraPage />} />
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
