/**
 * Oneli8 · Navigation Badge — headless behavior.
 *
 * Figma (989:484): "Canonical optional navigation badge. Content comes from
 * item.badge; geometry and colors are semantic token controlled."
 *
 * One atom serves Tabs, Segmented Control and Tab Bar. None of them owns a
 * private copy of it.
 */
export function renderNavigationBadge(label, options = {}) {
  const { className } = options;
  const text = String(label ?? '');
  if (text === '') throw new Error('[ol8] a navigation badge with nothing to say should not be rendered at all.');

  // The count is decoration beside a label that already names the destination,
  // so the badge is not announced twice. A product that needs it announced
  // spells it into the item's own accessible name.
  return `<span class="ol8-nav-badge${className ? ` ${className}` : ''}" aria-hidden="true">${escapeText(text)}</span>`;
}

function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
