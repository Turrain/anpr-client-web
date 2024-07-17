use std::{
    env, io, string::FromUtf8Error, sync::{Arc, Mutex}, thread::{self, sleep}, time::Duration
};

use serde::{Deserialize, Serialize};
use tauri::{async_runtime::spawn, command, State, Window};
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
    pub name: String,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: u8,
    pub flow_control: u8,
    pub driver: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CameraConfig {
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
        let sender = self.sender.lock().unwrap().clone().expect("msg");
        thread::spawn(move || {
            if let Some(config) = config {
                // let options = AnprOptions::default()
                //     .with_type_number(1)
                //     .with_vers("1.6.0");
                let result = anpr_video(
                    Some(config.url.clone()),
                    // Some(String::from(
                    //     img.to_str().expect("Failed to convert path to string"),
                    // )),
                    104,
                    move |data| {
                        let vec_u8: Vec<u8> = data
                        .into_iter()           // Convert Vec<String> into an iterator
                        .flat_map(|s| s.into_bytes()) // Convert each String into bytes and flatten the result
                        .collect();  
                        if sender.blocking_send(vec_u8).is_err() {
                            eprintln!("Failed to send data");
                           
                        }
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
        self.set_active(true);
        println!("Start a camera");
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
                            println!("{:?}", data);
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

pub struct AppState {
    pub camera: Arc<Camera>,
    pub port: Arc<SerialPort>,
    pub device_data: Marc<DeviceData>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DeviceData {
    camera_data: Vec<Vec<u8>>,
    port_data: Vec<Vec<u8>>,
}

impl DeviceData {
    // Function to convert Vec<u8> to String
    fn vec_to_string(vec: Vec<u8>) -> Result<String, FromUtf8Error> {
        String::from_utf8(vec)
    }

    // Function to print the camera and port data as strings
    pub fn print_data(&self) {
        for camera in &self.camera_data {
            match Self::vec_to_string(camera.clone()) {
                Ok(string) => println!("Camera Data: {}", string),
                Err(e) => println!("Error converting camera data to string: {}", e),
            }
        }

        for port in &self.port_data {
            match Self::vec_to_string(port.clone()) {
                Ok(string) => println!("Port Data: {}", string),
                Err(e) => println!("Error converting port data to string: {}", e),
            }
        }
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            camera: Arc::new(Camera::new()),
            port: Arc::new(SerialPort::new()),
            device_data: Arc::new(Mutex::new(DeviceData {
                camera_data: Vec::new(),
                port_data: Vec::new(),
            })),
        }
    }
    pub fn monitor_data(&self) {
        let camera_receiver = Arc::clone(&self.camera.receiver);
        let port_receiver = Arc::clone(&self.port.receiver);
        let device_data = Arc::clone(&self.device_data);
        let camera = self.camera.clone();

        thread::spawn(move || loop {
            let mut start_camera = false;

            {
                let mut port_lock = port_receiver.lock().unwrap();
                if let Some(port_rx) = port_lock.as_mut() {
                    if let Ok(data) = port_rx.try_recv() {
                        println!("Received data from serial port: {:?}", data);
                        let mut device_data_lock = device_data.lock().unwrap();
                        device_data_lock.port_data.push(data.clone());

                        // Example condition to start the camera
                        if data.contains(&51) {
                            start_camera = true;
                        }
                    }
                }
            }

            if start_camera {
                camera.run();
            } else {
                camera.stop();
            }

            {
                let mut camera_lock = camera_receiver.lock().unwrap();
                if let Some(camera_rx) = camera_lock.as_mut() {
                    if let Ok(data) = camera_rx.try_recv() {
                        println!("Received data from camera: {:?}", data);
                        let mut device_data_lock = device_data.lock().unwrap();
                        device_data_lock.camera_data.push(data);
                    }
                }
            }
            {
                let mut device_data_lock = device_data.lock().unwrap();
                if(device_data_lock.camera_data.len() > 0){
                    device_data_lock.print_data();
                }
              
            }
         
            // Sleep for a short duration to avoid busy-waiting
            sleep(Duration::from_millis(100));
        });
    }
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
pub fn start_camera(state: State<'_, AppState>) {
    state.camera.run();
}

#[command]
pub fn stop_camera(state: State<'_, AppState>) {
    state.camera.stop();
}

#[command]
pub fn configure_camera(config: CameraConfig, state: State<'_, AppState>) {
    state.camera.set_config(config);
}

#[command]
pub fn start_monitoring(state: State<'_, AppState>) {
    state.monitor_data();
}

fn should_process_frame(frame_number: usize, desired_fps: f32) -> bool {
    frame_number as f32 % (30.0 / desired_fps) == 0.0
}
