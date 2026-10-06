<div align="center">

# 🍽️ SmartDine

**Dine Smart, Dine Digital.**

A contactless, QR-code driven ordering platform for restaurants — customers scan a table's QR code, browse the menu, pay, and track their order live, while dedicated kitchen, steward and admin apps keep the whole floor in sync in real time.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520.9-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![Realtime](https://img.shields.io/badge/Realtime-Server--Sent_Events-1abc9c?style=flat-square)](#)
[![Payments](https://img.shields.io/badge/Payments-Razorpay-0C2451?style=flat-square)](https://razorpay.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#)

</div>

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Database](#database)
- [Security](#security)
- [Deploying to Production](#deploying-to-production)
- [Project Structure](#project-structure)

## Overview

SmartDine replaces printed menus, waiter-taken orders and manual coordination with four purpose-built apps sharing one database and a live event stream:

| App | Who uses it | Path |
|---|---|---|
| **Customer** | Diners, via the QR code on their table | `/table/[tableId]` |
| **Kitchen** | Chefs / kitchen staff | `/kitchen` |
| **Steward** | Floor staff who deliver orders and answer table calls | `/steward` |
| **Admin** | Restaurant management | `/admin` |

Everything after a diner scans their table's QR code — registration, menu browsing, payment, live status, kitchen acceptance, and delivery — happens without a single page refresh, powered by Server-Sent Events.

## How It Works

```
 Diner scans QR  →  Enters name/email/phone  →  Browses menu  →  Pays (Razorpay)
        │
        ▼
   Order created (PAID) ──────────────► Kitchen dashboard (live)
                                               │
                                       Chef accepts, sets ETA (ACCEPTED)
                                               │
                                         Kitchen marks ready (READY)
                                               │
                              ┌────────────────┴────────────────┐
                              ▼                                 ▼
                     Customer sees "Ready"            Steward dashboard (live)
                                                                 │
                                                     Steward delivers to table
                                                                 │
                                                                 ▼
                                                        Order marked DELIVERED
```

A diner can also tap **Call Steward** at any point to send a live alert (e.g. "need water", "need the bill") straight to the steward dashboard. If the kitchen needs to pause new orders (e.g. during a rush), a single toggle holds every newly-paid order until it resumes — nothing is lost or silently dropped.

## Features

- 📱 **QR-code table ordering** — no app install, just a browser
- 🧾 **Live order tracking** for the customer, from payment to delivery
- 🎛️ **Item customization** — free or chargeable add-ons per dish (e.g. "Extra Cheese +₹30", "No Onion" free), plus a special-instructions note per item, visible to the kitchen on every ticket
- 💳 **Integrated payments** via Razorpay, with server-verified signatures
- 👨‍🍳 **Kitchen dashboard** — accept orders with an ETA, mark dishes unavailable on the fly, pause/resume the queue
- 🛎️ **Steward dashboard** — live delivery queue plus instant "call steward" alerts
- 🛠️ **Admin panel** — menu & category management, table/QR code generation and printing, restaurant branding, order analytics, customer directory, staff password resets
- ⚡ **Real-time everywhere** — Server-Sent Events push every status change instantly, no polling
- 🔒 **Security by default** — signed staff sessions, per-order access tokens, login lockout, role-gated APIs (see [Security](#security))

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [lucide-react](https://lucide.dev) |
| Database | MySQL via [Prisma ORM 5](https://www.prisma.io) |
| Realtime | Server-Sent Events (native `EventSource`, no external broker) |
| Payments | [Razorpay](https://razorpay.com) |
| Auth | Signed HTTP-only cookies (HMAC-SHA256), bcrypt password hashing |
| QR codes | [qrcode.react](https://github.com/zpao/qrcode.react) |
| Process manager | [PM2](https://pm2.keymetrics.io) (`ecosystem.config.js` included) |

## Requirements

- **Node.js** ≥ 20.9.0
- **MySQL** 8.0+ (or a compatible MySQL-protocol database)
- **npm** (ships with Node.js)
- A **Razorpay** account (test or live keys) if you want working payments — the app runs without them, but checkout will show "payment gateway not configured"

## Quick Start

The included installer checks your toolchain, installs dependencies, prepares `.env`, syncs the database schema and optionally seeds sample data:

```bash
git clone https://github.com/ItsAmlan/smartdine.git
cd smartdine
./install.sh
```

Run `./install.sh --help` for flags (`-y` for non-interactive, `--no-seed`, `--skip-install`). The script will pause once to let you fill in `DATABASE_URL` (and Razorpay keys) in `.env` before it continues.

Once it finishes:

```bash
npm run dev
```

Visit `http://localhost:3000` (redirects to `/admin`) to sign in, or `http://localhost:3000/table/1` to try the customer flow on the first seeded table.

## Manual Setup

If you'd rather not run the installer:

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, SESSION_SECRET, etc.
npx prisma generate
npx prisma db push          # syncs the schema — this project has no migrations directory
npx prisma db seed          # optional: sample menu, 10 tables, and staff accounts
npm run dev
```

`npx prisma db seed` prints each newly-created staff account's password to the console **once**. Save it immediately — it is never stored or shown again. See [Environment Variables](#environment-variables) to pin specific passwords instead of random ones.

## Environment Variables

All variables are documented with examples in [`.env.example`](.env.example).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MySQL connection string, e.g. `mysql://user:pass@host:3306/smartdine` |
| `SESSION_SECRET` | ✅ in production | Signs staff session cookies. Generate with `openssl rand -hex 32` |
| `RAZORPAY_KEY_ID` | For payments | Razorpay key id (server-side) |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay key secret (server-side) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For payments | Same value as `RAZORPAY_KEY_ID`, exposed to the browser checkout widget |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL, used to build the QR codes printed for each table |
| `SEED_ADMIN_PASSWORD` | Optional | Pins the seeded Admin account's password instead of generating one |
| `SEED_KITCHEN_PASSWORD` | Optional | Pins the seeded Kitchen account's password |
| `SEED_STEWARD_PASSWORD` | Optional | Pins the seeded Steward account's password |

> Without a real `SESSION_SECRET`, development uses a fixed insecure fallback so `npm run dev` keeps working; in production (`NODE_ENV=production`), any attempt to log in or check a staff session throws instead, so this must be set before staff can sign in.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `npm run build` | Production build |
| `npm start` | Run the production build (run `build` first) |
| `npm run lint` | Lint the codebase |
| `npx prisma generate` | Regenerate the Prisma client after a schema change |
| `npx prisma db push` | Sync the database schema to match `prisma/schema.prisma` |
| `npx prisma db seed` | Seed sample tables, menu and staff accounts (idempotent) |
| `npx prisma studio` | Browse the database in Prisma's GUI |

## Database

The schema (`prisma/schema.prisma`) models restaurants, tables, categories, dishes, customers, orders, order items, payments, steward calls and staff users. This project uses Prisma's **schema push** workflow (`db push`) rather than versioned migrations — there is no `prisma/migrations` directory by design. When you change `schema.prisma`, run `npx prisma db push` again to sync it.

`prisma/seed.js` is safe to re-run: it only creates rows that don't already exist (tables, categories, dishes, staff accounts), so re-running it against a populated database is a no-op rather than a duplicate insert.

## Security

- **Signed sessions** — staff cookies are HMAC-SHA256 signed with an expiry and verified in constant time; they can't be forged by guessing a staff ID.
- **Tokenized order links** — each order gets an unguessable access token; viewing an order's live status (page or SSE stream) requires that token or a logged-in staff session, so order IDs can't be enumerated.
- **Role-gated APIs** — every admin/kitchen/steward-only endpoint (accept/complete/deliver an order, manage the menu, view analytics, upload images, etc.) requires the matching staff role.
- **Login lockout** — an account locks for 15 minutes after 5 consecutive failed login attempts, since kitchen/steward accounts are designed to use short PINs.
- **No self-service password changes for kitchen/steward** — there is no "change my password" option in either app. Only a logged-in admin can reset a staff account's password, from **Admin → Staff Accounts**; doing so also clears any active lockout. Kitchen/steward sessions get a 403 if they try the underlying API directly.
- **Payment integrity** — order totals are always computed server-side from live dish prices, never trusted from the client; Razorpay payments are verified via HMAC signature before an order is marked paid.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a restrictive `Permissions-Policy` are set on every response (see `next.config.mjs`).

## Deploying to Production

1. Provision a MySQL database and set `DATABASE_URL`, a strong `SESSION_SECRET`, and your live Razorpay keys.
2. Build the app:
   ```bash
   npm ci
   npx prisma generate
   npx prisma db push
   npm run build
   ```
3. Run it with the included [PM2](https://pm2.keymetrics.io) config:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```
   `ecosystem.config.js` runs the app on port `4403` with `NODE_ENV=production` and loads `.env.local` — either create your production env file as `.env.local`, or adjust the `dotenv` path in `ecosystem.config.js` to match wherever you keep it.
4. Put a reverse proxy (nginx, Caddy, etc.) in front of that port for TLS and your public domain.
5. Print/generate table QR codes from **Admin → Tables & QR** once `NEXT_PUBLIC_APP_URL` points at your public domain.

## Project Structure

```
src/
├── app/
│   ├── (customer)/        # Table registration, menu, checkout, order status
│   ├── admin/              # Admin panel (dishes, categories, tables, settings, analytics)
│   ├── kitchen/             # Kitchen dashboard
│   ├── steward/             # Steward dashboard
│   └── api/                 # Route handlers (orders, payments, auth, SSE streams, ...)
├── components/              # Shared UI (glass-morphism design system) + per-app components
├── context/                 # Cart state (customer app)
├── hooks/                   # useSSE — the real-time data hook
└── lib/                     # Prisma client, auth/session helpers, Razorpay, uploads
prisma/
├── schema.prisma            # Data model
└── seed.js                  # Sample data + staff account bootstrap
install.sh                    # One-shot setup script
ecosystem.config.js           # PM2 process definition
```
