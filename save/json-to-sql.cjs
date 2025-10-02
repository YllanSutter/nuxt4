const fs = require('fs');
const path = require('path');

// Fonction pour échapper les valeurs SQL
function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    // Échapper les apostrophes et autres caractères spéciaux
    return "'" + value.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Fonction pour générer une requête UPSERT
function generateUpsert(tableName, data, conflictField = 'id') {
  if (!Array.isArray(data) || data.length === 0) {
    return `-- Aucune donnée pour la table ${tableName}\n`;
  }

  const columns = Object.keys(data[0]);
  const values = data.map(row => {
    const rowValues = columns.map(col => escapeSqlValue(row[col]));
    return `(${rowValues.join(', ')})`;
  });

  // Générer la clause UPDATE pour l'upsert
  const updateClauses = columns
    .filter(col => col !== conflictField) // Exclure la clé primaire
    .map(col => `"${col}" = EXCLUDED."${col}"`)
    .join(', ');

  return `-- Table ${tableName}
INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES
${values.join(',\n')}
ON CONFLICT ("${conflictField}") DO UPDATE SET
${updateClauses};

`;
}

// Fonction pour générer une requête INSERT simple (pour les cas où on veut juste ignorer)
function generateInsert(tableName, data, conflictField = 'id') {
  if (!Array.isArray(data) || data.length === 0) {
    return `-- Aucune donnée pour la table ${tableName}\n`;
  }

  const columns = Object.keys(data[0]);
  const values = data.map(row => {
    const rowValues = columns.map(col => escapeSqlValue(row[col]));
    return `(${rowValues.join(', ')})`;
  });

  return `-- Table ${tableName}
INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES
${values.join(',\n')}
ON CONFLICT ("${conflictField}") DO NOTHING;

`;
}

