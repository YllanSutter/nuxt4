const fs = require('fs');
const path = require('path');

function isDdlLine(line) {
  const trimmed = line.trim();
  if (trimmed === '' || trimmed.startsWith('--')) return true; // garder commentaires/blancs
  // Exclure les opérations DML
  if (/^(INSERT|UPDATE|DELETE|COPY)\b/i.test(trimmed)) return false;
  // Conserver les DDL communs Postgres
  if (/^(CREATE|ALTER|DROP|COMMENT|GRANT|REVOKE|SET|DO|BEGIN|COMMIT|CREATE\s+TYPE|CREATE\s+INDEX|CREATE\s+EXTENSION)\b/i.test(trimmed)) return true;
  return true; // par défaut garder (les migrations sont surtout DDL)
}

function buildCreateTablesSql() {
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const outputPath = path.join(__dirname, 'create-tables.sql');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Dossier des migrations introuvable:', migrationsDir);
    process.exit(1);
  }

  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let combined = `-- Fichier généré automatiquement depuis prisma/migrations
-- Date: ${new Date().toISOString()}
-- Contient uniquement le DDL pour créer/altérer le schéma

SET client_encoding = 'UTF8';

`;

  for (const dir of dirs) {
    const migrationSqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (!fs.existsSync(migrationSqlPath)) continue;
    const content = fs.readFileSync(migrationSqlPath, 'utf8');
    const filtered = content
      .split(/\r?\n/)
      .filter(isDdlLine)
      .join('\n');

    combined += `\n-- ===== Migration: ${dir} =====\n`;
    combined += filtered.trim() + '\n';
  }

  fs.writeFileSync(outputPath, combined, 'utf8');
  console.log('✅ Fichier DDL généré:', outputPath);
}

if (require.main === module) {
  buildCreateTablesSql();
}

module.exports = { buildCreateTablesSql };


