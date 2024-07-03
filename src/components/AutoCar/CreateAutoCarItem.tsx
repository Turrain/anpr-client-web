import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';

const CreateAutoCarItem = () => {
  const [carPlateNumber, setCarPlateNumber] = useState('');
  const [photo, setPhoto] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    invoke('cmd_create_car_weights_auto', { car_plate_number: carPlateNumber, photo, weight: parseFloat(weight) })
      .then(() => navigate('/auto'))
      .catch(error => console.error('There was an error creating the item!', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Create Car Weight Auto</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Car Plate Number"
          fullWidth
          value={carPlateNumber}
          onChange={(e) => setCarPlateNumber(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Photo URL"
          fullWidth
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Weight"
          fullWidth
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit">Create</Button>
      </form>
    </Container>
  );
}

export default CreateAutoCarItem;
