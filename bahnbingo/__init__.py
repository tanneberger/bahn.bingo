#!/usr/bin/env nix-shell
#!nix-shell -i python3.11 -p "python311.withPackages(ps: with ps; [ pyvips flask ])"

from flask import Flask, request, jsonify
import json
import os
import uuid
import copy
import pyvips

app = Flask(__name__)  # Flask constructor

with open(os.getenv("BAHNBINGO_FIELD_CONFIG")) as f:
    name_mapping = json.loads(f.read())
with open(os.getenv("BAHNBINGO_BINGO_TEMPLATE")) as f:
    input_svg = f.read()


@app.route('/bingo', methods=['GET'])
def bingo():
    return jsonify(name_mapping)


@app.route('/share', methods=['POST'])
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

    return jsonify({"picture_id": new_uuid})


def main():
    app.run(host=os.getenv("BAHNBINGO_HTTP_HOST"), port=int(os.getenv("BAHNBINGO_HTTP_PORT")))


if __name__ == '__main__':
    print(name_mapping)
    app.run(host=os.getenv("BAHNBINGO_HTTP_HOST"), port=int(os.getenv("BAHNBINGO_HTTP_PORT")))
