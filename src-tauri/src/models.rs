use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::schema::{car_weights_auto,car_weight_manual,counterparty};
use diesel::sqlite::Sqlite;

#[derive(Queryable, Selectable,Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::car_weight_manual)]
#[diesel(check_for_backend(Sqlite))]
pub struct CarWeightManual {
    pub id: Option<i32>,
    pub brutto: f32,
    pub netto: f32,
    pub tara: f32,
    pub car_plate_number: String,
    pub status: String,
    pub dest_to: Option<i32>,
    pub dest_from: Option<i32>,
    pub cargo_type: String,
}

#[derive(Insertable,Debug, Serialize, Deserialize,AsChangeset)]
#[diesel(table_name = car_weight_manual)]
pub struct NewCarWeightManual<'a> {
    pub brutto: f32,
    pub netto: f32,
    pub tara: f32,
    pub car_plate_number: &'a str,
    pub status: &'a str,
    pub dest_to: Option<i32>,
    pub dest_from: Option<i32>,
    pub cargo_type: &'a str,
}

#[derive(Queryable, Selectable,Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::car_weights_auto)]
#[diesel(check_for_backend(Sqlite))]
pub struct CarWeightsAuto {
    pub id: Option<i32>,
    pub car_plate_number: String,
    pub photo: Option<String>,
    pub weight: f32,
    pub time_created: String,
    pub time_updated: String,
}

#[derive(Insertable,Debug, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = car_weights_auto)]
pub struct NewCarWeightsAuto<'a> {
    pub car_plate_number: &'a str,
    pub photo: Option<&'a str>,
    pub weight: f32,
    pub time_created: &'a str,
    pub time_updated: &'a str,
}

#[derive(Queryable, Selectable,Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::counterparty)]
#[diesel(check_for_backend(Sqlite))]
pub struct Counterparty {
    pub id: Option<i32>,
    pub formal_name: String,
    pub formal_address: String,
    pub bin: String,
    pub full_name: String,
}

#[derive(Insertable,Debug, AsChangeset)]
#[diesel(table_name = counterparty)]
pub struct NewCounterparty<'a> {
    pub formal_name: &'a str,
    pub formal_address: &'a str,
    pub bin: &'a str,
    pub full_name: &'a str,
}