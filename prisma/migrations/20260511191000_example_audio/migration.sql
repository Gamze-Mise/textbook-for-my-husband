-- Add example audio fields to Word
ALTER TABLE "Word"
ADD COLUMN IF NOT EXISTS "exampleAudioUrl" TEXT,
ADD COLUMN IF NOT EXISTS "exampleAudioPublicId" TEXT;
