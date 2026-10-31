# 用户名认证（服务端） - 任务清单

> 状态说明：`[ ]` 未完成，`[✅]` 已完成（已通过 CR 与自动化测试）
> 并行标记：`(P)` 表示与同组其他 `(P)` 任务无依赖，可并行

- [✅] 1. 修复 lint 配置
  - `biome.json` 中 `nursery.useTailwindSortedClasses` 改为当前 Biome 支持的 `useSortedClasses`，使 `pnpm check` 可以运行
  - 涉及文件：`biome.json`
  - 对应需求：非功能需求
- [ ] 2. 共享用户名规则模块
  - 新建 `packages/auth/src/username.ts`：长度常量、`USERNAME_PATTERN`、`isValidUsername`、`toPlaceholderEmail`、`PASSWORD_MIN_LENGTH`
  - 涉及文件：`packages/auth/src/username.ts`
  - 对应需求：FR-1
- [ ] 3. 启用 username 插件并关闭邮箱登录
  - `createAuth` 注册 `username()`（3–20 位、自定义 validator），设置 `minPasswordLength`、`disabledPaths: ["/sign-in/email"]`
  - 涉及文件：`packages/auth/src/index.ts`
  - 对应需求：FR-1、FR-2、FR-3
- [ ] 4. 数据库字段与迁移
  - [ ] 4.1 `pnpm auth:generate` 生成 `username` / `displayUsername`
  - [ ] 4.2 `pnpm db:generate` + `pnpm db:migrate`（`add_username`）
  - 涉及文件：`packages/db/prisma/schema/auth.prisma`、`packages/db/prisma/migrations/`
  - 对应需求：FR-1
- [ ] 5. 拆分 Hono 应用以便测试
  - 新建 `apps/server/src/app.ts`（`createApp`），`index.ts` 只负责 `serve()`
  - 涉及文件：`apps/server/src/app.ts`、`apps/server/src/index.ts`
  - 对应需求：FR-3、FR-4
- [ ] 6. 搭建后端测试并覆盖验收标准
  - [ ] 6.1 `apps/server` 引入 Vitest，添加 `test` 脚本与 `turbo.json` 的 `test` 任务
  - [ ] 6.2 编写注册 / 登录 / 关闭邮箱登录 / 不泄露密码 / `UNAUTHORIZED` 测试并通过
  - 涉及文件：`apps/server/vitest.config.ts`、`apps/server/src/__tests__/auth.test.ts`、`apps/server/package.json`、`turbo.json`
  - 对应需求：FR-1、FR-2、FR-3、FR-4、FR-5
