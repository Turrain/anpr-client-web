import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  ListItemContent,
  Modal,
  ModalDialog,
  Sheet,
  Stack,
  Switch,
  TextField,
  Typography,
  accordionDetailsClasses,
  accordionSummaryClasses,
} from "@mui/joy";

import {
  AirplanemodeActiveRounded,
  BluetoothRounded,
  Settings,
  Stop,
  TapAndPlayRounded,
  Usb,
  WifiRounded,
} from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/core";

interface PortSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  portName: string;
}

interface Settings {
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: number;
  flowControl: number;
  driver: number;
}

const PortSettingsDialog: React.FC<PortSettingsDialogProps> = ({
  open,
  onClose,
  portName,
}) => {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    const savedSettings = JSON.parse(
      localStorage.getItem(portName) || "{}",
    ) as Partial<Settings>;
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  }, [portName]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const saveSettings = () => {
    localStorage.setItem(portName, JSON.stringify(settings));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Box sx={{ p: 2, width: 300 }}>
          <Stack gap={2} sx={{ mt: 2 }}>
            {Object.keys(settings).map((key) => (
              <FormControl key={key}>
                <FormLabel>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </FormLabel>
                <Input
                  name={key}
                  value={settings[key]}
                  onChange={handleChange}
                  fullWidth
                />
              </FormControl>
            ))}
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            gap={1}
            sx={{ mt: 2 }}
          >
            <Button onClick={onClose} color="neutral">
              Cancel
            </Button>
            <Button onClick={saveSettings} color="primary">
              Save
            </Button>
          </Stack>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

interface Port {
  port_name: string;
  port_type: string;
}

interface PortListItemProps {
  port: Port;
  openSettingsDialog: (portName: string) => void;
  startReading: () => void;
  stopReading: () => void;
  runningPort: string | null;
}

const PortListItem: React.FC<PortListItemProps> = ({
  port,
  openSettingsDialog,
  startReading,
  stopReading,
  runningPort,
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={{ borderBottom: "1px solid black", py: 1 }}
  >
    <Box>
      <Typography>{port.port_name}</Typography>
      <Typography level="body-md" color="neutral">
        {port.port_type}
      </Typography>
    </Box>
    <Stack direction="row" gap={1}>
      <IconButton onClick={() => openSettingsDialog(port.port_name)}>
        <Settings />
      </IconButton>
      {runningPort === port.port_name ? (
        <IconButton onClick={stopReading}>
          <Stop />
        </IconButton>
      ) : (
        <IconButton onClick={startReading} disabled={runningPort !== null}>
          <Usb />
        </IconButton>
      )}
    </Stack>
  </Stack>
);
import { Chart } from "react-charts";
import { listen } from "@tauri-apps/api/event";

const LineChart = ({ data, markers }) => {
  const primaryAxis = React.useMemo(
    () => ({
      getValue: (datum) => datum.primary,
      scaleType: "time", // Explicitly set the scale type
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    () => [
      {
        getValue: (datum) => datum.secondary,
        scaleType: "linear", // Explicitly set the scale type
      },
    ],
    [],
  );

  return (
    <Box
      sx={{
        p: "2.5%",
        width: "100%",
        height: "400px",
      }}
    >
      <Chart
        options={{
          data: [
            ...data,
            {
              label: "Markers",
              data: markers.map((marker) => ({
                primary: marker.primary,
                secondary: marker.secondary,
              })),
            },
          ],
          primaryAxis,
          secondaryAxes,
        }}
      />
    </Box>
  );
};
const PortSettingsAccordion: React.FC<{ portName: string }> = ({
  portName,
}) => {
  const [settings, setSettings] = useState<Partial<Settings>>({});

  useEffect(() => {
    const savedSettings = JSON.parse(
      localStorage.getItem(portName) || "{}",
    ) as Partial<Settings>;
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  }, [portName]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const saveSettings = () => {
    localStorage.setItem(portName, JSON.stringify(settings));
  };

  return (
    <AccordionGroup>
      <Accordion>
        <AccordionSummary>
          <Avatar color="primary">
            <Settings />
          </Avatar>
          <ListItemContent>
            <Typography level="title-md">Settings</Typography>
            <Typography level="body-sm">
              Configure the serial port settings
            </Typography>
          </ListItemContent>
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={0.2} sx={{ mt: 2 }}>
            {Object.keys(settings).map((key) => (
              <FormControl key={key} orientation="horizontal">
                <FormLabel sx={{ flexBasis: "50%" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </FormLabel>
                <Input
                  size="sm"
                  name={key}
                  value={settings[key]}
                  onChange={handleChange}
                  fullWidth
                />
              </FormControl>
            ))}
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            gap={1}
            sx={{ mt: 2 }}
          >
            {/* <Button onClick={saveSettings} color="primary">
            Save
          </Button> */}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
};

interface SerialPort {
  port_name: string;
  port_type: string;
}

const PortList = () => {
  const [serialPorts, setSerialPorts] = useState([]);

  const [runningPort, setRunningPort] = useState(null);

  const [data, setData] = useState([
    {
      label: "Series 1",
      data: [],
    },
  ]);

  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const unlistenData = listen("data", (event) => {
      console.log("Data:", event.payload); // it's an integer
      // if(event.payload > 60000)  return;
      setData((prevData) => {
        const newData = [...prevData];
        newData[0].data = [
          ...newData[0].data,
          { primary: new Date(), secondary: event.payload },
        ];
        return newData;
      });
    });
    const unlistenXEvent = listen("eventX", (event) => {
      console.log("Event X:", event.payload); // it's a timestamp or other relevant data
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        { primary: new Date(), secondary: event.payload * 1000 },
      ]);
    });

    return () => {
      unlistenData.then((unlisten) => unlisten());
      unlistenXEvent.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    const fetchSerialPorts = async () => {
      try {
        const ports = await invoke("list_serial_ports2");
        console.log(ports);
        setSerialPorts(ports);
      } catch (error) {
        console.error("Error fetching serial ports:", error);
      }
    };

    fetchSerialPorts();
  }, []);

  const startReading = async (portName) => {
    const settings = JSON.parse(localStorage.getItem(portName) || "{}");
    try {
      await invoke("set_port_config", { config: settings });
      await invoke("start_port");
      await invoke("monitor_device_callbacks");
      setRunningPort(portName);
    } catch (error) {
      console.error("Failed to start port", error);
    }
  };

  const stopReading = async () => {
    try {
      await invoke("stop_port");
      setRunningPort(null);
    } catch (error) {
      console.error("Failed to stop port", error);
    }
  };
  const startCommunication = async () => {
    await invoke("start_serial_communication");
  };
  return (
    <>
      <Stack sx={{ height: "100dvh" }}>
        <Button onClick={startCommunication}>Start Communication</Button>
        <Box
          sx={{
            flexBasis: "50%",

            p: 2,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 2,
          }}
        >
          {serialPorts?.map((port, index) => (
            <Card key={index} variant="soft">
              <CardContent>
                <Typography level="h2">{port.port_name}</Typography>
                <Typography level="title-lg">{port.port_type}</Typography>
              </CardContent>
              <PortSettingsAccordion portName={port.port_name} />
              {runningPort === port.port_name ? (
                <Button variant="solid" size="sm" onClick={stopReading}>
                  Остановить
                </Button>
              ) : (
                <Button
                  variant="solid"
                  size="sm"
                  onClick={() => startReading(port.port_name)}
                  disabled={runningPort !== null}
                >
                  Запустить
                </Button>
              )}
            </Card>
          ))}
        </Box>

        <Sheet sx={{ flexBasis: "50%" }} variant="soft">
          {data && <LineChart data={data} markers={markers} />}
        </Sheet>
      </Stack>
    </>
  );
};

export default PortList;
