# 阅读器目录增强（MVP）设计

## 目标

- 目录侧栏支持章节搜索。
- 目录展示“已读/未读/读到段落”状态：
  - 已读/未读以书架 `lastReadChapterId` 为主（章节级）。
  - “读到段落”以 `readingPositionByBookId` 为辅（段落级）。
- 一键跳转：
  - 跳最新章
  - 跳读到位置（章节 + 段落）
  - 跳第一章未读
- 章节批量缓存：
  - 将章节内容写入 IndexedDB，支持离线读取（对 mock 数据同样可用，面向未来数据源）。

## 范围

### 本期包含

- Reader 内 TOC Sidebar UI 增强（搜索框 + 快捷跳转按钮 + 状态标记）。
- 新增章节缓存工具（idb-keyval）与 Reader 加载优先使用缓存。
- 缓存状态提示与简单进度（本期以“正在缓存/已缓存”提示为主）。

### 本期不包含

- 云端同步缓存。
- 目录分组（卷/部）。
- 缓存容量管理（清理策略、LRU）。
- 书籍详情页缓存入口（本期入口放在阅读器目录侧栏）。

## 数据来源与现状

- 远程/站内书：章节通过 `getChaptersByBookId(bookId)` 获取（mock 数据）。
- 本地书：章节通过 `getLocalChapters(bookId)` 从 IndexedDB 获取。
- 书架进度：`bookshelf[].lastReadChapterId`。
- 段落记忆：`readingPositionByBookId[bookId]`（段落级）。

## 状态判定规则（用户确认：两者结合）

### 章节级已读/未读

- 若书在书架中且存在 `lastReadChapterId`：
  - chapterIndex < lastReadIndex → 已读
  - chapterIndex = lastReadIndex → 当前/阅读中
  - chapterIndex > lastReadIndex → 未读
- 若不在书架或 lastReadChapterId 为空：默认均未读。

### 段落级读到位置

- 若存在 `readingPositionByBookId[bookId]`：
  - 在该章节条目右侧展示 `p{paragraphIndex+1}/{段落总数}`（段落总数取章节 content length）
  - “跳读到”按钮跳到 `/read/:bookId/:chapterId?p=:paragraphIndex`

### 最新章

- 最新章 = `chapters[chapters.length - 1]`（不受目录正序/逆序显示影响）。

## 交互与 UI

### TOC Sidebar 顶部区域

- 搜索框：输入即过滤章节标题（包含匹配）。
- 快捷按钮：
  - 最新：跳转到最新章
  - 读到：跳转到 readingPosition 位置（无则禁用/隐藏）
  - 未读：跳转到第一个未读章节（无则跳最新）
- 维持现有正序/逆序切换。

### 章节条目展示

- 维持当前章节高亮。
- 增加状态信息（轻量，避免拥挤）：
  - 已读：小标记（如“已读”/浅色点）
  - 未读：小标记（如“未读”/空心点）
  - 读到：仅对 readingPosition 所在章节显示段落位置

### 章节缓存入口

- 入口位置：目录侧栏顶部右侧按钮（如“缓存/已缓存/更新缓存”）。
- 行为：
  - 点击缓存：将当前书全部章节写入 IndexedDB 的缓存 key。
  - 成功后给 toast “已缓存 N 章”。
  - 若已缓存：按钮显示“已缓存”，再次点击可“更新缓存”（覆盖写入）。

## 章节缓存设计（IndexedDB）

### Key 规则

- 远程/站内书：`cache_chapters_${bookId}`
- 本地书：仍使用 `chapters_${bookId}`（不额外缓存）

### API（utils）

- `getCachedChapters(bookId): Promise<Chapter[] | null>`
- `setCachedChapters(bookId, chapters): Promise<void>`
- `removeCachedChapters(bookId): Promise<void>`

### Reader 加载策略

- 非本地书：
  1. 先尝试 `getCachedChapters(id)`，若存在且非空 → 使用缓存章节
  2. 否则 fallback 到 `getChaptersByBookId(id)`
- 本地书不变。

## 验收标准

- 目录侧栏可输入关键字过滤章节。
- 目录可显示已读/未读，且“未读”按钮能跳到第一章未读。
- “最新”按钮能跳到最新章。
- “读到”按钮能跳到记忆段落位置，并在目录中显示读到段落信息。
- “缓存”能将章节写入 IndexedDB；刷新后 Reader 仍可从缓存读到章节。

