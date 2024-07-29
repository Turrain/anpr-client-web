// src/database.rs

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

use dotenvy::dotenv;
use std::env;
use rust_xlsxwriter::*;

use crate::models::{CarWeightManual, CarWeightsAuto, Counterparty, NewCarWeightManual, NewCarWeightsAuto, NewCounterparty};
use crate::schema::{car_weight_manual, car_weights_auto, counterparty};

pub fn establish_connection() -> SqliteConnection {
    
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to the database: {}", 
            database_url))
}

pub fn create_car_weight_manual(conn: &mut SqliteConnection, new_car_weight_manual: NewCarWeightManual) -> CarWeightManual {
    use crate::schema::car_weight_manual;

    diesel::insert_into(car_weight_manual::table)
        .values(&new_car_weight_manual)
        .execute(conn)
        .expect("Error saving new car weight manual entry");

    car_weight_manual::table
        .order(car_weight_manual::id.desc())
        .first(conn)
        .expect("Error loading saved car weight manual entry")
}

pub fn get_all_car_weight_manuals(conn: &mut SqliteConnection) -> Vec<CarWeightManual> {
    use crate::schema::car_weight_manual::dsl::*;

    car_weight_manual
        .load::<CarWeightManual>(conn)
        .expect("Error loading car weight manual entries")
}

pub fn get_car_weight_manual_by_id(conn: &mut SqliteConnection, entry_id: i32) -> Option<CarWeightManual> {
    use crate::schema::car_weight_manual::dsl::*;

    car_weight_manual
        .filter(id.eq(entry_id))
        .first::<CarWeightManual>(conn)
        .optional()
        .expect("Error loading car weight manual entry")
}



pub fn create_car_weights_auto(conn: &mut SqliteConnection, new_car_weights_auto: NewCarWeightsAuto) -> CarWeightsAuto {
    use crate::schema::car_weights_auto;

    diesel::insert_into(car_weights_auto::table)
        .values(&new_car_weights_auto)
        .execute(conn)
        .expect("Error saving new car weights auto entry");

    car_weights_auto::table
        .order(car_weights_auto::id.desc())
        .first(conn)
        .expect("Error loading saved car weights auto entry")
}

pub fn get_all_car_weights_auto(conn: &mut SqliteConnection) -> Vec<CarWeightsAuto> {
    use crate::schema::car_weights_auto::dsl::*;

    car_weights_auto
        .load::<CarWeightsAuto>(conn)
        .expect("Error loading car weights auto entries")
}

pub fn get_car_weights_auto_by_id(conn: &mut SqliteConnection, entry_id: i32) -> Option<CarWeightsAuto> {
    use crate::schema::car_weights_auto::dsl::*;

    car_weights_auto
        .filter(id.eq(entry_id))
        .first::<CarWeightsAuto>(conn)
        .optional()
        .expect("Error loading car weights auto entry")
}


pub fn create_counterparty(conn: &mut SqliteConnection, new_counterparty: NewCounterparty) -> Counterparty {
    use crate::schema::counterparty;

    diesel::insert_into(counterparty::table)
        .values(&new_counterparty)
        .execute(conn)
        .expect("Error saving new counterparty entry");

    counterparty::table
        .order(counterparty::id.desc())
        .first(conn)
        .expect("Error loading saved counterparty entry")
}



pub fn get_all_counterparties(conn: &mut SqliteConnection) -> Vec<Counterparty> {
    use crate::schema::counterparty::dsl::*;

    counterparty
        .load::<Counterparty>(conn)
        .expect("Error loading counterparty entries")
}

pub fn get_counterparty_by_id(conn: &mut SqliteConnection, entry_id: i32) -> Option<Counterparty> {
    use crate::schema::counterparty::dsl::*;

    counterparty
        .filter(id.eq(entry_id))
        .first::<Counterparty>(conn)
        .optional()
        .expect("Error loading counterparty entry")
}

pub fn update_car_weight_manual(conn: &mut SqliteConnection, entry_id: i32, updated_car_weight_manual: NewCarWeightManual) -> bool {
    use crate::schema::car_weight_manual::dsl::*;

    diesel::update(car_weight_manual.filter(id.eq(entry_id)))
        .set(&updated_car_weight_manual)
        .execute(conn)
        .is_ok()
}

pub fn update_car_weights_auto(conn: &mut SqliteConnection, entry_id: i32, updated_car_weights_auto: NewCarWeightsAuto) -> bool {
    use crate::schema::car_weights_auto::dsl::*;

    diesel::update(car_weights_auto.filter(id.eq(entry_id)))
        .set(&updated_car_weights_auto)
        .execute(conn)
        .is_ok()
}

