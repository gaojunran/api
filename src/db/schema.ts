import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	varchar,
} from "drizzle-orm/pg-core";

export const bookmarkType = pgEnum("type", [
	"post",
	"tool",
	"book",
	"movie",
	"drama",
]);

export const bookmarkTable = pgTable("bookmark", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull().unique(),
	type: bookmarkType().notNull(),
	subtitle: varchar({ length: 255 }),
	url: varchar({ length: 65536 }),
	disabled: boolean().default(false),
});
