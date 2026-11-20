/**
 * Guards that keep the Android WebView from booting to a blank green screen.
 * Run: node scripts/verify-boot-guards.mjs
 */
import { readFileSync } from 'node:fs';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed += 1;
  } else {
    console.log('OK:', msg);
  }
}

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
assert(
  !app.includes('Notification.permission'),
  'App.tsx must not read Notification.permission on first render',
);
assert(
  app.includes('getInitialNotificationPermission'),
  'App.tsx uses the safe notification helper',
);

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
assert(
  !css.includes('fonts.googleapis.com'),
  'index.css must not @import Google Fonts (blocks first paint on WebView)',
);

const styles = readFileSync(
  new URL('../android/app/src/main/res/values/styles.xml', import.meta.url),
  'utf8',
);
assert(
  styles.includes('postSplashScreenTheme'),
  'Android launch theme must set postSplashScreenTheme or Android 12 splash never ends',
);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert(html.includes('boot-fallback'), 'index.html has a visible boot fallback');

// Reproduce the original crash in a Node environment (no Notification API).
assert(typeof Notification === 'undefined', 'this runtime has no Notification (like Android WebView)');

function oldBoot() {
  const isNative = true;
  const isNotificationSupported = isNative || 'Notification' in globalThis;
  return isNotificationSupported ? Notification.permission : 'unsupported';
}

function webNotificationPermission() {
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

function newBoot() {
  const isNative = true;
  if (isNative) return 'denied';
  return webNotificationPermission();
}

let oldThrew = false;
try {
  oldBoot();
} catch (err) {
  oldThrew = err instanceof ReferenceError;
}
assert(oldThrew, 'legacy Notification.permission access throws without the API');
assert(newBoot() === 'denied', 'native boot helper returns denied instead of throwing');
assert(webNotificationPermission() === 'unsupported', 'web helper is safe without Notification');

if (failed) {
  process.exit(1);
}
console.log('\nAll boot guards passed.');
