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

const SKIP_TOP = new Set(['source', 'typography', 'themes']);
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

// ---- primary-ramp aliasing ------------------------------------------------
// A semantic role that bakes the same hex as a color-primary-* step is emitted
// as a reference to that step instead. Without this the primaryFamily axis is
// inert: swapping the ramp would repaint nothing, because every role would still
// carry a literal blue. Resolved values are unchanged either way.
const primaryByValue = new Map();
for (const [k, v] of Object.entries(flat)) {
  if (/^color-primary-\d{3}$/.test(k)) primaryByValue.set(String(v).toLowerCase(), k);
}
const PRIMITIVE = /^color-(blue|cyan|green|yellow|orange|pink|violet|red|neutral|primary)-\d{3}$/;
// CSS only. `flat` keeps resolved literals, because dist/tokens.js is read by
// code that wants an actual colour — a var() string would be useless there.
const cssFlat = { ...flat };
let aliased = 0;
for (const [k, v] of Object.entries(cssFlat)) {
  if (!k.startsWith('color-') || PRIMITIVE.test(k)) continue;
  const step = primaryByValue.get(String(v).toLowerCase());
  if (step) { cssFlat[k] = `var(--ol8-${step})`; aliased++; }
}

const decls = Object.entries(cssFlat)
  .map(([k, v]) => `  --ol8-${k}: ${v};`).join('\n');

// ---- theme axes ------------------------------------------------------------
// Each axis is an independent attribute selector. They are never combined into a
// Cartesian product of modes: dark x orange is two attributes, not one block.
const ref = (v) => String(v).replace(/^\{(.+)\}$/, (_, n) => `var(--ol8-${n})`);
const themeBlocks = [];
for (const axis of Object.values(src.themes ?? {})) {
  if (!axis || typeof axis !== 'object' || !('selector' in axis) && !Object.values(axis)[0]?.selector) continue;
  const modes = 'selector' in axis ? [axis] : Object.values(axis);
  for (const mode of modes) {
    if (!mode?.selector) continue;
    const body = Object.entries(mode.overrides)
      .map(([k, v]) => `  --ol8-${k}: ${ref(v)};`).join('\n');
    themeBlocks.push(`${mode.selector} {\n${body}\n}`);
  }
}

mkdirSync(join(ROOT, 'packages/tokens/dist'), { recursive: true });
writeFileSync(join(ROOT, 'packages/tokens/dist/tokens.css'),
`/* GENERATED from packages/tokens/src/tokens.json — do not edit.
   Source: Figma "Oneli8 Design System — 1.0.0-beta.1", page Foundations (9:7). */
:root {
${decls}
}

${themeBlocks.join('\n\n')}

${typeRules.join('\n\n')}
`);

writeFileSync(join(ROOT, 'packages/tokens/dist/tokens.js'),
  `/* GENERATED from packages/tokens/src/tokens.json — do not edit. */\nexport const tokens = ${JSON.stringify(flat, null, 2)};\n`);

// Literal key union rather than a string index signature, so a typo in a token
// name is a compile error and editors can autocomplete the whole vocabulary.
const keyUnion = Object.keys(flat).map(k => `  | '${k}'`).join('\n');
writeFileSync(join(ROOT, 'packages/tokens/dist/tokens.d.ts'),
`/* GENERATED from packages/tokens/src/tokens.json — do not edit. */

/** Every token name emitted by this build, without the --ol8- prefix. */
export type Ol8TokenName =
${keyUnion};

/** Flat map of token name to resolved CSS value. */
export declare const tokens: Readonly<Record<Ol8TokenName, string>>;
`);

const n = Object.keys(flat).length;
console.log(`✓ ${n} tokens (${Object.keys(src.typography).length - 1} typography roles, ${aliased} aliased to the primary ramp, ${themeBlocks.length} theme blocks) -> dist/tokens.{css,js,d.ts}`);
