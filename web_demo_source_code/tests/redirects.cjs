// URL cũ vẫn yêu cầu đăng nhập/role, không tải lại giao diện đã bỏ.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const errors = [];
  let cases = 0;
  try {
    for (const width of [1440, 390]) {
      for (const role of [null, 'player', 'venue', 'organizer', 'admin']) {
        for (const old of ['chat.html', 'venue-slot-management.html']) {
          const context = await browser.newContext({ viewport: { width, height: 900 } });
          const page = await context.newPage();
          page.on('pageerror', e => errors.push(e.message));
          await page.goto(base + '/index.html');
          await page.evaluate(role => {
            CC.logout();
            if (role) CC.login(CC.db.users.find(user => user.role === role));
          }, role);
          const before = await page.evaluate(() => JSON.stringify(CC.db));
          const expected = !role ? 'login.html'
            : old === 'venue-slot-management.html' ? role === 'venue' ? 'venue-court-management.html' : '403.html'
            : 'player-my-sports.html';
          await page.goto(base + '/' + old);
          await page.waitForURL(base + '/' + expected);
          await page.waitForSelector('h1');
          if (!role) assert.equal(await page.evaluate(() => sessionStorage.getItem('cc.next')), old);
          if (old === 'chat.html' && role && role !== 'player')
            assert.equal(await page.locator('h1').innerText(), 'Bạn chưa có quyền truy cập');
          assert.equal(await page.evaluate(() => JSON.stringify(CC.db)), before, 'redirect preserves data');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          cases++;
          await context.close();
        }
      }
    }
    // Retain the old URL when a guest signs in with the correct venue account.
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/venue-slot-management.html?legacy=1');
    await page.waitForURL(base + '/login.html');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cc.next')), 'venue-slot-management.html?legacy=1');
    await page.locator('.demo-details summary').click();
    await page.locator('[data-action=demo-login][data-role=venue]').click();
    await page.waitForURL(base + '/venue-court-management.html');
    assert.equal(await page.evaluate(() => CC.me().role), 'venue');
    await page.getByRole('button', { name: 'Xem lịch sân' }).first().click();
    assert.ok(await page.locator('#modal.calendar-dialog').isVisible());
    await context.close();
    assert.deepEqual(errors, []);
    console.log(`PASS: ${cases} desktop/mobile redirect cases, role guards, data preservation and login-to-calendar.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
