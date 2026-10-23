const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/store.js'), 'utf8');
const removed = 'venue-no-show-risk.html';
const values = new Map();
const localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
};
const load = () => {
  const context = { window: {}, localStorage, sessionStorage: { getItem: () => null } };
  vm.runInNewContext(source, context);
  return context.window.CC;
};
let cc = load();
assert.equal(cc.loadError, '');
assert.ok(!fs.existsSync(path.join(root, removed)));
assert.equal(fs.readdirSync(root).filter((f) => f.endsWith('.html')).length, 43);
for (const name of fs.readdirSync(root).filter((f) => f.endsWith('.html'))) {
  assert.ok(
    !fs.readFileSync(path.join(root, name), 'utf8').includes(removed),
    name + ': no dead links'
  );
}
for (const b of cc.db.bookings) assert.ok(!Object.hasOwn(b, 'risk'));
assert.ok(!cc.db.aiHistory.some((e) => e.type === 'risk'));
const data = JSON.parse(JSON.stringify(cc.db));
const preserved = JSON.parse(JSON.stringify(data));
data.bookings[0].risk = { level: 'Cao', note: 'Old feature metadata' };
data.aiHistory.push({
  id: 'old-analysis',
  type: 'risk',
  input: { bookingId: data.bookings[0].id },
});
data.aiHistory.push(
  { id: 'keep-skill', type: 'skill', result: [] },
  { id: 'keep-team', type: 'teams', result: { a: [], b: [] } }
);
data.notifications.push({
  id: 'old-link',
  userId: 'u2',
  href: removed + '?booking=b1',
  text: 'Old feature',
});
data.notifications.push({
  id: 'old-confirmation',
  userId: 'u1',
  text: 'Chủ sân đề nghị bạn xác nhận lại lịch. Vui lòng kiểm tra đơn đặt.',
});
data.legacy = {
  bookings: [{ id: 'legacy-booking', risk: { level: 'Cao' }, status: 'approved' }],
  otherAI: [
    { id: 'old-legacy-analysis', type: 'risk' },
    { id: 'keep-legacy-skill', type: 'skill' },
  ],
  notifications: [
    { id: 'old-legacy-link', href: removed },
    { id: 'keep-legacy-link', href: 'venue-booking-management.html' },
  ],
};
localStorage.setItem(cc.KEY, JSON.stringify(data));
cc = load();
assert.equal(cc.loadError, '');
for (const key of [
  'users',
  'courts',
  'slots',
  'bookings',
  'matches',
  'events',
  'players',
  'reports',
  'courtReviews',
  'opponentReviews',
  'playerReports',
  'settings',
]) {
  assert.equal(
    JSON.stringify(cc.db[key]),
    JSON.stringify(preserved[key]),
    key + ': business data preserved'
  );
}
assert.ok(!cc.db.aiHistory.some((e) => e.type === 'risk'));
assert.ok(cc.db.aiHistory.some((e) => e.id === 'keep-skill'));
assert.ok(cc.db.aiHistory.some((e) => e.id === 'keep-team'));
assert.equal(cc.db.legacy.bookings[0].status, 'approved');
assert.ok(!Object.hasOwn(cc.db.legacy.bookings[0], 'risk'));
assert.equal(cc.db.legacy.otherAI.length, 1);
assert.equal(cc.db.legacy.notifications.length, 1);
assert.equal(cc.db.notifications.length, preserved.notifications.length);
const migrated = JSON.stringify(cc.db);
assert.equal(JSON.stringify(load().db), migrated, 'idempotent migration');
assert.equal(localStorage.getItem(cc.KEY), migrated, 'cleanup persists');
localStorage.setItem(cc.KEY, '{broken');
assert.ok(load().loadError);
assert.equal(localStorage.getItem(cc.KEY), '{broken', 'never overwrite corrupt storage');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
  let visits = 0;
  try {
    await page.goto(base + '/index.html');
    await page.evaluate(() => CC.login(CC.db.users.find((u) => u.role === 'venue')));
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 960 });
        await page.evaluate((theme) => localStorage.setItem('cc.theme', theme), theme);
        for (const route of [
          'venue-court-management',
          'venue-booking-management',
          'venue-revenue',
          'venue-reviews',
          'profile',
          'notifications',
          'settings',
          'help',
        ]) {
          await page.goto(`${base}/${route}.html`);
          await page.waitForSelector('h1');
          assert.equal(await page.locator(`a[href*="${removed}"]`).count(), 0);
          assert.ok(!(await page.locator('body').innerText()).includes('Cảnh báo vắng mặt'));
          assert.equal(
            await page.locator('script[src="js/ai.js"]').count(),
            0,
            'venue does not load AI'
          );
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
          );
          if (width === 390) {
            const menu = page.locator('[data-action=toggle-sidebar]');
            await menu.click();
            assert.equal(await menu.getAttribute('aria-expanded'), 'true');
            await menu.click();
            assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          }
          visits++;
        }
      }
    const old = await page.goto(base + '/' + removed);
    assert.equal(old.status(), 404, 'old URL is really removed');
    for (const [role, route] of [
      ['player', 'player-skill-match'],
      ['organizer', 'organizer-team-lineup'],
    ]) {
      await page.evaluate((role) => CC.login(CC.db.users.find((u) => u.role === role)), role);
      await page.goto(`${base}/${route}.html`);
      assert.equal(await page.evaluate(() => typeof AI.skillSuggestions), 'function');
      assert.equal(await page.evaluate(() => typeof AI.balanceTeams), 'function');
      assert.equal(await page.evaluate(() => typeof AI.risk), 'undefined');
      assert.equal(await page.evaluate(() => typeof AI.riskFor), 'undefined');
    }
    assert.deepEqual(errors, []);
    console.log(
      `PASS: page/route removed; fresh and legacy storage selectively cleaned and persisted; business records/CLB attendance preserved; ${visits} venue/shared page checks; mobile menus, 404 and two remaining AI APIs work.`
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
