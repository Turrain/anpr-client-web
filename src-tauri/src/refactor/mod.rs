use chrono::Local;
use serde::{Deserialize, Serialize};
use serialport;
use std::fs::DirEntry;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant, SystemTime};
use std::{env, io, ptr, thread};
use tauri::State;
use tokio::sync::mpsc;
use ANPR_bind::{anpr_plate, anpr_video, cvGrabFrame, AnprImage, AnprOptions, AnprVideoCapture};
#[derive(Debug, Clone)]
pub enum DataDriver {
    Rs232Xk,
    Raw,
}
#[derive(Debug)]
pub enum CarPlateType {
    Kz = 104,
}

type DataCallback = Box<dyn FnMut(Vec<u8>, Arc<Mutex<Vec<Vec<u8>>>>) + Send + Sync>;
#[derive(Clone)]
pub struct DeviceBase {
    active: Arc<Mutex<bool>>,
    callback: Arc<Mutex<Option<DataCallback>>>
}
#[derive(Clone)]
pub struct DeviceContainer {
    pub config: DeviceConfig,
    pub device: DeviceBase,
    pub history: Arc<Mutex<Vec<Vec<u8>>>>,
}

pub trait IntoSerialPortConfig {
    fn into_data_bits(self) -> serialport::DataBits;
    fn into_stop_bits(self) -> serialport::StopBits;
    fn into_parity(self) -> serialport::Parity;
    fn into_flow_control(self) -> serialport::FlowControl;
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

fn cleanup_old_files(folder_path: &Path, max_files: usize, max_age: Duration) {
    let mut entries: Vec<(PathBuf, SystemTime)> = std::fs::read_dir(folder_path)
        .expect("Failed to read directory")
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                e.metadata()
                    .ok()
                    .and_then(|meta| meta.modified().ok().map(|mod_time| (e.path(), mod_time)))
            })
        })
        .collect();

    // Sort by modified time
    entries.sort_by_key(|&(_, mod_time)| mod_time);

    // Delete files if exceeding max_files
    if entries.len() > max_files {
        let to_delete = entries.len() - max_files;
        for entry in entries.iter().take(to_delete) {
            std::fs::remove_file(&entry.0).expect("Failed to delete file");
        }
        entries.drain(..to_delete);
    }

    // Delete files older than max_age
    let now = SystemTime::now();
    for (path, mod_time) in entries {
        if now.duration_since(mod_time).unwrap_or(Duration::new(0, 0)) > max_age {
            std::fs::remove_file(path).expect("Failed to delete file");
        }
    }
}

