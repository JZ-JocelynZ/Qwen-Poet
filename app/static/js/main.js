document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const generateBtn = document.getElementById("generate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const calligraphyBtn = document.getElementById("calligraphy-btn");
  const charCounter = document.querySelector(".char-counter");
  const watermark = document.getElementById("watermark");
  const loadingOverlay = document.getElementById("loading-overlay");
  const notification = document.getElementById("notification");
  const poetryContent = document.querySelector(".poetry-content");

  document.querySelectorAll(".presets button").forEach((item) => {
    item.addEventListener("click", () => {
      inputText.value = item.dataset.text;
      refreshInputState();
    });
  });

  inputText.addEventListener("input", refreshInputState);

  clearBtn.addEventListener("click", () => {
    inputText.value = "";
    poetryContent.innerHTML = "";
    refreshInputState();
    showNotification("内容已清空");
  });

  copyBtn.addEventListener("click", async () => {
    const text = poetryContent.textContent.trim();
    if (!text) return showNotification("没有可复制的内容", "error");
    await navigator.clipboard.writeText(text);
    showNotification("古诗文已复制");
  });

  calligraphyBtn.addEventListener("click", () => {
    outputText.classList.toggle("calligraphy-mode");
    showNotification(outputText.classList.contains("calligraphy-mode") ? "已切换为竖排展示" : "已切换为横排展示");
  });

  generateBtn.addEventListener("click", async () => {
    const input = inputText.value.trim();
    if (!input) return showNotification("请输入白话文内容", "error");
    loadingOverlay.classList.add("active");
    generateBtn.disabled = true;
    try {
      const response = await fetch("/simple_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: input })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "请求失败");
      updateOutput(data.result || "");
      showNotification(data.mode === "mock" ? "Mock 模式生成成功" : "古诗文生成成功");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      loadingOverlay.classList.remove("active");
      generateBtn.disabled = false;
    }
  });

  function refreshInputState() {
    const length = inputText.value.length;
    charCounter.textContent = `${length}/300 字`;
    charCounter.style.color = length > 300 ? "var(--error)" : "var(--muted)";
    watermark.style.display = inputText.value.trim() ? "none" : "flex";
  }

  function updateOutput(text) {
    poetryContent.textContent = text.trim();
  }

  function showNotification(message, type = "success") {
    notification.className = `notification ${type === "error" ? "error" : ""}`;
    notification.querySelector("span").textContent = message;
    notification.classList.add("active");
    window.setTimeout(() => notification.classList.remove("active"), 2800);
  }

  refreshInputState();
});

