use serde::{Serialize, Deserialize};
use serialport::SerialPortType;
use tauri::{Manager, Window};
use std::{thread, sync::{mpsc::channel, Arc, Mutex}, time::Duration, io};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct PortInfo {
    port_name: String,
    port_type: String,
    vid: Option<u16>,
    pid: Option<u16>,
    serial_number: Option<String>,
    manufacturer: Option<String>,
    product: Option<String>,
    interface: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct SerialPortSettings {
    port_name: String,
    baud_rate: u32,
    data_bits: u8,
    stop_bits: u8,
    parity: u8,
    flow_control: u8,
    driver: i32,
}

#[derive(Serialize, Clone)]
pub(crate) struct PortData<T>
where
    T: Serialize,
{
    pub port_name: String,
    pub data: T,
}

pub(crate) const SCALES_DATA_DRIVER: i32 = 1;
pub(crate) const SERIAL_DATA_DRIVER: i32 = 2;

pub(crate) struct SerialComm {
    stop_flag: Arc<Mutex<bool>>,
    current_port: Arc<Mutex<Option<String>>>,
    settings: Arc<Mutex<Option<SerialPortSettings>>>,
}

impl SerialComm {
    fn new() -> Self {
        Self {
            stop_flag: Arc::new(Mutex::new(false)),
            current_port: Arc::new(Mutex::new(None)),
            settings: Arc::new(Mutex::new(None)),
        }
    }

    fn load_settings(&self, settings: SerialPortSettings) {
        *self.settings.lock().unwrap() = Some(settings);
    }
    
    fn start_read_serial_port(&self, window: Window) {
        self.stop();  // Ensure any running thread is stopped before starting a new one

        // Reset the stop flag
        {
            let mut stop_flag = self.stop_flag.lock().unwrap();
            *stop_flag = false;
        }

        let (tx, rx) = channel();
        let stop_flag = self.stop_flag.clone();
        let settings = self.settings.lock().unwrap().clone();

        if let Some(settings) = settings {
            *self.current_port.lock().unwrap() = Some(settings.port_name.clone());

            // Map u8 to serialport enums
            let data_bits = match settings.data_bits {
                5 => serialport::DataBits::Five,
                6 => serialport::DataBits::Six,
                7 => serialport::DataBits::Seven,
                8 => serialport::DataBits::Eight,
                _ => serialport::DataBits::Eight,
            };
            let stop_bits = match settings.stop_bits {
                1 => serialport::StopBits::One,
                2 => serialport::StopBits::Two,
                _ => serialport::StopBits::One,
            };
            let parity = match settings.parity {
                0 => serialport::Parity::None,
                1 => serialport::Parity::Odd,
                2 => serialport::Parity::Even,
                _ => serialport::Parity::None,
            };
            let flow_control = match settings.flow_control {
                0 => serialport::FlowControl::None,
                1 => serialport::FlowControl::Software,
                2 => serialport::FlowControl::Hardware,
                _ => serialport::FlowControl::None,
            };

            let port_name = settings.port_name.clone();
            let driver = settings.driver;

            // Spawn thread to read from the serial port
            let stop_flag_read = stop_flag.clone();
            let port_name_read = port_name.clone();
            thread::spawn(move || {
                let mut port = serialport::new(&port_name_read, settings.baud_rate)
                    .data_bits(data_bits)
                    .stop_bits(stop_bits)
                    .parity(parity)
                    .flow_control(flow_control)
                    .timeout(Duration::from_millis(10))
                    .open()
                    .expect("Failed to open port");

                loop {
                    let mut buffer: Vec<u8> = vec![0; 1024];
                    match port.read(buffer.as_mut_slice()) {
                        Ok(t) => {
                            let received_data = &buffer[..t];
                            println!("Received data: {:?}", received_data);
                            if tx.send(received_data.to_vec()).is_err() {
                                eprintln!("Receiver has been dropped");
                            }
                        }
                        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                        Err(e) => eprintln!("{:?}", e),
                    }
                   // println!("BBBB: {:?}", *stop_flag_read.lock().unwrap() );
                    if *stop_flag_read.lock().unwrap() {
                        break;
                    }
                }
            });

            // Spawn thread to send data to the Tauri frontend
            let stop_flag_write = stop_flag.clone();
            thread::spawn(move || {
                loop {
                    match rx.try_recv() {
                        Ok(data) => {
                            read_from_serial_data(&port_name, &data, driver, window.clone());
                        }
                        Err(_) => (),
                    }

                    if *stop_flag_write.lock().unwrap() {
                        break;
                    }
                }
            });
        } else {
            eprintln!("No settings loaded");
        }
    }


    fn stop(&self) {
        let mut stop = self.stop_flag.lock().unwrap();
        *stop = true;
        println!("AAAAAAAA:{:?}", *stop)
    }

    fn change_port(&self, settings: SerialPortSettings, window: Window) {
        self.stop();
        self.load_settings(settings);
        self.start_read_serial_port(window);
    }
}

// Reads data from the serial port and emits events based on the driver type
fn read_from_serial_data(port_name: &str, buffer: &[u8], driver: i32, window: Window) {
    match driver {
        SCALES_DATA_DRIVER => {
            if let Some(data) = extract_numeric_data(buffer) {
                window.emit("port-data", PortData { port_name: port_name.to_string(), data })
                    .expect("Failed to emit event");
            }
        }
        SERIAL_DATA_DRIVER => {
            window.emit("port-data", PortData { port_name: port_name.to_string(), data: buffer.to_vec() })
                .expect("Failed to emit event");
        }
        _ => {
            eprintln!("Unknown driver type: {}", driver);
        }
    }
}

// Extracts numeric data from the buffer
fn extract_numeric_data(buffer: &[u8]) -> Option<String> {
    if let Some(start) = buffer.iter().position(|&x| x == 0x77) {
        if let Some(end) = buffer.iter().skip(start).position(|&x| x == 0x0D) {
            let end = end + start + 1;
            if buffer.get(end) == Some(&0x0A) {
                let pattern = &buffer[start..end + 1];
                let numeric_data: String = pattern
                    .iter()
                    .filter_map(|&c| {
                        if c.is_ascii_digit() {
                            Some(c as char)
                        } else {
                            None
                        }
                    })
                    .collect();
                return Some(numeric_data);
            }
        }
    }
    None
}

lazy_static::lazy_static! {
    pub(crate) static ref SERIAL_COMM: SerialComm = SerialComm::new();
}

#[tauri::command]
pub(crate) fn read_serial_port(settings: SerialPortSettings, window: Window) {
    SERIAL_COMM.change_port(settings, window);
}

#[tauri::command]
pub(crate) fn stop_serial_port() {
    SERIAL_COMM.stop();
}

#[tauri::command]
pub(crate) fn load_serial_port_settings(settings: SerialPortSettings) {
    SERIAL_COMM.load_settings(settings);
}

#[tauri::command]
pub(crate) fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    match serialport::available_ports() {
        Ok(ports) => {
            let port_info_list: Vec<PortInfo> = ports.into_iter().map(|p| {
                match p.port_type {
                    SerialPortType::UsbPort(ref info) => PortInfo {
                        port_name: p.port_name.clone(),
                        port_type: "USB".to_string(),
                        vid: Some(info.vid),
                        pid: Some(info.pid),
                        serial_number: info.serial_number.clone(),
                        manufacturer: info.manufacturer.clone(),
                        product: info.product.clone(),
                        interface: None,
                    },
                    SerialPortType::BluetoothPort => PortInfo {
                        port_name: p.port_name,
                        port_type: "Bluetooth".to_string(),
                        vid: None,
                        pid: None,
                        serial_number: None,
                        manufacturer: None,
                        product: None,
                        interface: None,
                    },
                    SerialPortType::PciPort => PortInfo {
                        port_name: p.port_name,
                        port_type: "PCI".to_string(),
                        vid: None,
                        pid: None,
                        serial_number: None,
                        manufacturer: None,
                        product: None,
                        interface: None,
                    },
                    SerialPortType::Unknown => PortInfo {
                        port_name: p.port_name,
                        port_type: "Unknown".to_string(),
                        vid: None,
                        pid: None,
                        serial_number: None,
                        manufacturer: None,
                        product: None,
                        interface: None,
                    },
                }
            }).collect();
            Ok(port_info_list)
        }
        Err(e) => Err(format!("Error listing serial ports: {:?}", e)),
    }
}
