-- Your SQL goes here
CREATE TABLE counterparty (
    id INTEGER PRIMARY KEY AUTOINCREMENT  NOT NULL,
    formal_name TEXT NOT NULL,
    formal_address TEXT NOT NULL,
    bin TEXT NOT NULL,
    full_name TEXT NOT NULL
);