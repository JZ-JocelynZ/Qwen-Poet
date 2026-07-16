import logging

from flask import Flask, jsonify, render_template, request

from config import config
from inference import PoetryInference

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder="templates", static_folder="static")
inference = PoetryInference(config)


@app.get("/")
def index():
    return render_template("index.html", mode=config.mode)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "mode": config.mode, "model_loaded": inference.is_model_loaded})


@app.post("/simple_generate")
def simple_generate():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("input_text", "")).strip()

    if not text:
        return jsonify({"error": "请输入需要转换的白话文。"}), 400
    if len(text) > 300:
        return jsonify({"error": "输入过长，请控制在 300 字以内。"}), 400

    try:
        result = inference.generate(text)
        return jsonify({"result": result.text, "mode": result.mode})
    except Exception as exc:
        logger.exception("Poetry generation failed")
        return jsonify({"error": f"生成失败：{exc}"}), 500


if __name__ == "__main__":
    app.run(host=config.host, port=config.port, debug=False, use_reloader=False)
