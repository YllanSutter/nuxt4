/*
  Warnings:

  - You are about to alter the column `price` on the `Bundle` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `playtime_hours` on the `GameStat` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `rating` on the `GameStat` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `black_market_price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `sale_price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `initial_price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `budget` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `black_market_price` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `sale_price` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `initial_price` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `playtime_hours` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `rating` on the `UserGame` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Bundle" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."GameStat" ALTER COLUMN "playtime_hours" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."PriceHistory" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "black_market_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "sale_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "initial_price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "budget" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."UserGame" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "black_market_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "sale_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "initial_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "playtime_hours" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(5,2);
