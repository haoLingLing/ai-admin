# Web 登录注册与访问控制 - 任务清单

> 状态说明：`[ ]` 未完成，`[✅]` 已完成（已通过 CR 与自动化测试）
> 并行标记：`(P)` 表示与同组其他 `(P)` 任务无依赖，可并行

- [ ] 1. 客户端接入 username 插件与错误映射
  - `auth-client.ts` 注册 `usernameClient()`；`package.json` 增加 `@ai-admin/auth`；新建 `lib/auth-errors.ts`
  - 涉及文件：`apps/web/src/lib/auth-client.ts`、`apps/web/src/lib/auth-errors.ts`、`apps/web/package.json`
  - 对应需求：FR-1、FR-2
- [ ] 2. 注册表单改为用户名注册 (P)
  - 字段校验、占位邮箱、错误映射、中文文案、提交中状态
  - 涉及文件：`apps/web/src/components/sign-up-form.tsx`
  - 对应需求：FR-1、FR-6
- [ ] 3. 登录表单改为用户名登录 (P)
  - `signIn.username`，统一错误提示，中文文案
  - 涉及文件：`apps/web/src/components/sign-in-form.tsx`
  - 对应需求：FR-2、FR-6
- [ ] 4. 登录页会话校验与表单切换
  - `/login` 改 Server Component，已登录重定向；新建 `auth-forms.tsx` 默认显示登录
  - 涉及文件：`apps/web/src/app/login/page.tsx`、`apps/web/src/app/login/auth-forms.tsx`
  - 对应需求：FR-3
- [ ] 5. Dashboard 与用户菜单显示用户名、退出登录 (P)
  - [ ] 5.1 Dashboard 显示「欢迎，{用户名}」，会话获取失败按未登录处理
  - [ ] 5.2 用户菜单显示用户名、「退出登录」跳转 `/login`，去掉邮箱
  - 涉及文件：`apps/web/src/app/dashboard/page.tsx`、`apps/web/src/app/dashboard/dashboard.tsx`、`apps/web/src/components/user-menu.tsx`
  - 对应需求：FR-4、FR-5
- [ ] 6. Playwright E2E 覆盖验收标准
  - [ ] 6.1 搭建 Playwright（配置、`webServer` 启动 server + web、`test:e2e` 脚本）
  - [ ] 6.2 编写设计文档中的 8 个用例并通过
  - 涉及文件：`apps/web/playwright.config.ts`、`apps/web/e2e/auth.spec.ts`、`apps/web/package.json`、`turbo.json`
  - 对应需求：FR-1 ~ FR-6
