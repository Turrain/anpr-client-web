// PortList.js
import React from "react";
import {
  Paper,
  Button,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Settings, Stop, Usb } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/core";

interface PortListProps {
  serialPorts: { port_name: string, port_type: string }[];
}

const PortList: React.FC<PortListProps> = ({ serialPorts }) => {
  const [portName, setPortName] = React.useState<string>("");
  const [baudRate, setBaudRate] = React.useState<number>(9600);
  const [dataBits, setDataBits] = React.useState<number>(8);
  const [stopBits, setStopBits] = React.useState<number>(1);
  const [parity, setParity] = React.useState<number>(0);
  const [flowControl, setFlowControl] = React.useState<number>(0);
  const [driver, setDriver] = React.useState<number>(2);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState<boolean>(false);
  const [runningPort, setRunningPort] = React.useState<string | null>(null);

  const openSettingsDialog = (portName: string) => {
    setPortName(portName);
    setSettingsDialogOpen(true);
  };

  const closeSettingsDialog = () => {
    setSettingsDialogOpen(false);
  };

  const startReading = async () => {
    const settings = {
      name: portName,
      baud_rate: baudRate,
      data_bits: dataBits,
      stop_bits: stopBits,
      parity: parity,
      flow_control: flowControl,
      driver: driver
    };
    console.log(settings)
    try {
      await invoke('set_port_config', { config: settings });
      await invoke('start_port');
      await invoke('monitor_device_callbacks');
      setRunningPort(portName);
    } catch (error) {
      console.error('Failed to invoke set_port_config or start_port command', error);
    }
  };

  const stopReading = async () => {
    try {
      await invoke('stop_port');
      setRunningPort(null);
    } catch (error) {
      console.error('Failed to invoke stop_port command', error);
    }
  };

  const saveSettings = () => {
    const settings = {
      name: portName,
      baud_rate: baudRate,
      data_bits: dataBits,
      stop_bits: stopBits,
      parity: parity,
      flow_control: flowControl,
      driver: driver
    };
    setDriver(settings.driver);
    setBaudRate(settings.baud_rate);
    setDataBits(settings.data_bits);
    setStopBits(settings.stop_bits);
    setParity(settings.parity);
    setFlowControl(settings.flow_control);
    // Save the settings locally (for example, in a state variable or local storage)
    localStorage.setItem(portName, JSON.stringify(settings));
    setSettingsDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ width: "100%", maxWidth: "300px", p: 2 }}>
      <Stack gap={2}>
        {serialPorts?.map((port, index) => (
          <Stack key={index} direction="row" justifyContent="space-between" sx={{ borderBottom: '1px solid black' }}>
            <Stack>
              <Typography variant="body1">{port.port_name}</Typography>
              <Typography variant="caption">{port.port_type}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-evenly">
              <IconButton onClick={() => openSettingsDialog(port.port_name)}>
                <Settings />
              </IconButton>
              {runningPort === port.port_name ? (
                <IconButton onClick={stopReading}>
                  <Stop />
                </IconButton>
              ) : (
                <IconButton onClick={() => {
                  setPortName(port.port_name);
                  startReading();
                }} disabled={runningPort !== null}>
                  <Usb />
                </IconButton>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Dialog open={settingsDialogOpen} onClose={closeSettingsDialog}>
        <DialogTitle>Port Settings</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Driver"
            type="number"
            value={driver}
            onChange={e => setDriver(parseInt(e.target.value))}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Baud Rate"
            type="number"
            value={baudRate}
            onChange={e => setBaudRate(parseInt(e.target.value))}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Data Bits"
            type="number"
            value={dataBits}
            onChange={e => setDataBits(parseInt(e.target.value))}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Stop Bits"
            type="number"
            value={stopBits}
            onChange={e => setStopBits(parseInt(e.target.value))}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Parity"
            type="number"
            value={parity}
            onChange={e => setParity(parseInt(e.target.value))}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Flow Control"
            type="number"
            value={flowControl}
            onChange={e => setFlowControl(parseInt(e.target.value))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSettingsDialog} color="primary">Cancel</Button>
          <Button onClick={saveSettings} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PortList;