-- Your SQL goes here
CREATE TABLE car_weight_manual (
    id INTEGER PRIMARY KEY AUTOINCREMENT  NOT NULL,
    brutto REAL NOT NULL,
    netto REAL NOT NULL,
    tara REAL NOT NULL,
    car_plate_number TEXT NOT NULL,
    status TEXT NOT NULL,
    dest_to INTEGER,
    dest_from INTEGER,
    cargo_type TEXT NOT NULL,
    FOREIGN KEY(dest_to) REFERENCES counterparty(id),
    FOREIGN KEY(dest_from) REFERENCES counterparty(id)
);