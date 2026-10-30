# App 登录注册 - 技术设计

## 概述
native `authClient` 增加 `usernameClient()`；改写 `components/sign-in.tsx`、`components/sign-up.tsx` 为用户名表单，规则复用 `@ai-admin/auth/username`；首页用户卡片显示用户名、去掉邮箱；错误码映射与 web 保持同一套文案。用 jest-expo + React Native Testing Library 做组件测试（mock `authClient`）。

## 涉及端
App（`apps/native`）。

## 文件改动

| 文件 | 改动 |
| --- | --- |
| `apps/native/package.json` | 增加 `@ai-admin/auth: workspace:*`；测试依赖 `jest-expo`、`@testing-library/react-native`、`jest` |
| `apps/native/lib/auth-client.ts` | `plugins: [expoClient(...), usernameClient()]` |
| `apps/native/lib/auth-errors.ts`（新） | 与 web 相同的错误码 → 中文文案映射 |
| `apps/native/components/sign-up.tsx` | 字段：用户名、密码；`signUp.email({ email: toPlaceholderEmail(u), name: u, username: u, password })` |
| `apps/native/components/sign-in.tsx` | 字段：用户名、密码；`signIn.username` |
| `apps/native/app/(drawer)/index.tsx` | 用户卡片：「欢迎，{displayUsername ?? username}」，去掉邮箱，按钮「退出登录」 |

（假设）错误映射在 web / native 各一份；如后续出现第三个客户端，再提到 `packages/auth/src/username.ts`。

## 校验与错误映射
与 `02-web-auth/design.md` 相同（Zod schema、错误码表、文案）。

## 前端 / 交互
- HeroUI Native `TextField` + `Label` + `Input`；用户名框 `autoCapitalize="none"`、`autoCorrect={false}`、`textContentType="username"`。
- 提交中：按钮 `isDisabled` 且显示「提交中...」。
- toast：成功「登录成功」/「注册成功」，失败按错误映射。
- 登录 / 注册成功后 `queryClient.refetchQueries()`（沿用现有逻辑）；退出后 `queryClient.invalidateQueries()`。

## 异常处理
- 网络异常：toast「网络异常，请稍后重试」。

## 测试策略
jest-expo + RNTL，mock `@/lib/auth-client` 和 `heroui-native` 的 `useToast`：
1. 注册：非法用户名显示错误，不调用 `signUp.email`。
2. 注册：合法输入调用 `signUp.email`，参数含占位邮箱（小写）与 `username`。
3. 注册：`USERNAME_IS_ALREADY_TAKEN` → toast「该用户名已被注册」。
4. 登录：空输入提示必填，不调用接口。
5. 登录：调用 `signIn.username`；失败 toast「用户名或密码错误」。
6. 错误映射函数单测。

> Maestro 真机 E2E 需要模拟器与 Expo 开发构建，本次不做（假设）；如环境具备再补充。
