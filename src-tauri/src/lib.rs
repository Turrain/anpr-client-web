// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rand::Rng;
use refactor::{Device, DeviceConfig, DevicesState};
use serde::{Deserialize, Serialize};
use serialport::{available_ports, SerialPortType};
use std::{
    error::Error,
    io,
    path::Path,
    process::Command,
    sync::mpsc::{self, channel, Receiver},
    thread,
    time::Duration,
};
use tauri::{command, Manager, State, Window};
use tokio::sync::{oneshot, Mutex};
use ANPR_bind::{anpr_plate, anpr_video, AnprImage, AnprOptions};
#[macro_use]
mod commands;
mod database;
mod models;
mod schema;
#[macro_use]
mod port_commands;
#[macro_use]
mod camera_commands;
mod refactor;
mod shared_state;
use crate::camera_commands::*;
use crate::commands::*;
use crate::database::*;
use crate::models::*;
use crate::port_commands::*;
#[macro_use]
mod rf_shared_state;
use crate::rf_shared_state::*;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn start_serial_communication() {
    thread::spawn(move || {
        // let mut port1 = serialport::new("COM1", 9600)
        //     .timeout(Duration::from_millis(10))
        //     .open()
        //     .unwrap();

        let mut port2 = serialport::new("COM2", 1200)
            .timeout(Duration::from_millis(10))
            .open()
            .unwrap();

        let mut rng = rand::thread_rng();

        loop {
            // Listen for data on COM1
            // let mut buffer: Vec<u8> = vec![0; 1024];

            // match port1.read(buffer.as_mut_slice()) {
            //     Ok(t) => {
            //         let received_data = &buffer[..t];
            //    //     println!("Received data: {:?}", received_data);

            //     }
            //     Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
            //     Err(e) => eprintln!("{:?}", e),
            // }

            // Generate and send random data to COM2
            let random_data: u8 = rng.gen();
            let random_number: u16 = rng.gen_range(1000..9999);
            let formatted_text = format!("wn{}kg\r\n", random_number);
            let text_bytes = formatted_text.as_bytes();

            port2
                .write_all(text_bytes)
                .expect("Failed to write to COM2");
            println!("Sent random data: {}", random_number);
            //  window.emit("sent-data", random_data).expect("Failed to emit event");
            // Sleep for a short duration to avoid overwhelming the ports
            thread::sleep(Duration::from_millis(1500));
        }
    });
}

fn should_process_frame(frame_number: usize, desired_fps: f32) -> bool {
    frame_number as f32 % (30.0 / desired_fps) == 0.0
}

