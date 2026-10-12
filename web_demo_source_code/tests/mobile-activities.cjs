const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  try {
    const p = await browser.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const base = (process.env.BASE_URL || 'http://127.0.0.1:4173') + '/';
    const go = async (name) => {
      await p.goto(base + name);
      await p.waitForSelector('h1');
    };
    await go('index.html');
    await p.evaluate(() => CC.login(CC.find('users', 'u1')));
    await go('player-my-sports.html');
    await p.locator('[data-view=bookings]').click();
    assert.ok(await p.locator('[data-activity=bookings]').isVisible());
    assert.ok(!(await p.locator('[data-activity=matches]').isVisible()));
    await p.locator('[data-view=matches]').click();
    assert.ok(!(await p.locator('[data-activity=bookings]').isVisible()));
    assert.ok(await p.locator('[data-activity=matches]').isVisible());
    await p.locator('[data-view=all]').click();
    await p.locator('[data-action=review-court]').first().click();
    await p.locator('[name=stars][value="4"]').check();
    await p.locator('#dialog-form button[type=submit]').click();
    await p.waitForSelector('#toast:visible');
    assert.equal(await p.locator('#toast').innerText(), 'Đánh giá thành công.');
    await go('match-detail.html?id=community-1');
    await p.locator('[data-action=review-opponent]').first().click();
    await p.locator('[name=stars][value="5"]').check();
    await p.locator('#dialog-form button[type=submit]').click();
    await p.waitForSelector('#toast:visible');
    assert.equal(await p.locator('#toast').innerText(), 'Đánh giá thành công.');
    await p.locator('[data-action=report-player]').first().click();
    await p.locator('[name=comment]').fill('Kiểm tra thông báo thành công.');
    await p.locator('#dialog-form button[type=submit]').click();
    await p.waitForSelector('#toast:visible');
    assert.equal(await p.locator('#toast').innerText(), 'Báo cáo thành công.');
    for (const width of [320, 390, 760]) {
      await p.setViewportSize({ width, height: 844 });
      await go('player-my-sports.html');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.ok(
        await p
          .locator('.mobile-records tbody tr')
          .first()
          .evaluate((el) => el.getBoundingClientRect().width <= innerWidth)
      );
      await p.evaluate(() => CC.login(CC.find('users', 'u2')));
      await go('venue-booking-management.html');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await go('venue-court-management.html');
      await p.locator('[data-action=court-calendar]').first().click();
      assert.ok(await p.locator('.calendar-agenda').isVisible());
      assert.ok(!(await p.locator('.calendar-scroll').isVisible()));
      await p.locator('[data-action=calendar-next]').click();
      assert.ok((await p.locator('.agenda-slot').count()) > 0);
      assert.ok(await p.locator('#modal').evaluate((el) => el.scrollWidth <= el.clientWidth));
      await p.locator('.agenda-slot').first().click();
      assert.ok((await p.locator('#dialog-title').innerText()) === 'Chi tiết khung giờ');
      await p.evaluate(() => CC.login(CC.find('users', 'u1')));
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await go('player-my-sports.html');
    await p.evaluate(() => CC.login(CC.find('users', 'u2')));
    await go('venue-court-management.html');
    await p.locator('[data-action=court-calendar]').first().click();
    await p.locator('[data-action=calendar-next]').click();
    await p.setViewportSize({ width: 1280, height: 900 });
    assert.ok(await p.locator('.calendar-scroll').isVisible());
    assert.ok(!(await p.locator('.calendar-agenda').isVisible()));
    assert.deepEqual(errors, []);
    console.log(
      'PASS: 3 success messages, activity filters, mobile cards and daily agenda at 320/390/760px, slot details, desktop weekly layout; no runtime errors.'
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
