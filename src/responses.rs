use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct SharePictureCreated {
    pub picture_id: Uuid
}


