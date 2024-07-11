use std::sync::{Arc, Mutex};
use crate::{create_car_weights_auto, establish_connection, NewCarWeightsAuto};
use lazy_static::lazy_static;
#[derive(Debug)]
pub struct SharedState {
    pub port_data: Option<f32>,
    pub camera_data: Option<(String, Option<String>)>,
}

impl SharedState {
    pub fn new() -> Self {
        Self {
            port_data: None,
            camera_data: None,
        }
    }

    pub fn update_port_data(&mut self, data: f32) {
        self.port_data = Some(data);
        println!("{:?}", self);
        self.check_and_store_data();
    }

    pub fn update_camera_data(&mut self, plate_number: String, photo: Option<String>) {
        self.camera_data = Some((plate_number, photo));
        println!("{:?}", self);
        self.check_and_store_data();
    }

    fn check_and_store_data(&self) {
        if let (Some(weight), Some((car_plate_number, photo))) = (&self.port_data, &self.camera_data) {
            let current_time = chrono::Utc::now().to_string();
            let new_car_weights_auto = NewCarWeightsAuto {
                car_plate_number: &car_plate_number,
                photo: photo.as_deref(),
                weight: *weight,
                time_created: &current_time,
                time_updated: &current_time,
            };

            let mut conn = establish_connection();
            create_car_weights_auto(&mut conn, new_car_weights_auto);
        }
    }
}

lazy_static! {
    pub static ref SHARED_STATE: Arc<Mutex<SharedState>> = Arc::new(Mutex::new(SharedState::new()));
}
