-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "budget" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bundle" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "link" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "month_id" TEXT NOT NULL,
    "year_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BundleGame" (
    "id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "user_game_id" TEXT NOT NULL,
    "order_in_bundle" INTEGER NOT NULL,

    CONSTRAINT "BundleGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserGame" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "base_game_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "black_market_price" DECIMAL(65,30) NOT NULL,
    "sale_price" DECIMAL(65,30) NOT NULL,
    "initial_price" DECIMAL(65,30) NOT NULL,
    "playtime_hours" DECIMAL(65,30) NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,
    "tag_id" TEXT NOT NULL,
    "order_in_list" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BaseGame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BaseGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "default_visible" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLabelVisibility" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "UserLabelVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Year" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Month" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "id" TEXT NOT NULL,
    "user_game_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "black_market_price" DECIMAL(65,30) NOT NULL,
    "sale_price" DECIMAL(65,30) NOT NULL,
    "initial_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameStat" (
    "id" TEXT NOT NULL,
    "user_game_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "playtime_hours" DECIMAL(65,30) NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "GameStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Bundle" ADD CONSTRAINT "Bundle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bundle" ADD CONSTRAINT "Bundle_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bundle" ADD CONSTRAINT "Bundle_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bundle" ADD CONSTRAINT "Bundle_month_id_fkey" FOREIGN KEY ("month_id") REFERENCES "public"."Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bundle" ADD CONSTRAINT "Bundle_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "public"."Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BundleGame" ADD CONSTRAINT "BundleGame_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BundleGame" ADD CONSTRAINT "BundleGame_user_game_id_fkey" FOREIGN KEY ("user_game_id") REFERENCES "public"."UserGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGame" ADD CONSTRAINT "UserGame_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGame" ADD CONSTRAINT "UserGame_base_game_id_fkey" FOREIGN KEY ("base_game_id") REFERENCES "public"."BaseGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGame" ADD CONSTRAINT "UserGame_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLabelVisibility" ADD CONSTRAINT "UserLabelVisibility_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLabelVisibility" ADD CONSTRAINT "UserLabelVisibility_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "public"."Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceHistory" ADD CONSTRAINT "PriceHistory_user_game_id_fkey" FOREIGN KEY ("user_game_id") REFERENCES "public"."UserGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameStat" ADD CONSTRAINT "GameStat_user_game_id_fkey" FOREIGN KEY ("user_game_id") REFERENCES "public"."UserGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
