/**
 * Oneli8 · Button — headless behavior.
 *
 * The Figma component description is explicit that native semantics, disabled,
 * loading, pressed and fullWidth "remain implemented and tested in code; they
 * must not become fake visual axes." This module is that code.
 */
import { renderIcon, renderIconSvg, isOl8IconName } from '../icon/icon.js';

export const OL8_BUTTON_VARIANTS = ['primary', 'secondary', 'quiet', 'destructive'];
export const OL8_BUTTON_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_MATERIALS = ['regular', 'gem'];
/** Gem is approved for Primary and Secondary only (Figma 100:3). */
export const GEM_VARIANTS = ['primary', 'secondary'];

/** Compact+Standard take the 18px icon; Comfortable+Large take 24px. */
export function iconSizeForButton(size) {
  return size === 'comfortable' || size === 'large' ? 24 : 18;
}

/**
 * @param {string} label
 * @param {{variant?:string,size?:string,leadingIcon?:string,trailingIcon?:string,
 *          disabled?:boolean,loading?:boolean,pressed?:boolean,fullWidth?:boolean,
 *          href?:string,type?:string,className?:string}} [options]
 */
export function renderButton(label, options = {}) {
  const {
    variant = 'primary', size = 'standard', leadingIcon, trailingIcon,
    disabled = false, loading = false, pressed, fullWidth = false,
    href, type = 'button', className, material = 'regular',
  } = options;

  if (!OL8_BUTTON_VARIANTS.includes(variant)) throw new Error(`[ol8] unknown button variant "${variant}"`);
  if (!OL8_BUTTON_SIZES.includes(size)) throw new Error(`[ol8] unknown button size "${size}"`);
  if (!OL8_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (material === 'gem' && !GEM_VARIANTS.includes(variant)) {
    throw new Error(`[ol8] Gem has no approved treatment for "${variant}" — Figma 100:3 says Quiet and Destructive use the regular material.`);
  }

  const isLink = typeof href === 'string';
  const inert = disabled || loading;
  const iconSize = iconSizeForButton(size);

  const attrs = [
    `class="ol8-btn ol8-btn--${variant}${className ? ` ${className}` : ''}"`,
    `data-ol8-size="${size}"`,
    isLink ? (inert ? 'role="button" aria-disabled="true" tabindex="-1"' : `href="${escapeAttr(href)}"`)
           : `type="${type}"`,
    !isLink && inert ? 'disabled' : '',
    loading ? 'data-ol8-loading="true" aria-busy="true"' : '',
    pressed !== undefined ? `aria-pressed="${pressed}"` : '',
    fullWidth ? 'data-ol8-fullwidth="true"' : '',
    material === 'gem' ? 'data-ol8-material="gem"' : '',
  ].filter(Boolean).join(' ');

  // While loading the spinner occupies the leading slot; a leading icon is
  // suppressed so the button never shows two competing leading glyphs.
  const leading = loading
    ? `<span class="ol8-btn__spinner ol8-icon" aria-hidden="true">${renderIconSvg('loading')}</span>`
    : leadingIcon ? renderIcon(leadingIcon, { size: iconSize }) : '';
  const trailing = trailingIcon ? renderIcon(trailingIcon, { size: iconSize }) : '';

  const tag = isLink ? 'a' : 'button';
  return `<${tag} ${attrs}>${leading}<span class="ol8-btn__label">${escapeText(label)}</span>${trailing}</${tag}>`;
}

/**
 * Enforces the runtime contract on existing `.ol8-btn` markup. Idempotent.
 *   - <button> gets an explicit type (default "button", never a stray submit)
 *   - [data-ol8-loading] implies disabled + aria-busy and grows a spinner
 *   - links can't be natively disabled, so they get aria-disabled + tabindex=-1
 *     and their activation is swallowed
 */
export function hydrateButtons(root = document) {
  for (const el of root.querySelectorAll('.ol8-btn')) {
    const isLink = el.tagName === 'A';
    const loading = el.dataset.ol8Loading === 'true';

    if (!isLink && !el.hasAttribute('type')) el.setAttribute('type', 'button');

    if (loading) {
      el.setAttribute('aria-busy', 'true');
      if (isLink) { el.setAttribute('aria-disabled', 'true'); el.setAttribute('tabindex', '-1'); }
      else el.disabled = true;

      if (!el.querySelector('.ol8-btn__spinner')) {
        const prevLeading = el.querySelector(':scope > .ol8-icon:first-child');
        if (prevLeading) prevLeading.remove();
        const spinner = document.createElement('span');
        spinner.className = 'ol8-btn__spinner ol8-icon';
        spinner.setAttribute('aria-hidden', 'true');
        spinner.innerHTML = renderIconSvg('loading');
        el.prepend(spinner);
      }
    } else {
      el.removeAttribute('aria-busy');
      el.querySelector('.ol8-btn__spinner')?.remove();
    }

    if (isLink && (el.getAttribute('aria-disabled') === 'true') && !el.dataset.ol8InertBound) {
      el.addEventListener('click', swallow);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') swallow(e); });
      el.dataset.ol8InertBound = 'true';
    }
  }
}

function swallow(event) { event.preventDefault(); event.stopPropagation(); }

/** Flip a button into or out of its loading state at runtime. */
export function setButtonLoading(el, loading) {
  if (loading) el.dataset.ol8Loading = 'true';
  else delete el.dataset.ol8Loading;
  hydrateButtons(el.parentNode ?? document);
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
