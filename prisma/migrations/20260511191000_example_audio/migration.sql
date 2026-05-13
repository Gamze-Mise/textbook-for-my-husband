-- Baseline schema + legacy example-audio columns (first migration by name; shadow DB safe).
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "WordBucket" AS ENUM ('KNOWN', 'TO_STUDY', 'FORGOTTEN');

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PendingSignup" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "bucket" "WordBucket" NOT NULL DEFAULT 'FORGOTTEN',
    "audioPublicId" TEXT,
    "exampleAudioPublicId" TEXT,
    "imagePublicId" TEXT,
    "imageFocusX" INTEGER,
    "imageFocusY" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "PendingSignup_email_key" ON "PendingSignup"("email");

CREATE UNIQUE INDEX "PendingSignup_tokenHash_key" ON "PendingSignup"("tokenHash");

CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");

CREATE INDEX "Word_userId_bucket_idx" ON "Word"("userId", "bucket");

CREATE UNIQUE INDEX "Word_userId_term_key" ON "Word"("userId", "term");

ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Legacy columns (no-op if already present on "Word")
ALTER TABLE "Word" ADD COLUMN IF NOT EXISTS "exampleAudioUrl" TEXT;
ALTER TABLE "Word" ADD COLUMN IF NOT EXISTS "exampleAudioPublicId" TEXT;
