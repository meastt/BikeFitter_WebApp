# BikeFit - MVP

Personalized bike cockpit fit recommendations based on body dimensions, flexibility, and riding style. An app for the gravel cyclist out there.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (Postgres)
- **Auth**: NextAuth v5 (Auth.js)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for local dev)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client utilities
│   └── utils.ts          # General utilities
├── auth.ts               # NextAuth configuration
└── components.json       # shadcn/ui configuration
```

## Phase 0 - Complete ✅

Environment + Scaffolding completed:
- ✅ Next.js project with TypeScript
- ✅ Tailwind CSS v4 configured
- ✅ shadcn/ui installed and configured
- ✅ Supabase client setup
- ✅ NextAuth configuration
- ✅ Basic landing page
- ✅ Ready for Vercel deployment

## Next Steps (Phase 1)

- Create Supabase tables (users, bikes, frames, fits)
- Build CRUD endpoints for bikes/frames
- Seed initial frame data

## License

Private - All Rights Reserved
