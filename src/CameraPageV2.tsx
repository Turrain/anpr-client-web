import { Delete, Settings, Add, Camera } from "@mui/icons-material";
import {
  Modal,
  ModalDialog,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemContent,
  IconButton,
  ListItemButton,
  ListItemDecorator,
  ListSubheader,
  Grid,
  Sheet,
  Input,
  AspectRatio,
  Card,
  CardContent,
  CardOverflow,
  Divider,
} from "@mui/joy";

import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import VideoPlayer from "./components/Camera/VideoPlayer";

const AddStreamDialog = ({ open, onClose, onAddStream }) => {
  const [url, setUrl] = useState("");
  const [typeNumber, setTypeNumber] = useState(104);

  const handleAdd = () => {
    onAddStream(url, typeNumber);
    setUrl("");
    setTypeNumber(104);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Typography level="h4">Add Stream</Typography>
        <Box>
          <Input
            autoFocus
            margin="dense"
            label="Stream URL"
            type="url"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            margin="dense"
            label="Type Number"
            type="number"
            fullWidth
            value={typeNumber}
          />
          <Input
            margin="dense"
            label="Type Number"
            type="number"
            fullWidth
            value={typeNumber}
            onChange={(e) => setTypeNumber(parseInt(e.target.value))}
          />
        </Box>
        <Button onClick={onClose} color="neutral">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary">
          Add
        </Button>
      </ModalDialog>
    </Modal>
  );
};

const StreamSettingsDialog = ({
  open,
  onClose,
  onUpdateStream,
  dialogInput,
  setDialogInput,
  dialogTypeNumber,
  setDialogTypeNumber,
}) => {
  const handleUpdate = () => {
    onUpdateStream(dialogInput, dialogTypeNumber);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Typography level="h4">Stream Settings</Typography>
        <Box>
          <Input
            autoFocus
            margin="dense"
            label="Stream URL"
            type="url"
            fullWidth
            value={dialogInput}
            onChange={(e) => setDialogInput(e.target.value)}
          />
          <Input
            margin="dense"
            label="Type Number"
            type="number"
            fullWidth
            value={dialogTypeNumber}
            onChange={(e) => setDialogTypeNumber(parseInt(e.target.value))}
          />
        </Box>
        <Button onClick={onClose} color="neutral">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary">
          Update
        </Button>
      </ModalDialog>
    </Modal>
  );
};

const getGridItemSize = (numStreams) => {
  if (numStreams === 1) {
    return 12;
  } else if (numStreams === 2) {
    return 6;
  } else {
    return 4;
  }
};

