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

// --- rule 3: the 3px atomic grid -----------------------------------------
// Enforced by packages/tokens/scripts/build.mjs, which rejects an off-scale
// primitive outright and demands an approval record for literal Component
// geometry. Re-checking it here would be a weaker second opinion on the same
// question, so `npm run check` runs that suite instead.

if (failures.length) {
  console.error('\u2717 structure check failed:');
  for (const f of failures) console.error('  \u00b7 ' + f);
  process.exit(1);
}
console.log('\u2713 structure check: margins deferred to parents, atoms compose nothing');
