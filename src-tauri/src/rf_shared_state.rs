use std::{
    env, io,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

use serde::{Deserialize, Serialize};
use tauri::{command, State, Window};
use tokio::sync::mpsc::{self, Sender};
use ANPR_bind::{anpr_video, AnprOptions};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SerialPortInfo {
    name: String,
    port_type: String,
    vid: Option<u16>,
    pid: Option<u16>,
    serial_number: Option<String>,
    manufacturer: Option<String>,
    product: Option<String>,
    interface: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SerialPortConfig {
    name: String,
    baud_rate: u32,
    data_bits: u8,
    stop_bits: u8,
    parity: u8,
    flow_control: u8,
    driver: u32,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CameraConfig {
    name: String,
    url: String,
}

impl SerialPortConfig {
    fn get_data_bits(&self) -> serialport::DataBits {
        match self.data_bits {
            5 => serialport::DataBits::Five,
            6 => serialport::DataBits::Six,
            7 => serialport::DataBits::Seven,
            8 => serialport::DataBits::Eight,
            _ => serialport::DataBits::Eight,
        }
    }

    fn get_stop_bits(&self) -> serialport::StopBits {
        match self.stop_bits {
            1 => serialport::StopBits::One,
            2 => serialport::StopBits::Two,
            _ => serialport::StopBits::One,
        }
    }

    fn get_parity(&self) -> serialport::Parity {
        match self.parity {
            0 => serialport::Parity::None,
            1 => serialport::Parity::Odd,
            2 => serialport::Parity::Even,
            _ => serialport::Parity::None,
        }
    }

    fn get_flow_control(&self) -> serialport::FlowControl {
        match self.flow_control {
            0 => serialport::FlowControl::None,
            1 => serialport::FlowControl::Software,
            2 => serialport::FlowControl::Hardware,
            _ => serialport::FlowControl::None,
        }
    }
}

type Marc<T> = Arc<Mutex<T>>;

pub struct SerialPort {
    active: Marc<bool>,
    config: Marc<Option<SerialPortConfig>>,
    info: Marc<Option<SerialPortInfo>>,
    sender: Arc<Mutex<Option<Sender<Vec<u8>>>>>,
    receiver: Arc<Mutex<Option<mpsc::Receiver<Vec<u8>>>>>,
}

pub struct Camera {
    active: Marc<bool>,
    config: Marc<Option<CameraConfig>>,
    sender: Arc<Mutex<Option<Sender<Vec<u8>>>>>,
    receiver: Arc<Mutex<Option<mpsc::Receiver<Vec<u8>>>>>,
}

impl Camera {
    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel(32);
        Self {
            active: Arc::new(Mutex::new(false)),
            config: Arc::new(Mutex::new(None)),
            sender: Arc::new(Mutex::new(Some(tx))),
            receiver: Arc::new(Mutex::new(Some(rx))),
        }
    }
    pub fn set_config(&self, config: CameraConfig) -> &Self {
        *self.config.lock().unwrap() = Some(config);
        self
    }

    pub fn set_active(&self, active: bool) -> &Self {
        *self.active.lock().unwrap() = active;
        self
    }
    pub fn run(&self) {
        let current_dir = env::current_dir().expect("Failed to get current directory");
        let img = current_dir.join("test.jpg");

        // Clone the necessary data before the closure
        let config = self.config.lock().unwrap().clone();
        let active = Arc::clone(&self.active);

        thread::spawn(move || {
            if let Some(config) = config {
                // let options = AnprOptions::default()
                //     .with_type_number(1)
                //     .with_vers("1.6.0");
                let result = anpr_video(
                    Some(config.url.clone()),
                    Some(String::from(
                        img.to_str().expect("Failed to convert path to string"),
                    )),
                    104,
                    move |results| {
                        println!("{:?}", results);
                    },
                    move |frame| *active.lock().unwrap(),
                )
                .map_err(|e| e.to_string());
            } else {
                eprintln!("No configuration loaded");
            }
        });
        self.set_active(true);
    }

    pub fn stop(&self) {
        self.set_active(false);
    }
    pub async fn receive_callback(&self) -> Option<Vec<u8>> {
        if let Some(receiver) = self.receiver.lock().unwrap().as_mut() {
            receiver.recv().await
        } else {
            None
        }
    }
}

impl SerialPort {
    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel(32);
        Self {
            active: Arc::new(Mutex::new(false)),
            config: Arc::new(Mutex::new(None)),
            info: Arc::new(Mutex::new(None)),
            sender: Arc::new(Mutex::new(Some(tx))),
            receiver: Arc::new(Mutex::new(Some(rx))),
        }
    }
    pub fn set_config(&self, config: SerialPortConfig) -> &Self {
        *self.config.lock().unwrap() = Some(config);
        self
    }
    pub fn set_info(&self, info: SerialPortInfo) -> &Self {
        *self.info.lock().unwrap() = Some(info);
        self
    }
    pub fn set_active(&self, active: bool) -> &Self {
        *self.active.lock().unwrap() = active;
        self
    }
    pub fn run(&self) {
        self.stop();
        let active = self.active.clone();
        let config = self.config.lock().unwrap().clone();
        let sender = self.sender.lock().unwrap().clone().expect("msg");
        if let Some(config) = config {
            thread::spawn(move || {
                let mut port = serialport::new(config.name.clone(), config.baud_rate)
                    .data_bits(config.get_data_bits())
                    .stop_bits(config.get_stop_bits())
                    .parity(config.get_parity())
                    .flow_control(config.get_flow_control())
                    .timeout(Duration::from_millis(10))
                    .open()
                    .expect("Failed to open port");
                loop {
                    let mut buffer = vec![0; 1024];
                    match port.read(buffer.as_mut_slice()) {
                        Ok(bytes_read) => {
                            let data = buffer[..bytes_read].to_vec();

                            if sender.blocking_send(data).is_err() {
                                eprintln!("Failed to send data");
                                break;
                            }
                        }
                        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                        Err(e) => eprintln!("{:?}", e),
                    }
                    if !(*active.lock().unwrap()) {
                        break;
                    }
                }
            });
        } else {
            eprintln!("No configuration loaded");
        }

        self.set_active(true);
    }

    // pub fn test2(&self) {
    //     self.run(|data: Vec<u8>| {
    //         T = process_serial_data(data)
    //     })
    // }

    pub fn stop(&self) {
        self.set_active(false);
    }
    pub async fn receive_callback(&self) -> Option<Vec<u8>> {
        if let Some(receiver) = self.receiver.lock().unwrap().as_mut() {
            receiver.recv().await
        } else {
            None
        }
    }
    // pub fn process_serial_data(&self, data: Vec<u8>) -> Box<dyn Send + 'static>
    // {
    //     let config = self.config.lock().unwrap().clone();
    //     if let Some(config) = config {
    //         match config.driver {
    //             DRIVER_SERIAL => {
    //                 Box::new(SerialDriver::process_data(data.as_slice()))
    //             },
    //             DRIVER_SCALES => {
    //                 let res = ScalesDriver::process_data(data.as_slice());
    //                 if res.is_some() {
    //                     Box::new(res.expect("msg"))
    //                 } else {
    //                     Box::new(())
    //                 }
    //             }
    //             _ => {
    //                 eprintln!("No configuration loaded");
    //                 Box::new(())
    //             }
    //         }
    //     } else {
    //         eprintln!("No configuration loaded");
    //         Box::new(())
    //     }
    // }
}
// const DRIVER_SCALES: u32 = 1;
// const DRIVER_SERIAL: u32 = 2;

// trait Driver {
//     type Input;
//     type Output: Send;

//     const UID: u32;
//     fn process_data(data: Self::Input) -> Self::Output;
// }

// struct ScalesDriver;

// impl Driver for ScalesDriver {
//     type Input = &'static [u8];
//     type Output = Option<String>;

//     const UID: u32 = DRIVER_SCALES;

//     fn process_data(data: Self::Input) -> Self::Output {
//         extract_numeric_data(data)
//     }
// }

// struct SerialDriver;

// impl Driver for SerialDriver {
//     type Input = &'static [u8];
//     type Output = String;

//     const UID: u32 = DRIVER_SERIAL;

//     fn process_data(data: Self::Input) -> Self::Output {
//         String::from_utf8(data.to_vec()).expect("Invalid UTF-8")
//     }
// }

// fn extract_numeric_data(buffer: &[u8]) -> Option<String> {
//     if let Some(start) = buffer.iter().position(|&x| x == 0x77) {
//         if let Some(end) = buffer.iter().skip(start).position(|&x| x == 0x0D) {
//             let end = end + start + 1;
//             if buffer.get(end) == Some(&0x0A) {
//                 let pattern = &buffer[start..end + 1];
//                 let numeric_data: String = pattern.iter().filter_map(|&c| {
//                     if c.is_ascii_digit() {
//                         Some(c as char)
//                     } else {
//                         None
//                     }
//                 }).collect();
//                 return Some(numeric_data);
//             }
//         }
//     }
//     None
// }

pub struct AppState {
    camera: Camera,
    port: SerialPort,
}

#[command]
pub fn configure_port(state: State<'_, AppState>, config: SerialPortConfig) {
    state.port.set_config(config);
}

#[command]
pub fn start_port(state: State<'_, AppState>) {
    state.port.run();
}

#[command]
pub fn stop_port(state: State<'_, AppState>) {
    state.port.stop();
}

#[command]
pub fn start_camera( state: State<'_, AppState>) {
    state.camera.run();
}

#[command]
pub fn stop_camera(state: State<'_, AppState>)  {
    state.camera.stop();
}

#[command]
pub fn change_camera(config:CameraConfig, state: State<'_, AppState>) {
    state.camera.set_config(config);
}



fn should_process_frame(frame_number: usize, desired_fps: f32) -> bool {
    frame_number as f32 % (30.0 / desired_fps) == 0.0
}

pub async fn main_control(state: State<'_, AppState>, window: Window) {
    loop {
        if let Some(serial_data) = state.port.receive_callback().await {
            if serial_data.len() > 1000 {
                state.camera.run();
                if let Some(camera_data) = state.camera.receive_callback().await {
                    println!("Camera data: {:?}", camera_data);
                    // Process both serial data and camera data
                    if serial_data.len() > 1000 && !camera_data.is_empty() {
                        // Export this struct or perform your desired actions
                        println!(
                            "Exporting data: Serial Data  = {:?}, Camera Data = {:?}",
                            serial_data,
                            camera_data
                        );
                    }
                }
            }
            state.camera.stop()
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
}
