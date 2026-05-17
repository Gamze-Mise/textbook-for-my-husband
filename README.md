# Vocabulary

Personal vocabulary trainer with audio, illustrations, study mode, and adaptive quizzes. Each user gets a private deck—words move between **Known**, **Learning**, and **Needs review** as you practice.

## Features

- **Library** — Add words with meaning, examples, and optional images (JPEG / PNG / WebP).
- **Audio** — Pronunciation generated automatically for words and examples (stored on Cloudinary).
- **Study** — Flip cards; mark **Got it** or **Again** to update deck status.
- **Quiz** — Multiple-choice sessions (up to 20 questions); review words are weighted and each round samples a fresh set from your library.
- **Auth** — Email sign-up, verification, and password reset.

## Tech stack

| Layer | Tools                                         |
| ----- | --------------------------------------------- |
| App   | Next.js 16 (App Router), React 19, TypeScript |
| Data  | PostgreSQL, Prisma 7                          |
| Auth  | NextAuth (credentials)                        |
| Media | Cloudinary (images + audio)                   |
| Email | Nodemailer (SMTP)                             |
| UI    | Tailwind CSS 4                                |

## Prerequisites

- Node.js **20+**
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- SMTP account (verification & password reset)
- [Cloudinary](https://cloudinary.com) account (audio & images)

## Local development

```bash
git clone <repo-url>
cd textbook-for-my-husband
npm install
cp .env.example .env
```

Configure `.env` (see below), then:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable                | Description                              |
| ----------------------- | ---------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string             |
| `NEXTAUTH_URL`          | App URL (`http://localhost:3000` in dev) |
| `NEXTAUTH_SECRET`       | Random string for session signing        |
| `SMTP_HOST`             | SMTP server host                         |
| `SMTP_PORT`             | Usually `587`                            |
| `SMTP_SECURE`           | `true` or `false`                        |
| `SMTP_USER`             | SMTP username                            |
| `SMTP_PASS`             | SMTP password                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                    |

Audio and image uploads require valid Cloudinary credentials. Email flows require working SMTP.

**Pronunciation:** Words are saved as MP3 on Cloudinary. On save, the app tries to capture audio from your browser (Google Translate); on Vercel it uses **Google Cloud Text-to-Speech** when `GOOGLE_CLOUD_TTS_API_KEY` is set (enable the API in GCP, add the key to Vercel env). Default voice: `en-US-Standard-D`.

## Scripts

| Command                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm run dev`            | Start dev server                              |
| `npm run build`          | Production build                              |
| `npm run start`          | Run production build locally                  |
| `npm run lint`           | ESLint                                        |
| `npm test`               | Lint + production build                       |
| `npm run prisma:migrate` | Apply migrations (dev)                        |
| `npm run vercel-build`   | Migrate, generate client, build (CI / Vercel) |

## Deployment (Vercel)

1. Add all variables from `.env.example` in the Vercel project settings.
2. Set `DATABASE_URL` to your production database and `NEXTAUTH_URL` to your live domain.
3. Build command (configured in `vercel.json`):

   ```bash
   npm run vercel-build
   ```

   This runs `prisma migrate deploy`, `prisma generate`, and `next build`.

## Project structure

```text
src/
  app/                 # Routes (landing, auth, /app library · study · quiz)
  app/api/             # REST API (words, quiz, TTS, auth)
  components/          # UI (word cards, marketing, shared)
  lib/                 # Auth, Prisma, Cloudinary, mail
prisma/
  schema.prisma        # User & Word models
```

## License

Private project.
