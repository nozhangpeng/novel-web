import { Book, Chapter } from '../mock/data';

export const exportBookToHtml = (book: Book, chapters: Chapter[]) => {
  const css = `
    :root {
        --bg-color: #f8f9fa;
        --text-color: #333;
        --container-bg: #fff;
        --border-color: #eee;
        --primary-color: #007bff;
    }
    [data-theme="dark"] {
        --bg-color: #121212;
        --text-color: #e0e0e0;
        --container-bg: #1e1e1e;
        --border-color: #333;
        --primary-color: #4da3ff;
    }
    [data-theme="sepia"] {
        --bg-color: #f4ecd8;
        --text-color: #5b4636;
        --container-bg: #fdf6e3;
        --border-color: #e6d5b8;
        --primary-color: #8b6b4a;
    }
    body {
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        background-color: var(--bg-color);
        color: var(--text-color);
        line-height: 1.8;
        margin: 0;
        padding: 0;
        display: flex;
        transition: all 0.3s ease;
    }
    .sidebar {
        width: 250px;
        background: var(--container-bg);
        border-right: 1px solid var(--border-color);
        height: 100vh;
        position: fixed;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
        box-shadow: 2px 0 10px rgba(0,0,0,0.02);
        z-index: 100;
    }
    .sidebar h2 {
        font-size: 1.2rem;
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--primary-color);
    }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar li {
        padding: 10px 0;
        border-bottom: 1px dashed var(--border-color);
        cursor: pointer;
        color: #666;
        transition: color 0.2s;
    }
    .sidebar li:hover { color: var(--primary-color); font-weight: bold; }
    .sidebar a { text-decoration: none; color: inherit; display: block; }
    .main-content {
        margin-left: 250px;
        width: calc(100% - 250px);
        padding: 40px;
        box-sizing: border-box;
    }
    .controls {
        position: fixed;
        top: 20px;
        right: 40px;
        background: var(--container-bg);
        padding: 10px 20px;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        gap: 10px;
        z-index: 100;
    }
    .controls button {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 5px 15px;
        border-radius: 15px;
        cursor: pointer;
    }
    .container {
        max-width: 800px;
        margin: 0 auto;
        background: var(--container-bg);
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .chapter { margin-bottom: 60px; scroll-margin-top: 20px; }
    .chapter-title {
        font-size: 1.8rem;
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 20px;
    }
    .content p {
        font-size: 1.1rem;
        text-indent: 2em;
        margin-bottom: 15px;
    }
    @media (max-width: 768px) {
        .sidebar { display: none; }
        .main-content { margin-left: 0; width: 100%; padding: 20px 10px; }
        .container { padding: 20px; }
        .controls { top: auto; bottom: 20px; right: 50%; transform: translateX(50%); }
    }
  `;

  const tocHtml = chapters.map(c => `<li><a href="#${c.id}">${c.title}</a></li>`).join('');
  
  const contentHtml = chapters.map(c => `
    <div class="chapter" id="${c.id}">
      <h1 class="chapter-title">${c.title}</h1>
      <div class="content">
        ${c.content.map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${book.title} - 导出阅读</title>
    <style>${css}</style>
</head>
<body>
    <div class="sidebar">
        <h2>${book.title}</h2>
        <ul>${tocHtml}</ul>
        <div style="margin-top:20px; font-size: 0.8rem; color:#888;">
            导出时间: ${new Date().toISOString().split('T')[0]}
        </div>
    </div>
    
    <div class="controls">
        <button onclick="changeTheme('light')">默认</button>
        <button onclick="changeTheme('sepia')">护眼</button>
        <button onclick="changeTheme('dark')">夜间</button>
        <button onclick="changeFontSize(1)">A+</button>
        <button onclick="changeFontSize(-1)">A-</button>
    </div>

    <div class="main-content">
        <div class="container">
            ${contentHtml}
        </div>
    </div>

    <script>
        let currentSize = 1.1;
        function changeTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
        function changeFontSize(step) {
            currentSize += step * 0.1;
            if(currentSize < 0.8) currentSize = 0.8;
            if(currentSize > 2.0) currentSize = 2.0;
            document.querySelectorAll('.content p').forEach(p => {
                p.style.fontSize = currentSize + 'rem';
            });
        }
    </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
