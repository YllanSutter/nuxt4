-- Script SQL pour corriger la précision des champs Decimal
-- Transforme 0.410000000000000000000000000000 en 0.41

-- 1. Modifier les colonnes de la table User
ALTER TABLE "User" 
ALTER COLUMN "budget" TYPE DECIMAL(10,2);

-- 2. Modifier les colonnes de la table Bundle
ALTER TABLE "Bundle" 
ALTER COLUMN "price" TYPE DECIMAL(10,2);

-- 3. Modifier les colonnes de la table UserGame
ALTER TABLE "UserGame" 
ALTER COLUMN "price" TYPE DECIMAL(10,2),
ALTER COLUMN "black_market_price" TYPE DECIMAL(10,2),
ALTER COLUMN "sale_price" TYPE DECIMAL(10,2),
ALTER COLUMN "initial_price" TYPE DECIMAL(10,2),
ALTER COLUMN "playtime_hours" TYPE DECIMAL(10,2),
ALTER COLUMN "rating" TYPE DECIMAL(5,2);

-- 4. Modifier les colonnes de la table PriceHistory
ALTER TABLE "PriceHistory" 
ALTER COLUMN "price" TYPE DECIMAL(10,2),
ALTER COLUMN "black_market_price" TYPE DECIMAL(10,2),
ALTER COLUMN "sale_price" TYPE DECIMAL(10,2),
ALTER COLUMN "initial_price" TYPE DECIMAL(10,2);

-- 5. Modifier les colonnes de la table GameStat
ALTER TABLE "GameStat" 
ALTER COLUMN "playtime_hours" TYPE DECIMAL(10,2),
ALTER COLUMN "rating" TYPE DECIMAL(5,2);

-- Vérification des changements
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND data_type = 'numeric'
ORDER BY table_name, column_name;