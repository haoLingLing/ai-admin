import type { Session } from "@ai-admin/auth";
import type { Database } from "@ai-admin/db";

export type Context = {
  session: Session | null;
  db: Database;
};
