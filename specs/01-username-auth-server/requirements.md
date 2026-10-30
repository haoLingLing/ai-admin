# 用户名认证（服务端） - 需求说明

> 来源：docs/需求.md § 3.1、3.2、3.4、6、7

## 背景与目标
现有 Better Auth 只开启了邮箱密码登录。需要在服务端启用用户名登录，作为 web 和 App 共用的认证基础。

## 用户故事
- 作为新用户，我希望用用户名和密码注册，以便不需要邮箱也能使用后台。
- 作为已注册用户，我希望用用户名和密码登录，以便访问后台。
- 作为开发者，我希望需要登录的接口在未登录时统一返回 `UNAUTHORIZED`。

## 功能需求

### FR-1 用户名注册
服务端接受 `signUp.email` 请求时附带 `username`，按规则校验并保存。

**验收标准**
- WHEN 用户名 3–20 位且只含字母、数字、下划线 THEN 系统 SHALL 创建用户并返回会话
- WHEN 用户名不满足长度或字符规则 THEN 系统 SHALL 拒绝注册
- WHEN 用户名与已有用户名仅大小写不同 THEN 系统 SHALL 返回 `USERNAME_IS_ALREADY_TAKEN`
- WHEN 密码少于 8 位 THEN 系统 SHALL 拒绝注册

### FR-2 用户名登录
**验收标准**
- WHEN 用户名和密码正确（用户名大小写不敏感） THEN 系统 SHALL 返回会话并设置 cookie
- WHEN 用户名不存在或密码错误 THEN 系统 SHALL 返回同一个错误码 `INVALID_USERNAME_OR_PASSWORD`

### FR-3 关闭邮箱登录
**验收标准**
- WHEN 请求 `POST /api/auth/sign-in/email` THEN 系统 SHALL 返回 404

### FR-4 受保护接口
**验收标准**
- WHEN 未登录调用 `protectedProcedure` 接口 THEN 系统 SHALL 返回 `UNAUTHORIZED`
- WHEN 已登录调用 THEN `ctx.session.user` SHALL 包含 `username`

### FR-5 不泄露密码
**验收标准**
- WHEN 注册、登录、获取会话接口返回 THEN 响应中 SHALL 不包含密码或密码哈希

## 非功能需求
- 会话 cookie 保持 `httpOnly`、`secure`、`sameSite: none`（现有配置不变）。
- `pnpm check` 需要可以正常运行（当前 `biome.json` 规则名错误导致无法运行，本文件夹一并修复）。

## 范围外
- 前端表单与页面（见 02、03）。
- 找回密码、验证码、登录锁定。

## 依赖
- PostgreSQL（`apps/server/.env` 的 `DATABASE_URL`）。
