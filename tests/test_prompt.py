import sys
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1] / "app"
sys.path.insert(0, str(APP_DIR))

from inference import build_prompt, extract_assistant_text


def test_build_prompt_contains_user_text():
    prompt = build_prompt("????")
    assert "????" in prompt
    assert "<|im_start|>system" in prompt
    assert "<|im_start|>assistant" in prompt


def test_extract_assistant_text():
    output = "<|im_start|>assistant\n?????\n<|im_end|>"
    assert extract_assistant_text(output) == "?????"
