// PortList.js
import React from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { Settings, Usb } from "@mui/icons-material";
import { invoke } from '@tauri-apps/api/core';

const PortList = ({ serialPorts, setOpenSettingsDialog }) => {
  const [portName, setPortName] = React.useState("");
  const [driver, setDriver] = React.useState(2);


  const startReading = async () => {
    try {
      await invoke('read_serial_port', { portName:portName, driver:driver });
    } catch (error) {
      console.error('Failed to invoke command', error);
    }
  };


  return (
    <Paper elevation={0} sx={{ width: "100%", maxWidth: "300px", p:2 }}>
      <Stack gap={2} >
        {serialPorts?.map((port, index) => (
          <Stack direction="row" justifyContent="space-between" sx={{borderBottom: '1px solid black'}}>
            <Stack>
              <Typography variant="body1">{port.port_name} </Typography>
              <Typography variant="caption">{port.port_type} </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-evenly">
            <IconButton>
              <Settings/>
            </IconButton>
            <IconButton onClick={() => {
              setPortName(port.port_name);
            
              startReading();
            }}>
              <Usb/>
            </IconButton>
            </Stack>
         
          </Stack>
        ))}
      </Stack>

     
    </Paper>
  );
};

export default PortList;
