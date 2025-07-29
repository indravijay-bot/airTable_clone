-- Run this migration to add the Base and Table models to your database
-- This should be run after updating your Prisma schema

-- The migration will be handled by Prisma, but here's what it will create:

-- Create Base table
-- CREATE TABLE "Base" (
--     "id" TEXT NOT NULL,
--     "name" TEXT NOT NULL,
--     "description" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "createdById" TEXT NOT NULL,
--     CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
-- );

-- Create Table table
-- CREATE TABLE "Table" (
--     "id" TEXT NOT NULL,
--     "name" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "baseId" TEXT NOT NULL,
--     "createdById" TEXT NOT NULL,
--     CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
-- );

-- Add foreign key constraints
-- ALTER TABLE "Base" ADD CONSTRAINT "Base_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE "Table" ADD CONSTRAINT "Table_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Table" ADD CONSTRAINT "Table_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes
-- CREATE INDEX "Base_name_idx" ON "Base"("name");
-- CREATE INDEX "Base_createdById_idx" ON "Base"("createdById");
-- CREATE INDEX "Table_name_idx" ON "Table"("name");
-- CREATE INDEX "Table_baseId_idx" ON "Table"("baseId");
-- CREATE INDEX "Table_createdById_idx" ON "Table"("createdById");

-- To run this migration, use:
-- npx prisma migrate dev --name add-base-and-table-models
