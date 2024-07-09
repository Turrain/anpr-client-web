import React, {useState} from 'react';
import {
    Container,
    CssBaseline,
    Typography,
    AppBar,
    Toolbar,
    Button,
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';

import {Inbox, Mail} from '@mui/icons-material';
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ManualCarItemsList from './components/ManualCar/ManualCarItemsList';
import CreateManualCarItem from './components/ManualCar/CreateManualCarItem';
import UpdateManualCarItem from './components/ManualCar/UpdateManualCarItem';
import UpdateCounterpartyItem from './components/Counterparty/UpdateCounterpartyItem';
import UpdateAutoCarItem from './components/AutoCar/UpdateAutoCarItem';
import CreateCounterpartyItem from './components/Counterparty/CreateCounterpartyItem';
import CreateAutoCarItem from './components/AutoCar/CreateAutoCarItem';
import CounterpartyItemsList from './components/Counterparty/CounterpartyItemsList';
import AutoCarItemsList from './components/AutoCar/AutoCarItemsList';
import {DefPortPage} from './components/Port/PortPage';

import {invoke} from '@tauri-apps/api/core';
import {requestPermission, isPermissionGranted, sendNotification} from '@tauri-apps/plugin-notification';
import CameraManager from './components/Camera/CameraPage';

const drawerWidth = 240;
const App = () => {
    const [streams, setStreams] = useState([]);
    const sendNotification1 = async () => {
        let permissionGranted = await isPermissionGranted();
        console.log(permissionGranted);
        // If not we need to request it
        if (!permissionGranted) {
            const permission = await requestPermission();
            console.log(permission);
            permissionGranted = permission === 'granted';
        }

        // Once permission has been granted we can send the notification
        if (permissionGranted) {
            sendNotification({title: 'Tauri', body: 'Tauri is awesome!'});
        }
    };
    const startCommunication = async () => {
        await invoke("start_serial_communication");
    };
    return (
        <Router>
            <Box sx={{display: 'flex'}}>
                <AppBar
                    position="fixed"

                    sx={{width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, boxShadow: '0'}}
                >
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            CRUD Dashboard
                        </Typography>
                        <Button color="inherit" component={Link} to="/">Home</Button>
                        <Button color="inherit" component={Link} to="/create">Create</Button>
                    </Toolbar>
                </AppBar>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                    variant="permanent"
                    anchor="left"
                >
                    <Toolbar/>
                    <Divider/>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Inbox/>
                                </ListItemIcon>

                                <Button color="inherit" component={Link} to="/auto">Взвешивания</Button>

                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Mail/>
                                </ListItemIcon>

                                <Button color="inherit" component={Link} to="/manual">Весовая</Button>

                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Mail/>
                                </ListItemIcon>

                                <Button color="inherit" component={Link} to="/counterparty">Контрагенты</Button>

                            </ListItemButton>
                        </ListItem>


                    </List>
                    <Divider/>
                    <List>

                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Inbox/>
                                </ListItemIcon>

                                <Button color="inherit" component={Link} to="/ports">КОМ порты</Button>

                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Inbox/>
                                </ListItemIcon>
                                <Button color="inherit" component={Link} to="/cameras">Камеры</Button>
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <Inbox/>
                                </ListItemIcon>
                                <ListItemText primary={"text"}/>
                            </ListItemButton>
                        </ListItem>

                    </List>
                    <Button onClick={sendNotification1}>Send Notification</Button>
                    <Button onClick={startCommunication}>Start Communication</Button>
                </Drawer>

                <Box sx={{width: '100%'}}>
                    <Toolbar/>
                    <Box mt={0}>
                        <Routes>
                            <Route path="/ports" element={<DefPortPage/>}/>
                            <Route path="/cameras" element={<CameraManager streams={streams} setStreams={setStreams}
                                                                           handleProcess={undefined}/>}/>
                            <Route path="/manual" element={<ManualCarItemsList/>}/>
                            <Route path="/auto" element={<AutoCarItemsList/>}/>
                            <Route path="/counterparty" element={<CounterpartyItemsList/>}/>

                            <Route path="/create-manual" element={<CreateManualCarItem/>}/>
                            <Route path="/create-auto" element={<CreateAutoCarItem/>}/>
                            <Route path="/create-counterparty" element={<CreateCounterpartyItem/>}/>

                            <Route path="/update-manual/:id" element={<UpdateManualCarItem/>}/>
                            <Route path="/update-auto/:id" element={<UpdateAutoCarItem/>}/>
                            <Route path="/update-counterparty/:id" element={<UpdateCounterpartyItem/>}/>
                        </Routes>
                    </Box>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
