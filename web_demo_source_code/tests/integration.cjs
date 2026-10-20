const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const injectAIFailure = require('./helpers/inject-ai-failure.cjs');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = path.join(__dirname, 'artifacts');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [],
    checks = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const check = (name, value) => {
    assert.ok(value, name);
    checks.push(name);
    console.log('PASS ' + name);
  };
  const go = async (file) => {
    await page.goto(base + '/' + file);
    await page.waitForSelector('h1');
  };
  const evalDB = (fn) => page.evaluate(fn);
  async function login(email, password = 'Court123!') {
    await go('login.html');
    await page.fill('[name=email]', email);
    await page.fill('[name=password]', password);
    await page.click('#auth-form button[type=submit]');
    await page.waitForURL((url) => !url.pathname.endsWith('login.html'));
  }
  async function switchRole(role) {
    await page.evaluate(() => CC.logout());
    await login(role + '@courtconnect.demo');
  }
  async function otp(code) {
    for (let i = 0; i < 6; i++) await page.fill(`[name=otp${i}]`, code[i]);
    await page.click('#verify-submit');
  }
  async function submitDialog() {
    await page.click('#dialog-form button[type=submit]');
  }
  async function confirm() {
    await page.click('[data-action=confirm]');
  }
  await go('index.html');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await go('player-open-matches.html');
  await page.click('[data-action=create-match]');
  check('Guest sees login modal', await page.locator('#modal').isVisible());
  await page.click('[data-action=close]');
  await go('register.html');
  await page.fill('[name=name]', 'Kiểm thử Người chơi');
  await page.fill('[name=email]', 'qa@courtconnect.demo');
  await page.fill('[name=password]', 'Newpass123!');
  await page.fill('[name=confirm]', 'Different123!');
  await page.check('[name=terms]');
  await page.click('#auth-form button:not([type=button])');
  await page.waitForSelector('#auth-error:not([hidden])');
  check(
    'Register rejects mismatching confirmation',
    (await page.textContent('#auth-error')).includes('không khớp')
  );
  await page.fill('[name=confirm]', 'Newpass123!');
  await page.click('#auth-form button:not([type=button])');
  await page.waitForURL('**/verification-sent.html');
  check(
    'Registration persisted unverified account',
    await evalDB(() => CC.db.users.some((u) => u.email === 'qa@courtconnect.demo' && !u.verified))
  );
  await go('login.html');
  await page.fill('[name=email]', 'qa@courtconnect.demo');
  await page.fill('[name=password]', 'Newpass123!');
  await page.click('#auth-form button[type=submit]');
  await page.waitForSelector('#auth-error:not([hidden])');
  check(
    'Unverified account cannot log in',
    (await page.textContent('#auth-error')).includes('chưa được xác minh')
  );
  await go('verify-email.html');
  await otp('000000');
  await page.waitForSelector('#auth-error:not([hidden])');
  check('Wrong OTP rejected', (await page.textContent('#auth-error')).includes('không chính xác'));
  await otp('482915');
  await page.waitForURL('**/registration-success.html');
  check(
    'OTP verifies account',
    await evalDB(() => CC.db.users.find((u) => u.email === 'qa@courtconnect.demo').verified)
  );
  await login('qa@courtconnect.demo', 'Newpass123!');
  check(
    'Verified login creates session',
    await evalDB(() => CC.me().email === 'qa@courtconnect.demo')
  );
  await go('court-detail.html?id=c1');
  await page.click('.date-picker summary');
  const bookingDate = await evalDB(() => CC.date(3));
  while (!(await page.locator(`[data-booking-date="${bookingDate}"]`).count())) await page.click('[data-month-step="1"]');
  await page.click(`[data-booking-date="${bookingDate}"]`);
  await page.waitForURL('**/court-detail.html?*date=*');
  const testSlotId = await page.locator('[data-action=choose-slot]:enabled').first().getAttribute('data-id');
  await page.click(`[data-action=choose-slot][data-id="${testSlotId}"]`);
  await page.click('[data-action=book-selected]');
  await page.waitForURL('**/booking.html?*');
  await page.fill('[name=note]', 'Kiểm thử đặt sân liên vai trò');
  await page.check('[name=accept]');
  await page.click('#booking-form button[type=submit], #booking-form button:not([type])');
  await page.waitForURL('**/booking-success.html');
  const bookingId = await evalDB(
    () => CC.db.bookings.find((b) => b.note === 'Kiểm thử đặt sân liên vai trò').id
  );
  check(
    'Booking created pending',
    await page.evaluate((id) => CC.find('bookings', id).status === 'pending', bookingId)
  );
  check(
    'Pending booking blocks duplicate',
    await page.evaluate((slotId) => {
      try {
        CC.booking(slotId);
        return false;
      } catch (e) {
        return e.message.includes('không còn trống');
      }
    }, testSlotId)
  );
  await page.reload();
  check(
    'Booking survives reload',
    await page.evaluate((id) => !!CC.find('bookings', id), bookingId)
  );
  await switchRole('venue');
  await go('venue-booking-management.html');
  await page.click(`[data-action=booking-status][data-id="${bookingId}"][data-status=approved]`);
  await confirm();
  check(
    'Owner approval updates booking',
    await page.evaluate((id) => CC.find('bookings', id).status === 'approved', bookingId)
  );
  await page.evaluate(() => CC.logout());
  await login('qa@courtconnect.demo', 'Newpass123!');
  await go('player-match-create.html');
  await page.fill('[name=name]', 'Trận kiểm thử liên vai trò');
  await page.selectOption('[name=slotId]', testSlotId);
  await page.fill('[name=capacity]', '2');
  await page.click('#match-form button');
  await page.waitForURL('**/player-my-sports.html');
  const matchId = await evalDB(
    () => CC.db.matches.find((m) => m.name === 'Trận kiểm thử liên vai trò').id
  );
  check('Host can create match on approved slot', !!matchId);
  await page.evaluate(() => CC.logout());
  await login('player4@courtconnect.demo');
  await go('match-detail.html?id=' + matchId);
  await page.click('[data-action=join-match]');
  check(
    'Another player joins match',
    await page.evaluate((id) => CC.find('matches', id).playerIds.length === 2, matchId)
  );
  await page.evaluate(() => CC.logout());
  await login('player5@courtconnect.demo');
  await go('match-detail.html?id=' + matchId);
  check('Full match disables join', await page.locator('[data-action=join-match]').isDisabled());
  check(
    'Domain rejects over-capacity join',
    await page.evaluate((id) => {
      try {
        CC.joinMatch(id);
        return false;
      } catch (e) {
        return e.message.includes('đủ người');
      }
    }, matchId)
  );
  await page.evaluate(() => CC.logout());
  await login('player4@courtconnect.demo');
  await go('player-my-sports.html');
  await page.click(`[data-action=leave-match][data-id="${matchId}"]`);
  await confirm();
  check(
    'Player can withdraw from match',
    await page.evaluate((id) => CC.find('matches', id).playerIds.length === 1, matchId)
  );
  await page.evaluate(() => CC.logout());
  await login('qa@courtconnect.demo', 'Newpass123!');
  await go('player-my-sports.html');
  await page.click(`[data-action=cancel-booking][data-id="${bookingId}"]`);
  await confirm();
  check(
    'Booking cancellation releases slot and cancels associated match',
    await page.evaluate(
      ({ b, m, slotId }) =>
        CC.find('bookings', b).status === 'cancelled' &&
        CC.find('matches', m).status === 'cancelled' &&
        CC.available(CC.find('slots', slotId)),
      { b: bookingId, m: matchId, slotId: testSlotId }
    )
  );
  await switchRole('player');
  await go('player-skill-match.html');
  await page.click('#skill-submit');
  await page.waitForSelector('[data-action=skill-accept]');
  await page.locator('[data-action=skill-accept]').first().click();
  await page.click('[data-action=skill-save]');
  check(
    'Skill Match saves accepted recommendation',
    await evalDB(() => CC.db.aiHistory.some((h) => h.type === 'skill' && h.status === 'saved'))
  );
  check('Skill Match hides internal failure controls', await page.locator('[name=simulateError]').count() === 0);
  await injectAIFailure(page, 'slots');
  await page.click('#skill-submit');
  await page.waitForSelector('#ai-result .notice.error');
  check(
    'Skill Match failure has manual fallback',
    (await page.locator('#ai-result a[href="player-open-matches.html"]').count()) > 0
  );
  await page.click('[data-action=skill-again]');
  await page.waitForSelector('[data-action=skill-accept]');
  check('Skill Match retry recovers after a processing failure', await page.locator('#skill-submit').isEnabled());
  await page.fill('[name=date]', '2099-01-01');
  await page.click('#skill-submit');
  await page.waitForSelector('#ai-result .empty');
  check(
    'Skill Match handles no matches',
    (await page.textContent('#ai-result')).includes('Chưa tìm thấy')
  );
  await switchRole('organizer');
  await go('organizer-team-lineup.html?event=e1');
  await page.click('#team-submit');
  await page.waitForSelector('[data-action=save-teams]');
  await page.click('[data-action=accept-teams]');
  await page.click('[data-action=save-teams]');
  check(
    'Team Balancer saves unique complete roster',
    await evalDB(() => {
      const e = CC.find('events', 'e1'),
        ids = [...e.teams.a, ...e.teams.b];
      return (
        ids.length === e.playerIds.length &&
        new Set(ids).size === ids.length &&
        Math.abs(e.teams.a.length - e.teams.b.length) <= 1
      );
    })
  );
  await page.locator('[data-action=move-team]').first().click();
  await page.click('[data-action=save-teams]');
  check(
    'Manual team edit remains validated',
    await evalDB(() => {
      const e = CC.find('events', 'e1');
      return Math.abs(e.teams.a.length - e.teams.b.length) <= 1;
    })
  );
  await page.screenshot({ path: path.join(out, 'teams-result.png'), fullPage: true });
  check(
    'Invalid duplicate lineup rejected',
    await page.evaluate(() => {
      try {
        CC.saveTeams('e1', { a: ['u1', 'u1'], b: ['u5', 'u6', 'u7', 'u8'] });
        return false;
      } catch {
        return true;
      }
    })
  );
  await go('organizer-player-roster.html?event=e1');
  await page.click('[data-action=roster-toggle][data-id=u8]');
  check(
    'Roster update invalidates saved teams',
    await evalDB(() => CC.find('events', 'e1').teams === null)
  );
  await page.click('[data-action=roster-add]');
  await page.selectOption('#dialog-form [name=playerId]', 'u8');
  await submitDialog();
  await switchRole('venue');
  await go('venue-no-show-risk.html');
  await page.selectOption('[name=bookingId]', 'b1');
  await page.click('#risk-submit');
  await page.waitForSelector('#risk-save');
  await page.selectOption('[name=riskLevel]', 'Chưa chắc chắn');
  await page.fill('[name=note]', 'Cần trao đổi trực tiếp với người chơi');
  await page.click('#risk-save button:not([type=button])');
  check(
    'Risk assessment stores human override without rejecting booking',
    await evalDB(
      () =>
        CC.find('bookings', 'b1').risk.level === 'Chưa chắc chắn' &&
        CC.find('bookings', 'b1').status === 'approved'
    )
  );
  await page.evaluate(() => CC.transaction(() => (CC.find('players', 'u1').played = 0)));
  await page.selectOption('[name=bookingId]', 'b4');
  await page.click('#risk-submit');
  await page.waitForSelector('#risk-result .notice.warning');
  check(
    'No history gives uncertainty, not low risk',
    (await page.textContent('#risk-result')).includes('Không đủ dữ liệu')
  );
  await go('venue-court-management.html');
  await page.click('[data-action=court-calendar][data-id=c1]');
  await page.click('[data-action=calendar-new]');
  await page.fill('#dialog-form [name=date]', await evalDB(() => CC.date(1)));
  await page.fill('#dialog-form [name=start]', '18:00');
  await page.fill('#dialog-form [name=end]', '20:00');
  await submitDialog();
  await page.waitForSelector('#dialog-form .form-error:not([hidden])');
  check(
    'Overlapping slot rejected',
    (await page.textContent('#dialog-form .form-error')).includes('trùng')
  );
  await page.click('[data-action=close]');
  await go('admin-user-management.html');
  check(
    'Role guard blocks other role page',
    (await page.textContent('h1')).includes('chưa có quyền')
  );
  await switchRole('admin');
  await go('admin-sport-management.html');
  await page.click('[data-action=entity-new]');
  await page.fill('#dialog-form [name=name]', 'Tennis demo');
  await submitDialog();
  check(
    'Admin creates sport taxonomy',
    await evalDB(() => CC.db.sports.some((s) => s.name === 'Tennis demo'))
  );
  check(
    'Cannot archive a sport with active courts',
    await page.evaluate(() => {
      try {
        CC.archive('sports', 'badminton');
        return false;
      } catch {
        return true;
      }
    })
  );
  await go('admin-user-management.html');
  check(
    'Admin cannot disable self',
    await page.evaluate(() => {
      try {
        CC.archive('users', CC.me().id);
        return false;
      } catch {
        return true;
      }
    })
  );
  await page.click('[data-action=entity-new]');
  await page.fill('#dialog-form [name=name]', 'Tài khoản trùng');
  await page.fill('#dialog-form [name=email]', 'player@courtconnect.demo');
  await submitDialog();
  await page.waitForSelector('#dialog-form .form-error:not([hidden])');
  check(
    'Duplicate email rejected',
    (await page.textContent('#dialog-form .form-error')).includes('đã được sử dụng')
  );
  await page.click('[data-action=close]');
  await go('admin-sports-report.html');
  await page.click('[data-action=entity-new]');
  await page.fill('#dialog-form [name=name]', 'Báo cáo kiểm thử');
  await submitDialog();
  check(
    'Report snapshot saved from live demo data',
    await evalDB(() =>
      CC.db.reports.some((r) => r.name === 'Báo cáo kiểm thử' && r.snapshot.bookings > 0)
    )
  );
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action=export-report]').first().click();
  const download = await downloadPromise;
  check('Report exports downloadable CSV', download.suggestedFilename().endsWith('.csv'));
  await switchRole('player');
  await go('player-my-sports.html');
  check('Chat removed from navigation', await page.locator('a[href="chat.html"]').count() === 0);
  await page.evaluate(() => CC.logout());
  await go('forgot-password.html');
  await page.fill('[name=email]', 'qa@courtconnect.demo');
  await page.click('#auth-form button:not([type=button])');
  await page.waitForURL('**/recovery-sent.html');
  await go('verify-reset.html');
  await otp('482915');
  await page.waitForURL('**/reset-password.html');
  await page.fill('[name=password]', 'Changed123!');
  await page.fill('[name=confirm]', 'Changed123!');
  await page.click('#auth-form button:not([type=button])');
  await page.waitForURL('**/reset-success.html');
  await login('qa@courtconnect.demo', 'Changed123!');
  check(
    'Recovery changes password and permits login',
    await evalDB(() => CC.me().email === 'qa@courtconnect.demo')
  );
  await go('profile.html');
  await page.fill('[name=name]', 'Người chơi đã sửa');
  await page.selectOption('[name=level-badminton]', '4');
  await page.click('#profile-form button');
  await page.reload();
  check(
    'Profile edits persist and update player levels',
    await evalDB(
      () =>
        CC.me().name === 'Người chơi đã sửa' &&
        CC.find('players', CC.me().id).levels.badminton === 4
    )
  );
  check('No browser runtime errors', errors.length === 0);
  fs.writeFileSync(
    path.join(out, 'integration-results.json'),
    JSON.stringify({ checks, errors }, null, 2)
  );
  console.log('Completed ' + checks.length + ' checks.');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
