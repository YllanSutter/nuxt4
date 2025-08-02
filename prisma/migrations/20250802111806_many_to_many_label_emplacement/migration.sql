/*
  Warnings:

  - You are about to drop the `emplacement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."emplacement" DROP CONSTRAINT "emplacement_label_id_fkey";

-- AlterTable
ALTER TABLE "public"."Platform" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Tag" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."emplacement";

-- CreateTable
CREATE TABLE "public"."Emplacement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Emplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelEmplacement" (
    "id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "emplacement_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LabelEmplacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabelEmplacement_label_id_emplacement_id_key" ON "public"."LabelEmplacement"("label_id", "emplacement_id");

-- AddForeignKey
ALTER TABLE "public"."LabelEmplacement" ADD CONSTRAINT "LabelEmplacement_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "public"."Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelEmplacement" ADD CONSTRAINT "LabelEmplacement_emplacement_id_fkey" FOREIGN KEY ("emplacement_id") REFERENCES "public"."Emplacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
