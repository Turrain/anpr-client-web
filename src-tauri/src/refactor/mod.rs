use std::{io, thread};
use std::io::ErrorKind;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use ANPR_bind::anpr_video;
use serialport;
use tauri::State;
use tokio::sync::mpsc;
#[derive(Debug, Clone)]
pub enum DataDriver {
    Rs232Xk,
    Raw,
}
#[derive(Debug)]
pub enum CarPlateType {
    Kz = 104
}

type DataCallback = Box<dyn FnMut(Vec<u8>) + Send + Sync>;
#[derive(Clone)]
pub struct DeviceBase {
    active: Arc<Mutex<bool>>,
    callback: Arc<Mutex<Option<DataCallback>>>,
}
#[derive(Clone)]
pub struct DeviceContainer {
    pub config: DeviceConfig,
    pub device: DeviceBase,
}


pub trait IntoSerialPortConfig {
    fn into_data_bits(self) -> serialport::DataBits;
    fn into_stop_bits(self) -> serialport::StopBits;
    fn into_parity(self) -> serialport::Parity;
    fn into_flow_control(self) -> serialport::FlowControl;
}

#[derive(Debug, Clone,Serialize,Deserialize)]
pub struct SerialPortConfig {
    pub name: String,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: u8,
    pub flow_control: u8,
    pub driver: u8
}

impl IntoSerialPortConfig for SerialPortConfig {
    fn into_data_bits(self) -> serialport::DataBits {
        match self.data_bits {
            5 => serialport::DataBits::Five,
            6 => serialport::DataBits::Six,
            7 => serialport::DataBits::Seven,
            8 => serialport::DataBits::Eight,
            _ => serialport::DataBits::Eight,
        }
    }

    fn into_stop_bits(self) -> serialport::StopBits {
        match self.stop_bits {
            1 => serialport::StopBits::One,
            2 => serialport::StopBits::Two,
            _ => serialport::StopBits::One,
        }
    }

    fn into_parity(self) -> serialport::Parity {
        match self.parity {
            0 => serialport::Parity::None,
            1 => serialport::Parity::Odd,
            2 => serialport::Parity::Even,
            _ => serialport::Parity::None,
        }
    }

