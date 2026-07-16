import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

if load_dotenv:
    load_dotenv()


@dataclass(frozen=True)
class AppConfig:
    mode: str = os.getenv("POET_MODE", "mock").lower()
    base_model_path: str = os.getenv("BASE_MODEL_PATH", "./Qwen2-0.5B")
    lora_adapter_path: str = os.getenv("LORA_ADAPTER_PATH", "./model_adapter/qwen2-0.5b-poetry-lora")
    max_new_tokens: int = int(os.getenv("MAX_NEW_TOKENS", "300"))
    temperature: float = float(os.getenv("TEMPERATURE", "1.0"))
    top_p: float = float(os.getenv("TOP_P", "0.95"))
    repetition_penalty: float = float(os.getenv("REPETITION_PENALTY", "1.05"))
    torch_dtype: str = os.getenv("TORCH_DTYPE", "bfloat16")
    device_map: str = os.getenv("DEVICE_MAP", "auto")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "5000"))


config = AppConfig()
