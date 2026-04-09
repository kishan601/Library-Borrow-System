# Library Borrow System

> A groundbreaking technological achievement that allows human beings to track whether a book is available — something librarians have managed with index cards since 1876. But sure, let's use Node.js.

---

## Table of Contents

- [What Is This](#what-is-this)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [How Borrowing Works](#how-borrowing-works)
- [Constraints](#constraints)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## What Is This

This is a **Library Borrow System** — a full-stack web application designed to solve one of humanity's most pressing crises: not knowing if a book is checked out.

Before this system existed, people presumably wandered into libraries, stared at empty shelves, and wept silently. Now, they can do that *with a loading spinner.*

The system tracks books, their copy counts, who borrowed them, and whether those people have returned them (they haven't).

---

## Features

### List Books with Available Copies
Displays all books in the library with how many copies are currently available. This is extremely useful for discovering that the one book you wanted has zero copies left because someone named "John" borrowed all three of them and has not returned a single one since March.

### Borrow a Book
Users can borrow a book by entering their name and clicking a button. The system then records this moment of optimism and decrements the available copy count. The borrower is now morally obligated to return it. This system cannot enforce that, but it does remember.

### Return a Book
Users can return books. Theoretically. The button exists. Whether anyone clicks it is between them and their conscience.

### Availability Enforcement
If no copies of a book are available, the Borrow button is disabled and labeled "Unavailable." This is the system's way of saying "no" — politely, professionally, and completely ignoring your feelings about it.

### Library Stats Panel
A live summary showing:
- **Total titles** — how many unique books the library pretends to have
- **Available copies** — copies that are still physically present and not in someone's living room
- **Active borrows** — the count of people currently experiencing the book

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Because plain HTML was deemed "too stable" |
| Backend | Node.js + Express 5 | JavaScript on the server, as the ancient prophecy foretold |
| Database | PostgreSQL | A real database, for a fake emergency |
| ORM | Drizzle ORM | So we can write TypeScript instead of SQL and feel better about ourselves |
| Validation | Zod | Because TypeScript types alone weren't anxiety-inducing enough |
| API Contract | OpenAPI + Orval | Auto-generates hooks so nobody has to type `fetch` manually and risk a typo |
| Styling | Tailwind CSS | Utility-first CSS, which means your HTML looks like a keyboard fell on it |
| State | TanStack React Query | Caching, loading states, and error handling, so you don't have to |

---

## Project Structure

```
/
├── artifacts/
│   ├── api-server/         # The backend. Handles requests. Judges none.
│   └── library-app/        # The frontend. Pretty. Mostly harmless.
├── lib/
│   ├── api-client-react/   # Auto-generated React hooks. Do not edit. Do not look at it too long.
│   ├── api-spec/           # OpenAPI spec. The contract. The law. The truth.
│   ├── api-zod/            # Auto-generated Zod schemas. Validation lives here.
│   └── db/                 # Database schema and connection. Where the real truth is.
├── scripts/                # Utility scripts that mostly just exist
├── .gitignore              # A list of things we're ashamed of
├── README.md               # This document, which you are reading instead of using the app
└── package.json            # The root of all configuration
```

---

## Getting Started

### Prerequisites

- Node.js 24+ (because we believe in living dangerously on the latest version)
- pnpm (not npm, not yarn, pnpm — it has opinions and so do we)
- A PostgreSQL database (provided by the environment, or you can provision your own sadness)

### Installation

```bash
pnpm install
```

This will install approximately 400MB of node_modules for an app that tracks book availability. This is normal. This is fine.

### Running the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

The server will start and log that it is listening on a port. It means it. It is listening. It is always listening.

### Running the Frontend

```bash
pnpm --filter @workspace/library-app run dev
```

Opens a Vite dev server. Pages load fast. Books remain finite.

### Database Setup

```bash
pnpm --filter @workspace/db run push
```

Pushes the schema to the database. If the database does not exist yet, it will complain about that, which is fair.

---

## API Reference

All routes are prefixed with `/api`. This is important. If you forget the `/api`, you will receive a 404 and a moment of reflection.

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | List all books with available copy counts |
| `GET` | `/api/books/:id` | Get a single book by ID, if you know its ID, which you probably don't |
| `GET` | `/api/books/stats/summary` | Aggregate library statistics for people who like numbers |

### Borrows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/borrows` | List all borrows, active and returned, a complete record of human ambition |
| `POST` | `/api/borrows` | Borrow a book. Requires `bookId` and `borrowerName`. Honor system from here on. |
| `POST` | `/api/borrows/:id/return` | Return a book. A rare and celebrated event. |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/healthz` | Confirms the server is alive. Returns `{ status: "ok" }`. Sets the bar very low. |

---

## Database Schema

### `books` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Auto-incremented identity. The book does not choose its ID. |
| `title` | text | The name of the book, for humans |
| `author` | text | The person who wrote the book, often forgotten |
| `genre` | text | A vague category that may or may not be accurate |
| `total_copies` | integer | How many physical copies exist. Fixed. Immutable. A hard constraint on joy. |
| `description` | text | A summary of what happens in the book, spoiling the surprise slightly |

### `borrows` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Auto-incremented. Each borrow gets a number. Each number is a story. |
| `book_id` | integer | Foreign key to `books.id`. The book in question. |
| `borrower_name` | text | The name of the person who took the book. No last name required. Full deniability. |
| `borrowed_at` | timestamp | When the book was taken. Automatically recorded. Alibi established. |
| `returned_at` | timestamp | When the book came back. Null if it hasn't. Null is the default. |

---

## How Borrowing Works

1. User opens the catalog and sees books with available copy counts
2. User clicks "Borrow Copy" on a book they want
3. A dialog appears asking for the borrower's name. They type it in. This is the entire authentication system.
4. The system checks if any copies are available
5. **If yes:** A borrow record is created, available count decrements, user is happy
6. **If no:** The request is rejected with a clear error. User experiences what libraries felt like before this app existed.
7. The book counter updates in real time across the UI
8. The "Active Borrows" page shows the borrow with the book name, borrower name, and date
9. A "Return" button on that page allows the book to come back, closing the loop, restoring balance, healing the wound

---

## Constraints

- Each book has a **fixed total copy count**. You cannot add more copies by wanting them harder.
- Borrowing **fails immediately** if available copies reach zero. No waitlists. No queues. Just rejection.
- There is **no user authentication**. Anyone can claim to be anyone. The system trusts you. You should feel the weight of that.
- There is **no due date**. No late fees. No consequences. This is a system built on hope.
- Returned books become available again instantly, because the system is optimistic about cleanliness.

---

## FAQ

**Q: What happens if I borrow a book and never return it?**
A: The system records your name forever. The `returned_at` column stays `null` for eternity. That is all. Sleep well.

**Q: Can two people borrow the same book at the same time?**
A: Yes, as long as there are enough copies. The whole point. Keep up.

**Q: What if a book has zero copies and I still want it?**
A: The button is disabled. The UI communicates "no" clearly. The universe has spoken.

**Q: Is there a mobile app?**
A: No. Go to the website on your phone like an adult.

**Q: Can I add new books?**
A: Not through the UI, because nobody asked for that feature yet. You can seed the database directly, which is either a power move or a cry for help.

**Q: Why PostgreSQL?**
A: Because SQLite is for toys and MongoDB would require explaining document modeling to books.

**Q: Why pnpm?**
A: Faster installs, better disk usage, and the configuration to make it feel earned.

---

## Contributing

1. Fork the repository
2. Create a branch with a name that describes what you're doing
3. Make your changes without breaking the things that already work
4. Submit a pull request with a description that explains what you did and why
5. Wait patiently while it gets reviewed
6. Accept feedback gracefully

If you find a bug, please open an issue. Describe what you expected to happen, what actually happened, and try not to use the phrase "it just doesn't work" — that is a feeling, not a bug report.

---

*Built with TypeScript, strong opinions, and the deep conviction that a library's available copy count is critical information that deserves a REST API.*
