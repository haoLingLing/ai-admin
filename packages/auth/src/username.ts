// 用户名与密码规则：服务端插件配置与 web / native 表单校验共用。
// 只放纯常量与函数，不要引入 better-auth 服务端代码，前端通过 `@ai-admin/auth/username` 导入。

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const PASSWORD_MIN_LENGTH = 8;

// Better Auth 的 User.email 必填且唯一，注册时用它生成不对外展示的占位邮箱
export const PLACEHOLDER_EMAIL_DOMAIN = "users.ai-admin.local";

export const isValidUsername = (username: string): boolean =>
	username.length >= USERNAME_MIN_LENGTH &&
	username.length <= USERNAME_MAX_LENGTH &&
	USERNAME_PATTERN.test(username);

export const toPlaceholderEmail = (username: string): string =>
	`${username.toLowerCase()}@${PLACEHOLDER_EMAIL_DOMAIN}`;
