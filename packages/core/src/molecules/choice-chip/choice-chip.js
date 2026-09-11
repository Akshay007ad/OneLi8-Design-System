/**
 * Oneli8 · Choice Chip (MOLECULE) — the Soft Hexagon.
 *
 * Figma: Select and Combobox / Choice Chip / Soft Hexagon 636:847 (8 variants,
 * Size x Selection, plus a Label text property and a Show Mark boolean).
 *
 * From the Figma description:
 *   "Compact/Standard/Comfortable/Large use approved 30/36/42/42px visible
 *    geometry inside protected 48/48/48/60px targets. Fixed 12px terminals and
 *    tokenized 9/12/15/15px inner rail insets preserve one silhouette at every
 *    label width."
 *
 * Figma builds the silhouette from three boxes, and so does this: a fixed 12px
 * left terminal, a centre rail that grows with the label, and a mirrored right
 * terminal. Only the rail grows, which is why a short chip and a long chip keep
 * the same shoulder depth and side angle. The contract is explicit that ends
 * which scale with the text are prohibited.
 *
 * WHY SVG RATHER THAN clip-path
 * The terminals are not polygons. Each has three small curves softening the
 * shoulders and the point, and the contract rejects approximating that softness
 * with extra vertices because it reads as an Octagon. `clip-path: polygon()`
 * can only draw straight vertices, so the terminals are real paths.
 *
 * HOW ONE PATH SERVES FOUR HEIGHTS
 * Read from Figma, every terminal path at 30, 36 and 42 has identical X values
 * and Y values that scale exactly with the height: 1/36, 1/12, 5/12, 11/24,
 * 13/24, 7/12, 11/12, 35/36 of the height, at every size. So one viewBox of
 * 12 x 30 with `preserveAspectRatio="none"` and a fixed 12px width reproduces
 * Figma at all four sizes: the height stretches, the width cannot.
 * `vector-effect="non-scaling-stroke"` keeps the edge an even 2px through that
 * uneven stretch.
 *
 * THE OPEN EDGE
 * Figma draws two vectors per terminal: a closed fill and an open outline that
 * "deliberately omits the hidden vertical closing edge", so the rail's own top
 * and bottom borders continue the perimeter without a doubled seam. This keeps
 * that construction. Figma reaches an inside stroke by scaling the outline path
 * to 98.75% of the width; here the edge is clipped to the fill instead, which
 * is the same rendered result stated directly.
 */
import { renderIconSvg } from '../../atoms/icon/icon.js';

export const OL8_CHIP_SIZES = ['compact', 'standard', 'comfortable', 'large'];

/**
 * The terminal, in the 12 x 30 space Figma draws it in. The closed path is the
 * fill; the open one is the perimeter, missing the seam edge at x=12.
 */
export const OL8_CHIP_TERMINAL_FILL =
  'M12 0 L8.96202541 0 C7.44303812 0 6.43037944 0.83333333 5.92405035 2.5 ' +
  'L0.45569618 12.5 C-0.15189877 13.75 -0.15189877 16.25 0.45569618 17.5 ' +
  'L5.92405035 27.5 C6.43037944 29.16666667 7.44303812 30 8.96202541 30 L12 30 Z';
export const OL8_CHIP_TERMINAL_EDGE =
  'M12 0 L8.96202541 0 C7.44303812 0 6.43037944 0.83333333 5.92405035 2.5 ' +
  'L0.45569618 12.5 C-0.15189877 13.75 -0.15189877 16.25 0.45569618 17.5 ' +
  'L5.92405035 27.5 C6.43037944 29.16666667 7.44303812 30 8.96202541 30 L12 30';

/**
 * One terminal. `side` only picks a class; the right terminal is the left one
 * mirrored in CSS, so the two can never drift apart.
 *
 * The focus bands are strokes on the same path, painted before the fill and at
 * double width, so their inner half lands under the fill and the visible half
 * sits outside the silhouette. That is how a ring follows a hexagon instead of
 * boxing it.
 */
