# Reader and Bookshelf Spec

## Why
根据 PRD，产品最核心的功能在于为用户提供沉浸式的阅读体验以及个人书架管理。这两个功能模块将直接决定用户的留存率和使用满意度。需要实现阅读页的个性化设置、目录导航，以及书架的藏书管理和进度同步。

## What Changes
- 实现阅读页 (`src/pages/Reader.tsx`)，包含正文渲染、侧边栏目录、阅读设置面板（主题、字号、行距）以及上下章翻页功能。
- 实现个人书架页 (`src/pages/Bookshelf.tsx`)，展示用户加入书架的书籍，记录并展示最新阅读进度，提供继续阅读和移出书架的功能。
- 完善 `src/mock/data.ts` 中的章节数据，提供章节导航的工具函数。
- 确保 `src/store/useStore.ts` 能够正确持久化用户的阅读偏好（`readerSettings`）和阅读进度（`lastReadChapterId`）。

## Impact
- Affected specs: 阅读体验、用户书架管理。
- Affected code:
  - `src/pages/Reader.tsx`
  - `src/pages/Bookshelf.tsx`
  - `src/mock/data.ts`
  - `src/store/useStore.ts`
  - `src/components/Layout.tsx` (部分导航状态可能关联)

## ADDED Requirements
### Requirement: Reader Experience
系统应提供一个可定制的阅读器界面，允许用户切换阅读主题、调整字号和行距，并在翻页时自动记录进度。

#### Scenario: Success case
- **WHEN** 用户在阅读页点击“下一章”或更改主题
- **THEN** 系统加载下一章内容，自动将当前章节ID同步到书架进度中，并持久化保存主题设置。

### Requirement: Bookshelf Management
系统应允许注册用户在书架中管理收藏的小说，并能够一键继续阅读。

#### Scenario: Success case
- **WHEN** 用户在书架点击某本小说的“继续阅读”
- **THEN** 系统重定向至该小说上次阅读的章节。
- **WHEN** 用户点击“移出书架”
- **THEN** 系统从书架列表中移除该小说，并更新本地存储。
