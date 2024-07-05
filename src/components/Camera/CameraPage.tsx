// CameraManager.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
} from "@mui/material";
import { Delete, Settings, Camera, Add } from "@mui/icons-material";
import VideoPlayer from "./VideoPlayer";
import AddStreamDialog from "./StreamCreateDialog";
import StreamSettingsDialog from "./StreamSettingsDialog";

const getGridItemSize = (numStreams) => {
  if (numStreams === 1) {
    return 12;
  } else if (numStreams === 2) {
    return 6;
  } else {
    return 4;
  }
};

const CameraManager = ({ streams, setStreams, handleProcess }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(null);
  const [dialogInput, setDialogInput] = useState("");
  const [dialogTypeNumber, setDialogTypeNumber] = useState(104);

  const handleAddStream = (dialogInput, dialogTypeNumber) => {
    setStreams([
      ...streams,
      { url: dialogInput, typeNumber: dialogTypeNumber },
    ]);
    setOpenDialog(false);
  };

  const handleDeleteStream = (index) => {
    const newStreams = streams.filter((_, i) => i !== index);
    setStreams(newStreams);
  };

  const handleOpenSettingsDialog = (index) => {
    setCurrentStreamIndex(index);
    setDialogInput(streams[index].url);
    setDialogTypeNumber(streams[index].typeNumber);
    setOpenSettingsDialog(true);
  };

  const handleUpdateStream = () => {
    const newStreams = streams.map((stream, index) =>
      index === currentStreamIndex
        ? { url: dialogInput, typeNumber: dialogTypeNumber }
        : stream
    );
    setStreams(newStreams);
    setOpenSettingsDialog(false);
    setDialogInput("");
    setDialogTypeNumber(104);
    setCurrentStreamIndex(null);
  };

  return (
    <>
      <Stack direction="row">
        <List>
          {streams?.map((stream, index) => (
            <Paper elevation={2} sx={{  py: 1 }} key={index}>
              <ListItem>
                <ListItemText primary={`Поток ${index + 1}`} />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteStream(index)}
                >
                  <Delete />
                </IconButton>
              </ListItem>
              <ListItemButton
                dense
                onClick={() => handleOpenSettingsDialog(index)}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText>Настройки</ListItemText>
              </ListItemButton>
              <ListItem dense>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleProcess(stream.url)}
                >
                  Process
                </Button>
              </ListItem>
            </Paper>
          ))}
        </List>
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            marginTop: "auto",
          }}
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Опции
            </ListSubheader>
          }
        >
          <ListItemButton onClick={() => setOpenDialog(true)}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="Добавить поток" />
          </ListItemButton>
        </List>
        {!streams ? (
          <Paper
            sx={{
                flex: 1,
              height: "calc(100dvh - 48px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Camera sx={{ fontSize: "64px" }} />
              <Typography variant="h2" fontWeight="bold">
                Пусто
              </Typography>
              <Typography variant="h4" fontWeight="bold" letterSpacing={3}>
                Добавьте камеру
              </Typography>
            </div>
          </Paper>
        ) : (
          <Paper sx={{ height: "calc(100dvh - 48px)", flex: 1, display: "flex" }}>
            <Grid container spacing={2}>
              {streams?.map((stream, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={getGridItemSize(streams.length)}
                  key={index}
                >
                  <Typography
                    sx={{
                      backgroundColor: "blueviolet",
                      p: 1,
                      width: "fit-content",
                    }}
                    variant="h6"
                  >
                    {`Поток ${index + 1}`}
                  </Typography>
                  {stream.url.endsWith(".mjpg") ||
                  stream.url.endsWith(".mjpeg") ? (
                    <img
                      src={stream.url}
                      alt={`Stream ${index + 1}`}
                      style={{ maxWidth: "100%" }}
                    />
                  ) : (
                    <VideoPlayer url={stream.url} />
                  )}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteStream(index)}
                  >
                    <Delete />
                  </IconButton>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleProcess(stream.url)}
                  >
                    Process
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Stack>

      <AddStreamDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onAddStream={handleAddStream}
      />
      <StreamSettingsDialog
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        onUpdateStream={handleUpdateStream}
      />
    </>
  );
};

export default CameraManager;
