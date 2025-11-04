import { Elysia } from "elysia";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { blogApp } from "./modules/blog";
import { lmsApp } from "./modules/lms";

export const db = drizzle(process.env.DATABASE_URL!);

const app = new Elysia()
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(blogApp)
  .use(lmsApp)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
