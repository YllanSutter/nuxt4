const { convertJsonToSql } = require('./json-to-sql.cjs');
const { executeSqlFile } = require('./execute-sql.cjs');
const path = require('path');
const fs = require('fs');

async function importJsonDirect(jsonFilePath) {
  try {
    console.log('🚀 Importation directe JSON vers base de données...');
    console.log('=' .repeat(60));
    
    // Étape 1: Convertir JSON vers SQL
    console.log('📝 Étape 1: Conversion JSON vers SQL...');
    const sqlFilePath = path.join(__dirname, 'import-data.sql');
    convertJsonToSql(jsonFilePath, sqlFilePath);
    
    console.log('\n⏳ Attente de 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Étape 2: Exécuter le fichier SQL
    console.log('\n💾 Étape 2: Exécution du script SQL...');
    await executeSqlFile(sqlFilePath);
    
    console.log('\n🎉 Importation directe terminée avec succès !');
    console.log('✅ Vos données sont maintenant dans votre base de données Neon.tech');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'importation directe:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Vérifier la configuration
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variable DATABASE_URL non configurée');
      console.log('💡 Configurez votre fichier .env avec votre chaîne de connexion Neon.tech');
      process.exit(1);
    }
    
    const jsonFilePath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
    
    // Vérifier que le fichier JSON existe
    if (!fs.existsSync(jsonFilePath)) {
      console.error('❌ Fichier JSON non trouvé');
      console.log(`📁 Chemin attendu: ${jsonFilePath}`);
      process.exit(1);
    }
    
    console.log(`📖 Fichier source: ${jsonFilePath}`);
    console.log(`🔗 Base de données: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Neon.tech'}`);
    
    await importJsonDirect(jsonFilePath);
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { importJsonDirect };