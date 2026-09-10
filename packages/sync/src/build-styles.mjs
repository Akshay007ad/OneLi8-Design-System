/**
 * One stylesheet source, two packages.
 *
 * The component CSS lives in packages/core, next to the markup it styles.
 * packages/react ships the same rules, because a React consumer must not have
 * to install the vanilla package to get styles. Copying by hand guarantees the
 * two drift, so the copy is generated here and the react files are artifacts.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(ROOT, 'packages/core/src');
const OUT = join(ROOT, 'packages/react/src/styles');

const sheets = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.css')) sheets.push(full);
  }
})(SRC);

mkdirSync(OUT, { recursive: true });
const banner = (from) =>
  `/* GENERATED from ${from} by packages/sync/src/build-styles.mjs — do not edit.\n` +
  `   Edit the source in packages/core/src and re-run \`npm run sync:styles\`. */\n`;

const names = new Set();
for (const sheet of sheets) {
  const name = basename(sheet);
  if (names.has(name)) throw new Error(`[ol8] two stylesheets are both called ${name}; the flat react/styles layout needs unique names`);
  names.add(name);
  const rel = sheet.slice(ROOT.length + 1);
  writeFileSync(join(OUT, name), banner(rel) + readFileSync(sheet, 'utf8'));
}
console.log(`✓ ${sheets.length} stylesheets -> packages/react/src/styles (source: packages/core/src)`);
