-- AlterTable
ALTER TABLE "public"."Platform" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'blue',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."Tag" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'green',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';
