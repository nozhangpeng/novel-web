# 阅读器文字增强（排版 + 复制 + 高亮 + 笔记）设计（MVP）

## 目标

- 排版设置增强：加粗、对比度、边距、段间距、阅读宽度（窄/中/宽），全部持久化到 `readerSettings`。
- 文本选择与复制：允许正文选择文字，提供“复制”动作。
- 划线高亮：在同一段落内选中范围，高亮为默认黄色荧光笔，持久化并在正文中渲染。
- 笔记：基于高亮，支持为高亮添加笔记内容，并提供入口查看列表。
- 入口：底部菜单新增“笔记”按钮，打开左侧滑出面板展示高亮/笔记列表。

## 范围

### 本期包含

- 仅支持“段落内”选中（不允许跨段落）。
- 高亮颜色固定为黄色（夜间/护眼主题自动调透明度）。
- 笔记为文本备注（单条高亮最多一条备注）。
- 笔记面板支持：列表、点击跳转定位、删除（编辑可选，若不做则先仅新增/删除）。

### 本期不包含

- 跨段落高亮。
- 多色高亮。
- 高亮导出到 HTML（后续迭代）。
- 云同步。

## 现状与依赖

- Reader 渲染段落：`chapter.content.map(...)`，段落锚点已存在 `p-${chapterId}-${idx}`。
- 书签已实现段落级跳转，可复用定位逻辑（`?p=`）。
- Store 使用 `zustand/persist` 存 localStorage。

## 交互设计

### 选择菜单（正文内）

- 用户在正文选择文字后，弹出轻量浮层菜单：
  - 复制
  - 高亮
  - 写笔记
  - 取消（或点击空白关闭）
- 限制：仅当选区 anchor 与 focus 位于同一段落容器内时展示；否则提示“仅支持段落内选中”并关闭菜单。

### 笔记面板

- 底部菜单新增“笔记”按钮：
  - 短按：打开/关闭笔记面板（左侧滑出）。
- 面板列表项展示：
  - 章节标题
  - 高亮片段（截断）
  - 笔记内容（若有）
  - 时间
- 操作：
  - 点击：跳转章节并滚动到对应段落（可选：让该高亮短暂闪烁）
  - 删除：删除该条高亮/笔记

## 数据结构（Store）

### readerSettings 扩展

- `fontWeight: 'normal' | 'bold'`
- `contrast: 'low' | 'normal' | 'high'`
- `contentWidth: 'narrow' | 'medium' | 'wide'`
- `pagePadding: 'sm' | 'md' | 'lg'`
- `paragraphSpacing: 'sm' | 'md' | 'lg'`

### 高亮与笔记

- `highlightsByBookId: Record<string, TextHighlight[]>`

`TextHighlight`：
- `id: string`
- `bookId: string`
- `chapterId: string`
- `paragraphIndex: number`
- `startOffset: number`
- `endOffset: number`
- `text: string`
- `color: 'yellow'`
- `note?: string`
- `createdAt: number`

Actions：
- `addHighlight(payload)`
- `removeHighlight(bookId, highlightId)`
- `updateHighlightNote(bookId, highlightId, note)`（若本期不做编辑，可先实现为内部使用）

## offset 计算与稳定性

- 选区定位使用“段落内字符 offset”：
  - 对 `paragraphEl` 下的 text nodes 做 TreeWalker 遍历
  - 将 selection 的 startContainer/endContainer（Text）映射为“段落内累计偏移”
- 选区文本保留 `text` 字段用于列表展示与校验。
- 若段落内容变化导致范围越界：
  - 渲染时进行 clamp（0..len）
  - 若 start/end 无效则跳过该高亮。

## 高亮渲染策略（当前章节）

- 对每个段落取得该段落的 highlights 列表：
  - 按 startOffset 排序
  - 合并重叠区间（MVP：合并为最大区间）
  - 切片渲染 `before + <mark> + after`
- `<mark>` 使用 Tailwind 类实现黄色荧光笔效果，并随主题调整透明度。

## 验收标准

- 设置面板可调整：加粗/对比度/边距/段间距/阅读宽度，并在刷新后保持。
- 正文可选择文本，菜单可复制到剪贴板。
- 选中文字点击“高亮”后，刷新仍保持高亮显示。
- 选中文字点击“写笔记”可输入并保存，笔记面板可查看并点击跳转。

