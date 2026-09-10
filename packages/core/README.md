# @oneli8/core

OneLi8 Design System, framework agnostic components.

Every component is two functions: `renderX(...)` returns an HTML **string**, and
`hydrateX(root)` enforces the runtime contract on markup that already exists.
There is no framework dependency, no virtual DOM and no build step.

```sh
npm install @oneli8/core
```

```js
import { renderButton, hydrateButtons } from '@oneli8/core';
import '@oneli8/core/styles.css';

document.querySelector('#toolbar').innerHTML = renderButton('Save', {
  variant: 'primary',
  leadingIcon: 'add',
});

hydrateButtons();
```

## What is included

| Tier | Component |
|---|---|
| Atom | `Icon`, `Selection Indicator` (checkbox, radio, switch) |
| Molecule | `Button`, `Icon Button`, `Choice Item`, `Selection Option` |
| Organism | `Choice Group` (checkbox hierarchy, radio group) |
| Material | `Gem`, an attribute adapter, not a tier |

Anything not listed is not exported. Tokens exist for component families whose
implementations are not in this release; a token is not a promise of a component.

## Why this exists

OneLi8 means One Light. It was created by Akshay Dhore, intended for broad human
benefit and conceived as service to Guruji Shrii Arnav, whose teachings inspire
it. Service, clarity, harmony, proportion, restraint and evolution guide its
decisions. `PRINCIPLES.md` ships inside this package and sets them out in full.

The practical intention: most design systems hand you components and hope you
stay inside them. This one hands you the reasoning too, so when you need
something it does not ship you can build it and have it still belong.

## Naming

The structure is borrowed from Sanskrit grammar rather than a CSS convention.

**A compound naming one thing is one word.** `actionprimary` is not action plus
primary, it is a single role. `cutedge` is one feature of the Gem material.

**A qualifier stays separate from what it qualifies.** In
`--ol8-material-control-gem--primary-hover-start`, `hover` is a state applied to
`start`, so it keeps its hyphen. That is why `disabledcontent` is joined and
`hover-start` is not.

Hyphens separate levels of the hierarchy, never words inside a level. The words
themselves stay readable: no abbreviations and no truncation.

## Rendering and hydration

`render*` covers everything expressible in markup. `hydrate*` exists only for
what markup genuinely cannot express:

- `indeterminate` on a checkbox is a JavaScript only property, so Mixed needs
  hydration and every other state does not.
- A `<button>` without an explicit `type` submits its form. Hydration pins it.
- Links cannot be natively disabled, so they get `aria-disabled` and their
  activation is swallowed.

Hydration is idempotent, running it twice changes nothing.

## Styles

`@oneli8/core/styles.css` pulls in the tokens and every component sheet in the
order they must load. To take only what you use, import the parts:

```js
import '@oneli8/tokens/css';
import '@oneli8/core/styles/button.css';
```

Tokens must always come first, every component rule reads them.

## Accessibility is enforced, not suggested

`renderIconButton` throws without an accessible name. `renderButton` throws for
`material: "gem"` on `quiet` or `destructive`, because Figma approves Gem for
Primary and Secondary only. These are errors rather than review comments on
purpose.

Test Gem against its real backdrop. Content close to white content alone does not guarantee
readable contrast.

## Licence

Apache 2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`; preserve the
attribution notices when redistributing. This does not require a visible badge
in your product, and implies no OneLi8 endorsement.
