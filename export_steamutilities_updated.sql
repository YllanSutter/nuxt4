-- Export SQL SteamUtilities - Adapté au nouveau schéma Prisma
-- Date: 1 août 2025

-- ==========================================
-- TABLE ROLES (Nouvelle table)
-- ==========================================
INSERT INTO "Role" (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Administrateur avec tous les droits'),
('550e8400-e29b-41d4-a716-446655440002', 'user', 'Utilisateur standard');

-- ==========================================
-- TABLE USERS (Adaptée)
-- ==========================================
INSERT INTO "User" (id, name, email, password, budget, created_at, role_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'bundleAccount', 'bundleAccount@gmail.com', '$2b$10$e0g.KUWmSrMskSQbSwuhUOX0EgBwZyNcMPvboG0VDvIVXbCQqI4lK', 0, now(), '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', 'Test User', 'yllan@test.fr', '$2b$10$QiCUIM/HVytl1DTEw40Aluih1OFmxq8lKMQ/ZegeoN7qM7zI/igLO', 0, now(), '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440012', 'Yllan', 'sutter.yllan@laposte.net', '$2b$10$QiCUIM/HVytl1DTEw40Aluih1OFmxq8lKMQ/ZegeoN7qM7zI/igLO', 50, now(), '550e8400-e29b-41d4-a716-446655440001');

-- ==========================================
-- TABLE PLATFORMS (Adaptée)
-- ==========================================
INSERT INTO "Platform" (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'Gamesplanet'),
('550e8400-e29b-41d4-a716-446655440101', 'Green Man Gaming'),
('550e8400-e29b-41d4-a716-446655440102', 'Fanatical'),
('550e8400-e29b-41d4-a716-446655440103', 'Steam'),
('550e8400-e29b-41d4-a716-446655440104', 'Humble'),
('550e8400-e29b-41d4-a716-446655440105', 'Autres');

-- ==========================================
-- TABLE MONTHS (Adaptée)
-- ==========================================
INSERT INTO "Month" (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440200', 'janvier'),
('550e8400-e29b-41d4-a716-446655440201', 'février'),
('550e8400-e29b-41d4-a716-446655440202', 'mars'),
('550e8400-e29b-41d4-a716-446655440203', 'avril'),
('550e8400-e29b-41d4-a716-446655440204', 'mai'),
('550e8400-e29b-41d4-a716-446655440205', 'juin'),
('550e8400-e29b-41d4-a716-446655440206', 'juillet'),
('550e8400-e29b-41d4-a716-446655440207', 'août'),
('550e8400-e29b-41d4-a716-446655440208', 'septembre'),
('550e8400-e29b-41d4-a716-446655440209', 'octobre'),
('550e8400-e29b-41d4-a716-446655440210', 'novembre'),
('550e8400-e29b-41d4-a716-446655440211', 'décembre');

-- ==========================================
-- TABLE YEARS (Adaptée)
-- ==========================================
INSERT INTO "Year" (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440300', '2023'),
('550e8400-e29b-41d4-a716-446655440301', '2024'),
('550e8400-e29b-41d4-a716-446655440302', '2025'),
('550e8400-e29b-41d4-a716-446655440303', '2026');

-- ==========================================
-- TABLE STATES (Nouvelle table pour les états des bundles)
-- ==========================================
INSERT INTO "State" (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440400', 'private', 'Bundle privé'),
('550e8400-e29b-41d4-a716-446655440401', 'public', 'Bundle public'),
('550e8400-e29b-41d4-a716-446655440402', 'shared', 'Bundle partagé');

-- ==========================================
-- TABLE TAGS (Adaptée)
-- ==========================================
INSERT INTO "Tag" (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440500', 'base'),
('550e8400-e29b-41d4-a716-446655440501', 'trade'),
('550e8400-e29b-41d4-a716-446655440502', 'traded'),
('550e8400-e29b-41d4-a716-446655440503', 'platine'),
('550e8400-e29b-41d4-a716-446655440504', 'keep'),
('550e8400-e29b-41d4-a716-446655440505', 'gived');

-- ==========================================
-- TABLE LABELS (Adaptée depuis fieldList)
-- ==========================================
INSERT INTO "Label" (id, name, key, type, image, default_visible, position) VALUES
('550e8400-e29b-41d4-a716-446655440600', 'Tag', 'tagId', 'select', 'mingcute:tag-2-fill', true, 0),
('550e8400-e29b-41d4-a716-446655440601', 'Nom', 'name', 'text', 'mingcute:ad-rectangle-fill', true, 1),
('550e8400-e29b-41d4-a716-446655440602', 'Ordre', 'ordre', 'number', 'mingcute:list-ordered-line', false, 2),
('550e8400-e29b-41d4-a716-446655440603', 'Prix', 'prix', 'number', 'mingcute:currency-euro-fill', true, 4),
('550e8400-e29b-41d4-a716-446655440604', 'Prix Marché', 'prixMarche', 'number', 'mingcute:basket-fill', true, 5),
('550e8400-e29b-41d4-a716-446655440605', 'Prix Soldes', 'prixSoldes', 'number', 'mingcute:tag-fill', true, 6),
('550e8400-e29b-41d4-a716-446655440606', 'Prix Full', 'prixFull', 'number', 'mingcute:pig-money-fill', true, 7),
('550e8400-e29b-41d4-a716-446655440607', 'Heures jouées', 'heure', 'number', 'mingcute:clock-2-fill', true, 8),
('550e8400-e29b-41d4-a716-446655440608', 'Mois', 'moisId', 'select', 'mingcute:calendar-3-fill', true, 10),
('550e8400-e29b-41d4-a716-446655440609', 'Année', 'anneeId', 'select', 'mingcute:rewind-forward-square-5-line', true, 11),
('550e8400-e29b-41d4-a716-446655440610', 'Plateforme', 'plateformeId', 'select', 'mingcute:align-right-line', true, 12),
('550e8400-e29b-41d4-a716-446655440611', 'Bundle', 'bundleId', 'select', 'mingcute:folder-check-fill', false, 13),
('550e8400-e29b-41d4-a716-446655440612', 'Ratio', 'ratio', 'boolean', 'mingcute:presentation-1-fill', true, 14),
('550e8400-e29b-41d4-a716-446655440613', 'Supprimer une ligne', 'delete', 'boolean', 'mingcute:close-circle-fill', true, 16),
('550e8400-e29b-41d4-a716-446655440614', 'Image', 'image', 'text', 'mingcute:photo-album-line', false, 17),
('550e8400-e29b-41d4-a716-446655440615', 'Recherche', 'recherche', 'text', 'mingcute:search-ai-line', true, 18),
('550e8400-e29b-41d4-a716-446655440616', 'Stats', 'stats', 'boolean', 'mingcute:tag-2-fill', false, 19);

-- ==========================================
-- TABLE USER_LABEL_VISIBILITY (Nouvelle relation)
-- ==========================================
-- Visibilité par défaut pour l'utilisateur Yllan (toutes les colonnes visibles sauf ordre, bundle, image, stats)
INSERT INTO "UserLabelVisibility" (id, user_id, label_id, visible) VALUES
('550e8400-e29b-41d4-a716-446655440700', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440600', true),
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440601', true),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440602', false),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440603', true),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440604', true),
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440605', true),
('550e8400-e29b-41d4-a716-446655440706', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440606', true),
('550e8400-e29b-41d4-a716-446655440707', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440607', true),
('550e8400-e29b-41d4-a716-446655440708', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440608', true),
('550e8400-e29b-41d4-a716-446655440709', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440609', true),
('550e8400-e29b-41d4-a716-446655440710', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440610', true),
('550e8400-e29b-41d4-a716-446655440711', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440611', false),
('550e8400-e29b-41d4-a716-446655440712', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440612', true),
('550e8400-e29b-41d4-a716-446655440713', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440613', true),
('550e8400-e29b-41d4-a716-446655440714', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440614', false),
('550e8400-e29b-41d4-a716-446655440715', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440615', true),
('550e8400-e29b-41d4-a716-446655440716', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440616', false);

-- ==========================================
-- TABLE BUNDLES (Adaptée avec nouvelles relations)
-- ==========================================
-- Note: Les bundles incluent maintenant des références aux mois et années
-- Les états sont mappés vers les IDs des States
-- Plateforme par défaut: Humble (la plupart des bundles)
INSERT INTO "Bundle" (id, user_id, name, price, link, image, platform_id, state_id, month_id, year_id, is_public, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655441000', '550e8400-e29b-41d4-a716-446655440012', 'Pedal to the Metal Bundle', 5.39, '', '', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440012', 'Build your own Ruthless Bundle', 5.99, '', '', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440012', 'I am your beast', 12.68, '', '', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440012', 'Steam games mars 2025', 26.48, '', '', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441004', '550e8400-e29b-41d4-a716-446655440012', 'Monster hunter wilds', 48.79, '', '', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441005', '550e8400-e29b-41d4-a716-446655440012', 'Humble Choice - Juillet 2025', 8.25, '', '', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441006', '550e8400-e29b-41d4-a716-446655440012', 'Humble choice - aout 2025', 8.25, '', '', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440302', false, now(), now()),
('550e8400-e29b-41d4-a716-446655441007', '550e8400-e29b-41d4-a716-446655440012', 'Humble choice - Juin 2025', 12.99, '', '', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440302', true, now(), now()),
('550e8400-e29b-41d4-a716-446655441008', '550e8400-e29b-41d4-a716-446655440012', 'Platinum Collection - Build your own Bundle (July 2025)', 9.49, '', '', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440302', true, now(), now());

-- ==========================================
-- TABLE BASE_GAMES (Nouvelle structure)
-- ==========================================
-- Les jeux de base, indépendants des utilisateurs
INSERT INTO "BaseGame" (id, name) VALUES
('550e8400-e29b-41d4-a716-446655442000', 'Army of ruin'),
('550e8400-e29b-41d4-a716-446655442001', 'Prime of flames'),
('550e8400-e29b-41d4-a716-446655442002', 'Slice & dice'),
('550e8400-e29b-41d4-a716-446655442003', 'Planet crafter'),
('550e8400-e29b-41d4-a716-446655442004', 'Teardown'),
('550e8400-e29b-41d4-a716-446655442005', 'Yaoling'),
('550e8400-e29b-41d4-a716-446655442006', 'LEGO Star Wars: The Skywalker Saga'),
('550e8400-e29b-41d4-a716-446655442007', 'Dungeon & degenerate gamblers'),
('550e8400-e29b-41d4-a716-446655442008', 'Dragon quest monsters le prince des ombres'),
('550e8400-e29b-41d4-a716-446655442009', 'Pacific Drive'),
('550e8400-e29b-41d4-a716-446655442010', 'Venba');

-- ==========================================
-- TABLE USER_GAMES (Adaptée)
-- ==========================================
-- Échantillon de jeux adaptés au nouveau schéma
INSERT INTO "UserGame" (id, user_id, base_game_id, name, price, black_market_price, sale_price, initial_price, playtime_hours, rating, tag_id, order_in_list, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655443000', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442000', 'Army of ruin', 1.23, 1.39, 4.47, 7.99, 5.7, 4.5, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443001', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442001', 'Prime of flames', 5.37, 5.41, 5.41, 8.99, 22, 4.2, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442002', 'Slice & dice', 7.71, 11.4, 8.79, 8.79, 150, 4.8, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442003', 'Planet crafter', 10.1, 15.6, 14.39, 23.99, 30.6, 4.3, '550e8400-e29b-41d4-a716-446655440503', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443004', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442004', 'Teardown', 11.47, 14.6, 11.47, 29.99, 10.3, 4.0, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443005', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442005', 'Yaoling', 8.53, 8.53, 19.99, 19.99, 66, 4.5, '550e8400-e29b-41d4-a716-446655440503', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443006', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442006', 'LEGO Star Wars: The Skywalker Saga', 1.11, 9.55, 10.24, 0, 77.6, 4.7, '550e8400-e29b-41d4-a716-446655440503', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443007', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442007', 'Dungeon & degenerate gamblers', 6.5, 6.5, 9.75, 14.79, 2.3, 3.8, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443008', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442008', 'Dragon quest monsters le prince des ombres', 31.99, 39.99, 33.99, 39.99, 35.9, 4.6, '550e8400-e29b-41d4-a716-446655440503', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443009', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442009', 'Pacific Drive', 0.81, 7.7, 17.99, 34.99, 2, 4.1, '550e8400-e29b-41d4-a716-446655440504', 0, now(), now()),
('550e8400-e29b-41d4-a716-446655443010', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655442010', 'Venba', 0.72, 0.46, 5.99, 14.99, 0, 3.9, '550e8400-e29b-41d4-a716-446655440505', 0, now(), now());

-- ==========================================
-- TABLE BUNDLE_GAMES (Nouvelle relation)
-- ==========================================
-- Liaison entre bundles et jeux utilisateur
INSERT INTO "BundleGame" (id, bundle_id, user_game_id, order_in_bundle) VALUES
('550e8400-e29b-41d4-a716-446655444000', '550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655443001', 1),
('550e8400-e29b-41d4-a716-446655444001', '550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655443003', 2),
('550e8400-e29b-41d4-a716-446655444002', '550e8400-e29b-41d4-a716-446655441004', '550e8400-e29b-41d4-a716-446655443008', 1),
('550e8400-e29b-41d4-a716-446655444003', '550e8400-e29b-41d4-a716-446655441005', '550e8400-e29b-41d4-a716-446655443009', 1),
('550e8400-e29b-41d4-a716-446655444004', '550e8400-e29b-41d4-a716-446655441006', '550e8400-e29b-41d4-a716-446655443010', 1);

-- ==========================================
-- TABLE PRICE_HISTORY (Nouvelle pour historique)
-- ==========================================
-- Échantillon d'historique des prix
INSERT INTO "PriceHistory" (id, user_game_id, date, price, black_market_price, sale_price, initial_price) VALUES
('550e8400-e29b-41d4-a716-446655445000', '550e8400-e29b-41d4-a716-446655443002', '2024-06-01', 7.71, 11.4, 8.79, 8.79),
('550e8400-e29b-41d4-a716-446655445001', '550e8400-e29b-41d4-a716-446655443003', '2024-06-01', 10.1, 15.6, 14.39, 23.99),
('550e8400-e29b-41d4-a716-446655445002', '550e8400-e29b-41d4-a716-446655443005', '2024-07-01', 8.53, 8.53, 19.99, 19.99),
('550e8400-e29b-41d4-a716-446655445003', '550e8400-e29b-41d4-a716-446655443008', '2024-09-01', 31.99, 39.99, 33.99, 39.99);

-- ==========================================
-- TABLE GAME_STATS (Nouvelle pour statistiques)
-- ==========================================
-- Échantillon de statistiques de jeu
INSERT INTO "GameStat" (id, user_game_id, date, playtime_hours, rating) VALUES
('550e8400-e29b-41d4-a716-446655446000', '550e8400-e29b-41d4-a716-446655443002', '2024-07-31', 150, 4.8),
('550e8400-e29b-41d4-a716-446655446001', '550e8400-e29b-41d4-a716-446655443005', '2024-07-31', 66, 4.5),
('550e8400-e29b-41d4-a716-446655446002', '550e8400-e29b-41d4-a716-446655443006', '2024-07-31', 77.6, 4.7),
('550e8400-e29b-41d4-a716-446655446003', '550e8400-e29b-41d4-a716-446655443008', '2024-07-31', 35.9, 4.6);

-- ==========================================
-- NOTES DE MIGRATION
-- ==========================================
-- 1. Les anciens champs mois_id et annee_id des jeux ont été déplacés vers les bundles
-- 2. Les états des bundles sont maintenant gérés via une table State
-- 3. Les rôles utilisateur sont maintenant dans une table Role séparée
-- 4. Les fieldList sont devenus des Labels avec visibilité par utilisateur
-- 5. Les prix sont maintenant historisés dans PriceHistory
-- 6. Les statistiques de jeu sont dans GameStat
-- 7. Tous les IDs sont maintenant des UUIDs au lieu d'entiers
-- 8. Les relations sont correctement établies avec les contraintes de clés étrangères
