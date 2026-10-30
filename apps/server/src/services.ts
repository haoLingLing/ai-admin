import { createAuth } from "@ai-admin/auth";
import { createPrismaClient } from "@ai-admin/db";

import { ENV } from "./env.server";

export const db = createPrismaClient(ENV);
export const auth = createAuth(ENV, db);
