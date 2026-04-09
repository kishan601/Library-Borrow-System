import { Router } from "express";
import { db, booksTable, borrowsTable } from "@workspace/db";
import { eq, and, isNull, sql } from "drizzle-orm";
import { BorrowBookBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const borrows = await db.select().from(borrowsTable).orderBy(borrowsTable.borrowedAt);
    
    const borrowsWithBook = await Promise.all(
      borrows.map(async (borrow) => {
        const [book] = await db.select().from(booksTable).where(eq(booksTable.id, borrow.bookId));
        if (!book) return null;

        const borrowedCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(borrowsTable)
          .where(and(eq(borrowsTable.bookId, book.id), isNull(borrowsTable.returnedAt)));

        const borrowed = Number(borrowedCount[0]?.count ?? 0);
        return {
          ...borrow,
          book: {
            ...book,
            availableCopies: Math.max(0, book.totalCopies - borrowed),
          },
        };
      })
    );

    res.json(borrowsWithBook.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Failed to list borrows");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = BorrowBookBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { bookId, borrowerName } = parsed.data;

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const borrowedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowsTable)
      .where(and(eq(borrowsTable.bookId, bookId), isNull(borrowsTable.returnedAt)));

    const borrowed = Number(borrowedCount[0]?.count ?? 0);
    const available = book.totalCopies - borrowed;

    if (available <= 0) {
      res.status(400).json({ error: "No copies available for this book" });
      return;
    }

    const [newBorrow] = await db
      .insert(borrowsTable)
      .values({ bookId, borrowerName })
      .returning();

    const updatedBorrowedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowsTable)
      .where(and(eq(borrowsTable.bookId, bookId), isNull(borrowsTable.returnedAt)));

    const updatedBorrowed = Number(updatedBorrowedCount[0]?.count ?? 0);

    res.status(201).json({
      ...newBorrow,
      book: {
        ...book,
        availableCopies: Math.max(0, book.totalCopies - updatedBorrowed),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to borrow book");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/return", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid borrow ID" });
      return;
    }

    const [borrow] = await db.select().from(borrowsTable).where(eq(borrowsTable.id, id));
    if (!borrow) {
      res.status(404).json({ error: "Borrow not found" });
      return;
    }

    if (borrow.returnedAt !== null) {
      res.status(400).json({ error: "Book already returned" });
      return;
    }

    const [updated] = await db
      .update(borrowsTable)
      .set({ returnedAt: new Date() })
      .where(eq(borrowsTable.id, id))
      .returning();

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, updated.bookId));
    
    const borrowedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowsTable)
      .where(and(eq(borrowsTable.bookId, updated.bookId), isNull(borrowsTable.returnedAt)));

    const borrowed = Number(borrowedCount[0]?.count ?? 0);

    res.json({
      ...updated,
      book: {
        ...book,
        availableCopies: Math.max(0, (book?.totalCopies ?? 0) - borrowed),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to return book");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
