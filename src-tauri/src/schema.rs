// @generated automatically by Diesel CLI.

diesel::table! {
    car_weight_manual (id) {
        id -> Integer,
        brutto -> Float,
        netto -> Float,
        tara -> Float,
        car_plate_number -> Text,
        status -> Text,
        dest_to -> Nullable<Integer>,
        dest_from -> Nullable<Integer>,
        cargo_type -> Text,
    }
}

diesel::table! {
    car_weights_auto (id) {
        id -> Integer,
        car_plate_number -> Text,
        photo -> Nullable<Text>,
        weight -> Float,
        time_created -> Text,
        time_updated -> Text,
    }
}

diesel::table! {
    counterparty (id) {
        id -> Integer,
        formal_name -> Text,
        formal_address -> Text,
        bin -> Text,
        full_name -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    car_weight_manual,
    car_weights_auto,
    counterparty,
);
