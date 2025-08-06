const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données Neon.tech
// Remplacez ces valeurs par vos vraies informations de connexion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@hostname:5432/database',
  ssl: {
    rejectUnauthorized: false
  }
});

// Fonction pour lire et parser le fichier JSON
function loadBackupData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error);
    throw error;
  }
}

// Fonction pour créer les tables si elles n'existent pas
async function createTables() {
  const client = await pool.connect();
  
  try {
    // Table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        budget DECIMAL(10,2),
        created_at TIMESTAMP,
        role_id VARCHAR(255)
      )
    `);

    // Table roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT
      )
    `);

    // Table labels
    await client.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        key VARCHAR(255),
        type VARCHAR(50),
        image VARCHAR(255),
        default_visible BOOLEAN,
        position INTEGER,
        color VARCHAR(7)
      )
    `);

    // Table user_label_visibility
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_label_visibility (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        label_id VARCHAR(255) REFERENCES labels(id),
        visible BOOLEAN
      )
    `);

    // Table platforms
    await client.query(`
      CREATE TABLE IF NOT EXISTS platforms (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        image VARCHAR(255),
        color VARCHAR(7)
      )
    `);

    // Table tags
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        image VARCHAR(255),
        color VARCHAR(7)
      )
    `);

    // Table months
    await client.query(`
      CREATE TABLE IF NOT EXISTS months (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        value INTEGER
      )
    `);

    // Table years
    await client.query(`
      CREATE TABLE IF NOT EXISTS years (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        value INTEGER
      )
    `);

    // Table states
    await client.query(`
      CREATE TABLE IF NOT EXISTS states (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        image VARCHAR(255),
        color VARCHAR(7)
      )
    `);

    // Table ratings
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        value INTEGER,
        image VARCHAR(255),
        color VARCHAR(7)
      )
    `);

    // Table base_games
    await client.query(`
      CREATE TABLE IF NOT EXISTS base_games (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255)
      )
    `);

    // Table bundles
    await client.query(`
      CREATE TABLE IF NOT EXISTS bundles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        name VARCHAR(255),
        price DECIMAL(10,2),
        link TEXT,
        image TEXT,
        platform_id VARCHAR(255) REFERENCES platforms(id),
        state_id VARCHAR(255) REFERENCES states(id),
        month_id VARCHAR(255) REFERENCES months(id),
        year_id VARCHAR(255) REFERENCES years(id),
        is_public BOOLEAN,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);

    // Table user_games
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_games (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        base_game_id VARCHAR(255) REFERENCES base_games(id),
        name VARCHAR(255),
        price DECIMAL(10,2),
        black_market_price DECIMAL(10,2),
        sale_price DECIMAL(10,2),
        initial_price DECIMAL(10,2),
        playtime_hours DECIMAL(10,2),
        rating VARCHAR(255),
        rating_id VARCHAR(255) REFERENCES ratings(id),
        tag_id VARCHAR(255) REFERENCES tags(id),
        order_in_list INTEGER,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);

    // Table bundle_games
    await client.query(`
      CREATE TABLE IF NOT EXISTS bundle_games (
        id VARCHAR(255) PRIMARY KEY,
        bundle_id VARCHAR(255) REFERENCES bundles(id),
        user_game_id VARCHAR(255) REFERENCES user_games(id),
        order_in_bundle INTEGER
      )
    `);

    // Table emplacements
    await client.query(`
      CREATE TABLE IF NOT EXISTS emplacements (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        image VARCHAR(255),
        color VARCHAR(7)
      )
    `);

    console.log('✅ Tables créées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Fonction pour insérer les données
async function insertData(data) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insérer le rôle
    if (data.user.role) {
      await client.query(
        'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [data.user.role.id, data.user.role.name, data.user.role.description]
      );
    }

    // Insérer l'utilisateur
    await client.query(
      `INSERT INTO users (id, name, email, password, budget, created_at, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [
        data.user.id,
        data.user.name,
        data.user.email,
        data.user.password,
        parseFloat(data.user.budget),
        new Date(data.user.created_at),
        data.user.role_id
      ]
    );

    // Insérer les labels
    if (data.labels && Array.isArray(data.labels)) {
      for (const label of data.labels) {
        await client.query(
          `INSERT INTO labels (id, name, key, type, image, default_visible, position, color) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [
            label.id,
            label.name,
            label.key,
            label.type,
            label.image,
            label.default_visible,
            label.position,
            label.color
          ]
        );
      }
    }

    // Insérer user_label_visibility
    if (data.user_label_visibility && Array.isArray(data.user_label_visibility)) {
      for (const visibility of data.user_label_visibility) {
        await client.query(
          'INSERT INTO user_label_visibility (id, user_id, label_id, visible) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [visibility.id, visibility.user_id, visibility.label_id, visibility.visible]
        );
      }
    }

    // Insérer les plateformes
    if (data.platforms && Array.isArray(data.platforms)) {
      for (const platform of data.platforms) {
        await client.query(
          'INSERT INTO platforms (id, name, image, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [platform.id, platform.name, platform.image, platform.color]
        );
      }
    }

    // Insérer les tags
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        await client.query(
          'INSERT INTO tags (id, name, image, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [tag.id, tag.name, tag.image, tag.color]
        );
      }
    }

    // Insérer les mois
    if (data.months && Array.isArray(data.months)) {
      for (const month of data.months) {
        await client.query(
          'INSERT INTO months (id, name, value) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [month.id, month.name, month.value]
        );
      }
    }

    // Insérer les années
    if (data.years && Array.isArray(data.years)) {
      for (const year of data.years) {
        await client.query(
          'INSERT INTO years (id, name, value) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [year.id, year.name, year.value]
        );
      }
    }

    // Insérer les états
    if (data.states && Array.isArray(data.states)) {
      for (const state of data.states) {
        await client.query(
          'INSERT INTO states (id, name, image, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [state.id, state.name, state.image, state.color]
        );
      }
    }

    // Insérer les emplacements
    if (data.emplacements && Array.isArray(data.emplacements)) {
      for (const emplacement of data.emplacements) {
        await client.query(
          'INSERT INTO emplacements (id, name, image, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [emplacement.id, emplacement.name, emplacement.image, emplacement.color]
        );
      }
    }

    // Collecter et insérer tous les ratings uniques
    const ratingsSet = new Set();
    data.userGames.forEach(game => {
      if (game.rating_ref) {
        ratingsSet.add(JSON.stringify(game.rating_ref));
      }
    });

    for (const ratingStr of ratingsSet) {
      const rating = JSON.parse(ratingStr);
      await client.query(
        'INSERT INTO ratings (id, name, value, image, color) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [rating.id, rating.name, rating.value, rating.image, rating.color]
      );
    }

    // Collecter et insérer tous les base_games uniques
    const baseGamesSet = new Set();
    data.userGames.forEach(game => {
      if (game.base_game) {
        baseGamesSet.add(JSON.stringify(game.base_game));
      }
    });

    for (const baseGameStr of baseGamesSet) {
      const baseGame = JSON.parse(baseGameStr);
      await client.query(
        'INSERT INTO base_games (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [baseGame.id, baseGame.name]
      );
    }

    // Insérer les bundles
    if (data.bundles && Array.isArray(data.bundles)) {
      for (const bundle of data.bundles) {
        await client.query(
          `INSERT INTO bundles (id, user_id, name, price, link, image, platform_id, state_id, month_id, year_id, is_public, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
          [
            bundle.id,
            bundle.user_id,
            bundle.name,
            parseFloat(bundle.price),
            bundle.link,
            bundle.image,
            bundle.platform_id,
            bundle.state_id,
            bundle.month_id,
            bundle.year_id,
            bundle.is_public,
            new Date(bundle.created_at),
            new Date(bundle.updated_at)
          ]
        );
      }
    }

    // Insérer les user_games
    let gameCount = 0;
    for (const game of data.userGames) {
      await client.query(
        `INSERT INTO user_games (id, user_id, base_game_id, name, price, black_market_price, sale_price, initial_price, playtime_hours, rating, rating_id, tag_id, order_in_list, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT (id) DO NOTHING`,
        [
          game.id,
          game.user_id,
          game.base_game_id,
          game.name,
          parseFloat(game.price),
          parseFloat(game.black_market_price),
          parseFloat(game.sale_price),
          parseFloat(game.initial_price),
          parseFloat(game.playtime_hours),
          game.rating,
          game.rating_id,
          game.tag_id,
          game.order_in_list,
          new Date(game.created_at),
          new Date(game.updated_at)
        ]
      );

      // Insérer les bundle_games pour ce jeu
      if (game.bundle_games && Array.isArray(game.bundle_games)) {
        for (const bundleGame of game.bundle_games) {
          await client.query(
            'INSERT INTO bundle_games (id, bundle_id, user_game_id, order_in_bundle) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [bundleGame.id, bundleGame.bundle_id, bundleGame.user_game_id, bundleGame.order_in_bundle]
          );
        }
      }

      gameCount++;
      if (gameCount % 50 === 0) {
        console.log(`📊 ${gameCount}/${data.userGames.length} jeux traités...`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Toutes les données ont été importées avec succès');
    
    // Afficher les statistiques
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM user_games) as games_count,
        (SELECT COUNT(*) FROM bundles) as bundles_count,
        (SELECT COUNT(*) FROM tags) as tags_count,
        (SELECT COUNT(*) FROM platforms) as platforms_count
    `);
    
    console.log('\n📊 Statistiques d\'importation:');
    console.log(`- Utilisateurs: ${stats.rows[0].users_count}`);
    console.log(`- Jeux: ${stats.rows[0].games_count}`);
    console.log(`- Bundles: ${stats.rows[0].bundles_count}`);
    console.log(`- Tags: ${stats.rows[0].tags_count}`);
    console.log(`- Plateformes: ${stats.rows[0].platforms_count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de l\'importation...');
    
    // Charger les données du backup
    const backupPath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
    console.log('📖 Lecture du fichier de sauvegarde...');
    const data = loadBackupData(backupPath);
    
    console.log(`📊 Données trouvées:`);
    console.log(`- Export date: ${data.exportDate}`);
    console.log(`- User ID: ${data.userId}`);
    console.log(`- Nombre de jeux: ${data.userGames?.length || 0}`);
    console.log(`- Nombre de bundles: ${data.bundles?.length || 0}`);
    console.log(`- Nombre de tags: ${data.tags?.length || 0}`);
    console.log(`- Nombre de plateformes: ${data.platforms?.length || 0}`);
    
    // Créer les tables
    console.log('🏗️  Création des tables...');
    await createTables();
    
    // Insérer les données
    console.log('💾 Insertion des données...');
    await insertData(data);
    
    console.log('🎉 Importation terminée avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'importation:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, loadBackupData, createTables, insertData };