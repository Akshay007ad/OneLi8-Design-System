# Working with AI and Figma

[Back to OneLi8](../README.md) · [Design principles](../PRINCIPLES.md)

## Give the agent the actual system

Installing React packages does not automatically install AI skills. Clone this
public repository if you want its skills, mappings and editable sources:

```sh
git clone https://github.com/Akshay007ad/OneLi8-Design-System.git
```

Ask your agent to read `AGENTS.md`, `PRINCIPLES.md`, and the applicable `skills/`
entry. Tools with skill support may install these folders through their own
supported mechanism. Other tools can read the Markdown directly.

Example instruction:

> Read this repository's AGENTS.md and UI skill. Use the public OneLi8 components,
> generated semantic tokens and canonical icon pool. List missing capabilities
> instead of creating lookalike components. Preserve approved Gem treatment.

Skills guide use; they do not force every AI product to comply. Review generated
code. No access to Akshay's private knowledge graph or credentials is required.

## Three focused skills

- `skills/oneli8-ui/SKILL.md`: composition and minimum useful abstraction.
- `skills/oneli8-icons/SKILL.md`: reuse the neutral 24px pool; propose new identities.
- `skills/oneli8-figma-to-code/SKILL.md`: translate inspected properties without Code Connect.

Atoms form molecules; organisms compose functional sections; templates arrange
them; pages supply real content. Optional Spatial Experience follows Page. This
is a dependency/ownership rule, not permission to wrap every fragment in a component.

## Free property mapping—not an automatic exporter

Use an authorized connector, your own read-only Figma plugin or explicit manual
observations. The included translators do not require paid Code Connect. They do
not provide a plugin or automatically download Figma files. Manual observations
remain provisional where nested identities or token bindings are missing.

The included mapping tables are dated observations of canonical owners. In a
copied Figma library, IDs can change. Inspect the actual owner before translating.

```js
import fs from 'node:fs';
import {mapButton} from './mappings/map-button.mjs';
const mapping = JSON.parse(fs.readFileSync('./mappings/button.mapping.json', 'utf8'));
const observation = JSON.parse(fs.readFileSync('./observation.json', 'utf8'));
const result = mapButton(mapping, observation);
if (result.status === 'blocked') console.error(result.gaps);
else console.log(result.plan);
```

Use `mapIconButton` with its shared Button rules, or `mapLink` for Link. Read each
module signature and property table; do not guess observation keys. A plan uses
the public React export; it is not newly generated component artwork.

Keep four evidence classes separate: properties, structure/tokens, visual parity,
and runtime/accessibility. Successful mapping proves only the first. No automatic
bidirectional synchronization or all-component certification is promised.
