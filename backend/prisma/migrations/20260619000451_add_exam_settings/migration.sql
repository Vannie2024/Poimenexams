-- CreateEnum
CREATE TYPE "public"."MarkingSystem" AS ENUM ('STANDARD', 'NEGATIVE', 'CUSTOM');

-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "allowRetakes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "correctMarks" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "markingSystem" "public"."MarkingSystem" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wrongMarks" DOUBLE PRECISION NOT NULL DEFAULT 0;
