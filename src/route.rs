use axum::{
    routing::{get, post},
    Router,
};

use crate::{
    handler::{create_share_picture, get_text_mapping},
    models::AppConfig,
};

pub fn create_router() -> Router {
    let text_mapping = serde_json::from_str(
        &std::fs::read_to_string(
            std::env::var("BAHNBINGO_FIELD_CONFIG")
                .expect("BAHNBINGO_FIELD_CONFIG needs to be specified"),
        )
        .expect("Cannot read file specified at BAHNBINGO_FIELD_CONFIG"),
    )
    .expect("BAHNBINGO_FIELD_CONFIG has not valid format!");

    let config = AppConfig {
        template_path: std::env::var("BAHNBINGO_BING_TEMPLATE")
            .expect("BAHNBINGO_BING_TEMPLATE needs to be specified"),
        picture_folder: std::env::var("BAHNBINGO_PICTURE_FOLDER")
            .expect("BAHNBINGO_BING_TEMPLATE needs to be specified"),
        text_mapping,
    };

    Router::new()
        .route("/bingo", get(get_text_mapping))
        .route("/share", post(create_share_picture))
        .with_state(config)
}
