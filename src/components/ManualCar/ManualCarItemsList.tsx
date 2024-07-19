import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { invoke } from '@tauri-apps/api/core';
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

import {  Card, CardContent, Button, CardMedia, useTheme } from '@mui/material';

function CustomComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        overflow: { xs: 'auto', sm: 'initial' },
      }}
    >
      
      <Card
       
        sx={{
          display: 'flex',
        }}
      >
        <CardMedia
          component="img"
          image="./saved_images/live.jpg"
          sx={{ width: 440, }}
          alt="Alex Morrison"
        />
        <CardContent >
          <Typography variant="h6" component="div" fontWeight="light">
            Камера 1
          </Typography>
          <hr/>
          <Typography variant="h6" component="div" fontWeight="light">
            Последний распознанный номер: *** ***
          </Typography>
          <Typography variant="h6" fontWeight="light" component="div">
            Последняя оценка веса: *****
          </Typography>
         
        </CardContent>
      </Card>
    </Box>
  );
}

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke("cmd_get_all_car_weight_manuals")
      .then((response) => {
        setItems(response);
        setLoading(false);
      })
      .catch((error) =>
        console.error("There was an error fetching the items!", error)
      );
  }, []);

  const deleteItem = (id) => {
    invoke("cmd_delete_car_weight_auto", { id })
      .then(() => setItems(items.filter((item) => item.id !== id)))
      .catch((error) =>
        console.error("There was an error deleting the item!", error)
      );
  };

  if (loading) {
    return <CircularProgress />;
  }

  const rows: GridRowsProp = items.map((item) => ({
    id: item.id,
    brutto: item.brutto,
    netto: item.netto,
    tara: item.tara,
    car_plate_number: item.car_plate_number,
    status: item.status,
    dest_to: item.dest_to,
    dest_from: item.dest_from,
    cargo_type: item.cargo_type,
    edit: item.id, // used for the edit action
    delete: item.id, // used for the delete action
  }));

  const columns: GridColDef[] = [
    { field: "brutto", headerName: "Брутто", flex: 1, minWidth: 40 },

    {
      field: "netto",
      headerName: "Нетто",
      flex: 1,
      minWidth: 40,
      valueGetter: (value, row) => row.brutto - row.tara,
    },
    { field: "tara", headerName: "Тара", flex: 1, minWidth: 40 },
    {
      field: "car_plate_number",
      headerName: "Номер машины",
      flex: 1,
      minWidth: 150,
    },
    { field: "status", headerName: "Статус", flex: 1, minWidth: 150 },
    { field: "dest_to", headerName: "Куда", flex: 1, minWidth: 150 },
    { field: "dest_from", headerName: "Откуда", flex: 1, minWidth: 150 },
    { field: "cargo_type", headerName: "Тип груза", flex: 1, minWidth: 150 },
    {
      field: "edit",
      headerName: "Изменить",
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <IconButton
          edge="end"
          aria-label="edit"
          component={Link}
          to={`/update-manual/${params.value}`}
        >
          <Edit />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "Удалить",
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => deleteItem(params.value)}
        >
          <Delete />
        </IconButton>
      ),
    },
  ];
  return (
    <Box sx={{ width: "auto", overflow: "auto" }} className="custom-scrollbar">
    
      <Typography variant="h6" letterSpacing={1} gutterBottom>
        ВЕСОВАЯ
      </Typography>
      <CustomComponent/>
      <Alert variant="filled" sx={{ my: 2 }} severity="error">
        Не обнаружен номер
      </Alert>
      <DataGrid autoHeight rows={rows} columns={columns} />
    </Box>
  );
};

export default ItemsList;
