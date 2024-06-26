// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{error::Error, path::Path, sync::mpsc, thread};
use tokio::sync::oneshot;
use ANPR_bind::{anpr_plate, anpr_video, AnprImage, AnprOptions};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn process_anpr(input: String, type_number: i32) -> Result<Vec<String>, String> {
    let options = AnprOptions::default()
        .with_type_number(type_number)
        .with_vers("1.6.0");

   
        match Path::new(&input).extension().and_then(|s| s.to_str()) {
            Some(ext)
                if ext.eq_ignore_ascii_case("jpg")
                    || ext.eq_ignore_ascii_case("jpeg")
                    || ext.eq_ignore_ascii_case("png") =>
            {
                let img = AnprImage::load_image(&input).map_err(|e| e.to_string())?;
                let plate_numbers = anpr_plate(&img, &options).map_err(|e| e.to_string())?;
    
                Ok(plate_numbers)
            }
            Some(ext) if ext.eq_ignore_ascii_case("avi") || ext.eq_ignore_ascii_case("mp4") => {
                let (tx, rx) = oneshot::channel();
                tokio::task::spawn_blocking(move || {
                    let result = anpr_video(Some(input), type_number);
                    tx.send(result).unwrap();
                });
                rx.await.map_err(|e| e.to_string())??;
                Ok(vec!["Video processing completed".to_string()])
            }
            _ => {
                if input.starts_with("http") || input.starts_with("rtsp") {
                    let (tx, rx) = oneshot::channel();
                    tokio::task::spawn_blocking(move || {
                        let result = anpr_video(Some(input), type_number);
                        tx.send(result).unwrap();
                    });
                    rx.await.map_err(|e| e.to_string())??;
                    Ok(vec!["Video processing completed".to_string()])
                } else if input.starts_with("/dev/video") {
                    // Assuming Linux device file for camera
                    let (tx, rx) = oneshot::channel();
                    tokio::task::spawn_blocking(move || {
                        let result = anpr_video(Some(input), type_number);
                        tx.send(result).unwrap();
                    });
                    rx.await.map_err(|e| e.to_string())??;
                    Ok(vec!["Video processing completed".to_string()])
                } else {
                    Err("Unsupported file type or URL. Please provide a valid image, video file, or URL.".to_string())
                }
            }
        }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_anpr])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
