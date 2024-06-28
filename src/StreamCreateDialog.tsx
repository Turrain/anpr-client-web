// AddStreamDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@mui/material';
import React, { useState } from 'react';


interface AddStreamDialogProps {
  open: boolean;
  onClose: () => void;
  onAddStream: (url: string, typeNumber: number) => void;
}

const AddStreamDialog: React.FC<AddStreamDialogProps> = ({ open, onClose, onAddStream }) => {
  const [dialogInput, setDialogInput] = useState<string>('');
  const [dialogTypeNumber, setDialogTypeNumber] = useState<number>(0);

  const handleAddStream = () => {
    onAddStream(dialogInput, dialogTypeNumber);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ elevation: 2 }}>
      <DialogTitle>Add Stream</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the stream URL and type number to add a new stream.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Stream URL"
          fullWidth
          value={dialogInput}
          onChange={(e) => setDialogInput(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Type Number"
          type="number"
          fullWidth
          value={dialogTypeNumber}
          onChange={(e) => setDialogTypeNumber(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddStream} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStreamDialog;