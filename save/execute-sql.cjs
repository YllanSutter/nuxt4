const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données (préfère DIRECT_URL si disponible)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSqlFile(sqlFilePath) {
  const client = await pool.connect();
  
  try {
    console.log('📖 Lecture du fichier SQL...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🚀 Exécution du script SQL...');
    console.log(`📏 Taille du script: ${(sqlContent.length / 1024).toFixed(2)} KB`);
    
    // Diviser le script en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`📊 Nombre de requêtes à exécuter: ${queries.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      // Ignorer les commentaires et les commandes SET
      if (query.startsWith('--') || query.startsWith('SET')) {
        continue;
      }
      
      try {
        await client.query(query);
        successCount++;
        
        // Afficher le progrès tous les 50 requêtes
        if (successCount % 50 === 0) {
          console.log(`✅ ${successCount}/${queries.length} requêtes exécutées...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur dans la requête ${i + 1}:`, error.message);
        console.error(`📝 Requête: ${query.substring(0, 100)}...`);
        
        // Continuer malgré les erreurs (pour les conflits ON CONFLICT)
        if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
          console.error('⚠️  Erreur critique, arrêt du script');
          throw error;
        }
      }
    }
    
    console.log('\n🎉 Exécution terminée !');
    console.log(`✅ Requêtes réussies: ${successCount}`);
    console.log(`⚠️  Requêtes avec erreurs: ${errorCount}`);
    
    // Vérifier les données importées
    console.log('\n📊 Vérification des données importées:');
    
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM "User"'),
      client.query('SELECT COUNT(*) as count FROM "UserGame"'),
      client.query('SELECT COUNT(*) as count FROM "Bundle"'),
      client.query('SELECT COUNT(*) as count FROM "Tag"'),
      client.query('SELECT COUNT(*) as count FROM "Platform"'),
      client.query('SELECT COUNT(*) as count FROM "Label"')
    ]);
    
    console.log(`- Utilisateurs: ${stats[0].rows[0].count}`);
    console.log(`- Jeux: ${stats[1].rows[0].count}`);
    console.log(`- Bundles: ${stats[2].rows[0].count}`);
    console.log(`- Tags: ${stats[3].rows[0].count}`);
    console.log(`- Plateformes: ${stats[4].rows[0].count}`);
    console.log(`- Labels: ${stats[5].rows[0].count}`);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'exécution:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Exécution du script SQL d\'importation...');
    
    // Vérifier la configuration
    if (!connectionString) {
      console.error('❌ Ni DIRECT_URL ni DATABASE_URL ne sont configurées');
      console.log('💡 Configurez votre fichier .env avec vos URLs Supabase');
      process.exit(1);
    }
    
    const sqlFilePath = path.join(__dirname, 'import-data.sql');
    
    // Vérifier que le fichier SQL existe
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ Fichier import-data.sql non trouvé');
      console.log('💡 Exécutez d\'abord: node json-to-sql.cjs');
      process.exit(1);
    }
    
    console.log(`📁 Fichier SQL: ${sqlFilePath}`);
    const dbg = (connectionString.split('@')[1] || '').split('/')[0] || 'database';
    console.log(`🔗 Base de données: ${dbg}`);
    
    await executeSqlFile(sqlFilePath);
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { executeSqlFile };