-- Add rowCount column to Table
ALTER TABLE "Table" ADD COLUMN "rowCount" INTEGER NOT NULL DEFAULT 0;

-- Update existing tables with their current row counts
UPDATE "Table" 
SET "rowCount" = (
  SELECT COUNT(*) 
  FROM "Row" 
  WHERE "Row"."tableId" = "Table"."id"
);
