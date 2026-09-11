# Where this stands

Written 10 September 2026. Everything below is verified by `npm run build`,
which now runs the structure check, 70 token checks, 71 core component checks
and 50 React reference checks.

## Done and committed

**Link, synced to what Figma actually draws.** Five differences, all resolved in
favour of Figma: the focus ring moved outside the box, the inline padding
dropped from twelve to three, navigation stopped hiding its underline, it
stopped stretching to full width, and the current destination became a thicker
underline in the link colour rather than a bar beside the label in the primary
colour. The size `inherit` was removed because Figma binds each of the three
sizes to a concrete font size variable and a variable cannot resolve to context.

**Text Field, Gem Text Field and Form Message.** Both pages, in core and React,
with the gem material extended to the field control. Figma governed what is
drawn; the Text Field contract governed what the API means.

**The navigation family.** One Navigation Badge atom, one shared internal item
molecule, and the three organisms the contract calls the public surface: Tabs,
Segmented Control and Tab Bar, at the paths the status registry already named.

**Select, Selection Popup and Combobox.** Three of the ten sets on the Select
and Combobox page.

**Choice Chip and Token.** The Soft Hexagon, built the way Figma builds it: a
fixed twelve unit terminal, a rail that grows with the label, and a mirrored
terminal, so a short chip and a long one keep the same shoulder depth and side
angle. The terminals are real paths rather than a polygon, because the contract
rejects approximating their softness with extra vertices. One viewBox serves all
four heights: read from Figma, every terminal path at thirty, thirty six and
forty two shares identical X values and Y values that are the same fractions of
the height, so stretching Y alone is exact. Token draws no silhouette of its
own; it instantiates the chip's, exactly as the Figma component instantiates the
Geometry Owner.

**Ten stylesheets that were built but never shipped.** Text Field, Form Message,
Select, Combobox, Selection Popup, Navigation Badge, Navigation Item, Tabs, Tab
Bar and Segmented Control all had stylesheets in the tree and no import in
either package's `styles.css`, so a consumer loading them got markup with no
rules to paint it. The aggregate is now generated from the directory rather than
maintained by hand, which is the only version of this that cannot fall behind
again.

**The checkbox check was drawn a quarter too small at compact.** The stylesheet
scaled the glyph with its box, on a stated assumption that the eighteen master
is an exact three quarter scale of the twenty four one. Figma says otherwise:
`Icon / Selection / Check` is a governed two size master where Size=Small and
Size=Standard both carry the same 10.2 by 6.9 artwork at the same 1.8 stroke,
centred in their box. Scaling it also dropped the stroke to 1.35, off the 1.8
system. Both are fixed.

**The last three organisms on the Select and Combobox page.** Multi-select Field
and Choice Picker, which is every set on that page now built.

Multi-select Field is one component with an appearance axis rather than two,
because the Figma Filled description says so itself: "Same atomic composition
and size behavior as Outline; only the canonical field appearance owner
changes." In Figma the tokens are absolutely positioned over the field shell,
since a design file draws a picture rather than a layout that reflows, so the
real arrangement came from the contract: the committed values and the editable
input share one wrapping run, and the field grows rather than compressing
tokens to hold one nominal row.

Choice Picker follows the inline composition the maintainer approved as
canonical: a search field, a wrapping matrix of real checkboxes wearing the chip
appearance, and a commitment line that exists only in Apply mode. Figma draws
"Enter to apply" as text; the decision recorded on the component requires it to
be an actual clickable and focusable action, so it is a button, because a
keyboard instruction is no affordance for a pointer, touch, or a screen reader.

**Selection Popup now has a React reference,** which the Multi-select Field
needed. Writing it surfaced that React drew each option as an `li` inside a
`div` with role listbox, which is invalid markup and a drift from core, which
has always drawn a div. React now matches.

**Three defects found by looking at it rather than by running the tests.** A
committed value given as a bare string showed the option's value instead of its
label, so a field holding "ui" read "ui" rather than "Interface". The Text Field
pins its control stack to one row's height, which a single line input never
notices and a wrapping one does: tokens spilled straight out of the boundary
they belong inside. And a controlled chip with no change handler made React warn
about a read only field, which was fair, so a chip that nothing is listening to
now says it is read only rather than pretending otherwise.

**The core package exported eight of its twenty three stylesheets.** The export
map was hand maintained like the aggregate was, so a consumer could import the
whole sheet or a handful of early components and nothing else. It is generated
now, from the same walk that writes the aggregate.

**Combobox has a React reference,** so core and React now carry the same
twenty one components. React owns none of the keyboard model there: opening,
the active option and committing are application state, so they arrive as props
and leave as callbacks rather than being fought over.

**Select and Combobox have their variant matrices.** Both Figma sets declare
Material x Appearance x Size and hold Expanded as a boolean property rather
than an axis, "to avoid variant explosion", so the tests walk all sixteen in
each package and separately prove that opening multiplies nothing.

**The Token's two marks were not the same size.** The Icon Library cross spans
12 x 12 in the canonical 24 space and the check spans 10.2 x 6.9, so drawing
both at one frame size made the cross fifteen percent wider and well over half
again as tall, and it swamped the check beside it. Figma never drew it that way:
its Remove mark is an Icon Frame instance at 18, so the cross is 9 x 9 there and
sits comfortably against the check. The oversized cross was the stylesheet
rendering the library source at full size. Code now draws the 9 span Figma
draws, with the stroke left at the governed 1.8.

