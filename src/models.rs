use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

pub type BahnBingoValues = HashMap<i32, String>;

#[derive(Serialize, Deserialize, Debug)]
pub struct BingoField {
    pub start_station: String,
    pub destination_station: String,
    pub time: DateTime<Utc>,
    pub field: Vec<(i32, bool)>
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub template_path: String,
    pub picture_folder: String,
    pub text_mapping: BahnBingoValues
}

