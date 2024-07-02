// src/database.rs

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

use dotenvy::dotenv;
use std::env;

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
