/**
 * Oneli8 · Link — headless behavior.
 *
 * The Figma component description is explicit that "runtime href, native anchor
 * behavior, visited resolution, aria-current, motion preference and navigation
 * list hierarchy live in code". This module is that code.
 *
 * Figma's five States are visual evidence for review. They are never classes:
 * :hover, :active, :focus-visible, :visited and [aria-current] carry them.
 */
export const OL8_LINK_FORMS = ['inline', 'standalone', 'navigation'];
/** Figma defines three. `inherit` is a code addition for links inside body copy. */
export const OL8_LINK_SIZES = ['small', 'standard', 'large', 'inherit'];
export const OL8_LINK_MOTIONS = ['system', 'none'];

/**
 * @param {string} label
 * @param {string} href
 * @param {{form?:string,size?:string,current?:boolean|string,motion?:string,className?:string}} [options]
 */
export function renderLink(label, href, options = {}) {
  const { form = 'inline', size = 'standard', current, motion = 'system', className } = options;

  if (!OL8_LINK_FORMS.includes(form)) throw new Error(`[ol8] unknown link form "${form}"`);
  if (!OL8_LINK_SIZES.includes(size)) throw new Error(`[ol8] unknown link size "${size}"`);
  if (!OL8_LINK_MOTIONS.includes(motion)) throw new Error(`[ol8] unknown link motion "${motion}"`);
  if (typeof href !== 'string' || href === '') {
    throw new Error('[ol8] Link requires an href. A link without a destination is a button.');
  }
  if (current !== undefined && form !== 'navigation') {
    throw new Error('[ol8] aria-current belongs to a navigation link, not an inline or standalone one.');
  }

  const attrs = [
    `class="ol8-link${className ? ` ${className}` : ''}"`,
    `href="${escapeAttr(href)}"`,
    `data-ol8-form="${form}"`,
    `data-ol8-size="${size}"`,
    motion === 'none' ? 'data-ol8-motion="none"' : '',
    // true means this page; a string names what kind of current it is
    current ? `aria-current="${current === true ? 'page' : escapeAttr(String(current))}"` : '',
  ].filter(Boolean).join(' ');

  return `<a ${attrs}>${escapeText(label)}</a>`;
}

/**
 * Enforces the runtime contract on existing `.ol8-link` markup. Idempotent.
 *   - an anchor with no href is not a link, so it is reported rather than styled
 *   - a form is required for the size and target rules to apply
 *   - aria-current outside a navigation link is removed, since it claims a
 *     position in a set that does not exist
 */
export function hydrateLinks(root = document) {
  const problems = [];
  for (const el of root.querySelectorAll('.ol8-link')) {
    if (el.tagName !== 'A' || !el.getAttribute('href')) {
      problems.push(el);
      continue;
    }
    if (!el.dataset.ol8Form) el.dataset.ol8Form = 'inline';
    if (!el.dataset.ol8Size) el.dataset.ol8Size = 'standard';
    if (el.hasAttribute('aria-current') && el.dataset.ol8Form !== 'navigation') {
      el.removeAttribute('aria-current');
    }
  }
  if (problems.length > 0) {
    console.warn(`[ol8] ${problems.length} .ol8-link element(s) are not anchors with an href`, problems);
  }
  return problems.length;
}

// Defined locally, matching every other molecule in this package. Six modules
// carry their own copy; consolidating them is a separate change, not part of
// restoring Link.
function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
