import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateAutoCarItem = () => {
  const { id } = useParams();
  const [carPlateNumber, setCarPlateNumber] = useState('');
  const [photo, setPhoto] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    invoke('cmd_get_car_weights_auto_by_id', { id: parseInt(id, 10) })
      .then(item => {
        if (item) {
          setCarPlateNumber(item.car_plate_number);
          setPhoto(item.photo);
          setWeight(item.weight);
        }
      })
      .catch(error => console.error('There was an error fetching the item!', error));
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    invoke('cmd_update_car_weights_auto', { id: parseInt(id, 10), carPlateNumber: carPlateNumber, photo, weight: parseFloat(weight) })
      .then(() => navigate('/auto'))
      .catch(error => console.error('There was an error updating the item!', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Update Car Weight Auto</Typography>
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
        <Button variant="contained" color="primary" type="submit">Update</Button>
      </form>
    </Container>
  );
}

export default UpdateAutoCarItem;
