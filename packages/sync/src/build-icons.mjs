/**
 * Oneli8 · icon build
 * Normalizes raw Figma icon-master SVG exports into an inline-able registry.
 *
 * Figma contract (from component descriptions on nodes 418:14 … 894:123):
 *   "Canonical neutral 24px Icon Library source. Icon Frame geometrically
 *    scales the complete source instance; the source owns the universal
 *    1.8-unit optical stroke and the consumer supplies semantic color."
 *
 * Therefore:
 *   - viewBox stays 0 0 24 24  -> scaling is geometric, stroke scales with it
 *   - #151817 -> currentColor  -> consumer supplies semantic color
 *   - preserveAspectRatio="none" is dropped -> masters are square, uniform scale
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const RAW = join(ROOT, 'assets', 'icons-raw');
const OUT = join(ROOT, 'packages/react/src/foundations');

/** Figma "Icon / <Category> / <Name>" -> registry metadata. */
const REGISTRY = {
  'add':               { category: 'action',     figmaNode: '418:14',  mirrorInRTL: false },
  'forward':           { category: 'navigation', figmaNode: '418:16',  mirrorInRTL: true  },
  'critical':          { category: 'status',     figmaNode: '418:18',  mirrorInRTL: false },
  'visibility-open':   { category: 'action',     figmaNode: '418:21',  mirrorInRTL: false },
  'loading':           { category: 'status',     figmaNode: '440:2',   mirrorInRTL: false },
  'caution':           { category: 'status',     figmaNode: '440:4',   mirrorInRTL: false },
  'positive':          { category: 'status',     figmaNode: '440:8',   mirrorInRTL: false },
  'informative':       { category: 'status',     figmaNode: '440:11',  mirrorInRTL: false },
  'visibility-closed': { category: 'action',     figmaNode: '440:15',  mirrorInRTL: false },
  'chevron-down':      { category: 'navigation', figmaNode: '521:106', mirrorInRTL: false },
  'chevron-up':        { category: 'navigation', figmaNode: '521:108', mirrorInRTL: false },
  'search':            { category: 'action',     figmaNode: '557:2',   mirrorInRTL: false },
  'clear':             { category: 'action',     figmaNode: '557:4',   mirrorInRTL: false },
  'close':             { category: 'action',     figmaNode: '894:123', mirrorInRTL: false },
  // Selection glyphs. These live outside "Icon Library / Masters" (426:55) and
  // bake different inks than the neutral sources — Check #1A2A59, Selected Dot
  // #E2E9FF — but both are documented as "color is inherited from the consuming
  // selection indicator", so both normalize to currentColor like the rest.
  'check':             { category: 'selection',  figmaNode: '391:4',   mirrorInRTL: false },
  'mixed':             { category: 'selection',  figmaNode: '391:9',   mirrorInRTL: false },
  'selected-dot':      { category: 'selection',  figmaNode: '391:14',  mirrorInRTL: false },
};

const SOURCE_STROKE = '1.8';    // universal optical stroke, in 24-unit source space

/**
 * Every master bakes exactly one ink, which the consumer is meant to override.
 * We do not hardcode which ink: neutral sources bake #151817, but the selection
 * glyphs bake #1A2A59 (Check) and #E2E9FF (Selected Dot). Whatever it is, it
 * becomes currentColor — and more than one distinct ink is an error worth
 * failing on rather than guessing at.
 */
