import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { booksTable } from "./books";

export const borrowsTable = pgTable("borrows", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .notNull()
    .references(() => booksTable.id),
  borrowerName: text("borrower_name").notNull(),
  borrowedAt: timestamp("borrowed_at").notNull().defaultNow(),
  returnedAt: timestamp("returned_at"),
});

export const insertBorrowSchema = createInsertSchema(borrowsTable).omit({
  id: true,
  borrowedAt: true,
  returnedAt: true,
});
export type InsertBorrow = z.infer<typeof insertBorrowSchema>;
export type Borrow = typeof borrowsTable.$inferSelect;
