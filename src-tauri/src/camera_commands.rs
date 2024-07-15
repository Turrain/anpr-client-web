
use std::{env, sync::Arc};
use lazy_static::lazy_static;
use tokio::sync::{Mutex, oneshot};
use tauri::{Manager, Window};
use ANPR_bind::{anpr_video, AnprOptions};
use crate::shared_state::SHARED_STATE;


lazy_static! {
    static ref CAMERA_STATE: Arc<Mutex<Option<CameraStreamState>>> = Arc::new(Mutex::new(None));
}

struct CameraStreamState {
    url: String,
    handle: tokio::task::JoinHandle<()>,
    tx: oneshot::Sender<()>,
}

fn should_process_frame(frame_number: usize, desired_fps: f32) -> bool {
    frame_number as f32 % (30.0 / desired_fps) == 0.0
}

async fn start_camera_stream(url: String, window: Window) -> Result<(), String> {
    let (tx, rx) = oneshot::channel();
    let cloned_url = url.clone();
    let current_dir = env::current_dir().expect("msg");
    let img = current_dir.join("test.jpg");
    let handle = tokio::spawn(async move {
        let options = AnprOptions::default().with_type_number(1).with_vers("1.6.0");

        let result = anpr_video(
            Some(cloned_url.clone()),
            Some(String::from(img.to_str().expect("msg"))),
            104,
            move |results| {
                window.emit("anpr-update", results.clone()).unwrap();
                if let Some(plate_number) = results.get(0) {
                    SHARED_STATE.lock().unwrap().update_camera_data(plate_number.clone(), Some(cloned_url.clone()));
                }
            },
            |frame| should_process_frame(frame, 10.0),
          
        )
        .map_err(|e| e.to_string());

        let _ = rx.await;
        result.unwrap();
    });

    let mut state = CAMERA_STATE.lock().await;
    *state = Some(CameraStreamState { url, handle, tx });
    Ok(())
}


async fn stop_camera_stream() -> Result<(), String> {
    let mut state = CAMERA_STATE.lock().await;
    if let Some(stream_state) = state.take() {
        let _ = stream_state.tx.send(());
        stream_state.handle.await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn change_camera_url(new_url: String, window: Window) -> Result<(), String> {
    stop_camera_stream().await?;
    start_camera_stream(new_url, window).await
}

// Tauri commands for camera stream
#[tauri::command]
pub(crate) async fn start_stream(url: String, window: tauri::Window) -> Result<(), String> {
    start_camera_stream(url, window).await
}

#[tauri::command]
pub(crate) async fn stop_stream() -> Result<(), String> {
    stop_camera_stream().await
}

#[tauri::command]
pub(crate) async fn change_stream(url: String, window: tauri::Window) -> Result<(), String> {
    change_camera_url(url, window).await
}