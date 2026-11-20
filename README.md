# SalonBook — Client

SalonBook is a salon appointment booking platform. The client application is built with Next.js and provides the customer-facing website and role-based dashboard experience.

## Important Features

- Responsive salon website and navigation
- Browse salon services and view service details
- Search services by name, filter by category, and sort by price
- Customer and admin experiences with role-based dashboard navigation
- Authentication with Better Auth, including Google sign-in when configured on the server
- Appointment booking and appointment status views
- Stripe Checkout payment flow for confirmed appointments
- Profile management and image upload interface
- Loading, error, and toast feedback states

## Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components with Base UI
- Better Auth React client and JWT client plugin
- Lucide React
- Sonner

## Installation Instructions

1. Clone the client repository:

   ```bash
   git clone https://github.com/biddut-webdev/salonbook-client.git
   cd salonbook-client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add the required environment variable:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   Set `NEXT_PUBLIC_API_URL` to your deployed backend URL when using the production website.

## How to Run the Project Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build:

```bash
npm run build
npm run start
```

To run ESLint:

```bash
npm run lint
```

## Required Environment Variables

Add these names to `.env.local` (do not commit the file):

- `NEXT_PUBLIC_API_URL`

## Live Website

- Live Website: **Add the deployed Vercel URL here after deployment.**

## GitHub Repositories

- Client Repository: [salonbook-client](https://github.com/biddut-webdev/salonbook-client)
- Server Repository: [salonbook-server](https://github.com/biddut-webdev/salonbook-server)

## Security

Never commit `.env.local`, API keys, access tokens, or other secret credentials.
