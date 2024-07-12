use std::{
    sync::{mpsc::channel, Arc, Mutex},
    thread,
};

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
    driver: PortDataDriver,
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

pub enum PortDataDriver {
    Rs232Xk3190,
    RawData,
}
type Marc<T> = Arc<Mutex<T>>;

pub struct SerialPort {
    active: Marc<bool>,
    config: Marc<Option<SerialPortConfig>>,
    info: Marc<Option<SerialPortInfo>>,
}

impl SerialPort {
    pub fn new() -> Self {
        Self {
            active: Arc::new(Mutex::new(false)),
            config: Arc::new(Mutex::new(None)),
            info: Arc::new(Mutex::new(None)),
        }
    }
    pub fn set_config(&self, config: SerialPortConfig) -> Self {
        *self.config.lock().unwrap() = Some(config);
        self
    }
    pub fn set_info(&self, info: SerialPortInfo) -> Self {
        *self.info.lock().unwrap() = Some(info);
        self
    }
    pub fn set_active(&self, active: bool) -> Self {
        *self.active.lock().unwrap() = Some(active);
        self
    }
    pub fn run(&self, callback: T)
    where
        T: Fn(Vec<u8>) -> (),
    {
        self.stop();
        let active = self.active.clone();
        let config = self.config.lock().unwrap().clone();
        if let Some(config) = config {
            thread::spawn(move || {
                let mut port = serialport::new(config.name, config.baud_rate)
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
                            let data = &buffer[..bytes_read];
                            callback(data.to_vec())
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

    pub fn test(&self) {
        self.run(|data: Vec<u8>| {
            println!("Callback Test: {:?}", data);
        })
    }
    
    pub fn test2(&self) {
        self.run(|data: Vec<u8>| {
            T = process_serial_data(data)
        })
    }

    pub fn stop(&self) {
        self.set_active(false);
    }

    pub fn process_serial_data(&self, data: Vec<u8>) -> Send
    {
        let config = self.config.lock().unwrap().clone();
        if let Some(config) = config {
            match config.driver {
                PortDataDriver::RawData => {
                    SerialDriver::process_data(data.as_slice())
                },
                PortDataDriver::Rs232Xk3190 => {
                    ScalesDriver::process_data(data.as_slice())
                }
                _ => {
                    eprintln!("No configuration loaded");
                    ()
                }
            }
        } else {
            eprintln!("No configuration loaded");
        }
    }

}


trait Driver<T, U>
where
    U: Send,
{
    const UID: i32;
    fn process_data(data: T) -> U;
}

struct ScalesDriver;

impl Driver<&[u8], Option<String>> for ScalesDriver {
    const UID: i32 = DRIVER_SCALES;

    fn process_data(data: &[u8]) -> Option<String> {
        SerialPort::extract_numeric_data(data)
    }
}

struct SerialDriver;

impl Driver<&[u8], String> for SerialDriver {
    const UID: i32 = DRIVER_SERIAL;

    fn process_data(data: &[u8]) -> String {
        String::from_utf8(data.to_vec()).expect("Invalid UTF-8")
    }
}



fn extract_numeric_data(buffer: &[u8]) -> Option<String> {
    if let Some(start) = buffer.iter().position(|&x| x == 0x77) {
        if let Some(end) = buffer.iter().skip(start).position(|&x| x == 0x0D) {
            let end = end + start + 1;
            if buffer.get(end) == Some(&0x0A) {
                let pattern = &buffer[start..end + 1];
                let numeric_data: String = pattern.iter().filter_map(|&c| {
                    if c.is_ascii_digit() {
                        Some(c as char)
                    } else {
                        None
                    }
                }).collect();
                return Some(numeric_data);
            }
        }
    }
    None
}