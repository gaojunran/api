import { Elysia } from "elysia";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { blogApp } from "./modules/blog";

export const db = drizzle(process.env.DATABASE_URL!);

const app = new Elysia().use(blogApp).listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
