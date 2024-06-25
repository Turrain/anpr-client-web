// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::error::Error;
use ANPR_bind::{anpr_plate, AnprImage, AnprOptions};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(  type_number: i32,
    img_path: String) -> Vec<String> {

    let img = AnprImage::load_image(&img_path)
      .map_err(|e| format!("Failed to load image: {}", e)).unwrap();
  
    let options = AnprOptions::default()
      .with_type_number(type_number)
      .with_vers("1.6.0");
  
    let plate_numbers = anpr_plate(&img, &options)
      .map_err(|e| format!("Failed to process image: {}", e)).unwrap();
    plate_numbers
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
