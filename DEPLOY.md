# Deploy Guide

## Recommended Stack

- Code hosting: GitHub
- App hosting: Vercel
- Database: Prisma Postgres

## 1. Create A Database

1. Sign in to Prisma Console.
2. Create a new `Prisma Postgres` project.
3. Copy the connection string.
4. Put that string into `DATABASE_URL`.

## 2. Environment Variables

Set these in Vercel:

- `DATABASE_URL`
- `SESSION_SECRET`

Generate a strong `SESSION_SECRET`, for example:

```bash
openssl rand -base64 32
```

Or use any strong random 32+ character string.

## 3. Push To GitHub

```bash
git init
git add .
git commit -m "Initial deployable MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 4. Import Into Vercel

1. Log in to Vercel.
2. Click `Add New` -> `Project`.
3. Import your GitHub repository.
4. Add `DATABASE_URL` and `SESSION_SECRET`.
5. Deploy.

## 5. Run Prisma On Production

In Vercel project settings, set the build command to:

```bash
npx prisma migrate deploy && npm run build
```

If you need initial admin data after deployment, open the Vercel project terminal or run locally against the production `DATABASE_URL`:

```bash
npx prisma db seed
```

## 6. Default Admin

- email: `admin@example.com`
- password: `admin123456`

Change this password after first deployment.
