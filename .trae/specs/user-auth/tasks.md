# Tasks
- [x] Task 1: 扩展 Zustand Store
  - [x] SubTask 1.1: 在 `src/store/useStore.ts` 中添加 `user` 状态及 `login`, `logout`, `register` 等 mock 认证方法。
- [x] Task 2: 创建登录和注册页面
  - [x] SubTask 2.1: 实现 `src/pages/Login.tsx` 页面 (邮箱/密码表单，使用 mock 登录逻辑)。
  - [x] SubTask 2.2: 实现 `src/pages/Register.tsx` 页面 (包含表单验证及 mock 注册逻辑)。
- [x] Task 3: 路由配置与守卫
  - [x] SubTask 3.1: 创建 `src/components/RequireAuth.tsx` 组件，实现未登录访问受保护页面时的重定向。
  - [x] SubTask 3.2: 在 `src/App.tsx` 中添加 `/login` 和 `/register` 路由。
  - [x] SubTask 3.3: 在 `src/App.tsx` 中使用 `RequireAuth` 包装 `/bookshelf` 路由。
- [x] Task 4: 更新 Layout 导航栏
  - [x] SubTask 4.1: 修改 `src/components/Layout.tsx`，未登录时显示“登录/注册”按钮，已登录时显示用户名和退出按钮。
  - [x] SubTask 4.2: 移动端底部导航也应在“书架”按钮点击时受登录状态保护或直接跳转。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1]
