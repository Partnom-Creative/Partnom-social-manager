# Deploying Social Hub

This guide matches the production checklist: Git → Vercel → database → domain → OAuth consoles → app review.

## 1. Push code to GitHub (ongoing updates from Cursor)

1. Create an empty repository on [GitHub](https://github.com/new) (private is fine).
2. In your project directory:

```bash
git add -A
git status   # review
git commit -m "Prepare for production deploy"
git remote add origin https://github.com/YOUR_ORG/social-hub.git   # if not already added
git branch -M main
git push -u origin main
```

3. **Future updates:** after changes in Cursor, `git commit` and `git push`. Vercel (below) can auto-deploy `main`.

---

## 2. Import on Vercel and set environment variables

1. Sign in at [vercel.com](https://vercel.com) → **Add New** → **Project** → import your Git repo.
2. **Framework:** Next.js (default). **Root directory:** repo root.
3. **Build command:** set Vercel’s **Build Command** to `pnpm run build:with-migrate` so production applies migrations (`prisma migrate deploy`) against `DATABASE_URL`. The default `pnpm build` only runs `prisma generate` and `next build` (for local builds without a remote DB).

### Required environment variables (Production)

Set these under **Project → Settings → Environment Variables** (check **Production**; add **Preview** too if you want preview DB URLs).

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Production Postgres (e.g. Neon). Use TLS params your host requires. |
| `AUTH_SECRET` | `openssl rand -base64 32` — **unique in production**, not your dev secret. |
| `AUTH_URL` | Public HTTPS origin, e.g. `https://app.yourdomain.com` (no trailing slash). |
| `NEXTAUTH_URL` | **Same value as `AUTH_URL`.** Used for invite links in emails. |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` — **unique in production.** |
| `CRON_SECRET` | Random string; Vercel Cron must call `/api/cron/publish` with `Authorization: Bearer <CRON_SECRET>`. |
| `RESEND_API_KEY` | For invite emails. |
| OAuth | `TWITTER_*`, `LINKEDIN_*`, `GOOGLE_*` / YouTube, `META_APP_ID` + `META_APP_SECRET` (or values in [`.env.example`](.env.example)) when ready. |

**Base URL helper:** [`getPublicBaseUrl()`](src/lib/public-base-url.ts) uses `AUTH_URL` → `NEXTAUTH_URL` → `VERCEL_URL` (HTTPS) → localhost. Set `AUTH_URL` and `NEXTAUTH_URL` explicitly on production so invite and OAuth URLs are correct.

---

## 3. Database migrations

When you use **`pnpm run build:with-migrate`** on Vercel, the build runs `prisma migrate deploy` against `DATABASE_URL`. Ensure:

- Production `DATABASE_URL` is set before the first deploy.
- Migration files in `prisma/migrations/` are committed.

If you deploy with the default `pnpm build` (no migrate), run once against production:

```bash
DATABASE_URL="postgresql://..." pnpm exec prisma migrate deploy
```

---

## 4. Custom domain and DNS

1. Vercel → **Project → Domains** → add `app.yourdomain.com` (or apex domain).
2. At your DNS host, add the **CNAME** or **A** records Vercel shows.
3. When HTTPS works on that host, set **`AUTH_URL`** and **`NEXTAUTH_URL`** to `https://app.yourdomain.com` (no trailing slash) and redeploy.

Invite links look like: `https://app.yourdomain.com/invite/...` and `https://app.yourdomain.com/team/join/...`.

---

## 5. OAuth redirect URLs (developer consoles)

Register **exact** production callback URLs (scheme + host + path):

```
https://YOUR_DOMAIN/api/oauth/twitter/callback
https://YOUR_DOMAIN/api/oauth/linkedin/callback
https://YOUR_DOMAIN/api/oauth/youtube/callback
https://YOUR_DOMAIN/api/oauth/instagram/callback
```

Platform keys match [`src/lib/oauth/platforms.ts`](src/lib/oauth/platforms.ts). Meta/Facebook developer settings use the same path pattern for Instagram OAuth.

---

## 6. Legal pages (Meta / LinkedIn review)

These public routes are implemented for policy links:

- `https://YOUR_DOMAIN/privacy` — Privacy Policy  
- `https://YOUR_DOMAIN/terms` — Terms of Service  
- `https://YOUR_DOMAIN/data-deletion` — Data deletion instructions  

Use these URLs in developer consoles and app review forms. They are listed in the auth layout footer and linked from each other.

---

## 7. App review (Facebook / Instagram / LinkedIn)

This is **platform policy**; approval is not guaranteed by code alone.

1. Deploy a **stable production URL** with HTTPS.
2. Add **Privacy**, **Terms**, and **Data deletion** URLs above to Meta/LinkedIn app settings.
3. Submit **App Review** with:
   - Short description of use case (agency manages client social accounts).
   - **Screencast** of OAuth connect + posting flow.
   - Only the permissions you need (see [`src/lib/oauth/platforms.ts`](src/lib/oauth/platforms.ts)).
4. Complete **Meta Business Verification** if required for advanced access.
5. LinkedIn: add authorized redirect URLs; request additional products if your scopes require them (e.g. `w_member_social`).

---

## 8. Cron (scheduled publishing)

[`vercel.json`](vercel.json) schedules `GET /api/cron/publish` every minute. Set **`CRON_SECRET`** in Vercel; the route must receive `Authorization: Bearer <CRON_SECRET>` (Vercel Cron should attach this if configured in your integration).

---

## 9. Resend email

For production, verify your **sending domain** in Resend and replace the `from` address in [`src/lib/invite-email.ts`](src/lib/invite-email.ts) and [`src/lib/team-invite-email.ts`](src/lib/team-invite-email.ts) (currently `onboarding@resend.dev` is for testing only).

---

## Quick verification

- [ ] `AUTH_URL` === `NEXTAUTH_URL` === production HTTPS origin  
- [ ] `AUTH_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` unique in production  
- [ ] `git push` triggers a green Vercel build  
- [ ] `/privacy`, `/terms`, `/data-deletion` load without login  
- [ ] OAuth redirects match developer console entries  
