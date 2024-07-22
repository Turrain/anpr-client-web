use std::{
    collections::HashMap,
    io::ErrorKind,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

use serde::{Deserialize, Serialize};
use ANPR_bind::{anpr_plate, AnprOptions, AnprVideoCapture};
pub trait IntoSerialPortConfig {
    fn into_data_bits(self) -> serialport::DataBits;
    fn into_stop_bits(self) -> serialport::StopBits;
    fn into_parity(self) -> serialport::Parity;
    fn into_flow_control(self) -> serialport::FlowControl;
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialPortConfig {
    pub name: String,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: u8,
    pub flow_control: u8,
    pub driver: u8,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraConfig {
    pub driver: i32,
    pub fps: u8,
    pub stream_url: String,
}
pub struct Device {
    pub id: i32,
    pub active: bool,
    pub callback: Option<Box<dyn FnMut(Vec<u8>) + Send + Sync>>,
}
pub struct Port {
    pub base: Arc<Mutex<Device>>,
    pub config: SerialPortConfig,
    pub history: Arc<Mutex<Vec<Vec<u8>>>>,
}
pub struct Camera {
    pub base: Arc<Mutex<Device>>,
    pub config: CameraConfig,
}

impl Device {
    pub fn new() -> Self {
        Self {
            id: 0,
            active: false,
            callback: None,
        }
    }

    pub fn set_active(&mut self, active: bool) {
        self.active = active;
    }

    pub fn set_callback(&mut self, callback: Box<dyn FnMut(Vec<u8>) + Send + Sync>) {
        self.callback = Some(callback);
    }
}

impl Port {
    pub fn new() -> Self {
        Self {
            base: Arc::new(Mutex::new(Device::new())),
            config: SerialPortConfig {
                name: String::new(),
                baud_rate: 0,
                data_bits: 0,
                stop_bits: 0,
                parity: 0,
                flow_control: 0,
                driver: 0,
            },
            history: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn set_config(&mut self, config: SerialPortConfig) {
        self.config = config;
    }

    pub fn set_active(&mut self, active: bool) {
        self.base.lock().unwrap().set_active(active);
    }

    pub fn set_callback(&mut self, callback: Box<dyn FnMut(Vec<u8>) + Send + Sync>) {
        self.base.lock().unwrap().set_callback(callback);
    }

    pub fn run(&self) {
        let base = self.base.clone();
        let config = self.config.clone();
        let history = self.history.clone();
        thread::spawn(move || {
            let mut port = serialport::new(config.clone().name, config.clone().baud_rate)
            .data_bits(config.clone().into_data_bits())
            .stop_bits(config.clone().into_stop_bits())
            .parity(config.clone().into_parity())
            .flow_control(config.clone().into_flow_control())
            .timeout(Duration::from_millis(100))
            .open()
            .expect("Failed to open port");
            while base.lock().unwrap().active {
                let mut buffer = vec![0; 1024];
                match port.read(buffer.as_mut_slice()) {
                    Ok(bytes_read) => {
                        let data = buffer[..bytes_read].to_vec();
                        println!("Received data from serial port: {:?}", data);
                        if let Some(ref mut cb) = base.lock().unwrap().callback {
                            println!("Triggering callback with data: {:?}", data);
                            history.lock().unwrap().push(data.clone());
                            //  self.history.lock().unwrap().push(data.clone());
                            cb(data);
                        } else {
                            println!("No callback set, data: {:?}", data);
                        }
                    }
                    Err(ref e) if e.kind() == ErrorKind::TimedOut => (),
                    Err(e) => eprintln!("{:?}", e),
                }
            }
            println!("Serial port reading loop exited.");
        });
    }
}

impl Camera {
    pub fn new() -> Self {
        Self {
            base: Arc::new(Mutex::new(Device::new())),
            config: CameraConfig {
                driver: 0,
                fps: 0,
                stream_url: String::from(""),
            },
        }
    }

    pub fn set_config(&mut self, config: CameraConfig) {
        self.config = config;
    }

    pub fn set_active(&mut self, active: bool) {
        self.base.lock().unwrap().set_active(active);
    }

    pub fn set_callback(&mut self, callback: Box<dyn FnMut(Vec<u8>) + Send + Sync>) {
        self.base.lock().unwrap().set_callback(callback);
    }

    pub fn run(&self) {
        let base = self.base.clone();
        let driver = self.config.driver;
        let fps = self.config.fps;
        let stream_url = self.config.stream_url.clone();

        thread::spawn(move || {
            let mut frame_capture = match Some(stream_url.clone()) {
                Some(path) => AnprVideoCapture::from_file(&path).expect("Failed to open file"),
                None => AnprVideoCapture::from_camera(0).expect("Failed to open camera"),
            };

            let anpr_options = AnprOptions::default().with_type_number(104);
            let full_types = [4, 7, 9, 310, 311, 911];
            let is_full_type = anpr_options.is_full_type(&full_types);

            loop {
                match base.lock().unwrap().active {
                    true => {
                        println!("Camera capture loop started.");
                        let frame = frame_capture.read_frame();
                        match frame {
                            Ok(frame) => {
                                if frame.ptr.is_null() {
                                    eprintln!("Frame pointer is null, stopping capture");
                                    break;
                                }
                                match anpr_plate(&frame, &anpr_options) {
                                    Ok(results) => {
                                        let data: Vec<u8> = results
                                            .into_iter()
                                            .flat_map(|s| s.into_bytes())
                                            .collect();
                                        println!("ANPR results: {:?}", data);

                                        if let Some(ref mut cb) = base.lock().unwrap().callback {
                                            println!("Triggering callback with data: {:?}", data);
                                            cb(data);
                                        } else {
                                            println!("No callback set, data: {:?}", data);
                                        }
                                    }
                                    Err(e) => eprintln!("ANPR Error: {}", e),
                                }
                            }
                            Err(e) => {
                                eprintln!("Error reading frame: {}", e);
                                break;
                            }
                        }
                    }
                    false => {
                        println!("Camera capture loop exited.");
                        break;
                    }
                };
            }
            println!("Camera capture loop exited.");
        });
    }
}

pub struct DevicesState {
    pub camera: Arc<Mutex<Camera>>,
    pub port: Arc<Mutex<Port>>,
}

impl DevicesState {
    pub fn new() -> Self {
        println!("Initializing new DevicesState");
        Self {
            camera: Arc::new(Mutex::new(Camera::new())),
            port: Arc::new(Mutex::new(Port::new())),
        }
    }

    pub fn monitor(&self) {
        println!("Starting monitor thread");
        let camera = self.camera.clone();
        let port = self.port.clone();

        let port_callback = move |data: Vec<u8>| {
            let pb = port.lock().unwrap();

            let mut history = pb.history.lock().unwrap();
            println!("Port history: {:?}", history);

            let tolerance = 500; // Allowable differences
            let threshold = 25; // Minimum number of consecutive packets to trigger camera activation
            if history.len() >= threshold {
                find_most_frequent_with_tolerance(
                    vec_vec_u8_to_vec_i32(history.clone()),
                    tolerance,
                );
                history.clear();
            }
        };
        self.port
            .lock()
            .unwrap()
            .set_callback(Box::new(port_callback));
    }
}


fn find_most_frequent_with_tolerance(numbers: Vec<i32>, tolerance: i32) -> Option<i32> {
    let mut frequency: HashMap<i32, usize> = HashMap::new();

    for &number in &numbers {
        let mut found = false;
        for &key in frequency.keys() {
            if (key - number).abs() <= tolerance {
                *frequency.get_mut(&key).unwrap() += 1;
                found = true;
                break;
            }
        }
        if !found {
            frequency.insert(number, 1);
        }
    }

    let (mut most_frequent, mut max_count) = (0, 0);
    for (&key, &count) in &frequency {
        if count > max_count {
            most_frequent = key;
            max_count = count;
        }
    }

    if max_count > 2 {
        Some(most_frequent)
    } else {
        None
    }
}
fn vec_vec_u8_to_vec_i32(vec: Vec<Vec<u8>>) -> Vec<i32> {
    let mut result = Vec::new();

    for sub_vec in vec {
        if let Ok(string) = String::from_utf8(sub_vec) {
            if let Ok(number) = string.parse::<i32>() {
                result.push(number);
            }
        }
    }

    result
}
