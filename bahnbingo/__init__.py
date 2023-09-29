#!/usr/bin/env nix-shell
#!nix-shell -i python3.11 -p "python311.withPackages(ps: with ps; [ pyvips flask flask-cors ])"

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import os
import uuid
import copy
import pyvips

app = Flask(__name__)  # Flask constructor
CORS(app)
cors = CORS(app, resource={
    r"/*": {
        "origins": "*"
    }
})

with open(os.getenv("BAHNBINGO_FIELD_CONFIG")) as f:
    name_mapping = json.loads(f.read())
with open(os.getenv("BAHNBINGO_BINGO_TEMPLATE")) as f:
    input_svg = f.read()


@app.route('/bingo', methods=['GET'])
@cross_origin()
def bingo():
    response = jsonify({"picture_id": new_uuid})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/share', methods=['POST'])
@cross_origin()
def share():
    data = request.get_json(force=True)

    if "field" not in data and len(data["field"]) < 9:
        return "Bad User Data", 400

    new_uuid = uuid.uuid4()

    output_png_path = os.getenv("BAHNBINGO_PICTURE_FOLDER") + "/" + str(new_uuid) + ".png"

    svg_content_copy = copy.copy(input_svg)
    for i in range(9):
        # validating that it is a valid bingo field
        if str(data['field'][i]) not in name_mapping.keys():
            return "Bad User Data", 400

        svg_content_copy = svg_content_copy.replace("Test{}".format(str(i)), name_mapping[str(data["field"][i])])

    image = pyvips.Image.svgload_buffer(svg_content_copy.encode(), dpi=300)
    image.write_to_file(output_png_path)

    response = jsonify({"picture_id": new_uuid})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    print(name_mapping)
    app.run(host=os.getenv("BAHNBINGO_HTTP_HOST"), port=int(os.getenv("BAHNBINGO_HTTP_PORT")))