function sourceInkOf(svg, name) {
  const inks = [...new Set((svg.match(/#[0-9a-fA-F]{3,8}/g) ?? []).map(c => c.toLowerCase()))];
  if (inks.length === 0) return null;
  if (inks.length > 1) throw new Error(`${name}: expected one ink, found ${inks.join(', ')}`);
  return inks[0];
}

/** Strip the <svg> wrapper and Figma's group, keep only the drawing instructions. */
function extractBody(svg, name, ink) {
  const open = svg.indexOf('>', svg.indexOf('<svg'));
  let body = svg.slice(open + 1, svg.lastIndexOf('</svg>'));
  body = body.replace(/<g[^>]*>/g, '').replace(/<\/g>/g, '');
  // Consumer supplies semantic color; the master's own ink is discarded.
  if (ink) {
    body = body.replace(new RegExp(`(stroke|fill)="${ink}"`, 'gi'), '$1="currentColor"');
    if (new RegExp(ink, 'i').test(body)) throw new Error(`${name}: unconverted ${ink}`);
  }
  return body.split('\n').map(l => l.trim()).filter(Boolean).join('');
}


/**
 * The string `body` is what a plain innerHTML consumer wants. A React consumer
 * cannot use it without dangerouslySetInnerHTML, so the same glyph is also
 * emitted as structured elements with React attribute names. One source, two
 * shapes, so neither consumer has to hand write a glyph and drift from Figma.
 */
const REACT_ATTR = {
  'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule',
  'clip-rule': 'clipRule', 'stroke-dasharray': 'strokeDasharray',
};
function parseElements(body, name) {
  const elements = [];
  for (const tagMatch of body.matchAll(/<(\w+)([^>]*?)\/?>/g)) {
    const [, tag, rawAttrs] = tagMatch;
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
      const [, key, value] = a;
      if (key === 'id') continue; // duplicate ids across many icons on one page
      attrs[REACT_ATTR[key] ?? key] = value;
    }
    elements.push({ tag, attrs });
  }
  if (elements.length === 0) throw new Error(`${name}: no drawable elements`);
  return elements;
}

/**
 * Bounding box over the on-curve points of every absolute path in `body`.
 * Figma exports absolute commands only; control points are ignored, which is
 * the right call for an optical-centre check (the ink follows the anchors).
 */
function pathBounds(body) {
  const ARGC = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, seen = false;
  for (const m of body.matchAll(/\sd="([^"]+)"/g)) {
    let x = 0, y = 0;
    const tokens = m[1].match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
    let i = 0, cmd = null;
    while (i < tokens.length) {
      if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
      const key = (cmd ?? 'M').toUpperCase();
      const n = ARGC[key] ?? 0;
      const a = tokens.slice(i, i + n).map(Number);
      i += n;
      if (key === 'Z') continue;
      if (key === 'H') x = a[0];
      else if (key === 'V') y = a[0];
      else { x = a[n - 2]; y = a[n - 1]; }
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      seen = true;
      if (key === 'M') cmd = 'L'; // implicit lineto for repeated pairs
    }
  }
  return seen ? { minX, minY, maxX, maxY } : null;
}

const icons = {};
const audit = [];

for (const file of readdirSync(RAW).filter(f => f.endsWith('.svg')).sort()) {
  const name = basename(file, '.svg');
  const meta = REGISTRY[name];
  if (!meta) throw new Error(`No registry entry for "${name}"`);
  const raw = readFileSync(join(RAW, file), 'utf8');

  const vb = raw.match(/viewBox="([^"]+)"/)?.[1];
  if (vb !== '0 0 24 24') throw new Error(`${name}: viewBox is "${vb}", expected "0 0 24 24"`);
  for (const w of raw.match(/stroke-width="([^"]+)"/g) ?? []) {
    if (w !== `stroke-width="${SOURCE_STROKE}"`) throw new Error(`${name}: ${w}`);
  }

  const ink = sourceInkOf(raw, name);
  const body = extractBody(raw, name, ink);
  icons[name] = { ...meta, sourceInk: ink, body, elements: parseElements(body, name) };

  // Optical-centre audit: report masters whose ink is off-centre in the 24 box.
  const box = pathBounds(body);
  if (box) {
    const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
    if (Math.abs(cx - 12) > 0.75 || Math.abs(cy - 12) > 0.75) {
      audit.push(`${name}: ink centre (${cx.toFixed(2)}, ${cy.toFixed(2)}) vs source centre (12, 12)`);
    }
  }
}

mkdirSync(OUT, { recursive: true });

const banner = `// GENERATED by packages/sync/src/build-icons.mjs — do not edit by hand.
// Source: Figma "Oneli8 Design System — 1.0.0-beta.1", page Iconography,
// frame "Icon Library / Masters" (426:55). Re-run \`npm run sync:icons\`.
`;

// Runtime registry: plain ESM so the framework runs in a browser with no build step.
writeFileSync(join(OUT, 'icons.generated.js'), banner + `
export const OL8_ICON_VIEWBOX = '0 0 24 24';

/** @type {Record<string, import('./icons.generated.js').Ol8IconEntry>} */
export const OL8_ICONS = ${JSON.stringify(icons, null, 2)};
`);

// Types only — no emit, no tsc required by consumers.
writeFileSync(join(OUT, 'icons.generated.d.ts'), banner + `
export interface Ol8IconEntry {
  /** Figma category segment: "Icon / <Category> / <Name>". */
  readonly category: 'action' | 'navigation' | 'status' | 'selection';
  /** Node id of the 24px master in the Figma source file. */
  readonly figmaNode: string;
  /** Semantic registry controls RTL mirroring (per Iconography documentation). */
  readonly mirrorInRTL: boolean;
  /** The ink Figma baked into the master, discarded in favour of currentColor. */
  readonly sourceInk: string | null;
  /** Drawing instructions in the canonical 24-unit source space. */
  readonly body: string;
}

export declare const OL8_ICON_VIEWBOX: '0 0 24 24';
export declare const OL8_ICONS: {
${Object.keys(icons).map(n => `  readonly ${JSON.stringify(n)}: Ol8IconEntry;`).join('\n')}
};
export type Ol8IconName = keyof typeof OL8_ICONS;
`);

console.log(`✓ ${Object.keys(icons).length} masters -> icons.generated.{js,d.ts}`);
if (audit.length) {
  console.log('\n⚠ optical-centre audit (reproduced as-designed, not corrected):');
  for (const a of audit) console.log('  · ' + a);
}
