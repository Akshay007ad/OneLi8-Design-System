# @oneli8/core

[![npm](https://img.shields.io/npm/v/@oneli8/core?color=2c438b&label=npm)](https://www.npmjs.com/package/@oneli8/core)
[![licence](https://img.shields.io/npm/l/@oneli8/core?color=2c438b)](https://github.com/Akshay007ad/OneLi8-Design-System/blob/main/LICENSE)

**OneLi8 means One Light.**

A design system created by Akshay Dhore, intended for broad human benefit and
conceived as service to Guruji Shrii Arnav, whose teachings inspire it. Service,
clarity, harmony, proportion, restraint and evolution guide its decisions.

The practical intention is narrower and easier to check. Most design systems
hand you components and hope you stay inside them. This one hands you the
reasoning as well, so when you need something it does not ship, you can build it
and have it still belong. The rules travel inside this package, not in a wiki
someone forgets to read.

This is the framework free build. It runs anywhere HTML is produced as a string:
Rails, Django, Laravel, Astro, Eleventy, a CMS theme, or hand written markup.

```sh
npm install @oneli8/core
```

```js
import { renderMultiSelectField, hydrateMultiSelectFields } from '@oneli8/core';
import '@oneli8/core/styles.css';

element.innerHTML = renderMultiSelectField({
  label: 'Skills',
  options: skills,
  values: chosen,
  placeholder: 'Add skill…',
});
hydrateMultiSelectFields();
```

`render*` returns markup. `hydrate*` wires up only what markup genuinely cannot
express. Both halves produce the same DOM as `@oneli8/react`, checked on every
build.

## What is included

Twenty one components, every one of them drawn from a component set in the Figma
source rather than invented here. Anything not listed is not exported. Tokens
exist for families whose implementations are not in this release; a token is not
a promise of a component.

**Atoms** · `Icon` · `Selection Indicator` (checkbox, radio, switch)
· `Navigation Badge`

**Molecules** · `Button` · `Icon Button` · `Link` · `Text Field` · `Form Message`
· `Select` · `Choice Item` · `Selection Option` · `Choice Chip` · `Token`

**Organisms** · `Tabs` · `Tab Bar` · `Segmented Control` · `Choice Group`
· `Selection Popup` · `Combobox` · `Multi-select Field` · `Choice Picker`

**Material** · `Gem`, an attribute adapter, not a tier

## Why this exists

`PRINCIPLES.md` ships inside this package and sets out the six values in full,
along with the three operating laws every component obeys. It is the document to
read before extending anything.

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
- Tabs and Segmented Control move one tab stop across their items with the
  arrow keys, which is a roving focus model markup cannot describe.
- Combobox keeps real focus on its input and carries the active option as a
  virtual cursor, so the cursor has to be moved in script.
- Multi-select Field walks its committed values with the arrow keys and takes
  two presses to remove one, so a stray Backspace cannot drop a value.
- Choice Picker in Apply mode commits on Enter and restores on Escape, and
  leaves a composing input method alone.

Fifteen `hydrate*` functions ship, one per family that needs one. Hydration is
idempotent, running it twice changes nothing, and a page that never calls it
still renders and still reads correctly.

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
