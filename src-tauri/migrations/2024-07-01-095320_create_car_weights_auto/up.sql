-- Your SQL goes here
CREATE TABLE car_weights_auto (
    id INTEGER PRIMARY KEY AUTOINCREMENT  NOT NULL,
    car_plate_number TEXT NOT NULL,
    photo TEXT,
    weight REAL NOT NULL,
    time_created TEXT NOT NULL,
    time_updated TEXT NOT NULL
);