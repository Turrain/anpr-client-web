// import { useEffect, useRef, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "core";
// import "@fontsource/roboto/300.css";
// import "@fontsource/roboto/400.css";
// import "@fontsource/roboto/500.css";
// import "@fontsource/roboto/700.css";
// import "./App.css";
// import { open } from "@tauri-apps/plugin-dialog";
// import { listen } from "@tauri-apps/api/event";
// import { FixedSizeList, ListChildComponentProps } from "react-window";
// import ReactPlayer from "react-player";
// import Button from "@mui/material/Button";
// import {
//   AppBar,
//   Toolbar,
//   IconButton,
//   Typography,
//   Drawer,
//   List,
//   ListItem,
//   ListItemText,
//   TextField,
//   Grid,
//   Paper,
//   Stack,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   ListItemButton,
//   ListItemIcon,
//   ListSubheader,
//   Box,
//   Divider,
//   Tooltip,
//   styled,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@mui/material";
// import {
//   Add,
//   ArrowRight,
//   Camera,
//   Delete,
//   Home,
//   KeyboardArrowDown,
//   Menu,
//   Settings,
//   ShowChart,
// } from "@mui/icons-material";

// import React from "react";
// import AddStreamDialog from "./components/Camera/StreamCreateDialog";
// import StreamSettingsDialog from "./components/Camera/StreamSettingsDialog";
// import PortSettingsDialog, { SerialPortSettings } from "./PortSettingsDialog";

// function renderRow(props: ListChildComponentProps) {
//   const { index, data, style } = props;

//   return (
//     <Typography variant="caption" key={index}>
//       {data.port_name}: {data.data}
//     </Typography>
//   );
// }

// const VideoPlayer = ({ url }) => {
//   return (
//     <div
//       style={{
//         position: "relative",
//         paddingTop: "56.25%",
//         height: "0",
//         overflow: "hidden",
//       }}
//     >
//       <ReactPlayer
//         url={url}
//         className="react-player"
//         playing
//         controls
//         width="100%"
//         height="100%"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           padding: "4px",
//           backgroundColor: "darkorchid",
//         }}
//       />
//     </div>
//   );
// };
// import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';

// //mjpg is a timer update image from url
// const drawerWidth = 260;

// function App() {
//   const [typeNumber, setTypeNumber] = useState(104);
//   const [result, setResult] = useState([]);

//   const [streams, setStreams] = useState([]);

//   const [openDialog, setOpenDialog] = useState(false);
//   const [openSettingsDialog, setOpenSettingsDialog] = useState(false);

//   const [currentStreamIndex, setCurrentStreamIndex] = useState(null);
//   const [serialPorts, setSerialPorts] = useState([]);

//   const [openDrawer, setOpenDrawer] = React.useState(false);

//   const [running, setRunning] = useState(false);
//   const [receivedData, setReceivedData] = useState([]);

//   const [openPortSettingsDialog, setOpenPortSettingsDialog] = useState<boolean>(false);
//   const { enqueueSnackbar } = useSnackbar();

//   const handleUpdatePortSettings = (settings: SerialPortSettings) => {
//     console.log('Port Settings:', settings);
//     // You can add additional logic here to handle the updated port settings
//   };


//   useEffect(() => {
//     const unlistenReceived = listen("received-data", (event) => {

//       setReceivedData((prevData) => [...prevData, event.payload].slice(-49));
//       if(event.payload.data > 100) {
//         enqueueSnackbar(`THIS : ${event.payload.data}`, {
//           "anchorOrigin": {horizontal: "right", vertical: 'top'},
//           variant: 'error'
//         });
//       }
//     }); 

//     return () => {
//       unlistenReceived.then((unlisten) => unlisten());
//     };
//   }, []);

//   const startCommunication = async () => {
//     await invoke("start_serial_communication");
//     setRunning(true);
//   };

//   const toggleDrawer = (newOpen: boolean) => () => {
//     setOpenDrawer(newOpen);
//   };
//   const listEndRef = useRef(null);
//   useEffect(() => {
//     if (listEndRef.current) {
//       listEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }

//   }, [receivedData]);

//   useEffect(() => {
//     const unlisten = listen("anpr-update", (event) => {
//       setResult((prevResult) => [...prevResult, ...event.payload]);
//     });
//     invoke("list_serial_ports")
//       .then((ports) => setSerialPorts(ports))
//       .catch(console.error);
//     return () => {
//       unlisten.then((fn) => fn());
//     };
//   }, []);

//   const handleProcess = async (input) => {
//     try {
//       const response = await invoke("process_anpr", { input, typeNumber });
//       console.log({ response });

