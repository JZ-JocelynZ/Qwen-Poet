# Model Adapter

本目录用于放置 Qwen-Poet 的 LoRA Adapter。为了让 GitHub 仓库轻量、清晰且方便审查，当前不直接提交模型权重。

## Base Model

- `Qwen/Qwen2-0.5B`

## Adapter 作用

LoRA Adapter 将通用 Qwen2-0.5B 适配到“白话文转古诗文”的垂直生成任务，使模型输出更符合古典诗文表达习惯。

## 本地放置方式

```text
model_adapter/qwen2-0.5b-poetry-lora/
  adapter_config.json
  adapter_model.safetensors
```

`.env` 示例：

```ini
POET_MODE=model
BASE_MODEL_PATH=./Qwen2-0.5B
LORA_ADAPTER_PATH=./model_adapter/qwen2-0.5b-poetry-lora
```

## Hugging Face 发布建议

后续可将 Adapter 单独发布到 Hugging Face，建议包含：

- `adapter_config.json`
- `adapter_model.safetensors`
- Model Card
- 数据来源与训练参数说明
- 使用示例

不建议上传基座模型完整权重、训练中间 checkpoint 或 optimizer 状态文件。
