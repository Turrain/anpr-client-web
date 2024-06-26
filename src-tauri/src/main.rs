// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{error::Error, path::Path, sync::mpsc, thread};
use tauri::Manager;
use tokio::sync::oneshot;
use ANPR_bind::{anpr_plate, anpr_video, AnprImage, AnprOptions};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
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
        .invoke_handler(tauri::generate_handler![process_anpr])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
