import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, IconButton, Box } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@mui/joy';

const CounterpartyItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke('cmd_get_all_counterparties')
      .then(response => {
        setItems(response);
        setLoading(false);
      })
      .catch(error => console.error('There was an error fetching the items!', error));
  }, []);

  const deleteItem = (id) => {
    console.log(id)
    invoke('cmd_delete_counterparty', { id })
      .then(() => setItems(items.filter(item => item.id !== id)))
      .catch(error => console.error('There was an error deleting the item!', error));
  };

  if (loading) {
    return <CircularProgress />;
  }

  const rows: GridRowsProp = items.map(item => ({
    id: item.id,
    formal_name: item.formal_name,
    formal_address: item.formal_address,
    bin: item.bin,
    full_name: item.full_name,
    edit: item.id,
    delete: item.id,
  }));

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', minWidth: 25 },
    { field: 'formal_name', headerName: 'Formal Name', flex: 1, minWidth: 150 },
    { field: 'formal_address', headerName: 'Formal Address', flex: 1, minWidth: 150 },
    { field: 'bin', headerName: 'BIN', flex: 1, minWidth: 100 },
    { field: 'full_name', headerName: 'Full Name', flex: 1, minWidth: 200 },
    {
      field: 'edit',
      headerName: 'Edit',
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <IconButton edge="end" aria-label="edit" component={Link} to={`/update-counterparty/${params.value}`}>
          <Edit />
        </IconButton>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <IconButton edge="end" aria-label="delete" onClick={() => deleteItem(params.value)}>
          <Delete />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{width: 'auto',overflow: 'auto', p:2}} className='custom-scrollbar'>
         {/* <Typography variant="h6" letterSpacing={1} gutterBottom>КОНТРАГЕНТЫ</Typography> */}
      <div style={{ height: '90dvh', width: '100%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
      <Box position="fixed" bottom={16} right={16}>
        <Link to="/create-counterparty">
          <Button startDecorator={<Add />}>Add Counterparty</Button>
        </Link>

             
            </Box>
    </Box>
  );
}

export default CounterpartyItemsList;
