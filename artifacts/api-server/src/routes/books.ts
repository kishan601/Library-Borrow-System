import { Router } from "express";
import { db, booksTable, borrowsTable } from "@workspace/db";
import { eq, and, isNull, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const books = await db.select().from(booksTable);

    const booksWithAvailability = await Promise.all(
      books.map(async (book) => {
        const borrowedCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(borrowsTable)
          .where(and(eq(borrowsTable.bookId, book.id), isNull(borrowsTable.returnedAt)));

        const borrowed = Number(borrowedCount[0]?.count ?? 0);
        return {
          ...book,
          availableCopies: Math.max(0, book.totalCopies - borrowed),
        };
      })
    );

    res.json(booksWithAvailability);
  } catch (err) {
    req.log.error({ err }, "Failed to list books");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/summary", async (req, res) => {
  try {
    const books = await db.select().from(booksTable);
    const activeBorrowsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowsTable)
      .where(isNull(borrowsTable.returnedAt));

    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const activeBorrows = Number(activeBorrowsResult[0]?.count ?? 0);
    const availableCopies = Math.max(0, totalCopies - activeBorrows);
    const borrowedCopies = activeBorrows;

    res.json({
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      activeBorrows,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get book stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid book ID" });
      return;
    }

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const borrowedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowsTable)
      .where(and(eq(borrowsTable.bookId, book.id), isNull(borrowsTable.returnedAt)));

    const borrowed = Number(borrowedCount[0]?.count ?? 0);

    res.json({
      ...book,
      availableCopies: Math.max(0, book.totalCopies - borrowed),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get book");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
