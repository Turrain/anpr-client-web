import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';

const CreateCounterpartyItem = () => {
  const [formalName, setFormalName] = useState('');
  const [formalAddress, setFormalAddress] = useState('');
  const [bin, setBin] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    invoke('cmd_create_counterparty', {
       formalName,
      formalAddress,
      bin,
       fullName,
    })
      .then(() => navigate('/counterparty'))
      .catch(error => console.error('There was an error creating the item!', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Create Counterparty</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Formal Name"
          fullWidth
          value={formalName}
          onChange={(e) => setFormalName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Formal Address"
          fullWidth
          value={formalAddress}
          onChange={(e) => setFormalAddress(e.target.value)}
          margin="normal"
        />
        <TextField
          label="BIN"
          fullWidth
          value={bin}
          onChange={(e) => setBin(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Full Name"
          fullWidth
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit">Create</Button>
      </form>
    </Container>
  );
}

export default CreateCounterpartyItem;
