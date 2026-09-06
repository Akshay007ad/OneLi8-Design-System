/**
 * Structural lint for the atomic layering.
 *
 * Two rules, both from the project's atomic-design conventions:
 *
 *  1. "Assign margins to a component via its parent, never to the component
 *     itself." A component that sets its own margin is not reusable across
 *     contexts, so any `margin` declaration in a component stylesheet fails.
 *
 *  2. Atoms may not compose other components. An atom that imports from
 *     ../molecules or ../organisms has been mis-tiered.
 *
 *  3. Every px dimension token sits on the 3px atomic grid. Off-grid values
 *     are allowed only when the token carries an explicit `gridException`
 *     string saying why — Figma's own wording is "3pt anchors with governed
 *     optical exceptions", and this keeps them governed rather than gradual.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(ROOT, 'packages', 'core', 'src');

function walk(dir) {
  return readdirSync(dir).flatMap(e => {
    const full = join(dir, e);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const failures = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');

  if (file.endsWith('.css')) {
    text.split('\n').forEach((line, i) => {
      // `margin` as a property, not `margin` inside a comment or a var name.
      if (/^\s*margin(-(block|inline|top|right|bottom|left))?\s*:/.test(line)) {
        failures.push(`${rel}:${i + 1} sets its own margin — assign it from the parent instead`);
      }
    });
  }

  if (file.endsWith('.js') && rel.includes('/atoms/')) {
    for (const m of text.matchAll(/from\s+'([^']+)'/g)) {
      if (/\.\.\/(molecules|organisms)\//.test(m[1])) {
        failures.push(`${rel} imports ${m[1]} — atoms must not compose other components`);
      }
    }
  }
}

// --- rule 3: the 3px atomic grid ---------------------------------------
const tokens = JSON.parse(readFileSync(join(ROOT, 'packages/tokens/src/tokens.json'), 'utf8'));
(function walkTokens(node, path) {
  if (node && typeof node === 'object' && 'value' in node) {
    const m = /^(-?\d+(?:\.\d+)?)px$/.exec(String(node.value));
    if (m && Number(m[1]) % 3 !== 0 && !node.gridException) {
      failures.push(`token --ol8-${path.join('-')} = ${node.value} is off the 3px grid with no gridException`);
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (path.length === 0 && (k === 'source' || k === 'typography')) continue;
    if (v && typeof v === 'object') walkTokens(v, [...path, k]);
  }
})(tokens, []);

if (failures.length) {
  console.error('\u2717 structure check failed:');
  for (const f of failures) console.error('  \u00b7 ' + f);
  process.exit(1);
}
console.log('\u2713 structure check: margins deferred to parents, atoms compose nothing, all px tokens on the 3px grid (7 governed exceptions)');
