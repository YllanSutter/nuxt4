import fs from 'node:fs';

// 1. Charge le JSON exporté
const data = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

// 2. Définis ici le schéma SQL de chaque table (adapte si besoin)
const tableSchemas = {
  userlabelvisibility: `CREATE TABLE IF NOT EXISTS "userlabelvisibility" (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    label_id VARCHAR NOT NULL,
    visible BOOLEAN NOT NULL
  );`,
  user: `CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    budget NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    role_id VARCHAR NOT NULL
  );`,
  usergames: `CREATE TABLE IF NOT EXISTS "usergames" (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    base_game_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    black_market_price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2) NOT NULL,
    initial_price NUMERIC(10,2) NOT NULL,
    playtime_hours NUMERIC(10,2) NOT NULL,
    rating NUMERIC(5,2) NOT NULL,
    rating_id VARCHAR NOT NULL,
    tag_id VARCHAR NOT NULL,
    order_in_list INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
  );`,
  bundles: `CREATE TABLE IF NOT EXISTS "bundles" (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    link VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    platform_id VARCHAR NOT NULL,
    state_id VARCHAR NOT NULL,
    month_id VARCHAR NOT NULL,
    year_id VARCHAR NOT NULL,
    is_public BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
  );`,
  tags: `CREATE TABLE IF NOT EXISTS "tags" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR,
    color VARCHAR NOT NULL
  );`,
  platforms: `CREATE TABLE IF NOT EXISTS "platforms" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR,
    color VARCHAR NOT NULL
  );`,
  months: `CREATE TABLE IF NOT EXISTS "months" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL
  );`,
  years: `CREATE TABLE IF NOT EXISTS "years" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL
  );`,
  states: `CREATE TABLE IF NOT EXISTS "states" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR NOT NULL
  );`,
  ratings: `CREATE TABLE IF NOT EXISTS "ratings" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    value INT NOT NULL,
    image VARCHAR,
    color VARCHAR NOT NULL
  );`,
  roles: `CREATE TABLE IF NOT EXISTS "roles" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR
  );`,
  labels: `CREATE TABLE IF NOT EXISTS "labels" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    key VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    default_visible BOOLEAN NOT NULL,
    position INT NOT NULL,
    color VARCHAR NOT NULL
  );`
};

// 3. Ordre d'insertion (éléments enfants d'abord)
const tables = [
  'userlabelvisibility',
  'tags', 'platforms', 'months', 'years', 'states', 'ratings', 'roles', 'labels',
  'user',
  'usergames',
  'bundles'
];

function toSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return val;
}

let sql = '-- === SCHEMA CREATION ===\n';
for (const table of tables) {
  if (tableSchemas[table]) sql += tableSchemas[table] + '\n';
}
sql += '\n-- === DATA INSERTION ===\n';

for (const table of tables) {
  if (!data[table] || !Array.isArray(data[table])) continue;
  for (const row of data[table]) {
    // Ne garder que les champs scalaires (pas d'objet ni d'array)
    const keys = Object.keys(row).filter(k => {
      const v = row[k];
      return typeof v !== 'object' || v === null;
    });
    if (keys.length === 0) continue;
    const values = keys.map(k => toSqlValue(row[k]));
    sql += `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
  }
}

fs.writeFileSync('import_with_schema.sql', sql);
console.log('✅ Fichier import_with_schema.sql généré !');