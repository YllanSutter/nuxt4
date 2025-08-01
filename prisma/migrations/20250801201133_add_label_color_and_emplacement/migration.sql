-- AlterTable
ALTER TABLE "public"."Label" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'red';

-- CreateTable
CREATE TABLE "public"."emplacement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,

    CONSTRAINT "emplacement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."emplacement" ADD CONSTRAINT "emplacement_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "public"."Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