// Fonction principale
function convertJsonToSql(jsonFilePath, outputPath) {
  try {
    console.log('📖 Lecture du fichier JSON...');
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    const userRecord = Array.isArray(data.user) ? data.user[0] : data.user;
    let sql = `-- Script SQL généré automatiquement depuis ${path.basename(jsonFilePath)}
-- Date de génération: ${new Date().toISOString()}
-- Utilisateur: ${userRecord?.name ?? 'unknown'} (${userRecord?.email ?? 'unknown'})

SET client_encoding = 'UTF8';

`;

    // 1. Insérer le rôle (INSERT simple car données de référence)
    if (userRecord && userRecord.role) {
      sql += generateInsert('Role', [userRecord.role]);
    }

    // 2. Insérer l'utilisateur (UPSERT pour mettre à jour si existe)
    if (userRecord) {
      const userData = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        password: userRecord.password,
        budget: userRecord.budget !== undefined && userRecord.budget !== null ? parseFloat(userRecord.budget) : null,
        created_at: userRecord.created_at,
        role_id: userRecord.role_id
      };
      sql += generateUpsert('User', [userData]);
    }

    // 3. Insérer les labels (UPSERT pour mettre à jour si modifiés)
    if (data.labels && data.labels.length > 0) {
      const labelsData = data.labels.map(label => ({
        id: label.id,
        name: label.name,
        key: label.key,
        type: label.type,
        image: label.image,
        default_visible: label.default_visible,
        position: label.position,
        color: label.color
      }));
      sql += generateUpsert('Label', labelsData);
    }

    // 4. Insérer les visibilités de labels (UPSERT pour mettre à jour les préférences)
    const userLabelVisibility = Array.isArray(data.user_label_visibility)
      ? data.user_label_visibility
      : (userRecord && Array.isArray(userRecord.user_label_visibility) ? userRecord.user_label_visibility : []);
    if (userLabelVisibility && userLabelVisibility.length > 0) {
      const visibilityData = userLabelVisibility.map(visibility => ({
        id: visibility.id,
        user_id: visibility.user_id,
        label_id: visibility.label_id,
        visible: visibility.visible
      }));
      sql += generateUpsert('UserLabelVisibility', visibilityData);
    }

    // 5. Insérer les plateformes
    if (data.platforms && data.platforms.length > 0) {
      sql += generateInsert('Platform', data.platforms);
    }

    // 6. Insérer les tags
    if (data.tags && data.tags.length > 0) {
      sql += generateInsert('Tag', data.tags);
    }

    // 7. Insérer les mois
    if (data.months && data.months.length > 0) {
      sql += generateInsert('Month', data.months);
    }

    // 8. Insérer les années
    if (data.years && data.years.length > 0) {
      sql += generateInsert('Year', data.years);
    }

    // 9. Insérer les états
    if (data.states && data.states.length > 0) {
      sql += generateInsert('State', data.states);
    }

    // 10. Insérer les emplacements (si présents)
    if (data.emplacements && data.emplacements.length > 0) {
      const emplacementsData = data.emplacements.map(e => ({ id: e.id, name: e.name }));
      sql += generateInsert('Emplacement', emplacementsData);
    }

    // 11. Insérer les ratings (données de référence)
    let ratingsCount = 0;
    if (data.ratings && data.ratings.length > 0) {
      sql += generateInsert('Rating', data.ratings);
      ratingsCount = data.ratings.length;
    } else {
      // Fallback: collecter depuis les jeux si pas dans l'export
      const ratingsSet = new Set();
      data.userGames.forEach(game => {
        if (game.rating_ref) {
          ratingsSet.add(JSON.stringify(game.rating_ref));
        }
      });
      
      if (ratingsSet.size > 0) {
        const ratings = Array.from(ratingsSet).map(ratingStr => JSON.parse(ratingStr));
        sql += generateInsert('Rating', ratings);
      }
      ratingsCount = ratingsSet.size;
    }

    // 11b. Insérer tous les utilisateurs et rôles (si disponibles)
    if (data.allRoles && data.allRoles.length > 0) {
      sql += generateInsert('Role', data.allRoles);
    }

    if (data.allUsers && data.allUsers.length > 0) {
      const allUsersData = data.allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        budget: parseFloat(user.budget),
        created_at: user.created_at,
        role_id: user.role_id
      }));
      sql += generateUpsert('User', allUsersData);
    }

    // 12. Collecter et insérer tous les base_games uniques
    const baseGamesSet = new Set();
    data.userGames.forEach(game => {
      if (game.base_game) {
        baseGamesSet.add(JSON.stringify(game.base_game));
      }
    });
    
    if (baseGamesSet.size > 0) {
      const baseGames = Array.from(baseGamesSet).map(gameStr => JSON.parse(gameStr));
      sql += generateInsert('BaseGame', baseGames);
    }

    // 13. Insérer les bundles (UPSERT pour mettre à jour les bundles modifiés)
    if (data.bundles && data.bundles.length > 0) {
      const bundlesData = data.bundles.map(bundle => ({
        id: bundle.id,
        user_id: bundle.user_id,
        name: bundle.name,
        price: parseFloat(bundle.price),
        link: bundle.link,
        image: bundle.image,
        platform_id: bundle.platform_id,
        state_id: bundle.state_id,
        month_id: bundle.month_id,
        year_id: bundle.year_id,
        is_public: bundle.is_public,
        created_at: bundle.created_at,
        updated_at: bundle.updated_at
      }));
      sql += generateUpsert('Bundle', bundlesData);
    }

    // 14. Insérer les user_games (UPSERT pour mettre à jour les jeux modifiés)
    if (data.userGames && data.userGames.length > 0) {
      const userGamesData = data.userGames.map(game => ({
        id: game.id,
        user_id: game.user_id,
        base_game_id: game.base_game_id,
        name: game.name,
        price: parseFloat(game.price),
        black_market_price: parseFloat(game.black_market_price),
        sale_price: parseFloat(game.sale_price),
        initial_price: parseFloat(game.initial_price),
        playtime_hours: parseFloat(game.playtime_hours),
        rating: parseFloat(game.rating),
        rating_id: game.rating_id,
        tag_id: game.tag_id,
        order_in_list: game.order_in_list,
        created_at: game.created_at,
        updated_at: game.updated_at
      }));
      sql += generateUpsert('UserGame', userGamesData);
    }

    // 15. Insérer les bundle_games (UPSERT pour mettre à jour les relations)
    const allBundleGames = [];
    data.userGames.forEach(game => {
      if (game.bundle_games && Array.isArray(game.bundle_games)) {
        game.bundle_games.forEach(bundleGame => {
          allBundleGames.push({
            id: bundleGame.id,
            bundle_id: bundleGame.bundle_id,
            user_game_id: bundleGame.user_game_id,
            order_in_bundle: bundleGame.order_in_bundle
          });
        });
      }
    });
    
    if (allBundleGames.length > 0) {
      sql += generateUpsert('BundleGame', allBundleGames);
    }

    // 16. Insérer les LabelEmplacement (si disponibles dans l'export)
    if (data.labelEmplacements && data.labelEmplacements.length > 0) {
      const labelEmplacementsData = data.labelEmplacements.map(le => ({
        id: le.id,
        label_id: le.label_id,
        emplacement_id: le.emplacement_id,
        position: le.position
      }));
      sql += generateUpsert('LabelEmplacement', labelEmplacementsData);
    }

    // Ajouter les statistiques à la fin
    sql += `
-- Statistiques d'importation:
-- Utilisateurs: 1
-- Jeux: ${data.userGames?.length || 0}
-- Bundles: ${data.bundles?.length || 0}
-- Tags: ${data.tags?.length || 0}
-- Plateformes: ${data.platforms?.length || 0}
-- Labels: ${data.labels?.length || 0}
-- Ratings: ${ratingsCount}
-- Jeux de base: ${baseGamesSet.size}
-- Relations bundle-jeux: ${allBundleGames.length}

-- Fin du script
`;

    // Écrire le fichier SQL
    fs.writeFileSync(outputPath, sql, 'utf8');
    
    console.log('✅ Fichier SQL généré avec succès !');
    console.log(`📁 Fichier de sortie: ${outputPath}`);
    console.log(`📊 Statistiques:`);
    console.log(`   - Jeux: ${data.userGames?.length || 0}`);
    console.log(`   - Bundles: ${data.bundles?.length || 0}`);
    console.log(`   - Tags: ${data.tags?.length || 0}`);
    console.log(`   - Plateformes: ${data.platforms?.length || 0}`);
    console.log(`   - Labels: ${data.labels?.length || 0}`);
    console.log(`   - Ratings: ${ratingsCount}`);
    console.log(`   - Jeux de base: ${baseGamesSet.size}`);
    console.log(`   - Relations bundle-jeux: ${allBundleGames.length}`);
    
    const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`📏 Taille du fichier SQL: ${fileSizeKB} KB`);

  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error.message);
    throw error;
  }
}

// Fonction principale
function main() {
  const jsonFilePath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
  const outputPath = path.join(__dirname, 'import-data.sql');
  
  console.log('🚀 Conversion JSON vers SQL...');
  console.log(`📖 Fichier source: ${jsonFilePath}`);
  console.log(`📝 Fichier de sortie: ${outputPath}`);
  
  convertJsonToSql(jsonFilePath, outputPath);
  
  console.log('\n🎉 Conversion terminée !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Vérifiez le fichier import-data.sql généré');
  console.log('2. Exécutez le script SQL dans votre base de données Neon.tech');
  console.log('3. Ou utilisez: psql $DATABASE_URL -f import-data.sql');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { convertJsonToSql, generateInsert, escapeSqlValue };