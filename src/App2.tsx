import React from 'react';
import { Container, CssBaseline, Typography, AppBar, Toolbar, Button, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import { Inbox, Mail } from '@mui/icons-material';
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
const drawerWidth = 240;
const App = () => {
  return (
    <Router>
     <Box sx={{ display: 'flex' }}>
     <AppBar
        position="fixed"
        
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, boxShadow: '0' }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
        <Toolbar />
        <Divider />
        <List>
        <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Inbox /> 
                </ListItemIcon>

                <Button color="inherit" component={Link} to="/auto">Взвешивания</Button>
       
              </ListItemButton>
            </ListItem>
            <ListItem  disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Mail />
                </ListItemIcon>

                <Button color="inherit" component={Link} to="/manual">Весовая</Button>
       
              </ListItemButton>
            </ListItem>
            <ListItem  disablePadding>
              <ListItemButton>
                <ListItemIcon>
                 <Mail />
                </ListItemIcon>

                <Button color="inherit" component={Link} to="/counterparty">Контрагенты</Button>
       
              </ListItemButton>
            </ListItem>

        
        </List>
        <Divider />
        <List>
          {['Камеры', 'COM-порты', 'Выгрузка'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <Inbox /> : <Mail />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      <Box sx={{width:'100%', px:4}}>
      <Toolbar />
        <Box mt={3}>
        <Routes>
             <Route path="/" element={<>TEST</>} />
            <Route path="/manual" element={<ManualCarItemsList />} />
            <Route path="/auto" element={<AutoCarItemsList />} />
            <Route path="/counterparty" element={<CounterpartyItemsList />} />
          
            <Route path="/create-manual" element={<CreateManualCarItem />} />
            <Route path="/create-auto" element={<CreateAutoCarItem />} />
            <Route path="/create-counterparty" element={<CreateCounterpartyItem />} />
           
            <Route path="/update-manual/:id" element={<UpdateManualCarItem />} />
            <Route path="/update-auto/:id" element={<UpdateAutoCarItem />} />
            <Route path="/update-counterparty/:id" element={<UpdateCounterpartyItem />} />
          </Routes>
        </Box> 
      </Box>
      </Box>
    </Router>
  );
}

export default App;