const CameraManager = () => {
  const [streams, setStreams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(null);
  const [dialogInput, setDialogInput] = useState("");
  const [dialogTypeNumber, setDialogTypeNumber] = useState(104);

  const handleAddStream = async (dialogInput, dialogTypeNumber) => {
    const newStream = { url: dialogInput, typeNumber: dialogTypeNumber };
    setStreams([...streams, newStream]);
    setOpenDialog(false);
    await startCameraStream(newStream);
  };

  const handleDeleteStream = async (index) => {
    const streamToDelete = streams[index];
    const newStreams = streams.filter((_, i) => i !== index);
    setStreams(newStreams);
    await stopCameraStream(streamToDelete);
  };

  const handleOpenSettingsDialog = (index) => {
    setCurrentStreamIndex(index);
    setDialogInput(streams[index].url);
    setDialogTypeNumber(streams[index].typeNumber);
    setOpenSettingsDialog(true);
  };

  const handleUpdateStream = async () => {
    const updatedStream = { url: dialogInput, typeNumber: dialogTypeNumber };
    const newStreams = streams.map((stream, index) =>
      index === currentStreamIndex ? updatedStream : stream
    );
    setStreams(newStreams);
    setOpenSettingsDialog(false);
    setDialogInput("");
    setDialogTypeNumber(104);
    setCurrentStreamIndex(null);
    await configureCameraStream(updatedStream);
  };

  const startCameraStream = async (stream) => {
    try {
      const config = {
        driver: 1,
        fps: 30,
        stream_url: stream.url,
      };
      await invoke("set_camera_config", { config });
      //  await invoke('start_camera');
      console.log(`Started camera stream: ${stream.url}`);
    } catch (error) {
      console.error(`Failed to start camera stream: ${stream.url}`, error);
    }
  };

  const stopCameraStream = async (stream) => {
    try {
      await invoke("stop_camera");
      console.log(`Stopped camera stream: ${stream.url}`);
    } catch (error) {
      console.error(`Failed to stop camera stream: ${stream.url}`, error);
    }
  };

  const configureCameraStream = async (stream) => {
    try {
      const config = {
        driver: 1,
        fps: 30,
        stream_url: stream.url,
      };
      await invoke("set_camera_config", { config });
      console.log(`Configured camera stream: ${stream.url}`);
    } catch (error) {
      console.error(`Failed to configure camera stream: ${stream.url}`, error);
    }
  };

  useEffect(() => {
    streams.forEach(startCameraStream);
    return () => {
      streams.forEach(stopCameraStream);
    };
  }, [streams]);

  return (
    <>
      <Stack direction="row">
        {/* <List>
            {streams?.map((stream, index) => (
              <Sheet sx={{ py: 1 }} key={index}>
                <ListItem>
                  <ListItemContent>{`Stream ${index + 1}`}</ListItemContent>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteStream(index)}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
                <ListItemButton dense onClick={() => handleOpenSettingsDialog(index)}>
                  <ListItemDecorator>
                    <Settings />
                  </ListItemDecorator>
                  <ListItemContent>Settings</ListItemContent>
                </ListItemButton>
                <ListItem dense>
                  <Button
                    variant="solid"
                    fullWidth
                    onClick={() => startCameraStream({url: stream.url, typeNumber: 104})}
                  >
                    Process
                  </Button>
                </ListItem>
              </Sheet>
            ))}
          </List> */}

        {streams.length === 0 ? (
          <Sheet
            sx={{
              flex: 1,
              height: "calc(100vh - 48px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Camera sx={{ fontSize: "64px" }} />
              <Typography level="h1" >
                Пусто
              </Typography>

              <Button variant="plain" onClick={() => setOpenDialog(true)}>
                Добавить поток
              </Button>
            </div>
          </Sheet>
        ) : (
          <Sheet
            sx={{ height: "calc(100vh - 48px)", flex: 1, display: "flex", p:2 }}
          >
            <Box position="fixed" bottom={16} right={16}>
              <Button
                variant="outlined"
                onClick={() => setOpenDialog(true)}
                sx={{ boxShadow: 5, bgcolor: "background.paper" }}
              >
                <Add />
                Добавить поток
              </Button>
            </Box>
            <Grid container spacing={2}>
              {streams?.map((stream, index) => (
                <Grid
                  sx={{ width: "100%" }}
                  xs={12}
                  sm={6}
                  md={getGridItemSize(streams.length)}
                  key={index}
                >
                  <Card variant="outlined" sx={{ width: "480px" }}>
                    <CardOverflow>
                      <AspectRatio ratio="2">
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
                      </AspectRatio>
                    </CardOverflow>
                    <CardContent>
                      <Typography level="title-md">
                        {" "}
                        {`Stream ${index + 1}`}
                      </Typography>
                      <Typography level="body-sm">California</Typography>
                    </CardContent>
                    <CardOverflow
                      variant="soft"
                      sx={{ bgcolor: "background.level1" }}
                    >
                      <Divider inset="context" />
                      <CardContent orientation="horizontal">
                        <Button
                          variant="solid"
                          fullWidth
                          onClick={() => handleProcess(stream.url)}
                        >
                          Process
                        </Button>
                        <Divider orientation="vertical" />
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteStream(index)}
                        >
                          <Delete />
                        </IconButton>
                      </CardContent>
                    </CardOverflow>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Sheet>
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
        dialogInput={dialogInput}
        setDialogInput={setDialogInput}
        dialogTypeNumber={dialogTypeNumber}
        setDialogTypeNumber={setDialogTypeNumber}
      />
    </>
  );
};
export default CameraManager;
