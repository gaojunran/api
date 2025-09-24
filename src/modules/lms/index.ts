import Elysia, { t } from "elysia";
import { JSONFile } from "lowdb/node"
import { Low } from "lowdb";

const adapter = new JSONFile("../lms-cqupt-subscribe/receivers.json")
const db: any = new Low(adapter, {});

export const lmsApp = new Elysia({ prefix: "/lms" })
  .post(
    "/subscribe",
    async ({ body }) => {
      await db.read();
      db.data[body.email] = body.email;
      await db.write();
      return { status: "ok", message: "Subscribe successfully 🎉!" };
    },
    {
      body: t.Object({
        email: t.String(),
      }),
    },
  )
  .post(
    "/unsubscribe",
    async ({ body }) => {
      await db.read();
      delete db.data[body.email];
      await db.write();
      return { status: "ok", message: "Unsubscribe successfully 🎉!" };
    },
    {
      body: t.Object({
        email: t.String(),
      }),
    },
  );