pub fn update_counterparty(conn: &mut SqliteConnection, entry_id: i32, updated_counterparty: NewCounterparty) -> bool {
    use crate::schema::counterparty::dsl::*;

    diesel::update(counterparty.filter(id.eq(entry_id)))
        .set(&updated_counterparty)
        .execute(conn)
        .is_ok()
}



pub fn delete_car_weight_manual(conn: &mut SqliteConnection, entry_id: i32) -> bool {
    use crate::schema::car_weight_manual::dsl::*;

    diesel::delete(car_weight_manual.filter(id.eq(entry_id)))
        .execute(conn)
        .is_ok()
}

pub fn delete_car_weights_auto(conn: &mut SqliteConnection, entry_id: i32) -> bool {
    use crate::schema::car_weights_auto::dsl::*;

    diesel::delete(car_weights_auto.filter(id.eq(entry_id)))
        .execute(conn)
        .is_ok()
}

pub fn delete_counterparty(conn: &mut SqliteConnection, entry_id: i32) -> bool {
    use crate::schema::counterparty::dsl::*;
    let test = counterparty.filter(id.eq(entry_id));
    
    match diesel::delete(counterparty.filter(id.eq(entry_id))).execute(conn) {
        Ok(_) => true,
        Err(err) => {
            println!("Failed to delete counterparty with id {}: {}", entry_id, err);
            false
        }
    }
}



pub fn export_car_weight_manual_to_excel(conn: &mut SqliteConnection) -> Result<(), XlsxError> {
    // Query all car weight manual entries
    let car_weight_manuals = crate::database::get_all_car_weight_manuals(conn);
    let filepath = "./test_1.xlsx";
    // Create a new Excel workbook and add a worksheet
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    // Write headers
    worksheet.write_string(0, 0, "ID")?;
    worksheet.write_string(0, 1, "Brutto")?;
    worksheet.write_string(0, 2, "Netto")?;
    worksheet.write_string(0, 3, "Tara")?;
    worksheet.write_string(0, 4, "Car Plate Number")?;
    worksheet.write_string(0, 5, "Status")?;
    worksheet.write_string(0, 6, "Dest To")?;
    worksheet.write_string(0, 7, "Dest From")?;
    worksheet.write_string(0, 8, "Cargo Type")?;

    // Write data
    for (i, entry) in car_weight_manuals.iter().enumerate() {
        worksheet.write_number((i + 1) as u32, 0, entry.id as f64)?;
        worksheet.write_number((i + 1) as u32, 1, entry.brutto as f64)?;
        worksheet.write_number((i + 1) as u32, 2, entry.netto as f64)?;
        worksheet.write_number((i + 1) as u32, 3, entry.tara as f64)?;
        worksheet.write_string((i + 1) as u32, 4, &entry.car_plate_number)?;
        worksheet.write_string((i + 1) as u32, 5, &entry.status)?;
        worksheet.write_number((i + 1) as u32, 6, entry.dest_to.unwrap_or(0) as f64)?;
        worksheet.write_number((i + 1) as u32, 7, entry.dest_from.unwrap_or(0) as f64)?;
        worksheet.write_string((i + 1) as u32, 8, &entry.cargo_type)?;
    }

    // Save the workbook to the specified file path
    workbook.save(filepath)?;

    Ok(())
}
pub fn export_car_weights_auto_to_excel(conn: &mut SqliteConnection) -> Result<(), XlsxError> {
    let car_weights_auto = crate::database::get_all_car_weights_auto(conn);

    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    let filepath = "./test_2.xlsx";
    worksheet.write_string(0, 0, "ID")?;
    worksheet.write_string(0, 1, "Car Plate Number")?;
    worksheet.write_string(0, 2, "Photo")?;
    worksheet.write_string(0, 3, "Weight")?;
    worksheet.write_string(0, 4, "Time Created")?;
    worksheet.write_string(0, 5, "Time Updated")?;

    for (i, entry) in car_weights_auto.iter().enumerate() {
        worksheet.write_number((i + 1) as u32, 0, entry.id as f64)?;
        worksheet.write_string((i + 1) as u32, 1, &entry.car_plate_number)?;
        if let Some(photo) = &entry.photo {
            worksheet.write_string((i + 1) as u32, 2, photo)?;
        }
        worksheet.write_number((i + 1) as u32, 3, entry.weight as f64)?;
        worksheet.write_string((i + 1) as u32, 4, &entry.time_created)?;
        worksheet.write_string((i + 1) as u32, 5, &entry.time_updated)?;
    }

    workbook.save(filepath)?;

    Ok(())
}