-- Script pour assigner tous les labels à l'emplacement "main"

-- D'abord, créer ou récupérer l'emplacement "main" (avec id 1)
INSERT INTO "Emplacement" (id, name)
VALUES ('1', 'main')
ON CONFLICT (id) DO NOTHING;

-- Assigner tous les labels à l'emplacement "1"
UPDATE "Label" 
SET emplacement_id = '1'
WHERE emplacement_id IS NULL;

-- Vérification : afficher tous les labels avec leur emplacement
SELECT 
  l.name as label_name,
  l.id as label_id,
  e.name as emplacement_name
FROM "Label" l
LEFT JOIN "Emplacement" e ON l.emplacement_id = e.id
ORDER BY l.name;
