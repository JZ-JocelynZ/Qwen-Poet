import logging
import re
from dataclasses import dataclass

from config import AppConfig

logger = logging.getLogger(__name__)

MOCK_EXAMPLES = {
    "春": "春雨润平畴\n柳眼试新柔\n芳草穿泥出\n群花照水流",
    "山": "山泉明石罅\n日影动清流\n树色涵波静\n鱼行入画幽",
    "月": "月华铺野白\n远岫入烟青\n湖面浮银色\n虫声到夜深",
    "秋": "金风吹稻熟\n野径果香浮\n一望丰年景\n心随晚照悠",
}


@dataclass
class GenerationResult:
    text: str
    mode: str


class PoetryInference:
    def __init__(self, cfg: AppConfig):
        self.cfg = cfg
        self._tokenizer = None
        self._model = None

    @property
    def is_model_loaded(self) -> bool:
        return self._tokenizer is not None and self._model is not None

    def generate(self, text: str) -> GenerationResult:
        if self.cfg.mode == "mock":
            return GenerationResult(self._mock_generate(text), "mock")
        return GenerationResult(self._model_generate(text), "model")

    def _mock_generate(self, text: str) -> str:
        for keyword, poem in MOCK_EXAMPLES.items():
            if keyword in text:
                return poem
        return "白话入清辞\n新声寄古心\n一行涵远意\n半纸见云深"

    def _load_model(self):
        if self.is_model_loaded:
            return self._tokenizer, self._model

        import torch
        from peft import PeftModel
        from transformers import AutoModelForCausalLM, AutoTokenizer

        dtype = getattr(torch, self.cfg.torch_dtype, torch.bfloat16)
        logger.info("Loading tokenizer from %s", self.cfg.base_model_path)
        tokenizer = AutoTokenizer.from_pretrained(
            self.cfg.base_model_path,
            trust_remote_code=True,
            use_fast=False,
        )
        if tokenizer.pad_token_id is None:
            tokenizer.pad_token = tokenizer.eos_token

        logger.info("Loading base model from %s", self.cfg.base_model_path)
        base_model = AutoModelForCausalLM.from_pretrained(
            self.cfg.base_model_path,
            device_map=self.cfg.device_map,
            torch_dtype=dtype,
            trust_remote_code=True,
        )

        logger.info("Loading LoRA adapter from %s", self.cfg.lora_adapter_path)
        model = PeftModel.from_pretrained(base_model, self.cfg.lora_adapter_path)
        model = model.merge_and_unload()
        model.eval()

        self._tokenizer = tokenizer
        self._model = model
        return tokenizer, model

    def _model_generate(self, text: str) -> str:
        tokenizer, model = self._load_model()
        prompt = build_prompt(text)
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        import torch
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=self.cfg.max_new_tokens,
                temperature=self.cfg.temperature,
                top_p=self.cfg.top_p,
                repetition_penalty=self.cfg.repetition_penalty,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.pad_token_id,
            )

        full_output = tokenizer.decode(outputs[0], skip_special_tokens=False)
        return extract_assistant_text(full_output)


def build_prompt(text: str) -> str:
    system_prompt = (
        "你是一位精通古典诗词写作的文人，擅长用简洁典雅的语言表达深远意境。"
        "请将用户提供的白话文改写为古风诗文，风格高古，用词讲究，每句独立成行。"
    )
    return (
        f"<|im_start|>system\n{system_prompt}<|im_end|>\n"
        f"<|im_start|>user\n请将下面的白话文改写为古风诗文：\n\n{text}\n<|im_end|>\n"
        "<|im_start|>assistant\n"
    )


def extract_assistant_text(full_output: str) -> str:
    match = re.search(
        r"assistant\n(.+?)(<\|im_end\|>|<\|endoftext\|>|$)",
        full_output,
        re.DOTALL,
    )
    if match:
        return match.group(1).strip()
    return full_output.strip()
