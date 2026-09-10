/**
 * Oneli8 · Form Message — headless behavior.
 *
 * Figma (177:13): "Canonical Oneli8 Form Message molecule. Tone maps to
 * semantic message tone; Pending is resolved through validationStatus rather
 * than treated as a fifth error tone. Icon and Message remain modular content
 * atoms. Runtime role, status announcement and relationships live in code."
 *
 * So this module owns what Figma says code owns: the live region, the role that
 * follows from the tone, and the icon each tone carries.
 */
import { renderIcon } from '../../atoms/icon/index.js';

/** The five tones Figma enumerates. Pending is the validating state, not an error. */
export const OL8_FORM_MESSAGE_TONES = ['critical', 'caution', 'positive', 'informative', 'pending'];

/** Figma pairs one status icon with each tone. Pending carries the loading mark. */
export const OL8_FORM_MESSAGE_ICONS = {
  critical: 'critical',
  caution: 'caution',
  positive: 'positive',
  informative: 'informative',
  pending: 'loading',
};

/**
 * @param {string} message
 * @param {{tone?:string,icon?:boolean,id?:string,className?:string}} [options]
 */
export function renderFormMessage(message, options = {}) {
  const { tone = 'critical', icon = true, id, className } = options;

  if (!OL8_FORM_MESSAGE_TONES.includes(tone)) {
    throw new Error(`[ol8] unknown form message tone "${tone}"`);
  }

  // Critical is the only tone a screen reader must interrupt for. Pending is
  // progress, so it is polite. The rest report a result that already happened.
  const live = tone === 'critical' ? 'assertive' : 'polite';

  const attrs = [
    `class="ol8-form-message${className ? ` ${className}` : ''}"`,
    id ? `id="${escapeAttr(id)}"` : '',
    `data-ol8-tone="${tone}"`,
    tone === 'critical' ? 'role="alert"' : 'role="status"',
    `aria-live="${live}"`,
  ].filter(Boolean).join(' ');

  const mark = icon
    ? renderIcon(OL8_FORM_MESSAGE_ICONS[tone], { size: 18, className: 'ol8-form-message__icon' })
    : '';

  return `<div ${attrs}>${mark}<span class="ol8-form-message__text">${escapeText(message)}</span></div>`;
}

/** Enforces the runtime contract on existing markup. Idempotent. */
export function hydrateFormMessages(root = document) {
  for (const el of root.querySelectorAll('.ol8-form-message')) {
    const tone = el.dataset.ol8Tone || 'critical';
    if (!OL8_FORM_MESSAGE_TONES.includes(tone)) {
      console.warn(`[ol8] unknown form message tone "${tone}"`, el);
      continue;
    }
    el.dataset.ol8Tone = tone;
    if (!el.hasAttribute('role')) el.setAttribute('role', tone === 'critical' ? 'alert' : 'status');
    if (!el.hasAttribute('aria-live')) {
      el.setAttribute('aria-live', tone === 'critical' ? 'assertive' : 'polite');
    }
  }
}

function escapeAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escapeText(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
