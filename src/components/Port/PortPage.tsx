// PortPage.js
import React, { useEffect, useRef, useState } from "react";
import { Paper, Stack, Typography } from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import { useSnackbar } from "notistack";
import PortList from "./PortList";
import { invoke } from '@tauri-apps/api/core';

const PortPage = ({
  receivedData,
  setReceivedData,
  serialPorts,
  setSerialPorts,
}) => {
  const listEndRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    
    invoke("list_serial_ports2")
      .then((ports) => {console.log(ports); setSerialPorts(ports)})
      .catch(console.error);
  
  }, []);

  useEffect(() => {
    const unlistenReceived = listen("port-data", (event) => {
      setReceivedData((prevData) => [...prevData, event.payload].slice(-40));
      console.log(event.payload)
      // if (event.payload.data > 100) {
      //   enqueueSnackbar(`THIS : ${event.payload.data}`, {
      //     anchorOrigin: { horizontal: "right", vertical: "top" },
      //     variant: "error",
      //   });
      // }
    });

    return () => {
      unlistenReceived.then((unlisten) => unlisten());
    };
  }, [setReceivedData, enqueueSnackbar]);

  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [receivedData]);

  useEffect(() => {
    const unlisten = listen("anpr-update", (event) => {
      setReceivedData((prevResult) => [...prevResult, ...event.payload]);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setSerialPorts]);

  return (
    <Paper
      className="custom-scrollbar"
      elevation={1}
      sx={{
      
        width: "100%",
        overflow: "auto",
        maxHeight: "97dvh",
        scrollbarWidth: "auto",
      }}
    >
      <Stack>
        {receivedData.map((data, index) => (
          <Typography variant="caption" key={index}>
            {data.port_name}: {data.data}
          </Typography>
        ))}
        <div ref={listEndRef} />
      </Stack>
    </Paper>
  );
};

export default PortPage;

export function DefPortPage() {
    const [serialPorts, setSerialPorts] = useState([]);
    const [receivedData, setReceivedData] = useState([]);
    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  
  return (
    <Stack direction="row">
      
      <PortList
        serialPorts={serialPorts}
     
        setOpenSettingsDialog={setOpenSettingsDialog}
      />
      <PortPage
        receivedData={receivedData}
        setReceivedData={setReceivedData}
       
        serialPorts={serialPorts}
        setSerialPorts={setSerialPorts}
      />
    </Stack>
  );
}
