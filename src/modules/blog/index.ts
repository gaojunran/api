import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { bookmarksApp } from "./bookmarks";
import { tasksApp } from "./tasks";

export const blogApp = new Elysia({ prefix: "/blog" })
  .use(
    cors({
      origin: /^.*codenebula\.netlify\.app$/,
    }),
  )
  .use(bookmarksApp)
  .use(tasksApp);
