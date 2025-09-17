import Elysia, { t } from "elysia";
import { db } from "../..";
import { bookmarkTable } from "../../db/schema";

export const blogApp = new Elysia({ prefix: "/blog" })
	.get("/bookmarks/list", async () => {
		const data = (await db.select().from(bookmarkTable)).filter(
			(row) => !row.disabled,
		);
		return data;
	})
	.post(
		"/bookmarks/add",
		async ({ body }) => {
			await db
				.insert(bookmarkTable)
				.values(body as typeof bookmarkTable.$inferInsert);
			return { status: "ok" };
		},
		{
			body: t.Object({
				title: t.String(),
				subtitle: t.String(),
				url: t.String(),
				type: t.Enum({
					post: "post",
					tool: "tool",
					book: "book",
					movie: "movie",
					drama: "drama",
				}),
			}),
		},
	);
