use std::collections::HashMap;

use axum::{
    routing::{get, post},
    Router,
};

use crate::{
    handler::{
        create_share_picture, get_text_mapping,
    }, models::AppConfig,
};

pub fn create_router() -> Router {
    let config = AppConfig {
        template_path: "./".to_string(),
        picture_folder: "./".to_string(),
        text_mapping: HashMap::new()
    };

    Router::new()
        //.route("/api/healthchecker", get(health_checker_handler))
        .route("/bingo", get(get_text_mapping))
        .route("/share", post(create_share_picture))
        .with_state(config)
}
