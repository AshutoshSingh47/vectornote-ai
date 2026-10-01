CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "embedding" vector(384);
