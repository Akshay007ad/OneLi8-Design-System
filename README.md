# OneLi8 Design System

**One Light. Shared foundations. Your expression.**

A modular design system for students, independent developers and teams who want
to build from intentional components—not repeatedly generate approximations.
Created by **Akshay Dhore**, inspired by **Guruji Shrii Arnav** and the **9×12 Way**.

[Quick start](#quick-start) · [Components](docs/components.md) · [Themes and Gem](docs/theming.md) · [AI and Figma](docs/ai-and-figma.md) · [Philosophy](PRINCIPLES.md)

**Public Beta · Apache-2.0 · React 18+ · Node 20+**

## Quick start

In your existing React project:

```sh
npm install @oneli8/react@beta
```

This installs the React components **and their token dependency automatically**.
No manual ZIP download, GitHub login or paid Figma Code Connect is needed.
React and React DOM belong to your host application.

Choose what your project needs:

| Need | Command |
| --- | --- |
| Components, with tokens included automatically | `npm install @oneli8/react@beta` |
| Only tokens; no React components | `npm install @oneli8/tokens@beta` |
| Both as explicit project dependencies | `npm install @oneli8/react@beta @oneli8/tokens@beta` |

Use the published lowercase package names above, not `npm install OneLi8`.
If you import tokens directly in your own code, declare both explicitly.
Package installation does not clone the repository or install AI skills.

Import the stylesheet once in your application entry point:

```jsx
import '@oneli8/react/styles.css';
```

Then use the existing components:

```jsx
import {Button, IconButton, Icon, Link} from '@oneli8/react';

export function Actions() {
  return (
    <section aria-label="Actions"
      data-ol8-color-scheme="light" data-ol8-primary="blue">
      <Button leadingIcon={<Icon name="add" />}>Add item</Button>
      <IconButton accessibleName="Search" icon={<Icon name="search" />} />
      <Link href="/help">Read the guide</Link>
    </section>
  );
}
```

Wire action handlers to your application. The snippet demonstrates imports and
composition; it is not a prebuilt application. [Read the component API →](docs/components.md)

## What you can use today

| Building block | Included in this beta |
| --- | --- |
| Button | Four variants, four sizes, optional leading/trailing icons, loading and disabled |
| IconButton | Rounded and circular shapes, accessible names, Regular and Gem |
| Link | Inline, standalone and navigation-form links |
| Icon pool | 17 reusable neutral 24px identities with consumer-owned color |
| Tokens | 586 shared tokens; CSS, JavaScript, Tailwind and Figma data outputs |
| AI guidance | Three scoped skills and explicit Button/IconButton/Link property mappings |

Other component families remain outside this beta's exports. Token vocabulary
for those families is not a promise of an included implementation.

## Why OneLi8

- **Atomic Design:** meaningful atoms compose molecules, organisms, templates and
  pages. Small appearance does not automatically make something an atom.
- **OneLi8 Modularity:** identity, size, color, material and behavior have shared
  owners. Change a dependency instead of maintaining copies.
- **Harmony:** a 3px construction rhythm, governed optical exceptions, intentional
  spacing and semantic roles keep the system coherent.
- **Freedom of expression:** theme and primary family are independent. The current
  presets are a starting point; editable token sources support deliberate extension.
- **Service and clarity:** beautiful material must still communicate state and meaning.

[Explore the philosophy and operating principles →](PRINCIPLES.md)

## Gem Morphism

Gem is OneLi8's transparent material treatment, guided by **Cut, Color, Clarity
and Carat/weight**. It is a skin on shared components—not a disconnected library.

```jsx
<Button material="gem">Continue</Button>
```

Preserve the approved bezel and tint. Facets are restrained accents, not a default
on every tile. Gem retains near-white content; it does not automatically sample
the background or guarantee contrast on arbitrary scenery. Spatial computing is
a direction for the system, not a claim of XR-device certification.

[Use themes and Gem responsibly →](docs/theming.md)

## Work with AI, without Code Connect

The React install gives your application components and tokens. The repository
also contains agent instructions and focused skills:

- **UI composition:** reuse canonical owners and semantic tokens.
- **Icon creation:** extend one neutral source pool, not per-component copies.
- **Figma-to-code:** translate explicit observations through the included mappings.

These mappings run offline. They do not automatically extract a Figma file or
prove complete bidirectional parity. Agents need actual observations and must
report missing mappings rather than invent them.

[Set up your AI workflow →](docs/ai-and-figma.md)

## Editable source and local checks

```sh
git clone https://github.com/Akshay007ad/OneLi8-Design-System.git
cd OneLi8-Design-System
npm install
npm test
npm run build
```

The root stays private as an npm package: publishable units are separate.
Edit token source, rebuild, and test; don't patch installed dependencies or
copy values into local component skins.

## Beta evidence and boundaries

The packaging baseline passed **284 smoke checks**, **159 synthetic mapping-plan
renders**, and **69 token checks**. Reports distinguish what was tested.
Full visual parity, cross-browser behavior and assistive-technology certification
are not claimed. Test your real content, interactions and backgrounds.

For reproducible installs, pin both packages to `1.0.0-beta.2`; `@beta` follows
future beta releases. Keep your lockfile. Update intentionally and review release notes.

## Ownership, feedback and license

Akshay Dhore is the sole creator and approver of canonical OneLi8 components.
Feedback, test reports and proposals are welcome through
[GitHub Issues](https://github.com/Akshay007ad/OneLi8-Design-System/issues).
A proposed addition is not automatically canonical.

Licensed under [Apache-2.0](LICENSE), with attribution in [NOTICE](NOTICE).
Preserve applicable notices when redistributing; no visible product badge is
required. Earlier MIT releases retain their original permissions.
