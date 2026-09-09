# OneLi8 Design System

September 9, 2026 · Apache-2.0 · `1.0.0-beta.2`

OneLi8 means One Light: a modular design system created by Akshay Dhore,
inspired by Guruji Shrii Arnav and the 9×12 Way. This is a deliberately small
public beta, not a completed SaaS suite or a claim of full Figma/code certification.

## Included

- React `Icon`, `iconNames`, `Button`, `IconButton`, and `Link`.
- Existing Regular and Gem button treatments, without redesigning their source.
- Canonical editable tokens, CSS variables, JavaScript, and Tailwind adapters.
- Three AI skills, design principles, and explicit Button/IconButton/Link property mappings.

Other component families are not exported. The complete token vocabulary is
retained so its reference graph stays intact; tokens for another family do not
mean that family's component implementation is included. Internal shared helpers
are implementation details, not additional public components.

## Install into an existing React project

Requires Node 20+ and React 18+. React 18.3.1 is the tested version.
Unzip this bundle, then use the two local archives in `tarballs/`:

```sh
npm install /absolute/path/to/tarballs/oneli8-tokens-1.0.0-beta.2.tgz /absolute/path/to/tarballs/oneli8-react-1.0.0-beta.2.tgz
```

These are local packages, not a claim that this version is on npm.

```jsx
import {Button, IconButton, Icon, Link} from '@oneli8/react';
import '@oneli8/react/styles.css';

export function Actions() {
  return <div data-ol8-color-scheme="light" data-ol8-primary="blue">
    <Button leadingIcon={<Icon name="add" />}>Add item</Button>
    <IconButton accessibleName="Search" icon={<Icon name="search" />} />
    <Link href="/help">Help</Link>
  </div>;
}
```

This is a usage snippet, not an approved composed page. Use existing component
properties and tokens when arranging your product. `material="gem"` is available
on Button and IconButton, not Link. Test Gem content against its actual backdrop;
near-white content alone cannot guarantee readable contrast.

## API and tokens

The declaration files in `packages/react/src/` describe the API. Button variants
are primary/secondary/quiet/destructive; sizes are compact/standard/comfortable/large.
IconButton supports rounded/circle and requires an accessible name. Icons are
decorative; give meaning to their parent control. Do not pass an invented icon
name: choose from `iconNames`. Buttons select their shared icon size internally.

Read `packages/tokens/README.md` for theme attributes and Tailwind adapters.
Change editable `packages/tokens/src/` values, then run:

```sh
node packages/tokens/scripts/build.mjs --standalone
node packages/tokens/scripts/test.mjs --standalone
```

This regenerates token files, not Figma. Repack/reinstall the packages after edits.
Token status records describe development maturity, not public beta certification.

## AI use and free Figma mapping

Start with `AGENTS.md` and choose a task-specific skill in `skills/`. AI tools
that do not discover skills can read those Markdown instructions explicitly.
Skills guide agents; they do not force arbitrary AI tools to comply automatically.

`mappings/` contains offline translators and dated canonical property tables.
They accept inspected observations and return a component plan or explicit gaps.
No Code Connect subscription, credentials, or network access is required to run
them. They do not extract Figma automatically or certify visual parity. Copied
Figma libraries can have different IDs: inspect and update mappings, never guess.

## Validation and limits

See `BUILD-REPORT.json` and `SMOKE-REPORT.json` for this artifact's checks.
`SOURCE-MANIFEST.json` records hashes of reused source files. The React source
owners and CSS are copied unchanged; package entry points are scoped to this release.

Passing packaging, import, rendering, or mapping tests does not certify every
browser state, screen-reader interaction, visual match, background, or XR device.
Full-system synchronization remains incomplete. Report gaps rather than silently
recreating components. This bundle has no backend, analytics, or credentials.

## Ownership and evolution

Akshay Dhore is currently the sole creator and approver of canonical OneLi8
components. Apache-2.0 permits reuse and forks; upstream design approval is separate.
Feedback and proposals are welcome, but no contribution process or additional
maintainer is implied. Future releases can add fixed families incrementally.
See `PRINCIPLES.md`, `LICENSE` and `NOTICE`. Preserve applicable copyright and
attribution notices when redistributing under Apache-2.0. This does not require
a visible badge in your product or imply OneLi8 endorsement. Earlier MIT releases
retain their original permissions. This license update changes no component designs.