## Not built yet

Nothing. Every component set on every page is built in both packages, and every
one has its variant coverage.

## Decisions worth your eye

**Where Figma and a contract disagree, I followed Figma for what is drawn and
the contract for what the API means, and did not silently pick a winner.** Three
places where they actually differ:

1. *Leading icon size.* The Text Field contract says Comfortable and Large take
   a 24 unit icon. Figma draws 18 at every size. Code follows Figma.
2. *Icon to value gap.* The contract says nine at Comfortable and Large. Figma
   draws six at every size. Code follows Figma.
3. *Instruction to message gap.* The contract says three. Figma uses one root
   gap of six for the whole vertical stack. Code follows Figma.

**Button and Link draw their focus ring outside the box in Figma; the code drew
it inset.** Link is fixed. Button is not, and it is a wider visual change than
one component, so it is yours to call. Figma's Button focus is also a single
three unit outer ring where the code draws two.

**Figma draws the navigation focus edge at 1.8, which is the icon stroke value.**
Code uses the named `Focus / Ring / Inner Width` of three instead. This looks
like a slip in Figma rather than a decision.

**Coarse pointer targets for Compact and Standard fields are not implemented.**
The contract asks an adapter to expand the activation region. An overlay drawn
in CSS would sit over the value and take the caret away, which is worse than the
shortfall it fixes. It belongs to a platform adapter.

**The chip's default size is Standard.** Figma's variant default is Compact, but
that is which variant sits first in the set rather than a statement about the
API, and this contract names no default at all. Standard is what every other
size bearing component in the repository defaults to, so the house convention
wins until you say otherwise.

**The chip's edge uses a non scaling stroke.** It has to: the terminal stretches
on Y only, so an ordinary stroke would come out thicker along the top and bottom
than up the angled ends. The cost is that a CSS `zoom` or `transform: scale()`
applied to a chip will scale the rail's border and not the terminal's edge.
Browser page zoom is unaffected, because that scales CSS pixels and both follow.

**`component.choiceChip.markGap` and `component.choice.gap.standard` are both
nine and mean the same thing.** Figma binds the rail to the second. The first is
authored, unbound and now unused. One of them should go.

## Figma changes I made

All of these name a value that was already there, rather than changing a design.

- `Component / Link / Underline / Current`, aliased to `Border / Width / Strong`,
  bound to all three navigation current markers, which were a raw three.
- `Component / Text Field / Gap / Inline` and `Gap / Requirement`, bound across
  all eighty variants of the four Text Field sets, which were a raw six and three.
- Eighteen navigation component variables, so names that this repository had
  inferred are now names Figma agreed. Tokens with inferred names went from
  fifty three to thirty five.
- The mark moved from leading to trailing in all eight Choice Chip variants,
  which the twenty four Token variants inherit. Figma had drawn it ahead of the
  label, including the Remove cross, which is an unusual place for a remove
  affordance. You called it, so it moved. The whole slot moved rather than the
  cross alone, because splitting it would leave a Check on one side and a cross
  on the other among peer tokens, and the contract asks for one mark treatment
  across an instance. It now matches the anatomy the contract writes down,
  "Label + optional Remove mark".
- Four variables naming values this repository had inferred: `Component /
  Choice Chip / Gap`, and Token Field's `Gap`, `Padding Block` and `Minimum
  Input`. Tokens with inferred names went from thirty five to thirty one, and
  the chip family now spells itself one way rather than two.
- The Token's Remove mark moved from leading to trailing, and the six variants
  whose mark slot was still named "Selected Check" while holding a cross now say
  "Remove Mark".
- Sixty four bindings of raw numbers Figma was already drawing: the twelve
  between a field and its popup, now `Spacing / Stack / Related`, and the six of
  the picker's wrapping matrix, now the Choice Chip gap.
- `Component / Choice Chip / Mark Target`, a plain twenty four. The Remove mark
  is drawn at eighteen and the contract asks for a reachable target of at least
  twenty four, so the target is expanded around the drawn mark rather than the
  mark being enlarged. This is the one value here that Figma does not draw; it
  was created so the name would be Figma's rather than mine.

## Still open from before

- **Settled: the Token's two marks stay at different spans, check 10.2 and cross
  9.** The check is the larger of the two, so nothing dominates. Equalising them
  would mean changing the shared `Icon / Selection / Check` master, which is
  instanced 197 times across eleven families, so every checkbox, option, popup
  and chip tick in the system would shrink by twelve percent. Akshay looked at
  that number and chose to leave it. The cross cannot be moved the other way: it
  sits inside the Choice Chip geometry owner instance and Figma refuses size
  overrides that deep, silently.

- Thirty one tokens still have inferred names. Four
  of those, `innerTerminal`, `centerCut`, `innerCenterCut` and `bezelInset`,
  describe a mask based construction that neither Figma nor the code uses, since
  both draw two vectors per terminal instead. They are unreferenced.
- Five Figma variables are defined but not emitted, all superseded `683:*`
  duplicates.
- `data-ol8-type-mode` is inert and has no Figma design behind it.
- The version is `1.0.0-beta.6` in all four package files, built, packed and
  smoke tested against a clean consumer, but NOT published. Publishing needs a
  one time code from your authenticator, which only you can enter.
