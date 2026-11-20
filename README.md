# SalonBook — Client

SalonBook is a salon appointment booking platform. Customers browse salon services, request
appointments, track their status and pay for confirmed bookings with Stripe. The salon
administrator manages services, appointments, customers and payment transactions from a
role-based dashboard.

This repository contains the **Next.js (App Router) frontend**.

- **Live site:** https://salonbook-client-seven.vercel.app
- **Client repository:** https://github.com/biddut-webdev/salonbook-client
- **Server repository:** https://github.com/biddut-webdev/salonbook-server
- **Live API:** https://salonbook-server-blue.vercel.app

---

## Important Features

### Public
- Landing page with hero banner, featured services (from MongoDB), category grid and
  "how it works" / "why choose us" sections.
- Browse services with **search by name**, **category filter** and **sort by price**.
- Service details page with images, price, duration and the booking panel.
- Sign up (email + password or Google) and Sign In.

### Customer
- Dashboard overview with appointment counters (total, pending, confirmed, cancelled).
- **My Appointments**: view own bookings, cancel a *pending* request, and **Pay Now** for a
  *confirmed* appointment through Stripe Checkout.
- Payment success / cancel pages.
- **My Profile**: update name, phone, profile image (ImgBB upload or URL).

### Admin
- Dashboard overview: total customers, active services, appointment requests, pending,
  confirmed and total successful payments.
- **Manage Services**: create, update, delete, activate/deactivate, image upload.
- **Manage Appointments**: confirm pending requests, cancel pending/confirmed requests.
- **Manage Users**: list customers, block / unblock an account.
- **Transactions**: read-only list of paid/failed Stripe payments (no manual edits).
- **My Profile**: update own profile data.

### Cross-cutting
- Better Auth session + short-lived **JWT** sent to the Express API on every request.
- Role-based routing: customers can never open `/admin`, admins never see customer pages;
  attempts are redirected.
- Toast notifications (sonner) for every success/error — no `alert()`.
- Loading skeletons, empty states, a global error boundary and a custom 404 page.
- Fully responsive layout (mobile sidebar, stacked cards, fluid grids).

---

## Technology Stack

- **Next.js 16** (App Router, Turbopack, Server Components)
- **TypeScript**
- **Tailwind CSS v4** + shadcn/base-ui primitives
- **Better Auth** (email/password + Google OAuth, JWT plugin)
- **Stripe Checkout** (redirect flow, webhook-verified status)
- **ImgBB** for image hosting
- **lucide-react** icons, **sonner** toasts

---

## Installation

```bash
git clone https://github.com/biddut-webdev/salonbook-client.git
cd salonbook-client
npm install
```

Create `.env.local` in the project root (see **Environment Variables** below), then start
the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

> The Express API must be running too (default `http://localhost:5000`).

### Production build

```bash
npm run build
npm start
```

---

## Environment Variables

Names only — never commit real values.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express server (REST API **and** Better Auth), e.g. `http://localhost:5000` |

Copy `.env.example` to `.env.local` and fill in your own values.

---

## How the payment flow works

1. Customer requests an appointment → status `pending`, payment `unpaid`.
2. Admin confirms it → status `confirmed`.
3. Customer clicks **Pay Now** → the server creates a Stripe Checkout Session.
4. Stripe redirects back to `/payment/success`.
5. **Only** the verified Stripe webhook (`checkout.session.completed`) marks the appointment
   `paid` and writes the `transactions` record. The client can never set payment status.

Local webhook testing:

```bash
stripe listen --forward-to http://localhost:5000/api/payments/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired
```

Use the `whsec_...` printed by the CLI as the server's `STRIPE_WEBHOOK_SECRET`.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

---

## Project Structure

```
src/
├─ app/
│  ├─ page.tsx                  # Home
│  ├─ services/                 # Browse + details
│  ├─ sign-in / sign-up/        # Authentication
│  ├─ dashboard/                # Customer area (overview, appointments, profile)
│  ├─ admin/                    # Admin area (services, appointments, users, transactions)
│  ├─ payment/                  # Success / cancel pages
│  ├─ error.tsx                 # Error boundary
│  └─ not-found.tsx             # 404 page
├─ components/                  # layout, home, services, dashboard, ui
├─ lib/                         # api client, auth client, constants, validation
└─ types/                       # shared TypeScript types
```

---

## Admin access

Public registration always creates a **customer**. An admin account is promoted from the
server repository:

```bash
npm run make-admin -- admin@example.com
```

---

## Deployment

- Deploy this repository to **Vercel** (framework preset: Next.js).
- Set `NEXT_PUBLIC_API_URL` to the deployed server URL in the Vercel project settings.
- Add the deployed client URL to the server's `CLIENT_URL` and to the Google OAuth
  authorised redirect URIs (`<server>/api/auth/callback/google`).
