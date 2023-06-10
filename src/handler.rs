use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use log::error;
use uuid::Uuid;

use gdk_pixbuf::prelude::PixbufLoaderExt;
use gdk_pixbuf::PixbufLoader;

use crate::{
    models::{AppConfig, BingoField},
    responses::SharePictureCreated,
};

pub async fn get_text_mapping(State(state): State<AppConfig>) -> Response {
    Json(state.text_mapping).into_response()
}

pub async fn create_share_picture(
    State(state): State<AppConfig>,
    Json(body): Json<BingoField>,
) -> Response {
    let picure_id = Uuid::new_v4();

    let mut read_file_content = match std::fs::read_to_string(&state.template_path) {
        Ok(content) => content,
        Err(e) => {
            error!("error while reading template file {:?}", e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    for (i, bingo_field) in body.field.iter().enumerate() {
        let text = match state.text_mapping.get(&bingo_field.0) {
            Some(value) => value,
            None => {
                error!("cannot find specified enum value");
                return StatusCode::BAD_REQUEST.into_response();
            }
        };

        read_file_content = read_file_content.replace(&format!("test{}", i), text);
    }

    let loader = match PixbufLoader::new_with_mime_type("image/svg+xml") {
        Ok(valid_pixbuf) => valid_pixbuf,
        Err(e) => {
            error!("bixpuf cannot load patched svg {:?}", e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    if let Err(e) = loader.write(read_file_content.as_bytes()) {
        error!("cannot insert text into progressive pixbuf loader {:?}", e);
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    if let Err(e) = loader.close() {
        error!("cannot close pixbuf {:?}", e);
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    let pixbuf = match loader.get_pixbuf() {
        Some(valid_pixbuf) => valid_pixbuf,
        None => {
            error!("no valid pixbuf can be returned");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let bytes: Vec<u8> = match pixbuf.save_to_bufferv("png", &[]) {
        Ok(found_bytes) => found_bytes,
        Err(e) => {
            error!("cannot save pixbuf as png {:?}", e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    if let Err(e) = std::fs::write(format!("{}/{}.png", &state.template_path, picure_id), bytes) {
        error!("cannot write png file {:?}", e);
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    Json(SharePictureCreated {
        picture_id: picure_id,
    })
    .into_response()
}
