/**
 * Oneli8 · Token (MOLECULE) — a committed value.
 *
 * Figma: Select and Combobox / Molecule / Token 897:2106 (24 variants,
 * Size x Selection x Mark).
 *
 * From the Figma description:
 *   "Compact/Standard/Comfortable/Large delegate all 30/36/42/42px geometry to
 *    the Soft Hexagon Choice Chip owner. Selection and None/Check/Remove mark
 *    contracts remain independent; governed Check and Close atoms are reused
 *    instead of duplicated."
 *
 * So this draws no silhouette of its own. It instantiates the Choice Chip's
 * geometry exactly as the Figma component instantiates the Geometry Owner, and
 * adds the one thing that is genuinely its own: the Mark axis.
 *
 * A Token is not a Choice Chip. A chip is a checkbox a person toggles; a token
 * is a value that has already been committed, so it is ordinary content with an
 * optional Remove button rather than a form control.
 *
 * MARK
 * Figma's axis is the concrete None / Check / Remove. The contract adds `auto`
 * as the public default, which resolves rather than draws: "Remove for
 * removable committed values, Check for selected Choice Chips, and None for
 * unselected or informational chips." A variant cannot be `auto`, which is why
 * Figma has no such option and code does.
 */
import { renderIconSvg } from '../../atoms/icon/icon.js';
import { renderChipShape, escapeAttr, OL8_CHIP_SIZES } from '../choice-chip/choice-chip.js';

export const OL8_TOKEN_SIZES = OL8_CHIP_SIZES;
/** Figma draws the last three. `auto` resolves to one of them. */
export const OL8_TOKEN_MARKS = ['auto', 'none', 'check', 'remove'];

/** The contract's resolution, stated once so both packages agree. */
export function resolveTokenMark(mark, { removable = true, selected = false } = {}) {
  if (mark !== 'auto') return mark;
  if (removable) return 'remove';
  return selected ? 'check' : 'none';
}

/**
 * @param {string} label
 * @param {{size?:string,selected?:boolean,mark?:string,removable?:boolean,
 *          removeLabel?:string,id?:string,className?:string}} [options]
 */
export function renderToken(label, options = {}) {
  const {
    size = 'standard', selected = false, mark = 'auto', removable = true,
    removeLabel, id, className,
  } = options;

  if (!OL8_TOKEN_SIZES.includes(size)) throw new Error(`[ol8] unknown token size "${size}"`);
  if (!OL8_TOKEN_MARKS.includes(mark)) throw new Error(`[ol8] unknown token mark "${mark}"`);
  if (!label || !String(label).trim()) throw new Error('[ol8] Token requires a label');
  if (mark === 'remove' && !removable) {
    throw new Error('[ol8] mark "remove" offers a removal path a non removable token does not have');
  }

  const uid = id ?? `ol8-token-${Math.random().toString(36).slice(2, 9)}`;
  const resolved = resolveTokenMark(mark, { removable, selected });

  // The Remove mark is the only interactive part, so it is a real button with
  // its own accessible name. It follows the label, which is the anatomy the
  // contract writes down, and the label stays the token's content: the complete
  // value must remain readable, never shortened or overlaid by its mark.
  const markup = resolved === 'remove'
    ? `<button type="button" class="ol8-chip__mark ol8-token__remove" ` +
      `aria-label="${escapeAttr(removeLabel ?? `Remove ${label}`)}">${renderIconSvg('close')}</button>`
    : resolved === 'check'
      ? `<span class="ol8-chip__mark" aria-hidden="true">${renderIconSvg('check')}</span>`
      : '';

  const attrs = [
    `class="ol8-token ol8-chip${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    `data-ol8-selection="${selected ? 'selected' : 'inactive'}"`,
    `data-ol8-mark="${resolved}"`,
  ].join(' ');

  return `<span ${attrs}>${renderChipShape(uid, label, markup)}</span>`;
}
