# Web 登录注册与访问控制 - 需求说明

> 来源：docs/需求.md § 3、4、5、8

## 背景与目标
在 Next.js 管理后台提供用户名注册、登录、退出页面，并拦截未登录访问。

## 用户故事
- 作为新用户，我希望在 `/login` 切换到注册表单，用用户名和密码注册后直接进入后台。
- 作为已注册用户，我希望在 `/login` 登录后进入 `/dashboard`。
- 作为已登录用户，我希望在右上角看到我的用户名并能退出登录。

## 功能需求

### FR-1 注册表单
**验收标准**
- WHEN 用户名不是 3–20 位字母/数字/下划线，或密码少于 8 位 THEN 系统 SHALL 在对应输入框下方显示错误且不发请求
- WHEN 用户名已被注册（含仅大小写不同） THEN 系统 SHALL toast「该用户名已被注册」
- WHEN 注册成功 THEN 系统 SHALL 自动登录并跳转 `/dashboard`

### FR-2 登录表单
**验收标准**
- WHEN 用户名或密码为空 THEN 系统 SHALL 在输入框下方提示必填且不发请求
- WHEN 用户名或密码错误 THEN 系统 SHALL toast「用户名或密码错误」
- WHEN 登录成功 THEN 系统 SHALL 跳转 `/dashboard`

### FR-3 登录页
**验收标准**
- WHEN 访问 `/login` THEN 系统 SHALL 默认显示登录表单，可切换到注册表单再切回
- WHEN 已登录用户访问 `/login` THEN 系统 SHALL 重定向到 `/dashboard`

### FR-4 Dashboard
**验收标准**
- WHEN 已登录访问 `/dashboard` THEN 页面 SHALL 显示「欢迎，{用户名}」（注册时的原始大小写）
- WHEN 未登录访问 `/dashboard` THEN 系统 SHALL 重定向到 `/login`
- WHEN 已登录刷新页面 THEN 系统 SHALL 保持登录状态

### FR-5 用户菜单与退出
**验收标准**
- WHEN 已登录 THEN 右上角用户菜单 SHALL 显示用户名，并提供「退出登录」，不展示占位邮箱
- WHEN 点击「退出登录」 THEN 系统 SHALL 清除会话并跳转 `/login`
- WHEN 退出后访问 `/dashboard` THEN 系统 SHALL 重定向到 `/login`

### FR-6 交互通用要求
**验收标准**
- WHEN 表单提交中 THEN 提交按钮 SHALL 禁用并显示「提交中...」
- WHEN 操作成功或失败 THEN 系统 SHALL 用 toast 提示
- 输入框 SHALL 有关联的 `<label>`，表单 SHALL 支持回车提交

## 非功能需求
- 界面不展示、不提交给用户看到占位邮箱。
- 请求带 `credentials: include`，与服务端 cookie 策略一致（现有配置）。

## 范围外
- 首页 `/` 的内容调整。
- 找回密码等。

## 依赖
- 01-username-auth-server
