// Ce script permet d'appliquer les migrations Prisma de façon non destructive, même en développement.
// Il applique uniquement les migrations existantes, sans jamais réinitialiser la base.
// A utiliser à la place de `prisma migrate dev`.

const { execSync } = require('child_process');

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('\n✅ Migrations Prisma appliquées sans destruction.');
} catch (e) {
  console.error('\n❌ Erreur lors de l\'application des migrations Prisma.');
  process.exit(1);
}