function renderTerminal(uid, side) {
  const clip = `${uid}-clip-${side}`;
  return `<svg class="ol8-chip__terminal ol8-chip__terminal--${side}" viewBox="0 0 12 30" ` +
    `preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
    `<clipPath id="${clip}"><path d="${OL8_CHIP_TERMINAL_FILL}"/></clipPath>` +
    `<path class="ol8-chip__focus-outer" d="${OL8_CHIP_TERMINAL_EDGE}"/>` +
    `<path class="ol8-chip__focus-inner" d="${OL8_CHIP_TERMINAL_EDGE}"/>` +
    `<path class="ol8-chip__fill" d="${OL8_CHIP_TERMINAL_FILL}"/>` +
    `<path class="ol8-chip__edge" d="${OL8_CHIP_TERMINAL_EDGE}" clip-path="url(#${clip})"/>` +
    `</svg>`;
}

/**
 * The silhouette plus its rail contents. Private: Figma names this the
 * "Choice Chip / Geometry Owner" and both the public chip and the Token
 * instantiate it rather than redrawing it.
 *
 * `mark` is markup for the rail's leading slot, or an empty string. Figma puts
 * the mark BEFORE the label in every variant, including Remove.
 */
export function renderChipShape(uid, label, mark = '') {
  return renderTerminal(uid, 'leading') +
    `<span class="ol8-chip__rail">` +
      mark +
      `<span class="ol8-chip__label">${escapeText(label)}</span>` +
    `</span>` +
    renderTerminal(uid, 'trailing');
}

/**
 * A Choice Chip is a real checkbox. The contract is explicit: "Every option is
 * a real Checkbox rendered with the approved quiet Choice Chip appearance",
 * with "native checked state" among the redundant cues, so selection is never
 * carried by colour alone.
 *
 * @param {string} label
 * @param {{size?:string,selected?:boolean,showMark?:boolean,disabled?:boolean,
 *          name?:string,value?:string,id?:string,className?:string}} [options]
 */
export function renderChoiceChip(label, options = {}) {
  const {
    size = 'standard', selected = false, showMark = false, disabled = false,
    name, value, id, className,
  } = options;

  if (!OL8_CHIP_SIZES.includes(size)) throw new Error(`[ol8] unknown chip size "${size}"`);
  if (!label || !String(label).trim()) throw new Error('[ol8] Choice Chip requires a label');

  const uid = id ?? `ol8-chip-${Math.random().toString(36).slice(2, 9)}`;
  const mark = showMark
    ? `<span class="ol8-chip__mark" aria-hidden="true">${renderIconSvg('check')}</span>`
    : '';

  const inputAttrs = [
    'type="checkbox"', 'class="ol8-chip__input"', `id="${uid}"`,
    name ? `name="${escapeAttr(name)}"` : '',
    value !== undefined ? `value="${escapeAttr(value)}"` : '',
    selected ? 'checked' : '', disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');

  const rowAttrs = [
    `class="ol8-chip${className ? ` ${className}` : ''}"`,
    `for="${uid}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-selection="${selected ? 'selected' : 'inactive'}"`,
    `data-ol8-availability="${disabled ? 'disabled' : 'enabled'}"`,
  ].filter(Boolean).join(' ');

  return `<label ${rowAttrs}><input ${inputAttrs}>${renderChipShape(uid, label, mark)}</label>`;
}

/**
 * Keeps each chip's Selection attribute in step with its input. A chip in a
 * group is an ordinary checkbox, so the browser owns the toggling; this only
 * mirrors the result onto the attribute the stylesheet reads.
 */
export function hydrateChoiceChips(root = document) {
  const chips = [...root.querySelectorAll('.ol8-chip')];
  for (const chip of chips) {
    const input = chip.querySelector(':scope > .ol8-chip__input');
    if (!input) continue;
    syncChip(chip);
    if (chip.dataset.ol8ChipBound === 'true') continue;
    input.addEventListener('change', () => syncChip(chip));
    chip.dataset.ol8ChipBound = 'true';
  }
  return chips.length;
}

/** Repaints one chip from the live state of its input. */
export function syncChip(chip) {
  const input = chip.querySelector(':scope > .ol8-chip__input');
  if (!input) return;
  chip.dataset.ol8Selection = input.checked ? 'selected' : 'inactive';
  chip.dataset.ol8Availability = input.disabled ? 'disabled' : 'enabled';
}

/* Private. Exported only so Token can reuse the same escaping; neither name
   reaches the package index. */
export function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
