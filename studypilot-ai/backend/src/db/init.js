/**
 * Initializes the MySQL database: runs schema.sql and (optionally)
 * seed_catalog.sql. Run with: npm run db:init
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Running schema.sql ...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);
  console.log('✅ Schema created.');

  const seedFlag = process.argv.includes('--seed');
  if (seedFlag) {
    console.log('Seeding curriculum catalog ...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed_catalog.sql'), 'utf8');
    await connection.query(seed);
    console.log('✅ Catalog seeded.');
  }

  await connection.end();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ DB init failed:', err.message);
  process.exit(1);
});