#[tauri::command]
async fn start_rtsp_to_rtmp(rtsp_url: String, rtmp_url: String) -> Result<(), String> {
    let output = Command::new("ffmpeg")
        .arg("-i")
        .arg(rtsp_url)
        .arg("-c:v")
        .arg("copy")
        .arg("-c:a")
        .arg("copy")
        .arg("-f")
        .arg("flv")
        .arg(rtmp_url)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// #[tauri::command]
// async fn process_anpr(
//     input: String,
//     type_number: i32,
//     window: tauri::Window,
// ) -> Result<(), String> {
//     let options = AnprOptions::default()
//         .with_type_number(type_number)
//         .with_vers("1.6.0");

//     let (tx, rx) = oneshot::channel();

//     let handle = tokio::spawn(async move {
//         let result = match Path::new(&input).extension().and_then(|s| s.to_str()) {
//             Some(ext)
//                 if ext.eq_ignore_ascii_case("jpg")
//                     || ext.eq_ignore_ascii_case("jpeg")
//                     || ext.eq_ignore_ascii_case("png") =>
//             {
//                 let img = AnprImage::load_image(&input).map_err(|e| e.to_string())?;
//                 let plate_numbers = anpr_plate(&img, &options).map_err(|e| e.to_string())?;
//                 tx.send(Ok(plate_numbers)).unwrap();
//                 Ok(())
//             }
//             Some(ext) if ext.eq_ignore_ascii_case("avi") || ext.eq_ignore_ascii_case("mp4") => {
//                 anpr_video(
//                     Some(input),
//                     type_number,
//                     move |results| {
//                         window.emit("anpr-update", results.clone()).unwrap();
//                     },
//                     |frame| should_process_frame(frame, 5.0),
//                 )
//                 .map_err(|e| e.to_string())?;
//                 tx.send(Ok(vec!["Video processing completed".to_string()]))
//                     .unwrap();
//                 Ok(())
//             }
//             _ => {
//                 if input.starts_with("http") || input.starts_with("rtsp") {
//                     anpr_video(
//                         Some(input),
//                         type_number,
//                         move |results| {
//                             window.emit("anpr-update", results.clone()).unwrap();
//                         },
//                         |frame| should_process_frame(frame, 10.0),
//                     )
//                     .map_err(|e| e.to_string())?;
//                     tx.send(Ok(vec!["Video processing completed".to_string()]))
//                         .unwrap();
//                     Ok(())
//                 } else if input.starts_with("/dev/video") {
//                     // Assuming Linux device file for camera
//                     anpr_video(
//                         Some(input),
//                         type_number,
//                         move |results| {
//                             window.emit("anpr-update", results.clone()).unwrap();
//                         },
//                         |frame| should_process_frame(frame, 5.0),
//                     )
//                     .map_err(|e| e.to_string())?;
//                     tx.send(Ok(vec!["Video processing completed".to_string()]))
//                         .unwrap();
//                     Ok(())
//                 } else {
//                     tx.send(Err("Unsupported file type or URL. Please provide a valid image, video file, or URL.".to_string())).unwrap();
//                     Err("Unsupported file type or URL".to_string())
//                 }
//             }
//         };
//         result
//     });

//     handle.await.map_err(|e| e.to_string())??;
//     rx.await.map_err(|e| e.to_string())?;
//     Ok(())
// }
#[tauri::command]
fn set_device_config(state: State<'_, DevicesState>, device_type: String, config: DeviceConfig) {
    println!("{:?}", config);
    match device_type.as_str() {
        "camera" => state.camera.lock().unwrap().set_config(config),
        "port" => state.port.lock().unwrap().set_config(config),
        _ => panic!("Unknown device type"),
    };
}

#[tauri::command]
fn start_device(state: State<'_, DevicesState>, device_type: String) {
    println!("{:?}", device_type);
    match device_type.as_str() {
        "camera" => {
            let mut camera = state.camera.lock().unwrap();
            camera.set_active(true);
            camera.run();
        }
        "port" => {
            let mut port = state.port.lock().unwrap();
            port.set_active(true);
            port.run();
        }
        _ => panic!("Unknown device type"),
    };
}

#[tauri::command]
fn stop_device(state: State<'_, DevicesState>, device_type: String) {
    match device_type.as_str() {
        "camera" => state.camera.lock().unwrap().stop(),
        "port" => state.port.lock().unwrap().stop(),
        _ => panic!("Unknown device type"),
    };
}

#[tauri::command]
fn monitor_device_callbacks(state: State<'_, DevicesState>) {
    state.monitor_callbacks();
}

pub fn run() {
    print!("TETETETE");
    let serial_config = DeviceConfig::SerialPortConfig(refactor::SerialPortConfig {
        name: "COM3".to_string(),
        baud_rate: 9600,
        data_bits: 4u8,
        stop_bits: 1u8,
        parity: 0u8,
        flow_control: 2u8,
        driver: 1u8,
    });

    let serialized = serde_json::to_string(&serial_config).unwrap();
    println!("{:?}", serialized);
    tauri::Builder::default()
        .manage(AppState::new())
        .manage(DevicesState::new())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            // process_anpr,
            configure_port,
            start_port,
            stop_port,
            start_camera,
            stop_camera,
            configure_camera,
            start_monitoring,
            //--------------------
            monitor_device_callbacks,
            stop_device,
            start_device,
            set_device_config,
            start_serial_communication,
            start_rtsp_to_rtmp,
            read_serial_port,
            stop_serial_port,
            load_serial_port_settings,
            list_serial_ports,
            stop_stream,
            start_stream,
            change_stream,
            //---------------------------
            cmd_get_all_car_weights_auto,
            cmd_create_car_weights_auto,
            cmd_get_car_weights_auto_by_id,
            cmd_get_all_car_weight_manuals,
            cmd_create_car_weight_manual,
            cmd_get_car_weight_manual_by_id,
            cmd_get_all_counterparties,
            cmd_create_counterparty,
            cmd_get_counterparty_by_id,
            cmd_update_car_weight_manual,
            cmd_update_car_weights_auto,
            cmd_update_counterparty
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
