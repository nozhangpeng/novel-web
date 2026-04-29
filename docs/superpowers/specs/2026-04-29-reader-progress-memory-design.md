# 阅读器进度细化与自动记忆（段落级）设计（MVP）

## 目标

- 提供章节内进度条（底部常驻浮条）：显示本章进度百分比，并支持点击跳转到对应段落。
- 实现“实时自动记忆到段落/页”：对同一本书，无论用户从哪里进入阅读页，都自动跳转到最近记忆点（覆盖用户手动打开的章节）。
- 提供阅读时长统计（本次 + 累计）：在阅读器控制层内展示。
- 兼容滚动模式与横向分页模式（slide/cover/simulate）。

## 范围

### 本期包含

- 段落级进度与记忆（复用 Reader 的 `activeParagraphIndex` 能力）。
- 底部常驻进度浮条（百分比 + 可点击跳转）。
- 会话阅读时长（页面可见时计时，离开或切章结算到累计）。
- 数据本地持久化（zustand persist / localStorage）。

### 本期不包含

- 精确“像素级”进度条、拖动进度条连续滚动。
- “当前页/总页”的页码体系（横向 columns 不稳定，成本高）。
- 目录增强、文字增强（放到后续迭代）。
- 云同步。

## 现状与依赖

- Reader 已有段落识别：`activeParagraphIndex` 通过 IntersectionObserver 维护，段落锚点 `p-${chapterId}-${idx}` 已存在。[Reader.tsx](file:///workspace/src/pages/Reader.tsx)
- 已有段落跳转能力：使用 `?p=` 并在章节加载后 scrollIntoView。
- Store 使用 `zustand/persist` 存 localStorage。[useStore.ts](file:///workspace/src/store/useStore.ts)

## 关键策略（用户确认）

- **覆盖式恢复**：只要进入同一本书的阅读页，强制跳到最近记忆点（章节 + 段落），忽略 URL 内手动指定的章节。

## 数据结构（Store）

### 阅读位置

- `readingPositionByBookId: Record<string, ReadingPosition>`
- `ReadingPosition`：
  - `bookId: string`
  - `chapterId: string`
  - `paragraphIndex: number`
  - `updatedAt: number`

Actions：
- `setReadingPosition(bookId, chapterId, paragraphIndex)`
- `clearReadingPosition(bookId)`（可选，后续在书籍详情/书架提供清除）

### 阅读时长

- `readingStatsByBookId: Record<string, ReadingStats>`
- `ReadingStats`：
  - `bookId: string`
  - `totalMs: number`
  - `updatedAt: number`

Actions：
- `addReadingTime(bookId, deltaMs)`

## 进度计算

### 章节内进度（MVP）

- `chapterProgress = (activeParagraphIndex + 1) / max(1, chapter.content.length)`
- 显示：百分比（四舍五入到整数）。

### 点击跳转（按百分比映射段落）

- 点击进度条位置 `x`，得到 `ratio = x / width`，映射到：
  - `targetParagraphIndex = clamp(round((len - 1) * ratio))`
- 使用现有跳转机制：在当前章节 URL 上附加 `?p=targetParagraphIndex` 或直接设置 pendingScrollTarget。

## 自动记忆（段落级）

### 写入策略（实时自动）

- 当 `activeParagraphIndex` 变化时，节流写入 `setReadingPosition`（建议 1500ms）。
- 切章、页面隐藏（visibilitychange -> hidden）、组件卸载时强制写入一次。

### 读取与覆盖式恢复

- 进入 Reader 后，若 store 中存在该书 `readingPositionByBookId[bookId]`：
  - 若当前 URL 章节与记忆章节不同：立即 `navigate(/read/:bookId/:mem.chapterId?p=:mem.paragraphIndex, replace: true)`
  - 若章节相同：在本章渲染后定位到段落（现有 pendingScrollTarget 逻辑复用）
- 避免循环跳转：若当前 URL 已是目标 chapterId 且 `p` 与目标一致，则不再 navigate。

## 阅读时长统计

### 计时策略（本次 + 累计）

- Reader 维护会话变量：
  - `sessionVisibleStart = now()`（仅在页面可见时开始）
  - `sessionMs += now - sessionVisibleStart`（页面隐藏/卸载/切章时结算）
- `visibilitychange`：
  - `hidden`：结算一次
  - `visible`：重新开始计时
- 结算时写入：`addReadingTime(bookId, deltaMs)` 同时更新本地 `sessionMs` 展示。

### 展示位置

- 控制层（呼出菜单）里显示：
  - 本次阅读：`sessionMs`
  - 累计阅读：`totalMs`

## UI 变更

### 底部常驻进度浮条

- 位于阅读器底部（避开菜单区域与 safe-area），样式：
  - 细条进度条（填充比例）
  - 右侧显示百分比（可选）
- 交互：
  - 点击进度条：跳转到该章节对应段落（MVP）

## 错误处理

- 若段落长度为 0：进度固定为 0%，跳转无操作。
- 若记忆点段落不存在（段落数变化）：跳转到章节顶部并更新记忆点为 0。

## 验收标准

- 任意进入同一本书阅读页，会自动跳到最近一次阅读的章节+段落。
- 阅读过程中进度条百分比能随阅读推进变化。
- 点击进度条能跳到章节对应位置（段落级）。
- 控制层显示本次与累计阅读时长，且切后台不继续累计。

