# App 登录注册 - 任务清单

> 状态说明：`[ ]` 未完成，`[✅]` 已完成（已通过 CR 与自动化测试）
> 并行标记：`(P)` 表示与同组其他 `(P)` 任务无依赖，可并行

- [ ] 1. 客户端接入 username 插件与错误映射
  - `auth-client.ts` 增加 `usernameClient()`；`package.json` 增加 `@ai-admin/auth`；新建 `lib/auth-errors.ts`
  - 涉及文件：`apps/native/lib/auth-client.ts`、`apps/native/lib/auth-errors.ts`、`apps/native/package.json`
  - 对应需求：FR-1、FR-2
- [ ] 2. 注册组件改为用户名注册 (P)
  - 涉及文件：`apps/native/components/sign-up.tsx`
  - 对应需求：FR-1、FR-4
- [ ] 3. 登录组件改为用户名登录 (P)
  - 涉及文件：`apps/native/components/sign-in.tsx`
  - 对应需求：FR-2、FR-4
- [ ] 4. 首页用户卡片显示用户名与退出登录 (P)
  - 涉及文件：`apps/native/app/(drawer)/index.tsx`
  - 对应需求：FR-3
- [ ] 5. 组件测试
  - [ ] 5.1 搭建 jest-expo + RNTL（配置、`test` 脚本）
  - [ ] 5.2 编写设计文档中的用例并通过
  - 涉及文件：`apps/native/jest.config.js`、`apps/native/__tests__/`、`apps/native/package.json`
  - 对应需求：FR-1 ~ FR-4