    fn into_flow_control(self) -> serialport::FlowControl {
        match self.flow_control {
            0 => serialport::FlowControl::None,
            1 => serialport::FlowControl::Software,
            2 => serialport::FlowControl::Hardware,
            _ => serialport::FlowControl::None,
        }
    }
}
#[derive(Debug, Clone,Serialize,Deserialize)]
pub enum DeviceConfig {
    SerialPortConfig (SerialPortConfig),
    CameraConfig {
        url: String,
        target_fps: u8,
        car_plate_type: u8, //Enum
    },
    Unset,
}
pub trait Device {
    fn new() -> Self
    where
        Self: Sized;
         fn set_config(&mut self, config: DeviceConfig) -> &Self;
         fn set_active(&mut self, active: bool) -> &Self;
       fn run(&mut self);
       fn stop(&mut self);
        fn set_callback(&mut self, callback: DataCallback) -> &Self;
}
 impl Device for DeviceContainer {
    fn new() -> Self
    where
        Self: Sized,
    {
        Self {
            config: DeviceConfig::Unset,
            device: DeviceBase {
                active: Arc::new(Mutex::new(false)),
                callback: Arc::new(Mutex::new(None)),
            },
        }
    }
    fn set_config(&mut self, config: DeviceConfig) -> &Self {
        self.config = config;
        self
    }
    fn set_active(&mut self, active: bool) -> &Self {
        let mut active_lock = self.device.active.lock().unwrap();
        *active_lock = active;
        self
    }

    fn run(&mut self) {
        match &self.config {
            DeviceConfig::SerialPortConfig (
               serial_config
            ) => {
                let active = self.device.active.clone();
                let callback = self.device.callback.clone();

                // Move all necessary data into the closure
               let name = serial_config.name.clone();
                let baud_rate = serial_config.baud_rate;
                let data_bits = serial_config.clone().into_data_bits();
                let stop_bits = serial_config.clone().into_stop_bits();
                let parity = serial_config.clone().into_parity();
                let flow_control = serial_config.clone().into_flow_control();
                thread::spawn(move || {
                    let mut port = serialport::new(name, baud_rate)
                        .data_bits(data_bits)
                        .stop_bits(stop_bits)
                        .parity(parity)
                        .flow_control(flow_control)
                        .timeout(Duration::from_millis(100))
                        .open()
                        .expect("Failed to open port");

                    while *active.lock().unwrap() {
                        let mut buffer = vec![0; 1024];
                   
                        match port.read(buffer.as_mut_slice()) {
                            Ok(bytes_read) => {
                                let data = buffer[..bytes_read].to_vec();
                                println!("{:?}", data);
                                // if let Some(ref mut callback) = *callback.lock().unwrap() {
                                //     callback(data);
                                // }
                            }
                            Err(ref e) if e.kind() == ErrorKind::TimedOut => (),
                            Err(e) => eprintln!("{:?}", e),
                        }
                        // if let Some(ref callback) = *callback.lock().unwrap() {
                        //     // invoke the callback with some data
                        //     callback(vec![1, 2, 3, 4]);
                        // }
                    }
                });
            }
            DeviceConfig::CameraConfig {
                url,
                target_fps,
                car_plate_type, } => {
                let active = self.device.active.clone();
                let callback = self.device.callback.clone();
                let url = url.clone();
                let target_fps = *target_fps;
                let car_plate_type = *car_plate_type;

                thread::spawn(move || {
                    anpr_video(
                        Some(url.clone()),
                        104,
                        move |data| {
                            let vec_u8: Vec<u8> = data
                                .into_iter()
                                .flat_map(|s| s.into_bytes())
                                .collect();
                            if let Some(ref mut callback) = *callback.lock().unwrap() {
                                callback(vec_u8);
                            }
                        },
                        move |frame| *active.lock().unwrap(),
                    )
                        .map_err(|e| e.to_string()).expect("TODO: panic message");
                });
            }
            DeviceConfig::Unset => {
                panic!("Unhandled device configuration");
            }
        }
    }
    fn stop(&mut self) {
        println!("Stop there {:?}", self.config);
        self.set_active(false);
    }
    fn set_callback(&mut self, callback: DataCallback) -> &Self {
        self.device.callback = Arc::new(Mutex::new(Some(callback)));
        self
    }
}

pub struct DevicesState {
    pub camera: Arc<Mutex<DeviceContainer>>,
    pub port: Arc<Mutex<DeviceContainer>>,
}

impl DevicesState {
   pub fn new() -> Self {
        Self {
            camera: Arc::new(Mutex::new(DeviceContainer::new())),
            port: Arc::new(Mutex::new(DeviceContainer::new())),
        }
    }

   pub fn monitor_callbacks(&self) {
        print!("AAAAAAAAAAA");
        let camera = self.camera.clone();
        let port_callback = {
            let camera = camera.clone();
            print!("BBBBBBBBBBB");
            move |data: Vec<u8>| {
                println!("Port Data: {:?}", data);
                if data.len() > 1000 {
                    // Start the camera if port data size is greater than 1000
                    // let active = *camera.lock().unwrap().device.active.lock().unwrap();
                    // if !active {
                    //     camera.lock().unwrap().set_active(true);
                    // }
                } else {
                    // Stop the camera if port data size is less than or equal to 1000
                    // let active = *camera.lock().unwrap().device.active.lock().unwrap();
                    // if active {
                    //     camera.lock().unwrap().set_active(false);
                    // }
                }
            }
        };

        let camera_callback = |data: Vec<u8>| {
            println!("Camera Data: {:?}", data);
        };

        self.camera.lock().unwrap().set_callback(Box::new(camera_callback));
        self.port.lock().unwrap().set_callback(Box::new(port_callback));
    }
}

