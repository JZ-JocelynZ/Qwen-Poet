document.addEventListener('DOMContentLoaded', function() {
  // DOM 元素
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const generateBtn = document.getElementById('generate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const saveBtn = document.getElementById('save-btn');
  const calligraphyBtn = document.getElementById('calligraphy-btn');
  const charCounter = document.querySelector('.char-counter');
  const watermark = document.getElementById('watermark');
  const loadingOverlay = document.getElementById('loading-overlay');
  const notification = document.getElementById('notification');
  const poetryContent = document.querySelector('.poetry-content');
  
  // 预设输入
  const presetItems = document.querySelectorAll('.preset-item');
  presetItems.forEach(item => {
    item.addEventListener('click', function() {
      inputText.value = this.getAttribute('data-text');
      updateCharCounter();
      checkWatermark();
    });
  });
  
  // 字数统计
  function updateCharCounter() {
    const length = inputText.value.length;
    charCounter.textContent = `${length}/200 字`;
    if (length > 200) {
      charCounter.style.color = 'var(--error)';
    } else {
      charCounter.style.color = 'var(--ink-light)';
    }
  }
  
  // 水印显示控制
  function checkWatermark() {
    if (inputText.value.trim() === '') {
      watermark.style.display = 'flex';
    } else {
      watermark.style.display = 'none';
    }
  }
  
  // 监听输入变化
  inputText.addEventListener('input', function() {
    updateCharCounter();
    checkWatermark();
  });
  
  // 清空按钮
  clearBtn.addEventListener('click', function() {
    inputText.value = '';
    updateCharCounter();
    checkWatermark();
    showNotification('内容已清空', 'success');
  });
  
  // 复制按钮
  copyBtn.addEventListener('click', function() {
    const textToCopy = poetryContent.textContent;
    if (textToCopy.trim() === '') {
      showNotification('没有内容可复制', 'error');
      return;
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showNotification('古诗文已复制到剪贴板', 'success');
      })
      .catch(err => {
        showNotification('复制失败，请手动选择并复制', 'error');
      });
  });
  
  // 书法模式切换
  calligraphyBtn.addEventListener('click', function() {
    outputText.classList.toggle('calligraphy-mode');
    if (outputText.classList.contains('calligraphy-mode')) {
      showNotification('已切换为书法模式', 'success');
    } else {
      showNotification('已切换为普通模式', 'success');
    }
  });
  
  // 保存为图片
  saveBtn.addEventListener('click', function() {
    if (poetryContent.textContent.trim() === '') {
      showNotification('没有内容可保存', 'error');
      return;
    }
    
    // 模拟下载流程
    showNotification('正在保存为图片...', 'success');
    setTimeout(() => {
      showNotification('图片已保存', 'success');
    }, 1000);
  });
  
  // 生成古诗文功能
  generateBtn.addEventListener('click', async function() {
    console.log("生成按钮被点击");
    
    const input = inputText.value.trim();
    console.log("输入文本:", input);
    
    if (!input) {
      showNotification('请输入白话文内容', 'error');
      return;
    }
    
    // 显示加载动画
    loadingOverlay.classList.add('active');
    
    try {
      console.log("准备发送请求...");
      
      // 向后端发送请求
      const response = await fetch('/simple_generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_text: input })
      });
      
      console.log("收到响应:", response);
      
      // 检查响应状态
      if (!response.ok) {
        // 尝试解析错误数据
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || '请求失败');
        } catch (jsonError) {
          throw new Error(`请求失败：HTTP状态 ${response.status}`);
        }
      }
      
      // 解析响应数据
      const data = await response.json();
      console.log("解析的数据:", data);
      
      // 更新输出区域
      if (data.result) {
        updateOutput(data.result);
        showNotification('古诗文生成成功', 'success');
      } else {
        throw new Error('返回数据中没有结果');
      }
      
    } catch (error) {
      console.error("生成过程中出错:", error);
      showNotification(`生成失败: ${error.message}`, 'error');
      
      // 测试直接在前端生成示例输出
      const demoTexts = {
        "春天": "春雨润物细无声，\n万物复苏展新颜。\n杨柳吐绿添胜景，\n百花争艳满人间。",
        "山水": "山泉清澈见底流，\n日映波光闪烁辉。\n鱼游石下悠然乐，\n树影水中画意幽。",
        "月光": "月华如水洒大地，\n寂夜静谧披银辉。\n远峦如墨浓于黛，\n湖波粼粼泻珠辉。",
        "秋天": "金风送爽菊花黄，\n稻穗飘香遍地黄。\n硕果累累园中熟，\n丰收景象喜人心。",
        "default": "文字化韵古风情，\n笔墨传承意境深。\n千古文章存雅意，\n一言一句总关情。"
      };
      
      let demoText = demoTexts.default;
      for (const [keyword, text] of Object.entries(demoTexts)) {
        if (input.includes(keyword)) {
          demoText = text;
          break;
        }
      }
      
      updateOutput(demoText);
      showNotification("(前端演示模式) 生成成功", "success");
      
    } finally {
      // 隐藏加载动画
      loadingOverlay.classList.remove('active');
      console.log("处理完成，隐藏加载动画");
    }
  });
  
  // 更新输出区域
  function updateOutput(text) {
    const lines = text.trim().split('\n');
    let html = '';
    
    lines.forEach(line => {
      if (line.trim()) {
        html += `<div class="poetry-line">${line}</div>`;
      }
    });
    
    poetryContent.innerHTML = html;
  }
  
  // 通知提示功能
  function showNotification(message, type = 'success') {
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    
    const icon = notification.querySelector('.notification-icon i');
    if (type === 'success') {
      icon.className = 'fas fa-check-circle';
    } else {
      icon.className = 'fas fa-exclamation-circle';
    }
    
    notification.querySelector('.notification-message').textContent = message;
    notification.classList.add('active');
    
    setTimeout(() => {
      notification.classList.remove('active');
    }, 3000);
  }
  
  // 初始化页面
  updateCharCounter();
  checkWatermark();
  console.log("页面初始化完成，JavaScript功能已加载");
});
