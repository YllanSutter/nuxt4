-- Correction du drift manuel pour Prisma
-- 1. Création de la table Rating si elle n'existe pas
CREATE TABLE IF NOT EXISTS "Rating" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "value" INTEGER NOT NULL,
    "image" VARCHAR(255),
    "color" VARCHAR(32) DEFAULT 'orange'
);

-- 2. Ajout de la colonne rating_id à UserGame si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='UserGame' AND column_name='rating_id'
    ) THEN
        ALTER TABLE "UserGame" ADD COLUMN "rating_id" VARCHAR(36);
    END IF;
END $$;

-- 3. Ajout de la contrainte de clé étrangère
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='UserGame' AND constraint_type='FOREIGN KEY' AND constraint_name='UserGame_rating_id_fkey'
    ) THEN
        ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "Rating"("id");
    END IF;
END $$;

-- Après exécution, relance la migration Prisma normalement.
