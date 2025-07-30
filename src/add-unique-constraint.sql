-- Add unique constraint for rowId and columnId combination
-- This prevents duplicate cells for the same row/column combination

-- First, remove any duplicate cells if they exist
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "rowId", "columnId" ORDER BY "createdAt") as rn
  FROM "Cell"
)
DELETE FROM "Cell" 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add the unique constraint
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_rowId_columnId_key" UNIQUE ("rowId", "columnId");
