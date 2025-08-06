const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

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

// Fonction pour insérer les données avec Prisma
async function insertData(data) {
  try {
    console.log('🚀 Début de l\'importation avec Prisma...');

    // Insérer le rôle
    if (data.user.role) {
      await prisma.role.upsert({
        where: { id: data.user.role.id },
        update: {},
        create: {
          id: data.user.role.id,
          name: data.user.role.name,
          description: data.user.role.description
        }
      });
      console.log('✅ Rôle inséré');
    }

    // Insérer l'utilisateur
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: {},
      create: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        password: data.user.password,
        budget: parseFloat(data.user.budget),
        created_at: new Date(data.user.created_at),
        role_id: data.user.role_id
      }
    });
    console.log('✅ Utilisateur inséré');

    // Insérer les labels
    if (data.labels && Array.isArray(data.labels)) {
      for (const label of data.labels) {
        await prisma.label.upsert({
          where: { id: label.id },
          update: {},
          create: {
            id: label.id,
            name: label.name,
            key: label.key,
            type: label.type,
            image: label.image,
            default_visible: label.default_visible,
            position: label.position,
            color: label.color
          }
        });
      }
      console.log(`✅ ${data.labels.length} labels insérés`);
    }

    // Insérer user_label_visibility
    if (data.user_label_visibility && Array.isArray(data.user_label_visibility)) {
      for (const visibility of data.user_label_visibility) {
        await prisma.userLabelVisibility.upsert({
          where: { id: visibility.id },
          update: {},
          create: {
            id: visibility.id,
            user_id: visibility.user_id,
            label_id: visibility.label_id,
            visible: visibility.visible
          }
        });
      }
      console.log(`✅ ${data.user_label_visibility.length} visibilités de labels insérées`);
    }

    // Insérer les plateformes
    if (data.platforms && Array.isArray(data.platforms)) {
      for (const platform of data.platforms) {
        await prisma.platform.upsert({
          where: { id: platform.id },
          update: {},
          create: {
            id: platform.id,
            name: platform.name,
            image: platform.image,
            color: platform.color
          }
        });
      }
      console.log(`✅ ${data.platforms.length} plateformes insérées`);
    }

    // Insérer les tags
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        await prisma.tag.upsert({
          where: { id: tag.id },
          update: {},
          create: {
            id: tag.id,
            name: tag.name,
            image: tag.image,
            color: tag.color
          }
        });
      }
      console.log(`✅ ${data.tags.length} tags insérés`);
    }

    // Insérer les mois
    if (data.months && Array.isArray(data.months)) {
      for (const month of data.months) {
        await prisma.month.upsert({
          where: { id: month.id },
          update: {},
          create: {
            id: month.id,
            name: month.name
          }
        });
      }
      console.log(`✅ ${data.months.length} mois insérés`);
    }

    // Insérer les années
    if (data.years && Array.isArray(data.years)) {
      for (const year of data.years) {
        await prisma.year.upsert({
          where: { id: year.id },
          update: {},
          create: {
            id: year.id,
            name: year.name
          }
        });
      }
      console.log(`✅ ${data.years.length} années insérées`);
    }

    // Insérer les états
    if (data.states && Array.isArray(data.states)) {
      for (const state of data.states) {
        await prisma.state.upsert({
          where: { id: state.id },
          update: {},
          create: {
            id: state.id,
            name: state.name,
            description: state.description || state.name
          }
        });
      }
      console.log(`✅ ${data.states.length} états insérés`);
    }

    // Insérer les emplacements (si présents)
    if (data.emplacements && Array.isArray(data.emplacements)) {
      for (const emplacement of data.emplacements) {
        await prisma.emplacement.upsert({
          where: { id: emplacement.id },
          update: {},
          create: {
            id: emplacement.id,
            name: emplacement.name
          }
        });
      }
      console.log(`✅ ${data.emplacements.length} emplacements insérés`);
    } else {
      console.log('ℹ️  Aucun emplacement à insérer');
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
      await prisma.rating.upsert({
        where: { id: rating.id },
        update: {},
        create: {
          id: rating.id,
          name: rating.name,
          value: rating.value,
          image: rating.image,
          color: rating.color
        }
      });
    }
    console.log(`✅ ${ratingsSet.size} ratings insérés`);

    // Collecter et insérer tous les base_games uniques
    const baseGamesSet = new Set();
    data.userGames.forEach(game => {
      if (game.base_game) {
        baseGamesSet.add(JSON.stringify(game.base_game));
      }
    });

    for (const baseGameStr of baseGamesSet) {
      const baseGame = JSON.parse(baseGameStr);
      await prisma.baseGame.upsert({
        where: { id: baseGame.id },
        update: {},
        create: {
          id: baseGame.id,
          name: baseGame.name
        }
      });
    }
    console.log(`✅ ${baseGamesSet.size} jeux de base insérés`);

    // Insérer les bundles
    if (data.bundles && Array.isArray(data.bundles)) {
      for (const bundle of data.bundles) {
        await prisma.bundle.upsert({
          where: { id: bundle.id },
          update: {},
          create: {
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
            created_at: new Date(bundle.created_at),
            updated_at: new Date(bundle.updated_at)
          }
        });
      }
      console.log(`✅ ${data.bundles.length} bundles insérés`);
    }

    // Insérer les user_games
    let gameCount = 0;
    for (const game of data.userGames) {
      await prisma.userGame.upsert({
        where: { id: game.id },
        update: {},
        create: {
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
          created_at: new Date(game.created_at),
          updated_at: new Date(game.updated_at)
        }
      });

      // Insérer les bundle_games pour ce jeu
      if (game.bundle_games && Array.isArray(game.bundle_games)) {
        for (const bundleGame of game.bundle_games) {
          await prisma.bundleGame.upsert({
            where: { id: bundleGame.id },
            update: {},
            create: {
              id: bundleGame.id,
              bundle_id: bundleGame.bundle_id,
              user_game_id: bundleGame.user_game_id,
              order_in_bundle: bundleGame.order_in_bundle
            }
          });
        }
      }

      gameCount++;
      if (gameCount % 50 === 0) {
        console.log(`📊 ${gameCount}/${data.userGames.length} jeux traités...`);
      }
    }
    console.log(`✅ ${data.userGames.length} jeux insérés`);

    console.log('🎉 Importation terminée avec succès !');
    
    // Afficher les statistiques
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.userGame.count(),
      prisma.bundle.count(),
      prisma.tag.count(),
      prisma.platform.count()
    ]);
    
    console.log('\n📊 Statistiques d\'importation:');
    console.log(`- Utilisateurs: ${stats[0]}`);
    console.log(`- Jeux: ${stats[1]}`);
    console.log(`- Bundles: ${stats[2]}`);
    console.log(`- Tags: ${stats[3]}`);
    console.log(`- Plateformes: ${stats[4]}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de l\'importation avec Prisma...');
    
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
    
    // Insérer les données
    await insertData(data);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'importation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, loadBackupData, insertData };