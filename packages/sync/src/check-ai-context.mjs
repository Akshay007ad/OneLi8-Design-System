/**
 * Gates the machine-readable surface: llms.txt and ai-context.json.
 *
 * WHY THIS FILE EXISTS
 * README.md tells an agent to read llms.txt first and ai-context.json second.
 * Both are hand-maintained — build-package-context.mjs READS ai-context.json
 * and writes per-package subsets from it, so nothing ever forced the root files
 * to move. They drifted for eleven days and eight token changes without a
 * single check noticing, because check-docs.mjs only scans .md files.
 *
 * What they claimed when this check was written: version 1.0.0-beta.3 against a
 * beta.10 package, a token pipeline of src/tokens.json -> dist/tokens.css where
 * neither path exists, and 337 custom properties against a real 606. The file
 * an agent trusts most was the least true thing in the repository.
 *
 * Four rules:
 *   VERSION  the version they state must be the version that ships
 *   PATHS    every repo path they name must exist
 *   TOKENS   every --ol8-* they name must exist in the built CSS
 *   COUNTS   every token count they state must match build/manifest.json
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const failures = [];
const fail = (file, msg) => failures.push(`${file} ${msg}`);

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'packages/tokens/build/manifest.json'), 'utf8'));
const css = readFileSync(join(ROOT, 'packages/tokens/build/css/tokens.css'), 'utf8');
const defined = new Set([...css.matchAll(/^\s*(--ol8-[a-z0-9-]+)\s*:/gmi)].map((m) => m[1]));

const SURFACE = ['llms.txt', 'ai-context.json'];

for (const rel of SURFACE) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) { fail(rel, 'is missing; README points agents at it'); continue; }
  const text = readFileSync(full, 'utf8');

  /* ---- VERSION ---- */
  for (const m of text.matchAll(/1\.0\.0-beta\.(\d+)/g)) {
    if (m[0] !== pkg.version) fail(rel, `states version ${m[0]}, but the package ships ${pkg.version}`);
  }

  /* ---- PATHS ---- */
  const seen = new Set();
  for (const m of text.matchAll(/\b(packages\/[A-Za-z0-9_./-]*[A-Za-z0-9_-])/g)) {
    let p = m[1].replace(/[.,)]+$/, '');
    if (seen.has(p)) continue;
    seen.add(p);
    // a trailing-slash directory reference, or a glob-ish stem, still has to exist
    if (existsSync(join(ROOT, p))) continue;
    fail(rel, `names ${p}, which does not exist`);
  }

  /* ---- TOKENS ----
   * A trailing *, < or { makes it a PATTERN, not a claim about one token:
   * `--ol8-color-primary-*`, `--ol8-typography-<role>-{font-size,...}` and
   * `--ol8-color-action<family>-content` are all deliberate and all correct.
   * Only a concrete name is held to existing. */
  for (const m of text.matchAll(/(--ol8-[a-z0-9-]+)([*<{]?)/gi)) {
    const [, name, next] = m;
    if (next === '*' || next === '<' || next === '{') continue;
    if (name.endsWith('-')) continue;
    if (defined.has(name)) continue;
    fail(rel, `names ${name}, which no token defines`);
  }
}

/* ---- COUNTS (llms.txt prose) ---- */
const llms = existsSync(join(ROOT, 'llms.txt')) ? readFileSync(join(ROOT, 'llms.txt'), 'utf8') : '';
const total = manifest.counts.primitive + manifest.counts.semantic + manifest.counts.component;
const claims = [
  [/(\d+)\s+CSS custom properties/, total, 'total CSS custom properties'],
  [/(\d+)\s+primitives/, manifest.counts.primitive, 'primitives'],
  [/(\d+)\s+semantic roles/, manifest.counts.semantic, 'semantic roles'],
];
for (const [re, actual, label] of claims) {
  const m = llms.match(re);
  if (!m) continue;
  if (Number(m[1]) !== actual) fail('llms.txt', `claims ${m[1]} ${label}, but the build emits ${actual}`);
}

if (failures.length) {
  console.error(`✗ ai context check failed — ${failures.length} stale claim(s):`);
  for (const f of failures) console.error('  · ' + f);
  console.error('\n  README tells agents to read llms.txt first and ai-context.json second.');
  process.exit(1);
}
console.log('✓ ai context check: llms.txt and ai-context.json agree with the build');
