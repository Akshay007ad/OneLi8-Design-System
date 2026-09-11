/**
 * Ships the system's knowledge inside every published package.
 *
 * A consumer's agent that only sees an API will invent whatever is missing. So
 * each package carries the design language, the rules it must obey, and an
 * honest inventory of what exists. The inventory is derived from the source
 * tree rather than written by hand, so it cannot describe something that is
 * not there.
 *
 * The three packages need different halves of it:
 *   tokens  the foundations. No components, so no atomic tiers.
 *   core    the vanilla implementation: render returns a string, hydrate wires DOM.
 *   react   the React implementation.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ctx = JSON.parse(readFileSync(join(ROOT, 'ai-context.json'), 'utf8'));
const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

const FOUNDATIONS = {
  package: '@oneli8/tokens',
  css: '@oneli8/tokens/css',
  tokenPrefix: '--ol8-',
  namingAuthority:
    'Figma. Every variable carries an explicit codeSyntax, recorded verbatim in ' +
    'packages/tokens/src/figma-code-syntax.txt. Names are never derived from a rule.',
  rules: ctx.foundations.rules,
};

const SHARED_FORBIDDEN = [
  'A literal colour, size or font value anywhere in a component.',
  'A primitive token in a component. Primitives are hidden from the Figma pickers for the same reason.',
  'An invented icon name. Choose from OL8_ICONS.',
  'A per-size icon stroke. The 1.8 stroke is shared, and an Icon Frame instance is an exact scale of the 24px master, so an 18px one carries a 1.35 stroke. The selection masters are the exception: Icon / Selection / Check keeps the same 10.2 x 6.9 artwork at 1.8 in both its 18 and 24 boxes, so it is not scaled.',
  'Mixing a filled treatment with an outlined one across selection controls. Checkbox and Radio share one language.',
];

const SHARED_STEPS = [
  'Check the inventory below first. Do not rebuild something that exists.',
  'Pick the tier by what it composes, not by how complex it feels.',
  'Reach for a SEMANTIC token, never a primitive and never a literal. color-actionprimary-default, not color-blue-600 and not #2c438b.',
  'Every dimension sits on the 3px grid. An exception needs an approval record, not a rounded number.',
  'Icons come from the pool. To draw a new one follow skills/oneli8-icons: a 24px neutral source on the shared 1.8 stroke.',
  'Give margins to the parent, never to the component.',
  'States are not classes. Use :hover, :active, :focus-visible, [disabled] and data attributes.',
  'Colour is currentColor on icons; the parent supplies the semantic role.',
];

/**
 * Inventory read from the tree, limited to what the package actually exports.
 * The public surface is taken by importing the index rather than parsing it,
 * because `export *` chains cannot be resolved reliably by regex, and an
 * internal helper listed here would tell a consumer's agent that a private
 * thing is part of the API.
 */
async function inventory(pkgDir) {
  const src = join(ROOT, 'packages', pkgDir, 'src');
  const indexFile = join(src, 'index.js');
  if (!existsSync(indexFile)) return [];

  let publicNames;
  try {
    publicNames = new Set(Object.keys(await import(pathToFileURL(indexFile).href)));
  } catch (error) {
    throw new Error(
      `[ol8] cannot read the public surface of @oneli8/${pkgDir}: ${error.message}\n` +
      '      The inventory must be exact, so this fails rather than guessing from a regex.'
    );
  }

  const out = [];
  const TIERS = { atoms: 'atom', molecules: 'molecule', organisms: 'organism' };
  for (const [dir, tier] of Object.entries(TIERS)) {
    const full = join(src, dir);
    if (!existsSync(full)) continue;
    const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(join(d, e.name))
        // a generated registry is data, not a component
        : e.name.endsWith('.js') && e.name !== 'index.js' && !e.name.endsWith('.generated.js')
          ? [join(d, e.name)] : []);
    for (const file of walk(full)) {
      const source = readFileSync(file, 'utf8');
      const exported = [...source.matchAll(/export (?:const|function) (\w+)/g)]
        .map(m => m[1]).filter(n => publicNames.has(n));
      if (exported.length === 0) continue;
      out.push({
        tier,
        module: file.slice(src.length + 1),
        exports: exported,
        constraint: tier === 'atom'
          ? 'Composes no other component. Native elements only.'
          : tier === 'molecule'
            ? 'Composed of atoms. Reusable and more specialised.'
            : 'Composed of atoms, molecules or organisms. May hold application state.',
      });
    }
  }
  return out;
}

function write(pkgDir, context, { withSkills }) {
  const dest = join(ROOT, 'packages', pkgDir);
  writeFileSync(join(dest, 'ai-context.json'), JSON.stringify(context, null, 2) + '\n');
  for (const file of ['PRINCIPLES.md', 'AGENTS.md']) cpSync(join(ROOT, file), join(dest, file));
  if (withSkills) {
    mkdirSync(join(dest, 'skills'), { recursive: true });
    cpSync(join(ROOT, 'skills'), join(dest, 'skills'), { recursive: true });
  }
}

const base = { system: 'OneLi8', version, meaning: 'OneLi8 means One Light.', foundations: FOUNDATIONS };
const summary = [];

// ---- tokens: the foundations only ----------------------------------------
write('tokens', {
  $comment: 'GENERATED by packages/sync/src/build-package-context.mjs — do not edit.',
  ...base,
  readFirst: ['PRINCIPLES.md', 'README.md'],
  scope: 'Design decisions only. No markup and no components, so nothing here can conflict with a framework.',
  usingTheseTokens: {
    steps: SHARED_STEPS.slice(2, 5),
    forbidden: SHARED_FORBIDDEN.slice(0, 2),
  },
  themeAxes: {
    'data-ol8-color-scheme': ['light', 'dark'],
    'data-ol8-primary': ['blue', 'orange', 'green'],
    'data-ol8-type-mode': ['compact', 'medium', 'expanded'],
    note: 'Independent axes. Set two and you get both; there is no combined mode.',
  },
}, { withSkills: false });
summary.push('tokens (foundations)');

// ---- core and react: full component knowledge ------------------------------
for (const [pkgDir, model] of [
  ['core', 'Framework agnostic. renderX() returns an HTML string; hydrateX() applies the runtime rules to markup that already exists.'],
  ['react', 'React components. Same DOM and same stylesheets as @oneli8/core, verified identical.'],
]) {
  const components = await inventory(pkgDir);
  write(pkgDir, {
    $comment: 'GENERATED by packages/sync/src/build-package-context.mjs — do not edit.',
    ...base,
    readFirst: ['PRINCIPLES.md', 'AGENTS.md', 'skills/'],
    model,
    architecture: { convention: ctx.architecture.convention, rules: ctx.architecture.rules },
    components,
    buildingWhatIsNotHere: {
      principle: 'A component OneLi8 does not ship is still a OneLi8 component. Compose it from these foundations rather than inventing a parallel system.',
      steps: SHARED_STEPS,
      forbidden: SHARED_FORBIDDEN,
    },
    materials: { gem: { strategy: 'attribute', emitAs: ctx.materials.gem.emitAs, note: ctx.materials.gem.note, appliesTo: ctx.materials.gem.appliesTo } },
    pending: ctx.pending ?? {},
  }, { withSkills: true });
  summary.push(`${pkgDir} (${components.length} components)`);
}

console.log(`✓ package context: ${summary.join(', ')}`);
