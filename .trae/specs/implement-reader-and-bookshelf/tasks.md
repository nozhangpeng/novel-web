# Tasks
- [x] Task 1: 扩展 Mock 数据与辅助函数
  - [x] SubTask 1.1: 在 `src/mock/data.ts` 中添加更多章节数据（或生成占位数据），并添加 `getNextChapter` 和 `getPrevChapter` 的辅助函数。
- [x] Task 2: 完善 Zustand Store 逻辑
  - [x] SubTask 2.1: 确认 `useStore.ts` 中已有的 `updateReadProgress` 和 `updateReaderSettings` 可以正确持久化 `bookshelf` 与 `readerSettings`。
- [x] Task 3: 实现阅读页 (`src/pages/Reader.tsx`)
  - [x] SubTask 3.1: 构建沉浸式阅读主界面，包含正文渲染。
  - [x] SubTask 3.2: 实现阅读器控制栏，支持调整字体大小（`fontSize`）、行距（`lineHeight`）以及背景主题（`day`, `night`, `sepia`），并同步至全局 Store。
  - [x] SubTask 3.3: 实现侧边栏目录（章节列表），支持点击跳转对应章节。
  - [x] SubTask 3.4: 实现“上一章”、“下一章”的翻页功能，并在章节切换时调用 `updateReadProgress` 保存当前进度。
- [x] Task 4: 实现个人书架页 (`src/pages/Bookshelf.tsx`)
  - [x] SubTask 4.1: 从 Zustand Store 获取 `bookshelf` 列表，使用卡片网格或列表形式展示。
  - [x] SubTask 4.2: 显示书籍的封面、书名、作者，以及“上次阅读章节”（`lastReadChapterTitle`）。
  - [x] SubTask 4.3: 添加“继续阅读”按钮，点击后跳转至 `lastReadChapterId` 对应的阅读页。若无进度则默认跳转至第一章。
  - [x] SubTask 4.4: 添加“移出书架”功能（调用 `removeFromBookshelf`）。

# Task Dependencies
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
