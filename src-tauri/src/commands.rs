use tauri::command;
use crate::{create_car_weight_manual, create_car_weights_auto, create_counterparty, delete_car_weight_manual, delete_car_weights_auto, delete_counterparty, establish_connection, export_car_weight_manual_to_excel, export_car_weights_auto_to_excel, get_all_car_weight_manuals, get_all_car_weights_auto, get_all_counterparties, get_car_weight_manual_by_id, get_car_weights_auto_by_id, get_counterparty_by_id, update_car_weight_manual, update_car_weights_auto, update_counterparty, CarWeightManual, CarWeightsAuto, Counterparty, NewCarWeightManual, NewCarWeightsAuto, NewCounterparty};

#[command]
pub fn cmd_get_all_car_weights_auto() -> Vec<CarWeightsAuto> {
    let mut conn = establish_connection();
    get_all_car_weights_auto(&mut conn)
}

#[command]
pub fn cmd_create_car_weights_auto(car_plate_number: String, photo: Option<String>, weight: f32) -> CarWeightsAuto {
    let mut conn = establish_connection();
    let new_car_weights_auto = NewCarWeightsAuto {
        car_plate_number: &car_plate_number,
        photo: photo.as_deref(),
        weight,
        time_created: "now",
        time_updated: "now",
    };
    create_car_weights_auto(&mut conn, new_car_weights_auto)
}

#[command]
pub fn cmd_get_car_weights_auto_by_id(id: i32) -> Option<CarWeightsAuto> {
    let mut conn = establish_connection();
    get_car_weights_auto_by_id(&mut conn, id)
}

// CarWeightManual commands
#[command]
pub fn cmd_get_all_car_weight_manuals() -> Vec<CarWeightManual> {
    let mut conn = establish_connection();
    get_all_car_weight_manuals(&mut conn)
}

#[command]
pub fn cmd_create_car_weight_manual(brutto: f32, netto: f32, tara: f32, car_plate_number: String, status: String, dest_to: Option<i32>, dest_from: Option<i32>, cargo_type: String) -> CarWeightManual {
    let mut conn = establish_connection();
    let new_car_weight_manual = NewCarWeightManual {
        brutto,
        netto,
        tara,
        car_plate_number: &car_plate_number,
        status: &status,
        dest_to,
        dest_from,
        cargo_type: &cargo_type,
    };
    create_car_weight_manual(&mut conn, new_car_weight_manual)
}

#[command]
pub fn cmd_get_car_weight_manual_by_id(id: i32) -> Option<CarWeightManual> {
    let mut conn = establish_connection();
    get_car_weight_manual_by_id(&mut conn, id)
}

// Counterparty commands
#[command]
pub fn cmd_get_all_counterparties() -> Vec<Counterparty> {
    let mut conn = establish_connection();
    get_all_counterparties(&mut conn)
}

#[command]
pub fn cmd_create_counterparty(formal_name: String, formal_address: String, bin: String, full_name: String) -> Counterparty {
    let mut conn = establish_connection();
    let new_counterparty = NewCounterparty {
        formal_name: &formal_name,
        formal_address: &formal_address,
        bin: &bin,
        full_name: &full_name,
    };
    create_counterparty(&mut conn, new_counterparty)
}

#[command]
pub fn cmd_get_counterparty_by_id(id: i32) -> Option<Counterparty> {
    let mut conn = establish_connection();
    get_counterparty_by_id(&mut conn, id)
}

#[command]
pub fn cmd_update_car_weight_manual(
    id: i32,
    brutto: f32,
    netto: f32,
    tara: f32,
    car_plate_number: String,
    status: String,
    dest_to: Option<i32>,
    dest_from: Option<i32>,
    cargo_type: String,
) -> bool {
    let mut conn = establish_connection();
    let updated_car_weight_manual = NewCarWeightManual {
        brutto,
        netto,
        tara,
        car_plate_number: &car_plate_number,
        status: &status,
        dest_to: dest_to,
        dest_from: dest_from,
        cargo_type: &cargo_type,
    };
    update_car_weight_manual(&mut conn, id, updated_car_weight_manual)
}

#[command]
pub fn cmd_update_car_weights_auto(
    id: i32,
    weight: f32,
    car_plate_number: String,
    photo: Option<String>,
    time_created: String,
    time_updated: String,
) -> bool {
    let mut conn = establish_connection();
    let updated_car_weights_auto = NewCarWeightsAuto {
        weight,
        car_plate_number: &car_plate_number,
        photo: photo.as_deref(),
        time_created: &time_created,
        time_updated: &time_updated,
    };
    update_car_weights_auto(&mut conn, id, updated_car_weights_auto)
}

#[command]
pub fn cmd_update_counterparty(id: i32, formal_name: String, formal_address: String, bin: String, full_name: String) -> bool {
    let mut conn = establish_connection();
    let updated_counterparty = NewCounterparty {
        formal_name: &formal_name,
        formal_address: &formal_address,
        bin: &bin,
        full_name: &full_name,
    };
    update_counterparty(&mut conn, id, updated_counterparty)
}


#[command]
pub fn cmd_delete_car_weight_manual(id: i32) -> bool {
    let mut conn = establish_connection();
    delete_car_weight_manual(&mut conn, id)
}

#[command]
pub fn cmd_delete_car_weights_auto(id: i32) -> bool {
    let mut conn = establish_connection();
    delete_car_weights_auto(&mut conn, id)
}

#[command]
pub fn cmd_delete_counterparty(id: i32) -> bool {
    let mut conn = establish_connection();
    let result = delete_counterparty(&mut conn, id);
    if result {
        println!("Successfully deleted counterparty with id {}", id);
    } else {
        println!("Failed to delete counterparty with id {}", id);
    }
    result
}

#[command]
pub fn cmd_export_car_weight_manual_to_excel()  {
    let mut conn = establish_connection();
    export_car_weight_manual_to_excel(&mut conn);
}
#[command]
pub fn cmd_export_car_weights_auto_to_excel()  {
    let mut conn = establish_connection();
    export_car_weights_auto_to_excel(&mut conn);
}