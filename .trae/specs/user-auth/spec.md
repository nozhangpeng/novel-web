# User Authentication Spec

## Why
根据 PRD，产品需要区分访客和注册用户。访客仅有基础浏览权限，而注册用户可以加入书架、记录阅读进度和互动。因此需要实现登录和注册页面，以支持用户身份认证。

## What Changes
- 添加全局用户状态管理 (Zustand)。
- 实现登录页面 `/login`。
- 实现注册页面 `/register`。
- 更新导航栏 (Layout)，根据登录状态显示“登录/注册”入口或用户头像/退出入口。
- 实现路由守卫，未登录用户访问 `/bookshelf`（书架）等受保护页面时重定向至登录页。

## Impact
- Affected specs: 导航栏状态、路由控制、权限校验。
- Affected code: 
  - `src/store/useStore.ts`
  - `src/components/Layout.tsx`
  - `src/App.tsx`
  - 新增 `src/pages/Login.tsx`
  - 新增 `src/pages/Register.tsx`
  - 新增 `src/components/RequireAuth.tsx`

## ADDED Requirements
### Requirement: User Authentication
系统应提供用户认证功能，支持访客浏览及注册用户登录。

#### Scenario: Success case
- **WHEN** 用户点击导航栏“登录”按钮并提交正确的凭证
- **THEN** 系统重定向至首页，并显示已登录状态及用户菜单

#### Scenario: Unauthorized Access
- **WHEN** 访客尝试访问受保护路由如书架 (`/bookshelf`)
- **THEN** 系统重定向至登录页

## MODIFIED Requirements
### Requirement: Layout Navigation
导航栏需要根据用户状态动态调整展示内容。
