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
    async ({ params }) => {
      const data = (await db.select().from(bookmarkTable))
        .filter((row) => !row.disabled)
        .filter((row) => !params.type || row.type === params.type);
      return data;
    },
    {
      params: t.Object({
        type: typeEnum,
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
