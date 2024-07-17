

pub struct SerialPortConfig {
    name: String,
    baud_rate: u32,
    data_bits: u8,
    stop_bits: u8,
    parity: u8,
    flow_control: u8,
    driver: u32,
}

pub trait Device<T> {
    fn new() -> Self
    where
        Self: Sized;

    fn set_config(&self, config: T) -> &Self;

    fn set_active(&self, active: bool) -> &Self;

    fn run(&self);

    fn stop(&self);

    async fn receive_callback(&self) -> Option<Vec<u8>>;
}

impl Device<SerialPortConfig> for SerialPort {
    // ... implement methods here
}

impl Device<CameraConfig> for Camera {
    // ... implement methods here
}