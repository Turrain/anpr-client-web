// PortList.js
import React from 'react';
import { Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const PortList = ({ serialPorts, setOpenSettingsDialog }) => {
  return (
    <Paper elevation={4} sx={{ width: '100%' }}>
      <List sx={{ width: '100%' }}>
        {serialPorts?.map((port, index) => (
          <Paper elevation={2} sx={{ mt: 1, py: 1 }} key={index}>
            <ListItem>
              <ListItemText primary={port.port_name} />
            </ListItem>
            <ListItem dense>
              <ListItemText>Type: {port.port_type}</ListItemText>
            </ListItem>
            <ListItem dense>
              <Button variant="contained" fullWidth onClick={() => setOpenSettingsDialog(true)}>
                Настройки
              </Button>
            </ListItem>
            <ListItem dense>
              {/* <Button variant="contained" onClick={startCommunication} fullWidth>
                Включить
              </Button> */}
            </ListItem>
          </Paper>
        ))}
      </List>
    </Paper>
  );
};

export default PortList;