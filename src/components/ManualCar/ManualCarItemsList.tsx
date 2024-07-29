import React, { useEffect, useState } from "react";

import { Add, Delete, Edit } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { invoke } from '@tauri-apps/api/core';
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Alert, AspectRatio, Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, Typography } from "@mui/joy";

function CustomComponent() {


  return (

    <Card
      variant="soft"
      orientation="horizontal"
      sx={{
        width: '100%',
      }}
    >
      <AspectRatio ratio="16/9" sx={{ width: 460 }}>
        <img
          src="https://images.unsplash.com/photo-1507833423370-a126b89d394b?auto=format&fit=crop&w=90"
          srcSet="https://images.unsplash.com/photo-1507833423370-a126b89d394b?auto=format&fit=crop&w=90&dpr=2 2x"
          loading="lazy"
          alt=""
        />
      </AspectRatio>
      <CardContent>
        <Typography level="title-lg" id="card-description">
          Yosemite Park
        </Typography>
        <Typography level="body-sm" aria-describedby="card-description" mb={1}>
          <Link
            overlay
            underline="none"
            href="#interactive-card"
            sx={{ color: 'text.tertiary' }}
          >
            California, USA
          </Link>
        </Typography>
        <Chip
          variant="outlined"
          color="primary"
          size="sm"
          sx={{ pointerEvents: 'none' }}
        >
          Cool weather all day long
        </Chip>
      </CardContent>
    </Card>

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
    
  
      <CustomComponent/>

      <div style={{ height: 'auto', width: '100%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
      <Box position="fixed" bottom={16} right={16}>
        <Link to="/create-manual">
          <Button startDecorator={<Add />}>Add Counterparty</Button>
        </Link>

             
            </Box>
    </Box>
  );
};

export default ItemsList;
