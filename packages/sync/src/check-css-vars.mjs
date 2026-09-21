/**
 * Every --ol8-* custom property a component reads must actually exist.
 *
 * WHY THIS FILE EXISTS
 * The whole Gem material was dead in code and nothing noticed. gem.css read 27
 * variables under names like --ol8-material-control-gem-secondary-high, while
 * the agreed name in src/figma-code-syntax.txt is
 * --ol8-material-control-gem--secondary-high. A `var()` with no fallback and no
 * definition makes the entire declaration invalid, so a gem button computed to
 * background-image: none, backdrop-filter: none and — the part that mattered
 * most — box-shadow: none, meaning no rim, no specular, no bezel. Every other
 * check passed the whole time: the token suite tested the tokens, the component
 * suite tested the markup, and nothing tested that one could see the other.
 *
 * A missing variable is silent by design in CSS. That is exactly why it needs a
 * check rather than a convention.
 *
 * A reference is allowed when the property is defined in the built tokens.css,
 * or is component-local (--_foo), or the var() carries a fallback.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TOKENS = join(ROOT, 'packages/tokens/build/css/tokens.css');
const SRC = join(ROOT, 'packages/core/src');

const tokensCss = readFileSync(TOKENS, 'utf8');
const defined = new Set([...tokensCss.matchAll(/^\s*(--ol8-[a-z0-9-]+)\s*:/gmi)].map((m) => m[1]));

const sheets = [];
(function walk(dir) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.css')) sheets.push(full);
  }
})(SRC);

const failures = [];
for (const sheet of sheets) {
  const css = readFileSync(sheet, 'utf8');
  // properties this sheet defines itself are fair game to read back
  const local = new Set([...css.matchAll(/(--[a-z0-9_-]+)\s*:/gmi)].map((m) => m[1]));
  for (const m of css.matchAll(/var\(\s*(--ol8-[a-z0-9-]+)\s*([,)])/gmi)) {
    const [, name, next] = m;
    if (next === ',') continue;                 // has a fallback
    if (defined.has(name) || local.has(name)) continue;
    const line = css.slice(0, m.index).split('\n').length;
    failures.push(`${relative(ROOT, sheet)}:${line} reads ${name}, which no token defines`);
  }
}

if (failures.length) {
  console.error('✗ css variable check failed:');
  for (const f of failures) console.error('  · ' + f);
  console.error(`\n  ${failures.length} reference(s) resolve to nothing. In CSS that silently voids`);
  console.error('  the whole declaration, so the rule paints nothing at all.');
  process.exit(1);
}
console.log(`✓ css variable check: ${sheets.length} stylesheets, every --ol8-* reference resolves`);
