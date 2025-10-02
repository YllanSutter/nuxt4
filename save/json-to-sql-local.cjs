const path = require('path');
const { convertJsonToSql } = require('./json-to-sql.cjs');

function main() {
  // Utilise le fichier JSON présent dans le workspace
  const jsonFilePath = path.join(__dirname, '..', 'backup.json');
  const outputPath = path.join(__dirname, 'import-data.sql');

  console.log('🚀 Conversion JSON vers SQL (local)...');
  console.log(`📖 Fichier source: ${jsonFilePath}`);
  console.log(`📝 Fichier de sortie: ${outputPath}`);

  convertJsonToSql(jsonFilePath, outputPath);

  console.log('\n🎉 Conversion terminée !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Ouvrez save/import-data.sql');
  console.log('2. Exécutez-le dans votre BDD (psql ou UI)');
}

if (require.main === module) {
  main();
}


