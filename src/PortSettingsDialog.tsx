// PortSettingsDialog.tsx
import React, { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Button,
  Stack
} from '@mui/material';

interface PortSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdatePortSettings: (settings: SerialPortSettings) => void;
}

export  interface SerialPortSettings {
  portName: string;
  baudRate: number;
  dataBits: number;
  parity: string;
  stopBits: number;
}

const PortSettingsDialog: React.FC<PortSettingsDialogProps> = ({
  open,
  onClose,
  onUpdatePortSettings
}) => {
  const [portName, setPortName] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [dataBits, setDataBits] = useState<number>(8);
  const [parity, setParity] = useState<string>('none');
  const [stopBits, setStopBits] = useState<number>(1);

  const handleUpdatePortSettings = () => {
    const settings: SerialPortSettings = { portName, baudRate, dataBits, parity, stopBits };
    onUpdatePortSettings(settings);
    onClose();
  };

  return (
    <Dialog PaperProps={{ elevation: 2 }} open={open} onClose={onClose}>
      <DialogTitle>Port Settings</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Port Name"
          fullWidth
          value={portName}
          onChange={(e) => setPortName(e.target.value)}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="baudRateLabel">Baud Rate</InputLabel>
          <Select
            labelId="baudRateLabel"
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value as number)}
          >
            <MenuItem value={9600}>9600</MenuItem>
            <MenuItem value={19200}>19200</MenuItem>
            <MenuItem value={38400}>38400</MenuItem>
            <MenuItem value={57600}>57600</MenuItem>
            <MenuItem value={115200}>115200</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="dataBitsLabel">Data Bits</InputLabel>
          <Select
            labelId="dataBitsLabel"
            value={dataBits}
            onChange={(e) => setDataBits(e.target.value as number)}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={8}>8</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="parityLabel">Parity</InputLabel>
          <Select
            labelId="parityLabel"
            value={parity}
            onChange={(e) => setParity(e.target.value as string)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="even">Even</MenuItem>
            <MenuItem value="odd">Odd</MenuItem>
            <MenuItem value="mark">Mark</MenuItem>
            <MenuItem value="space">Space</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="stopBitsLabel">Stop Bits</InputLabel>
          <Select
            labelId="stopBitsLabel"
            value={stopBits}
            onChange={(e) => setStopBits(e.target.value as number)}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpdatePortSettings} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortSettingsDialog;
