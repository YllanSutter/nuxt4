const { execSync } = require('child_process');
const { convertJsonToSql } = require('./json-to-sql.cjs');
const path = require('path');
const fs = require('fs');

function main() {
  try {
    console.log('🚀 Importation simple JSON vers PostgreSQL...');
    console.log('=' .repeat(60));
    
    // Vérifier la configuration
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variable DATABASE_URL non configurée');
      console.log('💡 Configurez votre fichier .env avec votre chaîne de connexion Neon.tech');
      process.exit(1);
    }
    
    const jsonFilePath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
    const sqlFilePath = path.join(__dirname, 'import-data.sql');
    
    // Vérifier que le fichier JSON existe
    if (!fs.existsSync(jsonFilePath)) {
      console.error('❌ Fichier JSON non trouvé');
      console.log(`📁 Chemin attendu: ${jsonFilePath}`);
      process.exit(1);
    }
    
    // Étape 1: Convertir JSON vers SQL
    console.log('📝 Étape 1: Conversion JSON vers SQL avec UPSERTS...');
    convertJsonToSql(jsonFilePath, sqlFilePath);
    
    // Étape 2: Exécuter avec psql
    console.log('\n💾 Étape 2: Exécution du script SQL...');
    console.log('🔗 Connexion à la base de données...');
    
    try {
      // Utiliser psql pour exécuter le fichier SQL
      const command = `psql "${process.env.DATABASE_URL}" -f "${sqlFilePath}"`;
      console.log('⚡ Exécution en cours...');
      
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Script SQL exécuté avec succès !');
      
      // Afficher les dernières lignes de sortie (statistiques)
      const lines = output.split('\n').filter(line => line.trim());
      const lastLines = lines.slice(-10);
      console.log('\n📊 Résultats:');
      lastLines.forEach(line => {
        if (line.includes('INSERT')) {
          console.log(`✅ ${line}`);
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution SQL:', error.message);
      
      // Afficher des informations utiles
      if (error.message.includes('psql')) {
        console.log('\n💡 Solutions possibles:');
        console.log('1. Installez PostgreSQL client: https://www.postgresql.org/download/');
        console.log('2. Ou utilisez: npm run import:prisma (méthode alternative)');
        console.log('3. Ou copiez le contenu de import-data.sql dans votre interface Neon.tech');
      }
      
      throw error;
    }
    
    console.log('\n🎉 Importation terminée avec succès !');
    console.log('✅ Vos données sont maintenant dans votre base de données Neon.tech');
    console.log('\n📋 Avantages des UPSERTS utilisés:');
    console.log('- ✅ Pas d\'erreurs si les données existent déjà');
    console.log('- ✅ Mise à jour automatique des données modifiées');
    console.log('- ✅ Idempotent: peut être exécuté plusieurs fois sans problème');
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main };