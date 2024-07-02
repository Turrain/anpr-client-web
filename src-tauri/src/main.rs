// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rand::Rng;
use serde::Serialize;
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
use tauri::{command, Manager};
use tokio::sync::{oneshot, Mutex};
use ANPR_bind::{anpr_plate, anpr_video, AnprImage, AnprOptions};
#[macro_use]
mod commands;
mod database;
mod models;
mod schema;
use crate::database::*;
use crate::models::*;
use crate::commands::*;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[derive(Serialize)]
struct PortInfo {
    port_name: String,
    port_type: String,
    vid: Option<u16>,
    pid: Option<u16>,
    serial_number: Option<String>,
    manufacturer: Option<String>,
    product: Option<String>,
    interface: Option<String>,
}
#[derive(Serialize, Clone)]
struct PortData<T>
where
    T: Serialize,
{
    pub port_name: String,
    pub data: Vec<T>,
}

#[tauri::command]
fn start_serial_communication(window: tauri::Window) {
    thread::spawn(move || {
        let mut port1 = serialport::new("COM1", 9600)
            .timeout(Duration::from_millis(10))
            .open()
            .unwrap();

        let mut port2 = serialport::new("COM2", 9600)
            .timeout(Duration::from_millis(10))
            .open()
            .unwrap();

        let mut rng = rand::thread_rng();

        loop {
            // Listen for data on COM1
            let mut buffer: Vec<u8> = vec![0; 1024];

            match port1.read(buffer.as_mut_slice()) {
                Ok(t) => {
                    let received_data = &buffer[..t];
                    println!("Received data: {:?}", received_data);
                    window
                        .emit(
                            "received-data",
                            PortData {
                                port_name: String::from("COM1"),
                                data: received_data.to_vec(),
                            },
                        )
                        .expect("Failed to emit event");
                }
                Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                Err(e) => eprintln!("{:?}", e),
            }

            // Generate and send random data to COM2
            let random_data: u8 = rng.gen();
            port2
                .write_all(&[random_data])
                .expect("Failed to write to COM2");
            println!("Sent random data: {}", random_data);
            //  window.emit("sent-data", random_data).expect("Failed to emit event");
            // Sleep for a short duration to avoid overwhelming the ports
            thread::sleep(Duration::from_millis(100));
        }
    });
}

#[command]
fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    match serialport::available_ports() {
        Ok(ports) => {
            let mut port_info_list = Vec::new();
            for p in ports {
                let port_type = match p.port_type {
                    SerialPortType::UsbPort(ref info) => {
                        #[cfg(feature = "usbportinfo-interface")]
                        port_info_list.push(PortInfo {
                            port_name: p.port_name.clone(),
                            port_type: "USB".to_string(),
                            vid: Some(info.vid),
                            pid: Some(info.pid),
                            serial_number: info.serial_number.clone(),
                            manufacturer: info.manufacturer.clone(),
                            product: info.product.clone(),
                            interface: info.interface.as_ref().map(|x| format!("{:02x}", *x)),
                        });
                        "USB".to_string()
                    }
                    SerialPortType::BluetoothPort => "Bluetooth".to_string(),
                    SerialPortType::PciPort => "PCI".to_string(),
                    SerialPortType::Unknown => "Unknown".to_string(),
                };

                if port_type != "USB".to_string() {
                    port_info_list.push(PortInfo {
                        port_name: p.port_name,
                        port_type,
                        vid: None,
                        pid: None,
                        serial_number: None,
                        manufacturer: None,
                        product: None,
                        interface: None,
                    });
                }
            }
            Ok(port_info_list)
        }
        Err(e) => Err(format!("Error listing serial ports: {:?}", e)),
    }
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

#[tauri::command]
async fn process_anpr(
    input: String,
    type_number: i32,
    window: tauri::Window,
) -> Result<(), String> {
    let options = AnprOptions::default()
        .with_type_number(type_number)
        .with_vers("1.6.0");

    let (tx, rx) = oneshot::channel();

    let handle = tokio::spawn(async move {
        let result = match Path::new(&input).extension().and_then(|s| s.to_str()) {
            Some(ext)
                if ext.eq_ignore_ascii_case("jpg")
                    || ext.eq_ignore_ascii_case("jpeg")
                    || ext.eq_ignore_ascii_case("png") =>
            {
                let img = AnprImage::load_image(&input).map_err(|e| e.to_string())?;
                let plate_numbers = anpr_plate(&img, &options).map_err(|e| e.to_string())?;
                tx.send(Ok(plate_numbers)).unwrap();
                Ok(())
            }
            Some(ext) if ext.eq_ignore_ascii_case("avi") || ext.eq_ignore_ascii_case("mp4") => {
                anpr_video(
                    Some(input),
                    type_number,
                    move |results| {
                        window.emit_all("anpr-update", results.clone()).unwrap();
                    },
                    |frame| should_process_frame(frame, 5.0),
                )
                .map_err(|e| e.to_string())?;
                tx.send(Ok(vec!["Video processing completed".to_string()]))
                    .unwrap();
                Ok(())
            }
            _ => {
                if input.starts_with("http") || input.starts_with("rtsp") {
                    anpr_video(
                        Some(input),
                        type_number,
                        move |results| {
                            window.emit_all("anpr-update", results.clone()).unwrap();
                        },
                        |frame| should_process_frame(frame, 10.0),
                    )
                    .map_err(|e| e.to_string())?;
                    tx.send(Ok(vec!["Video processing completed".to_string()]))
                        .unwrap();
                    Ok(())
                } else if input.starts_with("/dev/video") {
                    // Assuming Linux device file for camera
                    anpr_video(
                        Some(input),
                        type_number,
                        move |results| {
                            window.emit_all("anpr-update", results.clone()).unwrap();
                        },
                        |frame| should_process_frame(frame, 5.0),
                    )
                    .map_err(|e| e.to_string())?;
                    tx.send(Ok(vec!["Video processing completed".to_string()]))
                        .unwrap();
                    Ok(())
                } else {
                    tx.send(Err("Unsupported file type or URL. Please provide a valid image, video file, or URL.".to_string())).unwrap();
                    Err("Unsupported file type or URL".to_string())
                }
            }
        };
        result
    });

    handle.await.map_err(|e| e.to_string())??;
    rx.await.map_err(|e| e.to_string())?;
    Ok(())
}
fn main() {
    // let mut conn = establish_connection();
    // // Create a new counterparty entry
    // let new_counterparty = NewCounterparty {
    //     formal_name: "Company Inc.",
    //     formal_address: "123 Street",
    //     bin: "123456789",
    //     full_name: "John Doe",
    // };

    // let counterparty = create_counterparty(&mut conn, new_counterparty);

    // // Use the created counterparty's ID for dest_to and dest_from
    // let new_car_weight_manual = NewCarWeightManual {
    //     brutto: 1.0,
    //     netto: 2.0,
    //     tara: 3.0,
    //     car_plate_number: "ABC123",
    //     status: "active",
    //     dest_to: Some(counterparty.id.unwrap()), // Assuming `id` is Option<i32>
    //     dest_from: Some(counterparty.id.unwrap()), // Assuming `id` is Option<i32>
    //     cargo_type: "type1",
    // };

    // let car_weight_manual = create_car_weight_manual(&mut conn, new_car_weight_manual);
    // let all_car_weight_manuals = get_all_car_weight_manuals(&mut conn);
    // println!("{:?}", all_car_weight_manuals);
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_anpr,
            list_serial_ports,
            start_serial_communication,
            start_rtsp_to_rtmp,

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
