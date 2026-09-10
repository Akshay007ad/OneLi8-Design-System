/**
 * Executable contract for the core molecules. Every check below states a rule
 * that either Figma draws or a component contract writes down, so a change that
 * quietly breaks one of them cannot reach a package.
 */
import { renderTextField, renderFormMessage, countGraphemes, clipToGraphemes,
         renderTabs, renderTabPanel, renderSegmentedControl, renderTabBar,
         renderNavigationBadge } from '../src/index.js';
import { resolveNavigationKey } from '../src/organisms/navigation-keys.js';

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

// ---- Navigation ---------------------------------------------------------
const threws = (name, fn) => t(name, () => {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error('should have thrown');
});

const tabItems = [{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Activity' }, { id: 'c', label: 'Settings', disabled: true }];

t('tabs emit tablist, tab and a named region', () => {
  const h = renderTabs({ label: 'Account sections', items: tabItems });
  has(h, 'role="tablist"'); has(h, 'aria-label="Account sections"'); has(h, 'role="tab"');
});
t('tabs keep exactly one enabled tab stop', () => {
  const h = renderTabs({ label: 'S', items: tabItems });
  eq((h.match(/tabindex="0"/g) || []).length, 1, 'one tab stop');
});
t('a tab points at exactly one owned panel', () => {
  const h = renderTabs({ label: 'S', items: tabItems, idPrefix: 'p' });
  has(h, 'aria-controls="p-panel-a"');
  has(renderTabPanel('a', 'x', { idPrefix: 'p' }), 'aria-labelledby="p-tab-a"');
});
threws('a tab list with no name is refused', () => renderTabs({ label: '', items: tabItems }));
threws('a tab list of only disabled tabs is refused', () => renderTabs({ label: 'S', items: [{ id: 'a', label: 'A', disabled: true }] }));
threws('two tabs sharing an id are refused', () => renderTabs({ label: 'S', items: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }] }));

t('roving focus skips disabled and wraps', () => {
  const items = [{ disabled: false }, { disabled: true }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 0), 2, 'skips the disabled one');
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 2), 0, 'wraps');
  eq(resolveNavigationKey({ key: 'End' }, items), 2, 'End reaches the last enabled');
  eq(resolveNavigationKey({ key: 'Home' }, items), 0, 'Home reaches the first enabled');
});
t('arrow keys mirror in right to left', () => {
  const items = [{ disabled: false }, { disabled: false }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 1, { rtl: false }), 2, 'right moves forward normally');
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 1, { rtl: true }), 0, 'and moves backward in RTL');
  eq(resolveNavigationKey({ key: 'ArrowLeft' }, items, 1, { rtl: true }), 2, 'left moves forward in RTL');
});
t('vertical tabs listen to up and down instead', () => {
  const items = [{ disabled: false }, { disabled: false }];
  eq(resolveNavigationKey({ key: 'ArrowRight' }, items, 0, { orientation: 'vertical' }), -1, 'horizontal keys are not ours');
  eq(resolveNavigationKey({ key: 'ArrowDown' }, items, 0, { orientation: 'vertical' }), 1, 'down moves forward');
});

t('segmented control declares its behavior in the role', () => {
  const items = [{ id: 'd', label: 'Daily' }, { id: 'w', label: 'Weekly' }];
  has(renderSegmentedControl({ label: 'Range', behavior: 'single', items }), 'role="radiogroup"');
  has(renderSegmentedControl({ label: 'Range', behavior: 'multi', items }), 'role="group"');
});
threws('a segmented control without a behavior is refused', () =>
  renderSegmentedControl({ label: 'R', items: [{ id: 'a', label: 'A' }] }));
threws('single selection refuses an array', () =>
  renderSegmentedControl({ label: 'R', behavior: 'single', items: [{ id: 'a', label: 'A' }], selected: ['a'] }));
threws('a momentary control refuses stored selection', () =>
  renderSegmentedControl({ label: 'R', behavior: 'momentary', items: [{ id: 'a', label: 'A' }], selected: 'a' }));
t('presentation never changes behavior', () => {
  const items = [{ id: 'a', label: 'A' }];
  for (const p of ['inset-fill', 'line-indicator', 'outlined-selection', 'soft-pill', 'stacked-label']) {
    has(renderSegmentedControl({ label: 'R', behavior: 'single', items, presentation: p }), 'role="radiogroup"');
  }
});
t('an icon only segment carries a name', () => {
  const h = renderSegmentedControl({ label: 'View', behavior: 'single', presentation: 'icon-only',
    items: [{ id: 'g', label: 'Grid', icon: 'add' }] });
  has(h, 'aria-label="Grid"');
});

const dests = [{ href: '/', label: 'Home', icon: 'add' }, { href: '/inbox', label: 'Inbox', badge: 3 }];
t('tab bar uses real links and one current destination', () => {
  const h = renderTabBar({ label: 'Primary', items: dests, current: '/inbox' });
  has(h, '<nav '); has(h, 'href="/inbox"'); has(h, 'aria-current="page"');
  eq((h.match(/aria-current/g) || []).length, 1, 'exactly one current');
});
threws('a destination without an href is refused', () => renderTabBar({ label: 'P', items: [{ label: 'X' }] }));
threws('a disabled destination is refused rather than redesigned', () =>
  renderTabBar({ label: 'P', items: [{ href: '/x', label: 'X', disabled: true }] }));
threws('a current destination that is not listed is refused', () =>
  renderTabBar({ label: 'P', items: dests, current: '/nowhere' }));
t('the badge is one atom, not three copies', () => {
  has(renderTabBar({ label: 'P', items: dests }), 'ol8-nav-badge');
  has(renderSegmentedControl({ label: 'R', behavior: 'single', items: [{ id: 'a', label: 'A', badge: 2 }] }), 'ol8-nav-badge');
  has(renderTabs({ label: 'T', items: [{ id: 'a', label: 'A', badge: 9 }] }), 'ol8-nav-badge');
});
threws('an empty badge is refused', () => renderNavigationBadge(''));

const failed = out.filter(l => l.startsWith('FAIL'));
if (failed.length) {
  console.error('\u2717 component contract failed:');
  for (const f of out) console.error('  \u00b7 ' + f);
  process.exit(1);
}
console.log(`\u2713 component contract: ${out.length}/${out.length} checks`);
