use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use log::{error, info};
use uuid::Uuid;

use resvg::{usvg, tiny_skia};
use resvg::usvg::TreeParsing;
use tiny_skia::Pixmap;

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
    info!("creating image with id {}", &picure_id);

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

        read_file_content = read_file_content.replace(&format!("Test{}", i), text);
    }

    info!("successfully patched image for {}", &picure_id);
    
    let tree = match usvg::Tree::from_str(&read_file_content, &usvg::Options::default()) {
        Ok(valid_svg) => valid_svg,
        Err(e) => {
            error!("usvg cannot load patched svg {:?}", e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let width: u32 = 1000;
    let height: u32 = 1000;

    let mut image = match Pixmap::new(width, height) {
        Some(pixel_buf) => pixel_buf,
        None => {
            error!("cannot create PixmapMut");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    resvg::Tree::from_usvg(&tree).render(usvg::Transform::identity(), &mut image.as_mut());
    
    let output_file = format!("{}/{}.png", &state.picture_folder, picure_id);
    if let Err(e) = image.save_png(&output_file) {
        error!("error while saving to png file {:?} saving to {}", e, &output_file);
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    info!("image generating complete {}", &picure_id);

    Json(SharePictureCreated {
        picture_id: picure_id,
    })
    .into_response()
}
