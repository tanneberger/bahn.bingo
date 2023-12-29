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
http_host = os.getenv("BAHNBINGO_HTTP_HOST")
http_port = os.getenv("BAHNBINGO_HTTP_PORT")

app = Flask(__name__)  # Flask constructor

with open(field_config) as f:
    bingo_values = json.loads(f.read())
    user_bingo_field = {}

    for (key, value) in bingo_values.items():
        user_bingo_field[key] = value["plain"]

with open(bingo_template) as f:
    input_svg = f.read()


@app.route("/bingo", methods=["GET"])
def bingo():
    response = jsonify(user_bingo_field)
    return response


@app.route("/share/<image_hash>.png", methods=["GET"])
def share_image_hash(image_hash):
    fields = []
    try:
        current_field_config = base64.b64decode(image_hash).decode()
        fields = current_field_config.split(",")
    except ValueError:
        return "Bad User Data", 400

    if len(fields) < 9:
        return "Bad User Data", 400

    dpi = int(request.args.get('dpi') or 300)
    if dpi > 600:
        return "Bad User Data", 400

    svg_content_copy = copy.copy(input_svg)
    for i in range(9):
        # validating that it is a valid bingo field
        if not fields[i].isdigit() and str(int(fields[i])) not in bingo_values.keys():
            return "Bad User Data", 400

        svg_content_copy = svg_content_copy.replace("Test{}".format(str(i)), bingo_values[str(fields[i])]["render"])

    image = pyvips.Image.svgload_buffer(svg_content_copy.encode(), dpi=dpi)
    image_buffer = image.pngsave_buffer()

    return send_file(
        io.BytesIO(image_buffer),
        mimetype="image/png",
        as_attachment=False,
        download_name="content.png",
    )


if __name__ == "__main__":
    print(bingo_values)
    app.run(host=http_host, port=int(http_port))
