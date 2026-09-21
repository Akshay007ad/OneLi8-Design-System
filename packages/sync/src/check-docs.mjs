/**
 * Gates the prose an agent reads before it reads any code.
 *
 * The token, component and React suites already gate the implementation. The
 * rule surface — AGENTS.md, PRINCIPLES.md, README.md, docs/ and skills/ — was
 * gated by nothing, and an audit found four stale claims in it: a subset of
 * exports that had grown from 5 to 21, a symbol (`iconNames`) that no longer
 * existed but was still shown as a working import, and two file paths that had
 * been deleted. Every one of them was checkable by running something.
 *
 * Four rules, each mechanical:
 *
 *   PATHS    every repo path a document names must exist
 *   SYMBOLS  every code symbol a document names must be exported or defined
 *   IMPORTS  every `import { … } from '@oneli8/…'` in a fence must resolve
 *   SUBSETS  no document may enumerate a closed list of public exports
 *
 * The last one is the interesting rule. The other three catch drift after it
 * happens; SUBSETS removes the shape of claim that goes stale by construction.
 * A list of exports is wrong the moment the library grows — so the rule is not
 * "keep the list current", it is "do not keep a list".
 *
 * Only root documents are scanned. build-package-context.mjs copies AGENTS.md
 * and PRINCIPLES.md into each package and build-styles.mjs copies skills/, so
 * checking the copies would report every failure four times.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const failures = [];
const fail = (file, line, msg) => failures.push(`${file}:${line} ${msg}`);

/* ---- which documents are the rule surface ----------------------------- */
function walkMd(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkMd(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

const DOCS = [
  join(ROOT, 'AGENTS.md'),
  join(ROOT, 'PRINCIPLES.md'),
  join(ROOT, 'README.md'),
  ...(existsSync(join(ROOT, 'docs')) ? walkMd(join(ROOT, 'docs')) : []),
  ...(existsSync(join(ROOT, 'skills')) ? walkMd(join(ROOT, 'skills')) : []),
].filter(existsSync);

/* ---- what actually exists --------------------------------------------- */
const exported = new Set();
for (const entry of ['packages/react/src/index.js', 'packages/core/src/index.js']) {
  const full = join(ROOT, entry);
  if (!existsSync(full)) continue;
  try {
    for (const name of Object.keys(await import(full))) exported.add(name);
  } catch (error) {
    failures.push(`${entry} could not be imported, so its exports cannot be checked: ${error.message}`);
  }
}
// Symbols that live outside the package entries, e.g. the Figma mapping adapters.
const LOOSE = join(ROOT, 'mappings');
if (existsSync(LOOSE)) {
  for (const file of readdirSync(LOOSE).filter(f => f.endsWith('.mjs'))) {
    for (const m of readFileSync(join(LOOSE, file), 'utf8').matchAll(/export\s+(?:function|const)\s+(\w+)/g)) {
      exported.add(m[1]);
    }
  }
}

/* ---- the rules --------------------------------------------------------- */
// A path claim is anything with a slash that looks like a repo path. Bare
// filenames are skipped: "index.d.ts" is ambiguous about which package it is in.
const PATH_RE = /(?<![\w./-])((?:packages|skills|docs|mappings|assets|labs|proof)\/[\w./*-]+)/g;
// Symbols this project actually names in prose. Deliberately narrow — a wide
// identifier match turns prose into noise.
const SYMBOL_RE = /\b(OL8_[A-Z0-9_]+|map[A-Z]\w+|is[A-Z]\w+|render[A-Z]\w+|hydrate[A-Z]\w+|iconNames)\b/g;
const SUBSET_RE = /(exports?\s+(?:are|is)\s+limited\s+to|only\s+\w[\w,\s]*\s+(?:are|is)\s+exported)/i;

for (const file of DOCS) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const n = i + 1;

    // PATHS
    for (const m of line.matchAll(PATH_RE)) {
      const claim = m[1].replace(/[.,)]+$/, '');
      if (claim.includes('*')) continue;                      // globs are patterns
      if (!existsSync(join(ROOT, claim))) fail(rel, n, `names a path that does not exist: ${claim}`);
    }

    // SYMBOLS
    for (const m of line.matchAll(SYMBOL_RE)) {
      if (!exported.has(m[1])) fail(rel, n, `names a symbol that is not exported: ${m[1]}`);
    }

    // SUBSETS
    if (SUBSET_RE.test(line)) {
      fail(rel, n, 'enumerates a closed list of public exports — point at index.d.ts instead, a list goes stale as the library grows');
    }
  });

  // IMPORTS — every named import from a workspace package must resolve.
  for (const m of readFileSync(file, 'utf8').matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]@oneli8\/(react|core)['"]/g)) {
    const line = readFileSync(file, 'utf8').slice(0, m.index).split('\n').length;
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (name && !exported.has(name)) fail(rel, line, `documents an import that would throw: ${name}`);
    }
  }
}

/* ---- rule 5: no orphaned document ---------------------------------------
 * The four rules above check what a document CLAIMS. None of them noticed that
 * docs/gem-material.md was reachable from nowhere, or that README.md — the
 * front door — contained zero markdown links at all, so PRINCIPLES.md,
 * AGENTS.md and every docs/ page were unreachable from it. A document nobody
 * can navigate to is stale by default, however accurate its contents.
 *
 * Every document in the rule surface must be linked from at least one other
 * document. README.md is the root and is exempt from needing an inbound link.
 */
const linkedTo = new Set();
for (const file of DOCS) {
  const dir = dirname(file);
  for (const m of readFileSync(file, 'utf8').matchAll(/\]\(([^)#]+\.md)(?:#[^)]*)?\)/g))
    linkedTo.add(resolve(dir, m[1]));
}
for (const file of DOCS) {
  if (file === join(ROOT, 'README.md')) continue;
  if (linkedTo.has(resolve(file))) continue;
  fail(relative(ROOT, file), 1,
    'is linked from no other document; a page nobody can navigate to is stale by default');
}

/* ---- rule 6: one spelling of the name --------------------------------
 * The system was spelled three ways: OneLi8 21 times, Oneli8 3 times, and
 * "One Li8" once the Figma file was renamed. For a design system whose premise
 * is that the rules travel with the package, a name that renders three ways is
 * the first thing a newcomer notices.
 *
 * OneLi8 is canonical. The rule is cheap to state because identifiers are all
 * lowercase — @oneli8/tokens, skills/oneli8-ui, --ol8-* — so any capital-O
 * spelling is prose by definition and must be the canonical one.
 */
const NAME_WRONG = /Oneli8|One Li8|OneLI8|ONELi8/;
for (const file of DOCS) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const m = line.match(NAME_WRONG);
    if (m) fail(relative(ROOT, file), i + 1, `spells the name "${m[0]}"; it is OneLi8 everywhere`);
  });
}

if (failures.length) {
  console.error(`✗ docs check failed — ${failures.length} stale claim(s):`);
  for (const f of failures) console.error('  · ' + f);
  console.error('\n  These are what an agent reads before it reads any code.');
  process.exit(1);
}
console.log(`✓ docs check: ${DOCS.length} documents, every path, symbol and import resolves, none orphaned, one spelling of the name`);