//       setResult(response);
//     } catch (error) {
//       console.error("Error processing ANPR:", error);
//     }
//   };
//   const handleAddStream = (dialogInput,dialogTypeNumber ) => {
//     setStreams([
//       ...streams,
//       { url: dialogInput, typeNumber: dialogTypeNumber },
//     ]);
//     setOpenDialog(false);
//   };
//   const handleDeleteStream = (index) => {
//     const newStreams = streams.filter((_, i) => i !== index);
//     setStreams(newStreams);
//   };
//   const getGridItemSize = (numStreams) => {
//     if (numStreams === 1) {
//       return 12;
//     } else if (numStreams === 2) {
//       return 6;
//     } else {
//       return 4;
//     }
//   };
//   const handleOpenSettingsDialog = (index) => {
//     setCurrentStreamIndex(index);
//     setDialogInput(streams[index].url);
//     setDialogTypeNumber(streams[index].typeNumber);
//     setOpenSettingsDialog(true);
//   };

//   const handleUpdateStream = () => {
//     const newStreams = streams.map((stream, index) =>
//       index === currentStreamIndex
//         ? { url: dialogInput, typeNumber: dialogTypeNumber }
//         : stream
//     );
//     setStreams(newStreams);
//     setOpenSettingsDialog(false);
//     setDialogInput("");
//     setDialogTypeNumber(104);
//     setCurrentStreamIndex(null);
//   };
//   const [rtspUrl, setRtspUrl] = useState('');
//   const [rtmpUrl, setRtmpUrl] = useState('');
//   const startBroadcast = async () => {
//     try {
//       await invoke('start_rtsp_to_rtmp', { rtspUrl, rtmpUrl });
//       alert('Broadcast started!');
//     } catch (e) {
//       alert('Failed to start broadcast: ' + e);
//     }
//   };
//   return (
//     <>
//       <div style={{ display: "flex" }}>
//         <Drawer
//           PaperProps={{ elevation: 1 }}
//           sx={{
//             width: drawerWidth * 2,
//             flexShrink: 0,

//             [`& .MuiDrawer-paper`]: {
//               width: drawerWidth * 2,
//               boxSizing: "border-box",
//               p: 1,
//             },
//           }}
//           open={openDrawer}
//           onClose={toggleDrawer(false)}
//         >
//           <Stack direction="row">
//             <Paper elevation={4} sx={{ width: "100%" }}>
//               <List sx={{ width: drawerWidth }}>
//                 {serialPorts.map((stream, index) => (
//                   <Paper elevation={2} sx={{ mt: 1, py: 1 }}>
//                     <ListItem key={index}>
//                       <ListItemText primary={stream.port_name} />
//                     </ListItem>
//                     <ListItem dense>
//                       <ListItemText>Type: {stream.port_type}</ListItemText>
//                     </ListItem>

//                     <ListItem dense>
//                       <Button variant="contained" fullWidth onClick={() => setOpenSettingsDialog(true)}>
//                         Настройки{" "}
//                       </Button>
//                     </ListItem>

//                     <ListItem dense>
//                       <Button
//                         variant="contained"
//                         onClick={startCommunication}
//                         fullWidth
//                       >
//                         Включить{" "}
//                       </Button>
//                     </ListItem>
//                   </Paper>
//                 ))}
//               </List>
//             </Paper>
//             <Paper
//               className="custom-scrollbar"
//               elevation={4}
//               sx={{
//                 width: "100%",
//                 overflow: "auto",
//                 maxHeight: "97dvh",
//                 scrollbarWidth: "auto",
//               }}
//             >
//               <Stack>
//                 {receivedData.map((data, index) => (
//                   <Typography variant="caption" key={index}>
//                     {data.port_name}: {data.data}
//                   </Typography>
//                 ))}

//                 <div ref={listEndRef} />
//               </Stack>
//             </Paper>
//           </Stack>
//         </Drawer>

//         <Drawer
//           variant="permanent"
//           PaperProps={{ elevation: 1 }}
//           sx={{
//             width: drawerWidth,
//             flexShrink: 0,

