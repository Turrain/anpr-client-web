import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateCounterpartyItem = () => {
  const { id } = useParams();
  const [formalName, setFormalName] = useState('');
  const [formalAddress, setFormalAddress] = useState('');
  const [bin, setBin] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    invoke('cmd_get_counterparty_by_id', { id: parseInt(id, 10) })
      .then(item => {
        if (item) {
          setFormalName(item.formal_name);
          setFormalAddress(item.formal_address);
          setBin(item.bin);
          setFullName(item.full_name);
        }
      })
      .catch(error => console.error('There was an error fetching the item!', error));
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    invoke('cmd_update_counterparty', {
      id: parseInt(id, 10),
      formalName: formalName,
      formalAddress: formalAddress,
      bin,
      fullName: fullName,
    })
      .then(() => navigate('/counterparty'))
      .catch(error => console.error('There was an error updating the item!', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Update Counterparty</Typography>
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
        <Button variant="contained" color="primary" type="submit">Update</Button>
      </form>
    </Container>
  );
}

export default UpdateCounterpartyItem;
