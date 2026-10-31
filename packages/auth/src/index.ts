import type { Database } from "@ai-admin/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import {
	isValidUsername,
	PASSWORD_MIN_LENGTH,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "./username";

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	CORS_ORIGIN: string;
};

export function createAuth(
	env: AuthConfig,
	database: Database,
	desktopOrigins: readonly string[] = []
) {
	return betterAuth({
		advanced: {
			defaultCookieAttributes: {
				httpOnly: true,
				sameSite: "none",
				secure: true,
			},
		},
		baseURL: env.BETTER_AUTH_URL,
		database: prismaAdapter(database, {
			provider: "postgresql",
		}),
		// 只允许用户名登录：邮箱仅作为注册时的占位字段
		disabledPaths: ["/sign-in/email"],
		emailAndPassword: { enabled: true, minPasswordLength: PASSWORD_MIN_LENGTH },
		plugins: [
			expo(),
			username({
				maxUsernameLength: USERNAME_MAX_LENGTH,
				minUsernameLength: USERNAME_MIN_LENGTH,
				usernameValidator: isValidUsername,
			}),
		],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [
			env.CORS_ORIGIN,
			...desktopOrigins,
			"ai-admin://",
			"exp://",
			"http://localhost:8081",
		],
	});
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
