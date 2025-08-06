/*
  Warnings:

  - Added the required column `rating_id` to the `UserGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."UserGame" ADD COLUMN     "rating_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "image" TEXT,
    "color" TEXT NOT NULL DEFAULT 'orange',

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserGame" ADD CONSTRAINT "UserGame_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "public"."Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
