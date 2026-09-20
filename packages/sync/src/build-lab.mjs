/**
 * Generates a standalone copy of a lab page for publishing.
 *
 * A lab links the real system stylesheets and imports the real component
 * modules. A published artifact can fetch neither, so this inlines them — by
 * READING the system files, never by copying values into a new file. That is
 * the whole point: the standalone is generated, so it cannot drift from the
 * system the way a hand-written copy does.
 *
 * Modules are wrapped, not flattened. Several of them define private helpers
 * with the same name (escapeAttr, escapeText), which is correct in ESM and
 * fatal in a flat concatenation.
 *
 *   node packages/sync/src/build-lab.mjs labs/gem-in-motion
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LAB = process.argv[2];
if (!LAB) { console.error('usage: build-lab.mjs <lab-dir>'); process.exit(1); }

const srcPath = resolve(ROOT, LAB, 'index.html');
const outPath = resolve(ROOT, LAB, 'standalone.html');
let html = readFileSync(srcPath, 'utf8');

/* ---- 1. inline every local stylesheet --------------------------------- */
let sheets = 0;
html = html.replace(/[ \t]*<link rel="stylesheet" href="(\.\.\/[^"]+)">\n?/g, (_, href) => {
  const css = readFileSync(resolve(dirname(srcPath), href), 'utf8');
  sheets++;
  return `<style>/* inlined from ${href} */\n${css}</style>\n`;
});

/* ---- 2. resolve the module graph -------------------------------------- */
const seen = new Set();
const order = [];
function walk(file) {
  if (seen.has(file)) return;
  seen.add(file);
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/from\s+'(\.[^']+)'/g)) walk(resolve(dirname(file), m[1]));
  order.push(file);
}

const entry = html.match(/import\s+(\{[^}]+\})\s*from\s+'(\.\.\/[^']+)'/);
if (!entry) { console.error('no module import found in', LAB); process.exit(1); }
const entryFile = resolve(dirname(srcPath), entry[2]);
walk(entryFile);

const idOf = f => relative(ROOT, f);

function exportedNames(src) {
  const names = new Set();
  for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/^export\s*\{([^}]+)\}\s*;/gm)) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      const name = (bits[1] ?? bits[0] ?? '').trim();
      if (name && name !== 'type') names.add(name);
    }
  }
  return [...names];
}

/* ---- 3. wrap each module in its own scope ----------------------------- */
const modules = order.map(file => {
  const raw = readFileSync(file, 'utf8');
  const named = exportedNames(raw);
  const barrels = [...raw.matchAll(/^\s*export\s+\*\s+from\s+'(\.[^']+)'\s*;?\s*$/gm)]
    .map(m => idOf(resolve(dirname(file), m[1])));

  // Named re-exports: export { a, b as c } from './x.js'. The system's barrels
  // use this form, so stripping it without re-binding silently empties them.
  const reNamed = [...raw.matchAll(/^\s*export\s*\{([^}]+)\}\s*from\s+'(\.[^']+)'\s*;?\s*$/gm)]
    .map(m => ({
      id: idOf(resolve(dirname(file), m[2])),
      pairs: m[1].split(',').map(part => {
        const [from, to] = part.trim().split(/\s+as\s+/);
        return from ? { from: from.trim(), to: (to ?? from).trim() } : null;
      }).filter(Boolean),
    }));

  let src = raw
    // local imports become registry lookups
    .replace(/^\s*import\s+(\{[^}]+\})\s*from\s+'(\.[^']+)'\s*;?\s*$/gm,
      (_, binding, spec) => `const ${binding} = __req(${JSON.stringify(idOf(resolve(dirname(file), spec)))});`)
    // barrels and bare re-exports are handled by the assign block below
    .replace(/^\s*export\s+\*\s+from\s+'\.[^']+'\s*;?\s*$/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*from\s*'[^']+'\s*;?\s*$/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*;\s*$/gm, '')
    // everything else just loses the keyword
    .replace(/^export\s+/gm, '');

  const assigns = [
    ...barrels.map(id => `  Object.assign(__x, __req(${JSON.stringify(id)}));`),
    ...reNamed.map(r => `  { const __m = __req(${JSON.stringify(r.id)}); Object.assign(__x, { ${r.pairs.map(p => `${p.to}: __m.${p.from}`).join(', ')} }); }`),
    named.length ? `  Object.assign(__x, { ${named.join(', ')} });` : '',
  ].filter(Boolean).join('\n');

  return `__def(${JSON.stringify(idOf(file))}, (__x, __req) => {\n${src.trim()}\n${assigns}\n});`;
}).join('\n\n');

const bundle = `const __mods = Object.create(null);
const __def = (id, fn) => { __mods[id] = { fn, val: null }; };
const __req = id => {
  const m = __mods[id];
  if (!m) throw new Error('missing module ' + id);
  if (!m.val) { m.val = {}; m.fn(m.val, __req); }
  return m.val;
};

${modules}

const ${entry[1]} = __req(${JSON.stringify(idOf(entryFile))});`;

/* ---- 4. splice it into the page --------------------------------------- */
html = html.replace(/<script type="module">[\s\S]*?<\/script>/, block => {
  const body = block
    .replace(/^<script type="module">/, '')
    .replace(/<\/script>$/, '')
    .replace(/^\s*import\s+\{[^}]+\}\s*from\s+'[^']+'\s*;?\s*$/gm, '');
  return `<script type="module">\n/* ===== system modules, inlined from source ===== */\n${bundle}\n\n/* ===== lab ===== */${body}</script>`;
});

writeFileSync(outPath, html);
console.log(`✓ ${relative(ROOT, outPath)} — ${sheets} stylesheets, ${order.length} modules inlined`);
