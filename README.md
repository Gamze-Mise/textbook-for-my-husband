# Flashcards – Personal vocabulary trainer

Audio-backed flashcards with email verification, password reset, and a focused study mode.

## Requirements

- Node.js 20+
- Postgres database (e.g. Neon)
- SMTP account for sending emails
- Cloudinary account for storing generated pronunciation audio

## Setup (local)

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
cp .env.example .env
```

Fill in all required environment variables.

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production / Vercel

This project includes a `vercel-build` script:

```bash
prisma migrate deploy && prisma generate && next build
```

On Vercel:

- Set all environment variables from `.env.example`
- Ensure `DATABASE_URL` points to the production database

## Scripts

- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run start`: Run production server locally
- `npm run lint`: Run ESLint

