#!/usr/bin/env nix-shell
#!nix-shell -i python3.11 -p "python311.withPackages(ps: with ps; [ pyvips flask ])"

from flask import Flask, request, jsonify, send_file
import json
import os
import uuid
import copy
import pyvips
import io
import base64

field_config = os.getenv("BAHNBINGO_FIELD_CONFIG")
bingo_template = os.getenv("BAHNBINGO_BINGO_TEMPLATE")
pictrure_folder = os.getenv("BAHNBINGO_PICTURE_FOLDER")
http_host = os.getenv("BAHNBINGO_HTTP_HOST")
http_port = os.getenv("BAHNBINGO_HTTP_PORT")

app = Flask(__name__)  # Flask constructor

with open(field_config) as f:
    name_mapping = json.loads(f.read())
with open(bingo_template) as f:
    input_svg = f.read()


@app.route("/bingo", methods=["GET"])
def bingo():
    response = jsonify(name_mapping)
    return response


@app.route("/share", methods=["POST"])
def share():
    data = request.get_json(force=True)

    if "field" not in data and len(data["field"]) < 9:
        return "Bad User Data", 400

    new_uuid = uuid.uuid4()

    output_png_path = pictrure_folder + "/" + str(new_uuid) + ".png"

    svg_content_copy = copy.copy(input_svg)
    for i in range(9):
        # validating that it is a valid bingo field
        if str(data["field"][i]) not in name_mapping.keys():
            return "Bad User Data", 400

        svg_content_copy = svg_content_copy.replace("Test{}".format(str(i)), name_mapping[str(data["field"][i])])

    image = pyvips.Image.svgload_bfuffer(svg_content_copy.encode(), dpi=300)
    image.write_to_file(output_png_path)

    response = jsonify({"picture_id": new_uuid})
    return response


@app.route("/share/<image_hash>.png", methods=["GET"])
def share_image_hash(image_hash):
    current_config_field = base64.b64decode(image_hash).decode()
    print(current_config_field)
    fields = current_config_field.split(",")

    svg_content_copy = copy.copy(input_svg)
    for i in range(9):
        # validating that it is a valid bingo field
        if not fields[i].isdigit() and str(int(fields[i])) not in name_mapping.keys():
            return "Bad User Data", 400

        svg_content_copy = svg_content_copy.replace("Test{}".format(str(i)), name_mapping[str(fields[i])])

    image = pyvips.Image.svgload_buffer(svg_content_copy.encode(), dpi=300)
    image_buffer = image.pngsave_buffer()

    return send_file(
        io.BytesIO(image_buffer),  # TODO: fix das mal muss iwie binary oder so
        mimetype="image/png",
        as_attachment=False,
        download_name="content.png",
    )


if __name__ == "__main__":
    print(name_mapping)
    app.run(host=http_host, port=int(http_port))
