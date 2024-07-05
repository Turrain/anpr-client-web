


import React, { useState } from 'react';
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

interface StreamSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdateStream: (url: string) => void; // You can add more params as needed
}

const StreamSettingsDialog: React.FC<StreamSettingsDialogProps> = ({
  open,
  onClose,
  onUpdateStream
}) => {
  const [dialogInput, setDialogInput] = useState<string>('');

  const handleUpdateStream = () => {
    onUpdateStream(dialogInput);
    onClose();
  };

  return (
    <Dialog PaperProps={{ elevation: 2 }} open={open} onClose={onClose}>
      <DialogTitle>Настройки потока</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Stream URL"
          fullWidth
          value={dialogInput}
          onChange={(e) => setDialogInput(e.target.value)}
        />
        
        <FormControl fullWidth>
          <InputLabel id="typeNumberLabel">Тип номеров</InputLabel>
          <Select labelId="typeNumberLabel" label="Тип номеров">
            <MenuItem value={10}>Казахстан</MenuItem>
            <MenuItem value={20}>Россия</MenuItem>
            <MenuItem value={30}>Туркменистан</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="triggerTypeLabel">Тип триггера</InputLabel>
          <Select labelId="triggerTypeLabel" label="Тип триггера">
            <MenuItem value={104}>Всегда</MenuItem>
            <MenuItem value={104}>Изменение COM-порта</MenuItem>
          </Select>
        </FormControl>

        <Stack direction={"row"} gap={1}>
          <TextField margin="dense" label="COM1" type="number" fullWidth />
          <TextField margin="dense" label=">=" type="number" fullWidth />
          <TextField margin="dense" label="2000" type="number" fullWidth />
        </Stack>

        <TextField
          margin="dense"
          label="Скорость обработки (кдр/с)"
          type="number"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Отменить
        </Button>
        <Button onClick={handleUpdateStream} color="primary">
          Обновить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StreamSettingsDialog;