# App 登录注册 - 需求说明

> 来源：docs/需求.md § 3.1、3.2、3.3、6、7

## 背景与目标
Expo 移动端复用同一套 Better Auth 接口，把现有邮箱登录/注册改为用户名 + 密码，会话保存在 SecureStore。

## 用户故事
- 作为移动端用户，我希望用用户名和密码注册、登录和退出。

## 功能需求

### FR-1 注册
**验收标准**
- WHEN 用户名不是 3–20 位字母/数字/下划线，或密码少于 8 位 THEN 系统 SHALL 显示错误且不发请求
- WHEN 用户名已被注册（含仅大小写不同） THEN 系统 SHALL toast「该用户名已被注册」
- WHEN 注册成功 THEN 系统 SHALL 自动登录，首页显示用户信息

### FR-2 登录
**验收标准**
- WHEN 用户名或密码为空 THEN 系统 SHALL 提示必填且不发请求
- WHEN 用户名或密码错误 THEN 系统 SHALL toast「用户名或密码错误」
- WHEN 登录成功 THEN 首页 SHALL 显示「欢迎，{用户名}」

### FR-3 退出登录
**验收标准**
- WHEN 已登录 THEN 首页 SHALL 显示用户名和「退出登录」，不展示占位邮箱
- WHEN 点击「退出登录」 THEN 系统 SHALL 清除会话并回到登录 / 注册表单

### FR-4 交互
**验收标准**
- WHEN 提交中 THEN 按钮 SHALL 禁用并显示「提交中...」
- 输入框 SHALL 有 label，密码框键盘「前往」可提交

## 非功能需求
- 会话保存在 SecureStore（现有 `expoClient` 配置）。

## 范围外
- 独立的登录页面路由（沿用首页卡片）。

## 依赖
- 01-username-auth-server
