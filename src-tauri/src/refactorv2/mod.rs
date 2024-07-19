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
    pub base: Device,
    pub config: SerialPortConfig,
    pub last_data: Vec<u8>,
    pub history: Vec<Vec<u8>>,
}
pub struct Camera {
    pub base: Device,
    pub config: CameraConfig,
    pub last_data: Vec<u8>,
    pub history: Vec<Vec<u8>>,
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
            base: Device::new(),
            config: SerialPortConfig {
                name: String::from(""),
                baud_rate: 0,
                data_bits: 0,
                stop_bits: 0,
                parity: 0,
                flow_control: 0,
                driver: 0,
            },
            last_data: Vec::new(),
            history: Vec::new(),
        }
    }

    pub fn set_config(&mut self, config: SerialPortConfig) {
        self.config = config;
    }

    pub fn set_active(&mut self, active: bool) {
        self.base.set_active(active);
    }

    pub fn set_callback(&mut self, callback: Box<dyn FnMut(Vec<u8>) + Send + Sync>) {
        self.base.set_callback(callback);
    }

    pub fn run() {
        
    } 
}