# ai-admin 项目架构

基于 [Better-T-Stack](https://better-t-stack.dev)（见 `bts.jsonc`）生成的 **pnpm + Turborepo monorepo**，全栈 TypeScript，端到端类型安全。

## 技术栈

| 层 | 技术 |
| --- | --- |
| Monorepo | pnpm workspaces（`catalog:` 统一依赖版本）+ Turborepo |
| Web 前端 | Next.js 16（App Router、`typedRoutes`、React Compiler）+ React 19 + Tailwind v4 + shadcn/ui（Base UI） |
| 移动端 | Expo 58 + Expo Router + React Native 0.88 + HeroUI Native + Uniwind（Tailwind for RN） |
| 后端 | Hono（Node 运行时，`@hono/node-server`），开发用 `tsx watch`，构建用 `tsdown` |
| API | tRPC v11 + TanStack Query（`@trpc/tanstack-react-query`） |
| 认证 | Better Auth（邮箱密码 + `@better-auth/expo` 插件） |
| 数据库 | PostgreSQL + Prisma 7（`prisma-client` 生成器，`@prisma/adapter-pg` 驱动适配器） |
| 表单 / 校验 | TanStack Form + Zod 4 |
| 环境变量 | Varlock（每个应用的 `.env.schema` → 生成类型化的 `src/env.ts`） |
| 文档站 | Fumadocs（MDX，含 `llms.txt` / markdown 内容协商） |
| 代码质量 | Biome + Ultracite（tab 缩进、双引号） |

## 目录结构

```
ai-admin/
├── apps/
│   ├── server/            # Hono API 服务（:3000）
│   │   └── src/
│   │       ├── index.ts       # Hono 入口：CORS、/api/auth/*（Better Auth）、/trpc/*（tRPC）
│   │       ├── services.ts    # 组装根：用 ENV 创建 db（Prisma）与 auth（Better Auth）单例
│   │       ├── context.ts     # tRPC context：从请求头解析 session，注入 { db, session }
│   │       └── env*.ts        # Varlock 生成的环境变量访问器
│   ├── web/               # Next.js 管理后台（:3001）
│   │   └── src/
│   │       ├── app/           # 路由：/、/login、/dashboard（服务端校验 session 后重定向）
│   │       ├── components/    # 应用级组件：providers、header、登录/注册表单、主题切换
│   │       ├── lib/auth-client.ts  # better-auth/react 客户端
│   │       └── utils/trpc.ts  # tRPC + QueryClient（全局错误 toast，cookie 凭证）
│   ├── native/            # Expo 移动端（scheme: ai-admin）
│   │   ├── app/               # Expo Router：(drawer)/(tabs) 布局、modal、+not-found
│   │   ├── components/        # sign-in / sign-up / theme-toggle 等
│   │   ├── contexts/          # 主题 context
│   │   ├── lib/auth-client.ts # expoClient + SecureStore 持久化 session
│   │   └── utils/trpc.ts      # 原生端手动转发 Cookie 头，web 端用 credentials: include
│   └── fumadocs/          # 文档站（:4000，独立依赖版本与 biome 配置）
│       ├── content/docs/      # MDX 文档内容
│       └── src/               # app 路由、搜索 API、llms.txt、OG 图片、proxy.ts
├── packages/
│   ├── api/               # @ai-admin/api：tRPC 实例、publicProcedure / protectedProcedure、appRouter
│   │   └── src/routers/index.ts   # 所有业务路由在此汇总，导出 AppRouter 类型
│   ├── auth/              # @ai-admin/auth：createAuth(env, db) 工厂 + Session 类型
│   ├── db/                # @ai-admin/db：createPrismaClient(env) 工厂 + Database 类型
│   │   └── prisma/
│   │       ├── schema/        # 多文件 schema：schema.prisma（generator/datasource）、auth.prisma（Better Auth 表）
│   │       ├── generated/     # Prisma Client 生成产物（勿手改）
│   │       └── migrations/
│   ├── ui/                # @ai-admin/ui：共享 shadcn/ui 组件、globals.css 设计令牌、cn 工具
│   └── config/            # @ai-admin/config：共享 tsconfig.base.json
├── .agents/skills/        # AI agent skills（.claude/skills 为指向此处的软链接）
├── turbo.json             # 任务管线与 globalEnv
├── pnpm-workspace.yaml    # workspace、catalog 版本、overrides
└── biome.json             # Ultracite 规则
```

## 架构要点

- **依赖方向**：`apps/*` → `packages/api` → `packages/auth` → `packages/db`。`packages/*` 不读取环境变量，只导出**工厂函数**（`createPrismaClient`、`createAuth`）和类型；由 `apps/server/src/services.ts` 传入 `ENV` 统一组装。新增共享包时保持这种依赖注入方式。
- **内部包无构建步骤**：`packages/*` 的 `exports` 直接指向 `src/*.ts`，由消费方编译。导入时使用子路径，例如 `@ai-admin/api/routers/index`、`@ai-admin/ui/components/button`（不要建 barrel 文件）。
- **请求链路**：客户端（web / native）→ `httpBatchLink` → Hono `/trpc/*` → `createContext`（`auth.api.getSession` 读 cookie）→ `appRouter` 中的 procedure → `ctx.db`（Prisma）。认证请求走 Hono `/api/auth/*` 直接交给 `auth.handler`。
- **类型共享**：客户端只 `import type { AppRouter }`，不打包服务端代码。
- **鉴权**：需要登录的接口用 `protectedProcedure`（无 session 抛 `UNAUTHORIZED`，之后 `ctx.session` 非空）。Web 页面在 Server Component 中用 `authClient.getSession({ fetchOptions: { headers } })` 校验并 `redirect`。
- **Cookie**：Better Auth cookie 为 `sameSite: none; secure; httpOnly`，web 跨域请求需 `credentials: "include"`，服务端 `CORS_ORIGIN` 必须匹配 web 源。移动端 session 存在 SecureStore，通过 `authClient.getCookie()` 手动带上。
- **UI**：共享基础组件放 `packages/ui`（`npx shadcn@latest add <c> -c packages/ui`）；仅 web 使用的业务块放 `apps/web/src/components`。设计令牌在 `packages/ui/src/styles/globals.css`。移动端使用 HeroUI Native，不共享 `packages/ui`。

## 环境变量

- 每个应用在 `.env.schema` 声明变量（类型、是否敏感），Varlock 生成 `src/env.ts`；改 schema 后运行 `pnpm run env:generate`。代码中使用生成的 `ENV`，不要直接读 `process.env`（客户端公开变量除外）。
- `packages/db/.env.schema` 从 `apps/server` 引入 `DATABASE_*`。
- server：`DATABASE_URL`、`BETTER_AUTH_SECRET`、`BETTER_AUTH_URL`、`CORS_ORIGIN`；web：`NEXT_PUBLIC_SERVER_URL`；native：`EXPO_PUBLIC_SERVER_URL`。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` / `dev:web` / `dev:server` / `dev:native` | 启动全部或单个应用 |
| `pnpm db:generate` | 生成 Prisma Client（改 schema 后、类型检查/构建前必须执行） |
| `pnpm db:push` / `db:migrate` / `db:studio` | 同步 schema / 迁移 / 打开 Studio |
| `pnpm auth:generate` | 修改 Better Auth 配置后重新生成 `auth.prisma` |
| `pnpm check-types` | 全仓类型检查 |
| `pnpm check` / `pnpm fix` | Ultracite 检查 / 自动修复 |

## 开发约定

- 新增 API：在 `packages/api/src/routers/` 下建子路由，并合并进 `routers/index.ts` 的 `appRouter`；输入用 Zod 校验。
- 新增数据表：在 `packages/db/prisma/schema/` 新建 `.prisma` 文件，然后 `db:generate` + `db:migrate`。不要手改 `auth.prisma`（由 `auth:generate` 生成）和 `prisma/generated/`。
- Next.js 版本较新，写 web 代码前先读 `apps/web/AGENTS.md` 的提示及 `node_modules/next/dist/docs/`。

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm exec ultracite fix`
- **Check for issues**: `pnpm exec ultracite check`
- **Diagnose setup**: `pnpm exec ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome will catch most mechanical issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm exec ultracite fix` before committing to ensure compliance.

---

## 开发经验沉淀

- [2026-10-30][01-username-auth-server] `ultracite fix` 的 `noGlobalDirnameFilename` 会把 CommonJS 配置（如 `apps/native/metro.config.js`）里的 `__dirname` 改成 `import.meta.dirname`，导致 Metro 无法加载 → CJS 文件不支持 `import.meta` → 保留 `__dirname` 并加 `// biome-ignore lint/correctness/noGlobalDirnameFilename: <原因>`；批量 `pnpm fix` 后检查 `.js` 配置文件的非空白改动。
- [2026-10-30][01-username-auth-server] 模板代码本身有约 60 个 Biome 报错（`noJsxPropsBind`、`noNestedTernary` 等），`pnpm check` 全仓不会通过 → 历史遗留 → 自检时用 `pnpm exec biome check <改动的文件>`，要求改动过的文件零报错。
- [2026-10-30][01-username-auth-server] `biome.json` 已排除 `apps/fumadocs`（自带根配置，嵌套会报错）、`.agents`（第三方 skill 脚本）和 Varlock 生成的 `**/src/env.ts`，不要对它们跑 `ultracite fix`。
- [2026-10-30][01-username-auth-server] `codex review --commit <SHA>` 不能同时传自定义提示词（报 `cannot be used with '[PROMPT]'`）→ CLI 限制 → 需要自定义审查说明时用 `codex exec --sandbox read-only -o <输出文件> "<提示词，内含 git show/diff 指令>"`。
