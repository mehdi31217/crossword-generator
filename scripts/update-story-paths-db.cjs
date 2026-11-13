/**
 * Applies the SVG → JPEG story-artwork repointing to the live database.
 *
 *   node scripts/update-story-paths-db.cjs [--dry]
 *
 * The JSON seed files are updated by scripts/update-story-paths.cjs, but the
 * story tables are only seeded when empty, so an existing database keeps the
 * old generated-SVG paths until this runs. Credentials stay inside the server's
 * own env loading — no need to inspect server/.env.
 */
const path = require('path');

const ROOT = path.join(__dirname, '..');
require(path.join(ROOT, 'server/node_modules/dotenv')).config({ path: path.join(ROOT, 'server/.env') });

const PostgresDB = require(path.join(ROOT, 'server/db/PostgresDB'));
const dry = process.argv.includes('--dry');

(async () => {
    const db = new PostgresDB();
    await db.ready;
    if (!db.pool) {
        console.error('no postgres pool — check server/.env DATABASE_URL');
        process.exit(1);
    }
    const renames = [
        `UPDATE story_books SET cover_image = '/images/covers/zal-rudabeh.jpg' WHERE cover_image = '/images/covers/zal.svg'`,
        `UPDATE story_chapters SET image = replace(image, '/images/chapters/khosrow/', '/images/chapters/khosrow_shirin/')`,
        `UPDATE story_chapters SET image = replace(image, '/images/chapters/peykar/', '/images/chapters/haft_peykar/')`,
    ];
    for (const sql of renames) {
        if (dry) continue;
        const r = await db.pool.query(sql);
        if (r.rowCount) console.log(`renamed ${r.rowCount} path(s)`);
    }

    const stmts = [
        ['story_books', 'cover_image', `cover_image LIKE '/images/%.svg'`],
        ['story_chapters', 'image', `image LIKE '/images/chapters/%.svg'`],
    ];
    for (const [table, col, where] of stmts) {
        if (dry) {
            const r = await db.pool.query(`SELECT count(*)::int AS n FROM ${table} WHERE ${where}`);
            console.log(`${table}: ${r.rows[0].n} rows still on .svg`);
            continue;
        }
        const res = await db.pool.query(
            `UPDATE ${table} SET ${col} = replace(${col}, '.svg', '.jpg') WHERE ${where}`
        );
        console.log(`${table}: ${res.rowCount} rows updated`);
    }
    await db.pool.end();
})();
