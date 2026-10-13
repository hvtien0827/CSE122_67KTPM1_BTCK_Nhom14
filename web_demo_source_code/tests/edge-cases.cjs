const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173',
  out = path.join(__dirname, 'artifacts');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await context.newPage();
  const checks = [],
    errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const check = (n, v) => {
    assert.ok(v, n);
    checks.push(n);
    console.log('PASS ' + n);
  };
  const go = async (f) => {
    await p.goto(base + '/' + f);
    await p.waitForSelector('h1');
  };
  const role = async (r) => {
    await p.evaluate((r) => {
      CC.logout();
      CC.login(CC.db.users.find((u) => u.role === r));
    }, r);
  };
  const save = () => p.click('#dialog-form button[type=submit]');
  const close = () => p.click('#modal [data-action=close]');
  await go('index.html');
  await p.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await p.reload();
  await role('venue');
  await go('venue-court-management.html');
  await p.click('[data-action=menu]');
  check('Mobile navigation opens', await p.locator('.sidebar').isVisible());
  check(
    'Mobile menu exposes current role links',
    await p.locator('.sidebar a[href="venue-revenue.html"]').isVisible()
  );
  await p.click('[data-action=menu]');
  await p.click('[data-action=entity-new]');
  await p.fill('#dialog-form [name=name]', '<img src=x onerror=alert(1)>');
  await p.fill('#dialog-form [name=location]', 'Địa chỉ thử nghiệm');
  await p.uncheck('[name=autoSchedule]');
  await save();
  const court = await p.evaluate(
    () => CC.db.courts.find((c) => c.location === 'Địa chỉ thử nghiệm').id
  );
  check(
    'Stored user input renders as text, not executable markup',
    (await p.locator('img[src=x]').count()) === 0 &&
      (await p
        .locator('body')
        .textContent()
        .then((t) => t.includes('<img src=x onerror=alert(1)>')))
  );
  await p.click(`[data-action=entity-edit][data-id="${court}"]`);
  await p.fill('#dialog-form [name=name]', 'Sân thử nghiệm mới');
  await p.fill('#dialog-form [name=price]', '90000');
  await save();
  check(
    'Court update persists',
    await p.evaluate((id) => CC.find('courts', id).price === 90000, court)
  );
  await p.click(`[data-action=court-calendar][data-id="${court}"]`);
  await p.click('[data-action=calendar-new]');
  await p.fill('#dialog-form [name=date]', await p.evaluate(() => CC.date(2)));
  await p.fill('#dialog-form [name=start]', '11:00');
  await p.fill('#dialog-form [name=end]', '10:00');
  await save();
  await p.waitForSelector('#dialog-form .form-error:not([hidden])');
  check(
    'Slot end before start is rejected',
    (await p.textContent('#dialog-form .form-error')).includes('kết thúc')
  );
  await p.fill('#dialog-form [name=end]', '13:00');
  await save();
  const slot = await p.evaluate((id) => CC.db.slots.find((s) => s.courtId === id).id, court);
  check('New slot created', !!slot);
  await p.click(`[data-action=calendar-slot][data-id="${slot}"]:visible`);
  await p.click(`[data-action=calendar-edit][data-id="${slot}"]`);
  await p.fill('#dialog-form [name=price]', '180000');
  await save();
  check(
    'Unbooked slot editable',
    await p.evaluate((id) => CC.find('slots', id).price === 180000, slot)
  );
  await p.click(`[data-action=calendar-slot][data-id="${slot}"]:visible`);
  await p.click(`[data-action=calendar-archive][data-id="${slot}"]`);
  check(
    'Slot can be archived',
    await p.evaluate((id) => CC.find('slots', id).status === 'archived', slot)
  );
  await go('venue-court-management.html');
  await p.click(`[data-action=entity-archive][data-id="${court}"]`);
  await p.click('[data-action=confirm]');
  check(
    'Unused court can be archived',
    await p.evaluate((id) => CC.find('courts', id).status === 'archived', court)
  );
  check(
    'Owner cannot complete future booking',
    await p.evaluate(() => {
      try {
        CC.setBooking('b1', 'completed');
        return false;
      } catch (e) {
        return e.message.includes('kết thúc');
      }
    })
  );
  await p.evaluate(() =>
    CC.transaction(() => {
      const s = CC.find('slots', CC.find('bookings', 'b1').slotId);
      s.date = CC.date(-1);
    })
  );
  await p.evaluate(() => CC.setBooking('b1', 'completed'));
  check(
    'Completing ended booking completes linked match',
    await p.evaluate(
      () =>
        CC.find('bookings', 'b1').status === 'completed' &&
        CC.find('matches', 'm1').status === 'completed'
    )
  );
  await role('organizer');
  await go('organizer-event-management.html');
  await p.click('[data-action=entity-new]');
  await p.fill('#dialog-form [name=name]', 'Sự kiện kiểm tra');
  await p.fill('#dialog-form [name=location]', 'Sân trường');
  await save();
  const event = await p.evaluate(() => CC.db.events.find((e) => e.name === 'Sự kiện kiểm tra').id);
  check('Organizer creates event', !!event);
  await go('organizer-team-lineup.html?event=' + event);
  check('Team AI disabled for insufficient roster', await p.locator('#team-submit').isDisabled());
  await go('organizer-player-roster.html?event=' + event);
  await p.click('[data-action=entity-new]');
  await p.fill('#dialog-form [name=name]', 'Khách thử nghiệm');
  await p.fill('#dialog-form [name=played]', '2');
  await p.fill('#dialog-form [name=noShows]', '3');
  await save();
  await p.waitForSelector('#dialog-form .form-error:not([hidden])');
  check(
    'Attendance history cannot exceed played matches',
    (await p.textContent('#dialog-form .form-error')).includes('không được lớn hơn')
  );
  await p.fill('#dialog-form [name=noShows]', '1');
  await save();
  const player = await p.evaluate(
    () => CC.db.players.find((x) => x.name === 'Khách thử nghiệm').id
  );
  check('Guest player created', !!player);
  for (const id of [player, 'u1']) {
    await p.click('[data-action=roster-add]');
    await p.selectOption('#dialog-form [name=playerId]', id);
    await save();
  }
  await go('organizer-team-lineup.html?event=' + event);
  await p.locator('.demo-details summary').click();
  await p.check('[name=simulateError]');
  await p.click('#team-submit');
  await p.waitForSelector('#team-result .notice.error');
  check(
    'Team AI simulated failure shows manual option',
    await p.locator('[data-action=manual-teams]').isEnabled()
  );
  await p.click('[data-action=manual-teams]');
  await p.click('[data-action=save-teams]');
  check(
    'Manual team workflow saves without AI',
    await p.evaluate((id) => !!CC.find('events', id).teams, event)
  );
  check(
    'Mobile lineup has no page overflow',
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
  );
  await p.screenshot({ path: path.join(out, 'team-result-mobile.png'), fullPage: true });
  await p.click('[data-action=clear-teams]');
  await p.click('[data-action=confirm]');
  check(
    'Saved lineup can be deleted',
    await p.evaluate((id) => CC.find('events', id).teams === null, event)
  );
  await role('venue');
  await go('venue-no-show-risk.html');
  await p.locator('.demo-details summary').click();
  await p.check('[name=simulateError]');
  await p.click('#risk-submit');
  await p.waitForSelector('#risk-result .notice.warning');
  check(
    'Risk simulated failure offers retry',
    await p.locator('[data-action=retry-risk]').isVisible()
  );
  await role('admin');
  await go('admin-user-management.html');
  await p.click('[data-action=entity-new]');
  await p.fill('#dialog-form [name=name]', 'Tài khoản kiểm tra');
  await p.fill('#dialog-form [name=email]', 'edge@courtconnect.demo');
  await p.selectOption('#dialog-form [name=role]', 'player');
  await save();
  const user = await p.evaluate(
    () => CC.db.users.find((u) => u.email === 'edge@courtconnect.demo').id
  );
  check(
    'Admin-created player has linked player profile',
    await p.evaluate((id) => !!CC.find('players', id), user)
  );
  await p.click(`[data-action=entity-archive][data-id="${user}"]`);
  await p.click('[data-action=confirm]');
  check(
    'Disabling user also disables player profile',
    await p.evaluate(
      (id) =>
        CC.find('users', id).status === 'disabled' && CC.find('players', id).status === 'disabled',
      user
    )
  );
  await p.click(`[data-action=activate-user][data-id="${user}"]`);
  check(
    'User can be reactivated',
    await p.evaluate((id) => CC.find('users', id).status === 'active', user)
  );
  await go('admin-sports-report.html');
  await p.click('[data-action=entity-new]');
  await p.fill('#dialog-form [name=name]', 'Báo cáo lịch sử');
  await p.fill('#dialog-form [name=from]', await p.evaluate(() => CC.date(-3)));
  await save();
  const report = await p.evaluate(() => CC.db.reports.at(-1).id);
  check(
    'Report recognizes revenue only from completed bookings',
    await p.evaluate(
      (id) =>
        CC.find('reports', id).snapshot.revenue ===
        CC.db.bookings.filter(b => {const s=CC.find('slots',b.slotId),r=CC.find('reports',id);return b.status === 'completed' && s.date >= r.from && s.date <= r.to;}).reduce((sum,b)=>sum+CC.find('slots',b.slotId).price,0),
      report
    )
  );
  await p.click(`[data-action=entity-edit][data-id="${report}"]`);
  await p.fill('#dialog-form [name=note]', 'Đã kiểm tra doanh thu');
  await save();
  check(
    'Report can be updated',
    await p.evaluate((id) => CC.find('reports', id).note === 'Đã kiểm tra doanh thu', report)
  );
  await p.click(`[data-action=entity-archive][data-id="${report}"]`);
  await p.click('[data-action=confirm]');
  check(
    'Report can be archived',
    await p.evaluate((id) => CC.find('reports', id).status === 'archived', report)
  );
  await p.evaluate(() => {
    CC.logout();
    sessionStorage.setItem(
      'cc.pending',
      JSON.stringify({
        email: 'player@courtconnect.demo',
        type: 'reset',
        code: '482915',
        expires: Date.now() - 1,
        resend: Date.now() - 1,
        verified: false,
      })
    );
  });
  await go('verify-reset.html');
  check('Expired OTP disables submit', await p.locator('#verify-submit').isDisabled());
  await p.click('#resend');
  check(
    'Resend refreshes expiry and cooldown',
    (await p.locator('#verify-submit').isEnabled()) && (await p.locator('#resend').isDisabled())
  );
  await go('reset-password.html');
  await p.fill('[name=password]', 'NoVerify123!');
  await p.fill('[name=confirm]', 'NoVerify123!');
  await p.click('#auth-form button:not([type=button])');
  await p.waitForSelector('#auth-error:not([hidden])');
  check(
    'Reset cannot bypass OTP verification',
    (await p.textContent('#auth-error')).includes('chưa xác minh')
  );
  await role('player');
  await go('notifications.html');
  await p.click('[data-action=read-all]');
  check(
    'Read-all updates only current user notifications',
    await p.evaluate(() =>
      CC.db.notifications.filter((n) => n.userId === CC.me().id).every((n) => n.read)
    )
  );
  await p.setViewportSize({ width: 768, height: 1024 });
  await go('player-open-matches.html');
  check(
    'Tablet layout has no page overflow',
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
  );
  await p.screenshot({ path: path.join(out, 'matches-tablet.png'), fullPage: true });
  await p.evaluate(() => localStorage.setItem(CC.KEY, '{broken json'));
  await go('settings.html');
  check(
    'Corrupt local data shows a visible error',
    (await p.textContent('body')).includes('Không thể đọc dữ liệu cục bộ')
  );
  check(
    'Corrupt local data is not silently overwritten',
    await p.evaluate(() => {
      try {
        CC.transaction(() => {});
        return false;
      } catch {
        return localStorage.getItem(CC.KEY) === '{broken json';
      }
    })
  );
  await p.click('[data-action=reset-data]');
  await p.click('[data-action=confirm]');
  await p.waitForURL('**/index.html');
  check(
    'Confirmed reset restores usable seed data',
    await p.evaluate(() => CC.db.users.length === 8 && !CC.loadError)
  );
  check('Edge tests have no runtime errors', errors.length === 0);
  fs.writeFileSync(
    path.join(out, 'edge-results.json'),
    JSON.stringify({ checks, errors }, null, 2)
  );
  console.log('Completed ' + checks.length + ' edge checks.');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
