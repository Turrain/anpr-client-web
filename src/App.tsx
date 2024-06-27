import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { open } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";

import ReactPlayer from "react-player";
import Button from "@mui/material/Button";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Grid,
  Paper,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  Box,
  Divider,
  Tooltip,
  styled,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Add,
  ArrowRight,
  Camera,
  Delete,
  Home,
  KeyboardArrowDown,
  Menu,
  Settings,
  ShowChart,
} from "@mui/icons-material";
import CustomizedList from "./SidebarList";
import React from "react";

const FireNav = styled(List)<{ component?: React.ElementType }>({
  "& .MuiListItemButton-root": {
    paddingLeft: 24,
    paddingRight: 24,
  },
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    marginRight: 16,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
});

const VideoPlayer = ({ url }) => {
  return (
    <div
      style={{
        position: "relative",
        paddingTop: "56.25%",
        height: "0",
        overflow: "hidden",
      }}
    >
      <ReactPlayer
        url={url}
        className="react-player"
        playing
        controls
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "4px",
          backgroundColor: "darkorchid",
        }}
      />
    </div>
  );
};

//mjpg is a timer update image from url
const drawerWidth = 260;

function App() {
  const [input, setInput] = useState("");
  const [typeNumber, setTypeNumber] = useState(104);
  const [result, setResult] = useState([]);
  const [isVideo, setIsVideo] = useState(false);
  const [isMJPEG, setIsMJPEG] = useState(false);
  const [streams, setStreams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogInput, setDialogInput] = useState("");
  const [dialogTypeNumber, setDialogTypeNumber] = useState(104);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(null);
  const [serialPorts, setSerialPorts] = useState([]);

  const [openDrawer, setOpenDrawer] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenDrawer(newOpen);
  };

  useEffect(() => {
    const unlisten = listen("anpr-update", (event) => {
      setResult((prevResult) => [...prevResult, ...event.payload]);
    });
    invoke("list_serial_ports")
      .then((ports) => setSerialPorts(ports))
      .catch(console.error);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleFileChange = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Image or Video Files",
            extensions: ["jpg", "jpeg", "png", "avi", "mp4"],
          },
        ],
      });
      if (selected) {
        setInput(selected);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setInput(url);
    setIsVideo(url.startsWith("http") || url.startsWith("rtsp"));
    setIsMJPEG(url.endsWith(".mjpg") || url.endsWith(".mjpeg"));
  };

  const handleProcess = async () => {
    try {
      const response = await invoke("process_anpr", { input, typeNumber });
      console.log({ response });

      setResult(response);
    } catch (error) {
      console.error("Error processing ANPR:", error);
    }
  };
  const handleAddStream = () => {
    setStreams([
      ...streams,
      { url: dialogInput, typeNumber: dialogTypeNumber },
    ]);
    setOpenDialog(false);
    setDialogInput("");
    setDialogTypeNumber(104);
  };
  const handleDeleteStream = (index) => {
    const newStreams = streams.filter((_, i) => i !== index);
    setStreams(newStreams);
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
      <div style={{ display: "flex" }}>
        <Drawer
          PaperProps={{ elevation: 1 }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,

            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              p: 1,
            },
          }}
          open={openDrawer}
          onClose={toggleDrawer(false)}
        >
          <List>
            {serialPorts.map((stream, index) => (
              <Paper elevation={2} sx={{ mt: 1, py: 1 }}>
                <ListItem key={index}>
                  <ListItemText primary={stream.port_name} />
                </ListItem>
                <ListItem dense>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText>Type: {stream.port_type}</ListItemText>
                </ListItem>
              </Paper>
            ))}
          </List>
        </Drawer>

        <Drawer
          variant="permanent"
          PaperProps={{ elevation: 1 }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,

            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              p: 1,
            },
          }}
        >
          <List>
            {streams.map((stream, index) => (
              <Paper elevation={2} sx={{ mt: 1, py: 1 }}>
                <ListItem key={index}>
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

            <ListItemButton onClick={toggleDrawer(true)}>
              <ListItemIcon>
                <ShowChart />
              </ListItemIcon>
              <ListItemText primary="Открыть порты" />
            </ListItemButton>
          </List>
          <List>
            {/* <ListItem button onClick={handleFileChange}>
              <ListItemText primary="Choose File" />
            </ListItem>
            <ListItem>
              <TextField
                label="Enter URL"
                value={input}
                onChange={handleUrlChange}
                fullWidth
                size="small"
              />
            </ListItem>
            <ListItem>
              <TextField
                label="Type Number"
                type="number"
                value={typeNumber}
                onChange={(e) => setTypeNumber(Number(e.target.value))}
                fullWidth
                size="small"
              />
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProcess}
              >
                Process
              </Button>
            </ListItem> */}
          </List>
        </Drawer>
        <main style={{ flexGrow: 1, padding: "24px" }}>
          {input && !isVideo && (
            <div>
              <Typography variant="h6">Selected Image</Typography>
              <img src={input} alt="Selected" style={{ maxWidth: "100%" }} />
            </div>
          )}
          {input && isVideo && !isMJPEG && (
            <div>
              <Typography variant="h6">Video Stream</Typography>
              <VideoPlayer url={input} />
            </div>
          )}
          {input && isMJPEG && (
            <div>
              <Typography variant="h6">MJPEG Stream</Typography>
              <img
                src={input}
                alt="MJPEG Stream"
                style={{ maxWidth: "100%" }}
              />
            </div>
          )}

          {!isVideo && !isMJPEG && streams.length == 0 && (
            <Paper
              sx={{
                height: "calc(100dvh - 48px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack justifyContent={"center"} alignItems={"center"}>
                <Camera sx={{ fontSize: "64px" }} />
                <Typography textAlign="center" variant="h2" fontWeight="bold">
                  Пусто
                </Typography>
                <Typography
                  textAlign="center"
                  variant="h4"
                  fontWeight="bold"
                  letterSpacing={3}
                >
                  Добавьте камеру
                </Typography>
              </Stack>
            </Paper>
          )}

          {streams.length > 0 && (
            <Paper
              sx={{
                height: "calc(100dvh - 48px)",
                display: "flex",
              }}
            >
              <Grid container spacing={2}>
                {streams.map((stream, index) => (
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
                    >{`Поток ${index + 1}`}</Typography>
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
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* <Grid container spacing={2} mt={2}>
            {serialPorts.map((stream, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={1} sx={{ p: 1 }}>
                  <Typography variant="h5">{stream.port_name}</Typography>
                  <Divider />
                  <Typography mt={1}>{stream.port_type}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid> */}

          <Grid container spacing={2}>
            {result.length > 0 && (
              <>
                <Typography variant="h6">Results</Typography>
                <ul>
                  {result.map((plate, index) => (
                    <li key={index}>{plate}</li>
                  ))}
                </ul>
              </>
            )}
          </Grid>
        </main>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          PaperProps={{ elevation: 2 }}
        >
          <DialogTitle>Add Stream</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the stream URL and type number to add a new stream.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Stream URL"
              fullWidth
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Type Number"
              type="number"
              fullWidth
              value={dialogTypeNumber}
              onChange={(e) => setDialogTypeNumber(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleAddStream} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          PaperProps={{ elevation: 2 }}
          open={openSettingsDialog}
          onClose={() => setOpenSettingsDialog(false)}
        >
          <DialogTitle>Настройки потока</DialogTitle>
          <DialogContent>
            {/* <DialogContentText>
              Update the stream URL and type number. 00102037
            </DialogContentText> */}
            <TextField
              autoFocus
              margin="dense"
              label="Stream URL"
              fullWidth
            
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Type Number"
              type="number"
              fullWidth
             
              value={dialogTypeNumber}
              onChange={(e) => setDialogTypeNumber(Number(e.target.value))}
            />
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              // value={age}
              // onChange={handleChange}
              label="Тип номеров"
              
           
              fullWidth
            >
              
              <MenuItem value={104}>Казахстанские</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
            <TextField
              margin="dense"
              label="Тип триггера"
              type="number"
           
              fullWidth
            />
            <TextField
              margin="dense"
              label="Скорость обработки (кдр/с)"
              type="number"
            
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenSettingsDialog(false)}
              color="primary"
            >
              Отменить
            </Button>
            <Button onClick={handleUpdateStream} color="primary">
              Обновить
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default App;
