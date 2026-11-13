/**
 * Script to dump all Supabase data to local JSON files
 * Run: node scripts/dump-supabase.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'profiles',
  'matches',
  'friendships',
  'notifications',
  'messages',
  'dictionary',
  'story_books',
  'story_chapters',
];

const OUTPUT_DIR = path.join(__dirname, '..', 'local-data');

async function dumpTable(tableName) {
  console.log(`⏳ Dumping ${tableName}...`);
  const allData = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + limit - 1);

    if (error) {
      console.error(`❌ Error dumping ${tableName}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) break;

    allData.push(...data);
    from += limit;
    console.log(`   ${allData.length} records fetched...`);
  }

  console.log(`✅ ${tableName}: ${allData.length} records`);
  return allData;
}

async function main() {
  console.log('🚀 Starting Supabase data dump...\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const table of TABLES) {
    const data = await dumpTable(table);
    if (data) {
      const filePath = path.join(OUTPUT_DIR, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }

  console.log('\n📦 All data dumped to:', OUTPUT_DIR);

  // Write a manifest file
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(files, null, 2),
    'utf8'
  );

  console.log('📋 Manifest written.');
  console.log('🎉 Done!');
}

main().catch(console.error);
