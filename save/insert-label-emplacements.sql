-- Script SQL pour insérer les relations LabelEmplacement
-- Généré automatiquement selon les spécifications

-- D'abord, insérer les emplacements s'ils n'existent pas
INSERT INTO "Emplacement" ("id", "name") VALUES
('emplacement-calculs', 'Calculs'),
('emplacement-filtres', 'Filtres'),
('emplacement-main', 'Main')
ON CONFLICT ("id") DO NOTHING;

-- Relations pour emplacement-calculs
INSERT INTO "LabelEmplacement" ("id", "label_id", "emplacement_id", "position") VALUES
('labelempl-calc-1', 'label-black-market-price', 'emplacement-calculs', 1),
('labelempl-calc-2', 'label-initial-price', 'emplacement-calculs', 2),
('labelempl-calc-3', 'label-playtime', 'emplacement-calculs', 3),
('labelempl-calc-4', 'label-price', 'emplacement-calculs', 4),
('labelempl-calc-5', 'label-sale-price', 'emplacement-calculs', 5)
ON CONFLICT ("id") DO UPDATE SET
"position" = EXCLUDED."position";

-- Relations pour emplacement-filtres
INSERT INTO "LabelEmplacement" ("id", "label_id", "emplacement_id", "position") VALUES
('labelempl-filt-1', 'label-bundle-filter', 'emplacement-filtres', 1),
('labelempl-filt-2', 'label-month-filter', 'emplacement-filtres', 2),
('labelempl-filt-3', 'label-platform-filter', 'emplacement-filtres', 3),
('labelempl-filt-4', 'label-rating', 'emplacement-filtres', 4),
('labelempl-filt-5', 'label-search', 'emplacement-filtres', 5),
('labelempl-filt-6', 'label-tag', 'emplacement-filtres', 6),
('labelempl-filt-7', 'label-year-filter', 'emplacement-filtres', 7)
ON CONFLICT ("id") DO UPDATE SET
"position" = EXCLUDED."position";

-- Relations pour emplacement-main
INSERT INTO "LabelEmplacement" ("id", "label_id", "emplacement_id", "position") VALUES
('labelempl-main-1', 'label-black-market-price', 'emplacement-main', 1),
('labelempl-main-2', 'label-delete', 'emplacement-main', 2),
('labelempl-main-3', 'label-image', 'emplacement-main', 3),
('labelempl-main-4', 'label-initial-price', 'emplacement-main', 4),
('labelempl-main-5', 'label-month-filter', 'emplacement-main', 5),
('labelempl-main-6', 'label-name', 'emplacement-main', 6),
('labelempl-main-7', 'label-order', 'emplacement-main', 7),
('labelempl-main-8', 'label-platform-filter', 'emplacement-main', 8),
('labelempl-main-9', 'label-playtime', 'emplacement-main', 9),
('labelempl-main-10', 'label-price', 'emplacement-main', 10),
('labelempl-main-11', 'label-rating', 'emplacement-main', 11),
('labelempl-main-12', 'label-sale-price', 'emplacement-main', 12),
('labelempl-main-13', 'label-tag', 'emplacement-main', 13)
ON CONFLICT ("id") DO UPDATE SET
"position" = EXCLUDED."position";

-- Vérification des insertions
SELECT 
    e.name as emplacement,
    COUNT(le.id) as nb_labels
FROM "Emplacement" e
LEFT JOIN "LabelEmplacement" le ON e.id = le.emplacement_id
GROUP BY e.id, e.name
ORDER BY e.name;