import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { useNavigate } from 'react-router-dom';

const CreateManualCarItem = () => {
  const [brutto, setBrutto] = useState('');
  const [netto, setNetto] = useState('');
  const [tara, setTara] = useState('');
  const [carPlateNumber, setCarPlateNumber] = useState('');
  const [status, setStatus] = useState('');
  const [destTo, setDestTo] = useState('');
  const [destFrom, setDestFrom] = useState('');
  const [cargoType, setCargoType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(carPlateNumber);
    
    invoke('cmd_create_car_weight_manual', {
      brutto: parseFloat(brutto),
      netto: parseFloat(netto),
      tara: parseFloat(tara),
      car_plate_number: carPlateNumber,
      status,
      dest_to: destTo ? parseInt(destTo) : null,
      dest_from: destFrom ? parseInt(destFrom) : null,
      cargo_type: cargoType,
    })
      .then(() => navigate('/manual'))
      .catch(error => console.error('There was an error creating the item!', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Create Manual Car Weight</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Brutto"
          fullWidth
          value={brutto}
          onChange={(e) => setBrutto(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Netto"
          fullWidth
          value={netto}
          onChange={(e) => setNetto(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Tara"
          fullWidth
          value={tara}
          onChange={(e) => setTara(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Car Plate Number"
          fullWidth
          value={carPlateNumber}
          onChange={(e) => setCarPlateNumber(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Status"
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Destination To"
          fullWidth
          value={destTo}
          onChange={(e) => setDestTo(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Destination From"
          fullWidth
          value={destFrom}
          onChange={(e) => setDestFrom(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Cargo Type"
          fullWidth
          value={cargoType}
          onChange={(e) => setCargoType(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit">Create</Button>
      </form>
    </Container>
  );
}

export default CreateManualCarItem;
