import Elysia, { t } from "elysia";
import { db } from "../..";
import { bookmarkTable } from "../../db/schema";

const typeEnum = t.Enum({
  post: "post",
  tool: "tool",
  book: "book",
  movie: "movie",
  drama: "drama",
});

export const bookmarksApp = new Elysia({ prefix: "/bookmarks" })
  .get(
    "/list",
    async ({ query: { type } }) => {
      const data = (await db.select().from(bookmarkTable))
        .filter((row) => !row.disabled)
        .filter((row) => !type || row.type === type);
      return data;
    },
    {
      query: t.Object({
        type: t.Optional(typeEnum),
      }),
    },
  )
  .post(
    "/add",
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
        type: typeEnum,
      }),
    },
  );
