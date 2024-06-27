// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{error::Error, path::Path, sync::mpsc::{self, Receiver, channel}, thread};
use serde::Serialize;
use serialport::{available_ports, SerialPortType};
use tauri::{command, Manager};
use tokio::sync::{oneshot, Mutex};
use ANPR_bind::{anpr_plate, anpr_video, AnprImage, AnprOptions};

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

#[tauri::command]
async fn process_anpr(input: String, type_number: i32, window: tauri::Window) -> Result<(), String> {
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
                anpr_video(Some(input), type_number, move |results| {
                    window.emit_all("anpr-update", results.clone()).unwrap();
                }).map_err(|e| e.to_string())?;
                tx.send(Ok(vec!["Video processing completed".to_string()])).unwrap();
                Ok(())
            }
            _ => {
                if input.starts_with("http") || input.starts_with("rtsp") {
                    anpr_video(Some(input), type_number, move |results| {
                        window.emit_all("anpr-update", results.clone()).unwrap();
                    }).map_err(|e| e.to_string())?;
                    tx.send(Ok(vec!["Video processing completed".to_string()])).unwrap();
                    Ok(())
                } else if input.starts_with("/dev/video") {
                    // Assuming Linux device file for camera
                    anpr_video(Some(input), type_number, move |results| {
                        window.emit_all("anpr-update", results.clone()).unwrap();
                    }).map_err(|e| e.to_string())?;
                    tx.send(Ok(vec!["Video processing completed".to_string()])).unwrap();
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
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_anpr, list_serial_ports])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
