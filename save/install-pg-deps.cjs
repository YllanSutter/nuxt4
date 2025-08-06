const { execSync } = require('child_process');

console.log('📦 Installation des dépendances PostgreSQL...');

try {
  // Installer pg pour la connexion directe à PostgreSQL
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('✅ pg installé avec succès');
  
  // Installer les types TypeScript pour pg (optionnel)
  execSync('npm install --save-dev @types/pg', { stdio: 'inherit' });
  console.log('✅ @types/pg installé avec succès');
  
  console.log('\n🎉 Toutes les dépendances ont été installées !');
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Configurez votre DATABASE_URL dans le fichier .env');
  console.log('2. Exécutez le script d\'importation :');
  console.log('   - Avec pg : node import-backup.cjs');
  console.log('   - Avec Prisma : node import-backup-prisma.cjs');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'installation :', error.message);
  process.exit(1);
}