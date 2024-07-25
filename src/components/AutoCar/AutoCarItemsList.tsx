import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, IconButton, Box } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Delete, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';



const AutoCarItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke('cmd_get_all_car_weights_auto')
      .then(response => {
        setItems(response);
        setLoading(false);
      })
      .catch(error => console.error('There was an error fetching the items!', error));
  }, []);

  const deleteItem = (id) => {
    invoke('cmd_delete_car_weight_auto', { id })
      .then(() => setItems(items.filter(item => item.id !== id)))
      .catch(error => console.error('There was an error deleting the item!', error));
  };

  if (loading) {
    return <CircularProgress />;
  }

  const rows: GridRowsProp = items.map(item => ({
    id: item.id,
    car_plate_number: item.car_plate_number,
    photo: item.photo,
    weight: item.weight,
    time_created: item.time_created,
    time_updated: item.time_updated,
    edit: item.id,
    delete: item.id,
  }));
  const columns: GridColDef[] = [
    { field: 'car_plate_number', headerName: 'Car Plate Number', flex: 1, minWidth: 150 },
    { field: 'photo', headerName: 'Photo', flex: 1, minWidth: 150 },
    { field: 'weight', headerName: 'Weight', flex: 1, minWidth: 100 },
    { field: 'time_created', headerName: 'Time Created', flex: 1, minWidth: 200 },
    { field: 'time_updated', headerName: 'Time Updated', flex: 1, minWidth: 200 },
    {
      field: 'edit',
      headerName: 'Edit',
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <IconButton edge="end" aria-label="edit" component={Link} to={`/update-auto/${params.value}`}>
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
         
          <div style={{ height: '90dvh', width: '100%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
    </Box>
  );
}

export default AutoCarItemsList;
