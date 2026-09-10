/**
 * Compiles packages/tokens/src/tokens.json into:
 *   dist/tokens.css  — :root custom properties + .ol8-type-* role classes
 *   dist/tokens.js   — flat JS object
 *
 * Typography is composite in Figma (a role bundles family/size/line/weight/
 * tracking), so it is emitted twice: as resolved sub-variables, and as a class
 * that applies them — which is what a consumer actually wants to reach for.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const src = JSON.parse(readFileSync(join(ROOT, 'packages/tokens/src/tokens.json'), 'utf8'));

const SKIP_TOP = new Set(['source', 'typography']);
const flat = {};

(function walk(node, path) {
  if (node && typeof node === 'object' && 'value' in node) {
    // A bare font family name is not usable CSS — compose the declared fallback stack.
    flat[path.join('-')] = node.fallback ? `"${node.value}", ${node.fallback}` : node.value;
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (path.length === 0 && SKIP_TOP.has(k)) continue;
    if (v && typeof v === 'object') walk(v, [...path, k]);
  }
})(src, []);

// ---- typography roles -------------------------------------------------
// RETIRED 2026-09-09: the per-role --ol8-typography-<role>-<prop> custom
// properties. They duplicated values that .ol8-type-<role> already applies;
// the class reads the primitive font vars directly and never read them;
// nothing in the system referenced them; and foundations rule 5 tells
// consumers to use the class. 51 dead properties, 3.5KB of tokens.css.
const typeRules = [];
for (const [role, spec] of Object.entries(src.typography)) {
  if (role.startsWith('$')) continue;
  const props = {
    'font-family': `var(--ol8-font-family-${spec.family})`,
    'font-size':   `var(--ol8-font-size-${spec.size})`,
    'line-height': `var(--ol8-font-line-${spec.line})`,
    'font-weight': `var(--ol8-font-weight-${spec.weight})`,
    'letter-spacing': spec.letterSpacing,
    ...(spec.family === 'functional' ? { 'font-variation-settings': 'var(--ol8-font-variation-functional)' } : {}),
  };
  typeRules.push(
    `.ol8-type-${role} {\n` +
    Object.entries(props).map(([p, v]) => `  ${p}: ${v};`).join('\n') +
    `\n}`
  );
}

const decls = Object.entries(flat)
  .map(([k, v]) => `  --ol8-${k}: ${v};`).join('\n');

mkdirSync(join(ROOT, 'packages/tokens/dist'), { recursive: true });
writeFileSync(join(ROOT, 'packages/tokens/dist/tokens.css'),
`/* GENERATED from packages/tokens/src/tokens.json — do not edit.
   Source: Figma "Oneli8 Design System — 1.0.0-beta.1", page Foundations (9:7). */
:root {
${decls}
}

${typeRules.join('\n\n')}
`);

writeFileSync(join(ROOT, 'packages/tokens/dist/tokens.js'),
  `/* GENERATED from packages/tokens/src/tokens.json — do not edit. */\nexport const tokens = ${JSON.stringify(flat, null, 2)};\n`);

const n = Object.keys(flat).length;
console.log(`✓ ${n} tokens (${Object.keys(src.typography).length - 1} typography roles) -> dist/tokens.{css,js}`);