//             [`& .MuiDrawer-paper`]: {
//               width: drawerWidth,
//               boxSizing: "border-box",
//               p: 1,
//             },
//           }}
//         >
//           <List>
//             {streams.map((stream, index) => (
//               <Paper elevation={2} sx={{ mt: 1, py: 1 }}>
//                 <ListItem key={index}>
//                   <ListItemText primary={`Поток ${index + 1}`} />
//                   <IconButton
//                     edge="end"
//                     aria-label="delete"
//                     onClick={() => handleDeleteStream(index)}
//                   >
//                     <Delete />
//                   </IconButton>
//                 </ListItem>
//                 <ListItemButton
//                   dense
//                   onClick={() => handleOpenSettingsDialog(index)}
//                 >
//                   <ListItemIcon>
//                     <Settings />
//                   </ListItemIcon>
//                   <ListItemText>Настройки</ListItemText>
//                 </ListItemButton>
//                 <ListItem dense>
//                   <Button
//                     variant="contained"
//                     fullWidth
//                     onClick={() => handleProcess(stream.url)}
//                   >
//                     Process{" "}
//                   </Button>
//                 </ListItem>
//               </Paper>
//             ))}
//           </List>
//           <List
//             sx={{
//               width: "100%",
//               maxWidth: 360,
//               bgcolor: "background.paper",
//               marginTop: "auto",
//             }}
//             component="nav"
//             aria-labelledby="nested-list-subheader"
//             subheader={
//               <ListSubheader component="div" id="nested-list-subheader">
//                 Опции
//               </ListSubheader>
//             }
//           >
//             <ListItemButton onClick={() => setOpenDialog(true)}>
//               <ListItemIcon>
//                 <Add />
//               </ListItemIcon>
//               <ListItemText primary="Добавить поток" />
//             </ListItemButton>

//             <ListItemButton onClick={toggleDrawer(true)}>
//               <ListItemIcon>
//                 <ShowChart />
//               </ListItemIcon>
//               <ListItemText primary="Открыть порты" />
//             </ListItemButton>

//             <ListItem>
//               <TextField size="small" label="RTSP" value={rtspUrl}  onChange={(e) => setRtspUrl(e.target.value)}/>
//               </ListItem>
//               <ListItem>

//               <TextField size="small" label="RTMP" value={rtmpUrl}  onChange={(e) => setRtmpUrl(e.target.value)}/>
//               </ListItem>
//               <ListItem>
//               <Button fullWidth onClick={startBroadcast}>Start Broadcast</Button>
//               </ListItem>
//           </List>
//           <List>
          
//           </List>
//         </Drawer>
//         <main style={{ flexGrow: 1, padding: "24px" }}>
//           {streams.length == 0 && (
//             <Paper
//               sx={{
//                 height: "calc(100dvh - 48px)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Stack justifyContent={"center"} alignItems={"center"}>
//                 <Camera sx={{ fontSize: "64px" }} />
//                 <Typography textAlign="center" variant="h2" fontWeight="bold">
//                   Пусто
//                 </Typography>
//                 <Typography
//                   textAlign="center"
//                   variant="h4"
//                   fontWeight="bold"
//                   letterSpacing={3}
//                 >
//                   Добавьте камеру
//                 </Typography>
//               </Stack>
//             </Paper>
//           )}

//           {streams.length > 0 && (
//             <Paper
//               sx={{
//                 height: "calc(100dvh - 48px)",
//                 display: "flex",
//               }}
//             >
//               <Grid container spacing={2}>
//                 {streams.map((stream, index) => (
//                   <Grid
//                     item
//                     xs={12}
//                     sm={6}
//                     md={getGridItemSize(streams.length)}
//                     key={index}
//                   >
//                     <Typography
//                       sx={{
//                         backgroundColor: "blueviolet",
//                         p: 1,
//                         width: "fit-content",
//                       }}
//                       variant="h6"
//                     >{`Поток ${index + 1}`}</Typography>
//                     {stream.url.endsWith(".mjpg") ||
//                     stream.url.endsWith(".mjpeg") ? (
//                       <img
//                         src={stream.url}
//                         alt={`Stream ${index + 1}`}
//                         style={{ maxWidth: "100%" }}
//                       />
//                     ) : (
//                       <VideoPlayer url={stream.url} />
//                     )}
//                   </Grid>
//                 ))}
//               </Grid>
//             </Paper>
//           )}

//           <Grid container spacing={2}>
//             {result.length > 0 && (
//               <>
//                 <Typography variant="h6">Results</Typography>
//                 <ul>
//                   {result.map((plate, index) => (
//                     <li key={index}>{plate}</li>
//                   ))}
//                 </ul>
//               </>
//             )}
//           </Grid>
//         </main>

//         <AddStreamDialog
//           open={openDialog}
//           onClose={() => setOpenDialog(false)}
//           onAddStream={handleAddStream}
//         />
//         <StreamSettingsDialog
//           open={openSettingsDialog}
//           onClose={() => setOpenSettingsDialog(false)}
//           onUpdateStream={handleUpdateStream}
//         />
//         <PortSettingsDialog
//         open={openSettingsDialog}
//         onClose={() => setOpenSettingsDialog(false)}
//         onUpdatePortSettings={handleUpdatePortSettings}
//       />
//       </div>
//     </>
//   );
// }

// export default App;
