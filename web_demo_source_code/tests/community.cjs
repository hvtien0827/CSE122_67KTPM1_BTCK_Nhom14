const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  const p = await b.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const base = (process.env.BASE_URL || 'http://127.0.0.1:4173') + '/';
  const go = async (url) => {
    await p.goto(base + url);
    await p.waitForFunction(() => !!window.CC && !!window.renderPage);
    assert.equal(await p.locator('#main .notice.error:visible').count(), 0);
  };
  const login = async (id) => p.evaluate((id) => CC.login(CC.find('users', id)), id);
  try {
    await go('index.html');
    await login('u1');
    await go('player-my-sports.html');
    const eligibleBookings = await p.evaluate(
      () =>
        CC.db.bookings.filter(
          (booking) =>
            booking.playerId === CC.me().id &&
            booking.status === 'completed' &&
            Community.ended(CC.find('slots', booking.slotId))
        ).length
    );
    assert.ok(eligibleBookings > 0);
    assert.equal(await p.locator('[data-action=review-court]').count(), eligibleBookings);
    const reportsBefore = await p.evaluate(() => CC.db.playerReports.length);
    await p.locator('[data-action=review-court]').first().click();
    await p.locator('[name=stars][value="4"]').check();
    await p.locator('[name=tag0]').check();
    await p.locator('[name=comment]').fill('Sân tốt, sẽ quay lại.');
    await p.locator('#dialog-form button[type=submit], #dialog-form button:not([type])').click();
    await p.waitForTimeout(150);
    await go('match-detail.html?id=community-1');
    await p.locator('[data-action=review-opponent]').first().click();
    await p.locator('[name=stars][value="5"]').check();
    await p.locator('[name=tag1]').check();
    await p.locator('[name=comment]').fill('Chơi nhiệt tình!');
    await p.locator('#dialog-form button[type=submit], #dialog-form button:not([type])').click();
    await p.waitForTimeout(100);
    await p.locator('[data-action=report-player]').first().click();
    await p.locator('[name=comment]').fill('Cần quản trị viên xem xét sự việc.');
    await p.locator('#dialog-form button[type=submit], #dialog-form button:not([type])').click();
    await p.waitForTimeout(100);
    assert.equal(await p.evaluate(() => CC.db.playerReports.length), reportsBefore + 1);
    const denied = await p.evaluate(() => {
      try {
        Community.saveReview('opponent', 'community-3', 'u5', { stars: 5 });
        return false;
      } catch {
        return true;
      }
    });
    assert.ok(denied);
    await go('profile.html');
    await p.locator('[name=phone]').fill('0912345678');
    await p.locator('[name=facebook]').fill('https://www.facebook.com/courtconnect');
    await p.getByRole('button', { name: 'Lưu hồ sơ' }).click();
    await go('profile-public.html?id=u1');
    assert.ok(!(await p.locator('#main').innerText()).includes('0912345678'));
    assert.equal(await p.locator('a[href="https://www.facebook.com/courtconnect"]').count(), 1);
    await go('profile.html');
    await p.locator('[name=phonePublic]').check();
    await p.getByRole('button', { name: 'Lưu hồ sơ' }).click();
    await go('profile-public.html?id=u1');
    assert.ok((await p.locator('#main').innerText()).includes('0912345678'));
    assert.ok(
      await p.evaluate(() => {
        try {
          Community.socialLinks({ facebook: 'javascript:alert(1)' });
          return false;
        } catch {
          return true;
        }
      })
    );
    await login('u2');
    await go('venue-court-management.html');
    assert.equal(await p.locator('.sidebar a[href="venue-slot-management.html"]').count(), 0);
    await p.locator('[data-action=court-calendar]').first().click();
    assert.equal(await p.locator('.calendar-day').count(), 7);
    assert.ok((await p.locator('.calendar-slot.approved').count()) > 0);
    assert.ok((await p.locator('.calendar-slot.free').count()) > 0);
    await p.locator('[data-action=calendar-new]').click();
    await p.locator('[name=date]').fill(await p.evaluate(() => CC.date(10)));
    await p.locator('[name=start]').fill('06:00');
    await p.locator('[name=end]').fill('07:00');
    await p.locator('#dialog-form button[type=submit], #dialog-form button:not([type])').click();
    await p.waitForTimeout(150);
    assert.equal(await p.locator('.calendar-day').count(), 7);
    await go('venue-revenue.html');
    const expectedRevenue = await p.evaluate(() =>
      UI.money(
        Community.revenueRows('month', CC.date())
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => sum + CC.find('slots', b.slotId).price, 0)
      )
    );
    assert.ok((await p.locator('.stats').innerText()).includes(expectedRevenue));
    for (const value of ['day', 'week', 'month', 'year']) {
      await p.locator('[name=revenue-period]').selectOption(value);
      assert.equal(await p.locator('[name=revenue-period]').inputValue(), value);
    }
    await p.locator('[name=revenue-court]').selectOption('c2');
    const courtRevenue = await p.evaluate(() =>
      UI.money(
        Community.revenueRows('year', CC.date(), 'c2')
          .filter((booking) => booking.status === 'completed')
          .reduce((total, booking) => total + CC.find('slots', booking.slotId).price, 0)
      )
    );
    assert.ok((await p.locator('.stats').innerText()).includes(courtRevenue));
    await go('venue-reviews.html');
    assert.ok((await p.locator('#main').innerText()).includes('Sân tốt'));
    await login('u4');
    await go('admin-user-management.html');
    await p.locator('[data-action=filter-role][data-role=venue]').click();
    assert.equal(
      await p.locator('tbody tr').count(),
      await p.evaluate(() => CC.db.users.filter((user) => user.role === 'venue').length)
    );
    await p.locator('[data-action=filter-role][data-role=player]').click();
    assert.equal(
      await p.locator('tbody tr').count(),
      await p.evaluate(() => CC.db.users.filter((user) => user.role === 'player').length)
    );
    await go('admin-player-reports.html');
    await p.locator('[data-action=resolve-player-report]').first().click();
    assert.ok((await p.locator('#main').innerText()).includes('Đã xem xét'));
    await login('u1');
    await go('player-skill-match.html');
    assert.equal(await p.locator('a[href="chat.html"]').count(), 0);
    await p.setViewportSize({ width: 402, height: 874 });
    await go('player-my-sports.html');
    await p.locator('[data-action=toggle-sidebar]').click();
    assert.ok(
      await p.locator('#site-navigation').evaluate((el) => el.classList.contains('is-open'))
    );
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    assert.deepEqual(errors, []);
    console.log(
      'PASS: reviews, reports, eligibility, social privacy, calendar create, revenue filters, owner reviews, admin groups, mobile navigation.'
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