fn start_cleanup_thread(folder_path: PathBuf, max_files: usize, max_age: Duration) {
    thread::spawn(move || {
        loop {
            cleanup_old_files(&folder_path, max_files, max_age);
            thread::sleep(Duration::from_secs(60)); // Adjust the interval as needed
        }
    });
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
pub enum DeviceConfig {
    SerialPortConfig(SerialPortConfig),
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
    fn set_callback<F>(&self, callback: F) -> &Self
    where
        F: FnMut(Vec<u8>, Arc<Mutex<Vec<Vec<u8>>>>) + 'static + Send + Sync;
    fn trigger_callback(&self, data: Vec<u8>);
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
            history: Arc::new(Mutex::new(Vec::new())),
        }
    }
    fn set_config(&mut self, config: DeviceConfig) -> &Self {
        println!("Setting device configuration: {:?}", config);
        self.config = config;
        self
    }
    fn set_active(&mut self, active: bool) -> &Self {
        let mut active_lock = self.device.active.lock().unwrap();
        *active_lock = active;
        println!("Setting device active state to: {}", active);
        self
    }
    fn trigger_callback(&self, data: Vec<u8>) {
        if let Some(ref mut cb) = *self.device.callback.lock().unwrap() {
            println!("Triggering callback with data: {:?}", data);
            self.history.lock().unwrap().push(data.clone());
            cb(data, self.history.clone());
        } else {
            println!("No callback set, data: {:?}", data);
        }
    }
    fn run(&mut self) {
        match &self.config {
            DeviceConfig::SerialPortConfig(serial_config) => {
                println!("Starting Serial Port with config: {:?}", serial_config);
                let active = self.device.active.clone();
                let callback = self.device.callback.clone();

                // Move all necessary data into the closure
                let name = serial_config.name.clone();
                let baud_rate = serial_config.baud_rate;
                let data_bits = serial_config.clone().into_data_bits();
                let stop_bits = serial_config.clone().into_stop_bits();
                let parity = serial_config.clone().into_parity();
                let flow_control = serial_config.clone().into_flow_control();
                let self_clone = self.clone();
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
                                println!("Received data from serial port: {:?}", data);
                                self_clone.trigger_callback(data);
                            }
                            Err(ref e) if e.kind() == ErrorKind::TimedOut => (),
                            Err(e) => eprintln!("{:?}", e),
                        }
                        // if let Some(ref callback) = *callback.lock().unwrap() {
                        //     // invoke the callback with some data
                        //     callback(vec![1, 2, 3, 4]);
                        // }
                    }
                    println!("Serial port reading loop exited.");
                });
            }
            DeviceConfig::CameraConfig {
                url,
                target_fps,
                car_plate_type,
            } => {
                println!(
                    "Starting Camera with config: url={}, target_fps={}, car_plate_type={}",
                    url, target_fps, car_plate_type
                );
                let active = self.device.active.clone();
                let callback = self.device.callback.clone();
                let url = url.clone();
                let target_fps = *target_fps;
                let car_plate_type = *car_plate_type;
                let current_dir = env::current_dir().expect("Failed to get current directory");

                let folder_path = current_dir.join("saved_images");
                if !folder_path.exists() {
                    std::fs::create_dir(&folder_path).expect("Failed to create folder");
                }

                // Start the cleanup thread
                start_cleanup_thread(folder_path.clone(), 10, Duration::from_secs(3600 * 24)); // Example: 100 files max, 24 hours max age

                let self_clone = self.clone();
                println!("WARN: Start a camera: {}", url.clone());

                thread::spawn(move || {
                    let mut frame_capture = match Some(url.clone()) {
                        Some(path) => {
                            AnprVideoCapture::from_file(&path).expect("Failed to open file")
                        }
                        None => AnprVideoCapture::from_camera(0).expect("Failed to open camera"),
                    };

                    let anpr_options = AnprOptions::default().with_type_number(104);
                    let full_types = [4, 7, 9, 310, 311, 911];
                    let is_full_type = anpr_options.is_full_type(&full_types);

                    let target_duration = Duration::from_secs_f64(1.0 / target_fps as f64);
                    let mut frame_number = 0;
                    loop {
                        let now = Local::now();
                        let date_str = now.format("%Y-%m-%d_%H-%M-%S-%3f").to_string();

                        let car_plate_number = "example_plate"; // You should replace this with the actual car plate number
                        let img_name = format!("{}_{}.jpg", car_plate_number, date_str);
                        let img_path = folder_path.join(&img_name);
                        let live_img_path = folder_path.join("live.jpg");

                        if !*active.lock().unwrap() {
                            // Sleep or yield to avoid busy waiting
                            thread::sleep(Duration::from_millis(100));
                            continue;
                        }

                        let start = Instant::now();
                        let mut frame = match frame_capture.read_frame() {
                            Ok(frame) => frame,
                            Err(e) => {
                                eprintln!("Error reading frame: {}", e);
                                break;
                            }
                        };

                        if frame.ptr.is_null() {
                            eprintln!("Frame pointer is null, stopping capture");
                            break;
                        }

                        if let Some(ref value) =
                            Some(img_path.to_str().expect("Failed to convert path to string"))
                        {
                            frame.save_image(value);
                            let _ = frame.save_image(
                                live_img_path
                                    .to_str()
                                    .expect("Failed to convert path to string"),
                            );
                        }

                        match anpr_plate(&frame, &anpr_options) {
                            Ok(results) => {
                                let vec_u8: Vec<u8> =
                                    results.into_iter().flat_map(|s| s.into_bytes()).collect();
                                println!("ANPR results: {:?}", vec_u8);
                                self_clone.trigger_callback(vec_u8);
                            }
                            Err(e) => eprintln!("ANPR Error: {}", e),
                        }

                        let duration = start.elapsed();
                        if duration < target_duration {
                            thread::sleep(target_duration - duration);
                        }
                        frame_number += 1;
                        println!("Processed frame number: {}", frame_number);
                    }
                    println!("Camera capture loop exited.");
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
    fn set_callback<F>(&self, callback: F) -> &Self
    where
        F: FnMut(Vec<u8>, Arc<Mutex<Vec<Vec<u8>>>>) + 'static + Send + Sync,
    {
        let mut cb = self.device.callback.lock().unwrap();
   
        *cb = Some(Box::new(callback));
        self
    }
}



pub struct DevicesState {
    pub camera: Arc<Mutex<DeviceContainer>>,
    pub port: Arc<Mutex<DeviceContainer>>,
    // pub last_port_data: Arc<Mutex<Vec<u8>>>,
    // pub last_camera_data: Arc<Mutex<Vec<u8>>>,
}

impl DevicesState {
    pub fn new() -> Self {
        println!("Initializing new DevicesState");
        Self {
            camera: Arc::new(Mutex::new(DeviceContainer::new())),
            port: Arc::new(Mutex::new(DeviceContainer::new())),
        }
    }

    pub fn monitor_callbacks(&self) {
        println!("Monitoring callbacks for devices");
        let camera = self.camera.clone();
        let port_callback = {
            let camera = camera.clone();

            move |data: Vec<u8>, history| {
                println!("Port Data: {:?}", data);
                if data.contains(&51) {
                    println!("START CAMERA");
                    //     Start the camera if port data size is greater than 1000
                    let active = *camera.lock().unwrap().device.active.lock().unwrap();
                    // println!("ACTIVE 1:{} ", active);
                    if !active {
                        camera.lock().unwrap().set_active(true);
                        //     println!("ACTIVE 2:{} ", active);
                    }
                } else {
                    println!("STOP CAMERA");
                    // Stop the camera if port data size is less than or equal to 1000
                    let active = *camera.lock().unwrap().device.active.lock().unwrap();
                    //  println!("ACTIVE 3:{} ", active);
                    if active {
                        camera.lock().unwrap().set_active(false);
                        //       println!("ACTIVE 4:{} ", active);
                    }
                }
            }
        };

        let camera_callback = |data: Vec<u8>, history| {
            println!("Camera Data: {:?}", data);
        };

        self.camera
            .lock()
            .unwrap()
            .set_callback(Box::new(camera_callback));
        self.port
            .lock()
            .unwrap()
            .set_callback(Box::new(port_callback));
    }
}

//refactor v3
