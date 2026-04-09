# Library Borrow System

## Overview

A full-stack library book borrowing system. Users can browse books with available copy counts, borrow copies, and return them. Borrowing is blocked when no copies are available.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/library-app)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- Book catalog with availability counts per book
- Borrow a book (enter borrower name, blocked if no copies available)
- Return a borrowed book
- Library stats (total books, copies, active borrows)
- Active borrows list with return action

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## DB Schema

- `books` — title, author, genre, total_copies, description
- `borrows` — book_id (FK), borrower_name, borrowed_at, returned_at (nullable)

## API Routes

- `GET /api/books` — list books with available copies
- `GET /api/books/:id` — get single book
- `GET /api/books/stats/summary` — library aggregate stats
- `GET /api/borrows` — list all borrows (with book info)
- `POST /api/borrows` — borrow a book `{ bookId, borrowerName }`
- `POST /api/borrows/:id/return` — return a book
