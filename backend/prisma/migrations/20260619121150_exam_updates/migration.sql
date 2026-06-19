-- AlterTable
ALTER TABLE "public"."ExamAttempt" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "passed" BOOLEAN,
ADD COLUMN     "percentage" DOUBLE PRECISION;
