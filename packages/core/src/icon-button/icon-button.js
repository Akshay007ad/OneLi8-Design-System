/**
 * Oneli8 · Icon Button — headless behavior.
 *
 * Figma (86:2): "Icon is an INSTANCE_SWAP sourced from the governed 24px Icon
 * Library atom and resized only through Icon Frame; Accessible Name is
 * mandatory. Size and State are deterministic visual evidence. Runtime
 * disabled, loading, pressed, motion, tooltip policy, and native button
 * semantics live in code."
 *
 * "Accessible Name is mandatory" is enforced here, not left to reviewers.
 */
import { renderIcon, renderIconSvg, isOl8IconName } from '../icon/icon.js';
import { GEM_VARIANTS } from '../button/button.js';

export const OL8_ICON_BUTTON_VARIANTS = ['primary', 'secondary', 'quiet', 'destructive'];
export const OL8_ICON_BUTTON_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_ICON_BUTTON_SHAPES = ['rounded', 'circle'];

/** Artwork sizes as BUILT in Figma: 18 / 18 / 24 / 24. */
export function artworkSizeForIconButton(size) {
  return size === 'comfortable' || size === 'large' ? 24 : 18;
}

/**
 * @param {string} icon    registry name, e.g. "add"
 * @param {string} label   accessible name — REQUIRED
 * @param {{variant?:string,size?:string,shape?:string,disabled?:boolean,
 *          loading?:boolean,pressed?:boolean,type?:string,className?:string}} [options]
 */
export function renderIconButton(icon, label, options = {}) {
  const {
    variant = 'primary', size = 'standard', shape = 'rounded',
    disabled = false, loading = false, pressed, type = 'button', className, material = 'regular',
  } = options;

  if (!isOl8IconName(icon)) throw new Error(`[ol8] unknown icon "${icon}"`);
  if (!OL8_ICON_BUTTON_VARIANTS.includes(variant)) throw new Error(`[ol8] unknown icon-button variant "${variant}"`);
  if (!OL8_ICON_BUTTON_SIZES.includes(size)) throw new Error(`[ol8] unknown icon-button size "${size}"`);
  if (!OL8_ICON_BUTTON_SHAPES.includes(shape)) throw new Error(`[ol8] unknown icon-button shape "${shape}"`);
  if (material === 'gem' && !GEM_VARIANTS.includes(variant)) {
    throw new Error(`[ol8] Gem has no approved treatment for "${variant}" — Figma 100:3 says Quiet and Destructive use the regular material.`);
  }
  if (!label || !String(label).trim()) {
    throw new Error('[ol8] Icon Button requires an accessible name — Figma marks it mandatory (86:2).');
  }

  const artwork = artworkSizeForIconButton(size);
  const glyph = loading
    ? `<span class="ol8-icon" aria-hidden="true">${renderIconSvg('loading')}</span>`
    : renderIcon(icon, { size: artwork });

  const attrs = [
    `class="ol8-icon-btn ol8-icon-btn--${variant}${className ? ` ${className}` : ''}"`,
    `type="${type}"`,
    `data-ol8-size="${size}"`,
    shape === 'circle' ? 'data-ol8-shape="circle"' : '',
    `aria-label="${escapeAttr(label)}"`,
    disabled || loading ? 'disabled' : '',
    loading ? 'data-ol8-loading="true" aria-busy="true"' : '',
    pressed !== undefined ? `aria-pressed="${pressed}"` : '',
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  return `<button ${attrs}><span class="ol8-icon-btn__surface">${glyph}</span></button>`;
}

/**
 * Enforces the runtime contract on existing `.ol8-icon-btn` markup. Idempotent.
 * Wraps a bare glyph in the required surface, and reports any button that has
 * no accessible name — the one rule Figma calls mandatory.
 */
export function hydrateIconButtons(root = document) {
  const unnamed = [];
  for (const el of root.querySelectorAll('.ol8-icon-btn')) {
    if (!el.hasAttribute('type') && el.tagName === 'BUTTON') el.setAttribute('type', 'button');

    // The protected target must always wrap a visible surface.
    if (!el.querySelector(':scope > .ol8-icon-btn__surface')) {
      const surface = document.createElement('span');
      surface.className = 'ol8-icon-btn__surface';
      while (el.firstChild) surface.appendChild(el.firstChild);
      el.appendChild(surface);
    }

    const loading = el.dataset.ol8Loading === 'true';
    if (loading) {
      el.setAttribute('aria-busy', 'true');
      el.disabled = true;
      const surface = el.querySelector(':scope > .ol8-icon-btn__surface');
      if (!surface.querySelector('[data-ol8-loading-glyph]')) {
        surface.innerHTML = `<span class="ol8-icon" aria-hidden="true" data-ol8-loading-glyph="true">${renderIconSvg('loading')}</span>`;
      }
    } else {
      el.removeAttribute('aria-busy');
    }

    if (!accessibleName(el)) unnamed.push(el);
  }
  if (unnamed.length) {
    console.error(`[ol8] ${unnamed.length} icon button(s) have no accessible name; Figma marks it mandatory.`, unnamed);
  }
  return { unnamed };
}

function accessibleName(el) {
  const aria = el.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim();
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const text = labelledby.split(/\s+/)
      .map(id => el.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ').trim();
    if (text) return text;
  }
  // Visible text that is not aria-hidden also names the control.
  const clone = el.cloneNode(true);
  for (const h of clone.querySelectorAll('[aria-hidden="true"]')) h.remove();
  return clone.textContent.trim();
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
