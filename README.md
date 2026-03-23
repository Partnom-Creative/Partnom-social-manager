# Social Hub

A multi-tenant social media management platform for marketing agencies. Manage multiple clients' social media accounts, create and schedule posts, and collaborate with your team — all from one place.

## Features

- **Client Management** — Organize clients with color-coded profiles and separate social accounts per client
- **Team RBAC** — Add team members with granular per-client access (View, Create, Manage)
- **OAuth Onboarding** — Send secure invite links to clients so they connect their own accounts via OAuth (no credential sharing)
- **Post Composer** — Create posts with per-platform character limits, schedule or publish immediately
- **Publishing Engine** — Automated cron-based publishing to X, LinkedIn, YouTube, and Instagram
- **Calendar View** — Visualize scheduled posts across all clients

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Auth**: Auth.js (NextAuth v5) with JWT sessions
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Email**: Resend (for client invites)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech))
- pnpm package manager

### Setup

1. **Clone and install dependencies:**

```bash
git clone <repo-url>
cd social-hub
pnpm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your database URL and other settings. At minimum you need:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
- `ENCRYPTION_KEY` — Generate with `openssl rand -hex 32`

3. **Set up the database:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Start the development server:**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) and register your agency account.

### Social Platform Setup

To enable OAuth connections and publishing, register developer apps on each platform:

| Platform | Developer Portal | Key Env Vars |
|----------|-----------------|-------------|
| X (Twitter) | [developer.twitter.com](https://developer.twitter.com) | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` |
| LinkedIn | [linkedin.com/developers](https://www.linkedin.com/developers/) | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |
| YouTube | [console.cloud.google.com](https://console.cloud.google.com) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Instagram | [developers.facebook.com](https://developers.facebook.com) | `META_APP_ID`, `META_APP_SECRET` |

Set the OAuth callback URL for each platform to:
```
https://your-domain.com/api/oauth/{platform}/callback
```

### Deployment

Deploy to Vercel:

```bash
vercel
```

The `vercel.json` includes a cron job that runs every minute to publish scheduled posts. Make sure to set the `CRON_SECRET` environment variable in production.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & registration pages
│   ├── (dashboard)/     # Main dashboard pages
│   │   ├── clients/     # Client management
│   │   ├── posts/       # Post composer & list
│   │   ├── team/        # Team member management
│   │   ├── calendar/    # Scheduled posts calendar
│   │   └── settings/    # Organization settings
│   ├── invite/          # Client onboarding flow
│   └── api/             # API routes
├── components/          # Shared components
├── lib/
│   ├── auth.ts          # Auth.js configuration
│   ├── db.ts            # Prisma client
│   ├── encryption.ts    # AES-256 token encryption
│   ├── permissions.ts   # RBAC helpers
│   ├── oauth/           # Platform OAuth configs
│   ├── publishers/      # Platform publishing logic
│   └── token-refresh.ts # OAuth token refresh
└── middleware.ts         # Auth middleware
```
