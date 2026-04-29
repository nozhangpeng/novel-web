# 阅读器书签/段落标记设计（段落级）

## 目标

- 在阅读器内支持“段落级书签”。
- 支持一键添加书签（基于当前段落）。
- 支持书签列表（左侧滑出面板）。
- 支持点击书签跳转到对应章节并定位到段落。
- 被书签命中的段落在正文中使用浅色底色高亮（随主题适配）。

## 范围

### 本期包含

- 书签数据结构与本地持久化（zustand persist / localStorage）。
- 阅读页内“当前段落”识别（优先 IntersectionObserver，必要时降级为中心点计算）。
- 底部菜单新增“书签”入口：
  - 短按：打开/关闭书签面板
  - 长按：对当前段落执行 toggle bookmark，并给轻提示
- 书签面板（左侧滑出）：
  - 按时间倒序展示
  - 删除书签
  - 点击跳转并定位
- 正文段落高亮样式（浅色底色，随主题适配）。

### 本期不包含

- 选中文字加书签/划线/批注。
- 书签备注、标签筛选。
- 云端同步。
- 复杂的仿真翻页手势动画（本期仅保证书签在现有翻页模式下可用）。

## 现状与依赖

- 阅读器页面：[Reader.tsx](file:///workspace/src/pages/Reader.tsx)
- 全局 store（zustand persist）：[useStore.ts](file:///workspace/src/store/useStore.ts)
- 路由形态：`/read/:id/:chapterId`
- 阅读历史与书架进度已存在，可复用其持久化能力。

## 交互设计

### 入口与操作

- 阅读器底部菜单新增“书签”按钮：
  - 短按：打开/关闭书签面板（左侧滑出）
  - 长按（建议 450ms）：对“当前段落”执行 toggle bookmark
    - 若该段落已有书签：长按则取消
    - 若没有：长按则新增
  - 轻提示：建议使用非阻塞 toast/轻提示（避免 `alert`）

### 书签面板

- 形态：与目录（TOC）相同的左侧滑出面板（可复用布局/遮罩逻辑）。
- 列表排序：`createdAt` 倒序。
- 列表项展示：
  - 章节标题（chapter title）
  - 段落摘要（excerpt：段落前 20-30 字）
  - 时间（可选：仅显示日期/时间）
- 操作：
  - 点击：跳转到章节并定位到段落
  - 删除：按钮删除（滑动删除不做）

### 正文高亮

- 被书签命中的段落增加浅色底色高亮。
- 高亮颜色按阅读主题适配（day/night/sepia/green）。

## “当前段落”判定设计

### 段落锚点

- 渲染章节正文时，每个段落容器具有稳定 id：
  - `id="p-${chapterId}-${idx}"`
- idx 为段落序号（0-based），用于持久化定位。

### 主方案：IntersectionObserver

- 在阅读内容容器内观察段落节点。
- 选取当前“可见比例最高”或“最接近容器中心”的段落作为 `activeParagraphIndex`。
- 在字体/行高变化时，需要重新初始化观察（依赖设置变化）。

### 降级方案：中心点距离

- 若 IntersectionObserver 不可用或表现不稳定：
  - 在容器滚动时，计算所有段落 `getBoundingClientRect()` 与 viewport 中心的距离
  - 取距离最小者作为 `activeParagraphIndex`
- 为性能考虑：使用 `requestAnimationFrame` 或节流（100ms）控制计算频率。

## 数据结构与持久化

### Store 字段

- `bookmarksByBookId: Record<string, Bookmark[]>`

### Bookmark 结构

- `id: string`
- `bookId: string`
- `chapterId: string`
- `paragraphIndex: number`
- `excerpt: string`
- `createdAt: number`

### Store Actions

- `addBookmark(bookId, chapterId, paragraphIndex, excerpt)`
- `removeBookmark(bookId, bookmarkId)`
- `toggleBookmark(bookId, chapterId, paragraphIndex, excerpt)`
- `getBookmarks(bookId)`（selector 形式即可）
- `isParagraphBookmarked(bookId, chapterId, paragraphIndex)`（selector 形式即可）

## 跳转与定位

### 点击书签

1. `navigate(/read/:bookId/:chapterId)`
2. 在 Reader 加载并渲染段落后执行：
   - `document.getElementById(p-${chapterId}-${paragraphIndex}).scrollIntoView({ block: 'center' })`
3. 为避免重复滚动：
   - 使用 `pendingScrollTarget`（组件 state 或 store 临时字段）在成功定位后清空。

## 错误处理

- 若书签对应章节/段落不存在（文本变更或导入异常）：
  - 给轻提示“定位失败，已跳转到章节顶部”
  - 不崩溃，不阻塞阅读。

## 测试与验收

- 能在任意章节长按添加书签，列表出现，刷新后仍存在。
- 点击书签可跳转并定位到对应段落。
- 被书签命中的段落显示高亮底色。
- 切换主题/字号/行高后仍能正常识别当前段落并添加书签（定位误差可接受）。

