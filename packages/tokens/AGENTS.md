# OneLi8 public beta usage

Read README.md and PRINCIPLES.md first. packages/react/src/index.d.ts is the
authoritative export surface — twenty one components across the atom, molecule
and organism tiers, plus their OL8_* option constants. Do not name a subset
here; it goes stale and then agents rebuild things that already ship. Do not
treat unused token families as available components either: a token is not a
promise that a component exists. Use [skills/oneli8-ui/SKILL.md](skills/oneli8-ui/SKILL.md) for composition,
[skills/oneli8-icons/SKILL.md](skills/oneli8-icons/SKILL.md) for icon work, and
[skills/oneli8-figma-to-code/SKILL.md](skills/oneli8-figma-to-code/SKILL.md) for
mapping work.

Reuse canonical code and semantic tokens. Do not create consumer-local copies
of existing icons, component skins or state geometry. Ask the maintainer about
missing design decisions. This public beta does not enforce arbitrary downstream
code automatically and does not claim complete Figma parity.
