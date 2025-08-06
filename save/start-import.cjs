const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Assistant d\'importation de sauvegarde vers Neon.tech');
  console.log('=' .repeat(60));
  
  try {
    // Vérifier si le fichier de sauvegarde existe
    const backupPath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Fichier de sauvegarde non trouvé !');
      console.log(`📁 Chemin attendu: ${backupPath}`);
      const newPath = await question('📝 Entrez le chemin complet vers votre fichier de sauvegarde: ');
      if (!fs.existsSync(newPath)) {
        console.log('❌ Le fichier spécifié n\'existe pas. Arrêt du script.');
        process.exit(1);
      }
    }
    
    // Tester le fichier de sauvegarde
    console.log('\n🔍 Test du fichier de sauvegarde...');
    try {
      execSync('node test-backup-file.cjs', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Erreur lors du test du fichier. Arrêt du script.');
      process.exit(1);
    }
    
    // Vérifier la configuration de la base de données
    console.log('\n🔧 Vérification de la configuration...');
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  Variable DATABASE_URL non configurée');
      console.log('📝 Veuillez configurer votre fichier .env avec votre chaîne de connexion Neon.tech');
      console.log('💡 Exemple: DATABASE_URL=postgresql://username:password@hostname:5432/database');
      
      const continueAnyway = await question('❓ Voulez-vous continuer quand même ? (y/N): ');
      if (continueAnyway.toLowerCase() !== 'y' && continueAnyway.toLowerCase() !== 'yes') {
        console.log('👋 Configuration requise. Arrêt du script.');
        process.exit(0);
      }
    } else {
      console.log('✅ DATABASE_URL configurée');
    }
    
    // Choisir la méthode d\'importation
    console.log('\n📋 Choisissez votre méthode d\'importation:');
    console.log('1. Avec pg (connexion directe PostgreSQL) - Crée automatiquement les tables');
    console.log('2. Avec Prisma ORM - Nécessite un schéma Prisma configuré');
    
    const choice = await question('🔢 Votre choix (1 ou 2): ');
    
    if (choice === '1') {
      console.log('\n📦 Vérification des dépendances pg...');
      try {
        require('pg');
        console.log('✅ Dépendance pg trouvée');
      } catch (error) {
        console.log('⚠️  Dépendance pg non trouvée');
        const install = await question('❓ Voulez-vous installer pg maintenant ? (Y/n): ');
        if (install.toLowerCase() !== 'n' && install.toLowerCase() !== 'no') {
          console.log('📦 Installation de pg...');
          execSync('node install-pg-deps.cjs', { stdio: 'inherit' });
        } else {
          console.log('❌ pg requis pour cette option. Arrêt du script.');
          process.exit(1);
        }
      }
      
      console.log('\n🚀 Lancement de l\'importation avec pg...');
      execSync('node import-backup.cjs', { stdio: 'inherit' });
      
    } else if (choice === '2') {
      console.log('\n📦 Vérification de Prisma...');
      try {
        require('@prisma/client');
        console.log('✅ Prisma Client trouvé');
      } catch (error) {
        console.log('❌ Prisma Client non trouvé. Assurez-vous que Prisma est configuré.');
        process.exit(1);
      }
      
      console.log('\n🚀 Lancement de l\'importation avec Prisma...');
      execSync('node import-backup-prisma.cjs', { stdio: 'inherit' });
      
    } else {
      console.log('❌ Choix invalide. Arrêt du script.');
      process.exit(1);
    }
    
    console.log('\n🎉 Script terminé !');
    
  } catch (error) {
    console.error('\n💥 Erreur:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}