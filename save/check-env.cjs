const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  console.log('🔍 Vérification de l\'environnement...');
  console.log('=' .repeat(50));
  
  let allGood = true;
  
  // Vérifier Node.js
  console.log(`📦 Node.js: ${process.version}`);
  
  // Vérifier le fichier .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ Fichier .env trouvé');
    
    // Lire et vérifier DATABASE_URL
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('DATABASE_URL=')) {
      console.log('✅ DATABASE_URL configurée dans .env');
    } else {
      console.log('⚠️  DATABASE_URL non trouvée dans .env');
      allGood = false;
    }
  } else {
    console.log('⚠️  Fichier .env non trouvé');
    console.log('💡 Copiez .env.example vers .env et configurez DATABASE_URL');
    allGood = false;
  }
  
  // Vérifier le fichier de sauvegarde
  const backupPath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
  if (fs.existsSync(backupPath)) {
    console.log('✅ Fichier de sauvegarde trouvé');
    
    // Vérifier la taille du fichier
    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Taille du fichier: ${fileSizeMB} MB`);
  } else {
    console.log('⚠️  Fichier de sauvegarde non trouvé');
    console.log(`📁 Chemin attendu: ${backupPath}`);
    allGood = false;
  }
  
  // Vérifier les dépendances
  console.log('\n📦 Vérification des dépendances:');
  
  // Prisma
  try {
    require('@prisma/client');
    console.log('✅ @prisma/client disponible');
  } catch (error) {
    console.log('⚠️  @prisma/client non disponible');
  }
  
  // pg
  try {
    require('pg');
    console.log('✅ pg disponible');
  } catch (error) {
    console.log('⚠️  pg non disponible (optionnel)');
  }
  
  // Vérifier les scripts
  console.log('\n📄 Vérification des scripts:');
  const scripts = [
    'import-backup.cjs',
    'import-backup-prisma.cjs',
    'test-backup-file.cjs',
    'install-pg-deps.cjs',
    'start-import.cjs'
  ];
  
  scripts.forEach(script => {
    if (fs.existsSync(path.join(__dirname, script))) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} manquant`);
      allGood = false;
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  if (allGood) {
    console.log('🎉 Environnement prêt pour l\'importation !');
    console.log('\n📝 Prochaines étapes:');
    console.log('1. Configurez DATABASE_URL dans .env si ce n\'est pas fait');
    console.log('2. Lancez: node start-import.cjs');
  } else {
    console.log('⚠️  Quelques éléments nécessitent votre attention');
    console.log('\n📝 Actions recommandées:');
    console.log('1. Configurez votre fichier .env');
    console.log('2. Vérifiez le chemin du fichier de sauvegarde');
    console.log('3. Installez les dépendances manquantes si nécessaire');
  }
  
  return allGood;
}

// Exécuter la vérification
if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };