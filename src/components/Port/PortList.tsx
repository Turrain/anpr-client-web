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
            <IconButton >
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
