const fs = require('fs');

function testBackupFile() {
  const backupPath = 'c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json';
  
  console.log('🔍 Test du fichier de sauvegarde...');
  console.log(`📁 Chemin: ${backupPath}`);
  
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Le fichier n\'existe pas !');
      return false;
    }
    console.log('✅ Fichier trouvé');
    
    // Lire le fichier
    console.log('📖 Lecture du fichier...');
    const data = fs.readFileSync(backupPath, 'utf8');
    console.log(`✅ Fichier lu (${data.length} caractères)`);
    
    // Parser le JSON
    console.log('🔄 Parsing JSON...');
    const jsonData = JSON.parse(data);
    console.log('✅ JSON valide');
    
    // Analyser la structure
    console.log('\n📊 Structure des données:');
    console.log(`- Clés principales: ${Object.keys(jsonData).join(', ')}`);
    console.log(`- Date d'export: ${jsonData.exportDate}`);
    console.log(`- ID utilisateur: ${jsonData.userId}`);
    console.log(`- Nom utilisateur: ${jsonData.user?.name}`);
    console.log(`- Email utilisateur: ${jsonData.user?.email}`);
    
    // Compter les éléments
    console.log('\n🔢 Nombre d\'éléments:');
    const counts = {
      userGames: jsonData.userGames?.length || 0,
      bundles: jsonData.bundles?.length || 0,
      tags: jsonData.tags?.length || 0,
      platforms: jsonData.platforms?.length || 0,
      months: jsonData.months?.length || 0,
      years: jsonData.years?.length || 0,
      states: jsonData.states?.length || 0,
      labels: jsonData.labels?.length || 0,
      emplacements: jsonData.emplacements?.length || 0,
      user_label_visibility: jsonData.user_label_visibility?.length || 0
    };
    
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`- ${key}: ${count}`);
    });
    
    // Analyser quelques exemples
    console.log('\n🎮 Exemple de jeu:');
    if (jsonData.userGames && jsonData.userGames.length > 0) {
      const firstGame = jsonData.userGames[0];
      console.log(`- ID: ${firstGame.id}`);
      console.log(`- Nom: ${firstGame.name}`);
      console.log(`- Prix: ${firstGame.price}€`);
      console.log(`- Prix marché noir: ${firstGame.black_market_price}€`);
      console.log(`- Temps de jeu: ${firstGame.playtime_hours}h`);
      console.log(`- Tag: ${firstGame.tag?.name || 'N/A'}`);
      console.log(`- Bundles: ${firstGame.bundle_games?.length || 0}`);
    }
    
    console.log('\n📦 Exemple de bundle:');
    if (jsonData.bundles && jsonData.bundles.length > 0) {
      const firstBundle = jsonData.bundles[0];
      console.log(`- ID: ${firstBundle.id}`);
      console.log(`- Nom: ${firstBundle.name}`);
      console.log(`- Prix: ${firstBundle.price}€`);
      console.log(`- Plateforme: ${firstBundle.platform_id}`);
      console.log(`- Public: ${firstBundle.is_public ? 'Oui' : 'Non'}`);
    }
    
    console.log('\n🎉 Test réussi ! Le fichier est prêt pour l\'importation.');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error instanceof SyntaxError) {
      console.error('💡 Le fichier JSON semble être malformé');
    }
    return false;
  }
}

// Exécuter le test
if (require.main === module) {
  testBackupFile();
}

module.exports = { testBackupFile };