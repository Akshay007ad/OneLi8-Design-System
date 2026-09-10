/**
 * Executable contract for the core molecules. Every check below states a rule
 * that either Figma draws or a component contract writes down, so a change that
 * quietly breaks one of them cannot reach a package.
 */
import { renderTextField, renderFormMessage, countGraphemes, clipToGraphemes } from '../src/index.js';

const out = [];
const t = (name, fn) => { try { fn(); out.push(`ok   ${name}`); } catch (e) { out.push(`FAIL ${name}: ${e.message}`); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };
const has = (s, sub) => { if (!s.includes(sub)) throw new Error(`missing ${sub}`); };
const hasnt = (s, sub) => { if (s.includes(sub)) throw new Error(`unexpected ${sub}`); };

t('default size is Comfortable, per the contract', () => {
  has(renderTextField({ label: 'Email' }), 'data-ol8-size="comfortable"');
});
t('label is associated with the input', () => {
  const h = renderTextField({ label: 'Email', id: 'e1' });
  has(h, '<label class="ol8-field__label" for="e1"'); has(h, 'id="e1"');
});
t('hidden label still names the input', () => {
  const h = renderTextField({ label: 'Search', showLabel: false, id: 'q' });
  hasnt(h, 'ol8-field__label-row'); has(h, 'aria-label="Search"');
});
t('invalid exposes aria-invalid and points at the message', () => {
  const h = renderTextField({ label: 'Email', id: 'e', invalid: true, message: 'Use name@example.com' });
  has(h, 'aria-invalid="true"'); has(h, 'aria-errormessage="e-message"'); has(h, 'role="alert"');
});
t('read only plus invalid is refused', () => {
  let threw = false;
  try { renderTextField({ label: 'X', readOnly: true, invalid: true }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});
t('pending is a status, not a tone', () => {
  let threw = false;
  try { renderTextField({ label: 'X', messageTone: 'pending' }); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
  has(renderTextField({ label: 'X', validationStatus: 'pending', message: 'Checking' }), 'data-ol8-tone="pending"');
});
t('describedby names instruction, message and counter in order', () => {
  const h = renderTextField({ label: 'Bio', id: 'b', instruction: 'Keep it short', message: 'Too long', characterLimit: 60 });
  has(h, 'aria-describedby="b-instruction b-message b-counter"');
});
t('no native maxlength, because it counts code units', () => {
  hasnt(renderTextField({ label: 'B', characterLimit: 10 }), 'maxlength');
});
t('counter counts graphemes', () => {
  eq(countGraphemes('👩‍👩‍👧‍👦'), 1, 'family emoji is one character');
  eq(countGraphemes('café'), 4, 'combining mark');
  eq(clipToGraphemes('👩‍👩‍👧‍👦abc', 2), '👩‍👩‍👧‍👦a', 'clip keeps clusters whole');
  has(renderTextField({ label: 'B', id: 'b', value: '👩‍👩‍👧‍👦', characterLimit: 5 }), '>1 / 5<');
});
t('gem is an attribute, not an appearance', () => {
  const h = renderTextField({ label: 'X', material: 'gem', appearance: 'filled' });
  has(h, 'data-ol8-material="gem"'); has(h, 'data-ol8-appearance="filled"');
});
t('slots collapse when absent', () => {
  const h = renderTextField({ label: 'X' });
  hasnt(h, 'ol8-field__affix'); hasnt(h, 'ol8-field__leading-icon'); hasnt(h, 'ol8-field__trailing-action');
  hasnt(h, 'ol8-field__supporting');
});
t('form message tone drives role and live region', () => {
  has(renderFormMessage('x', { tone: 'critical' }), 'aria-live="assertive"');
  has(renderFormMessage('x', { tone: 'informative' }), 'aria-live="polite"');
  has(renderFormMessage('x', { tone: 'positive' }), 'data-ol8-icon="positive"');
  hasnt(renderFormMessage('x', { icon: false }), 'data-ol8-icon');
});
t('markup escapes what a person typed', () => {
  has(renderTextField({ label: '<script>', id: 'a' }), '&lt;script&gt;');
});

const failed = out.filter(l => l.startsWith('FAIL'));
if (failed.length) {
  console.error('\u2717 component contract failed:');
  for (const f of out) console.error('  \u00b7 ' + f);
  process.exit(1);
}
console.log(`\u2713 component contract: ${out.length}/${out.length} checks`);
