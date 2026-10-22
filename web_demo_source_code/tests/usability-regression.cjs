/* Regression coverage for the October usability and persisted-data fixes. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = path.join(__dirname, 'artifacts');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name); };
  const go = file => page.goto(`${base}/${file}`);
  const role = async r => page.evaluate(r => CC.login(CC.db.users.find(u => u.role === r)), r);
  const save = async () => { await page.click('#dialog-form [type=submit]'); await page.waitForSelector('#modal[open]', { state: 'hidden' }); };
  const confirm = async () => { await page.click('[data-action=confirm]'); await page.waitForSelector('#modal[open]', { state: 'hidden' }); };
  try {
    await go('index.html');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    // Simulate an old installed demo with expired schedules and missing community tables.
    const originalBooking = await page.evaluate(() => {
      const db = CC.db;
      db.slots.forEach(s => s.date = '2025-01-01');
      db.communityVersion = 1;
      delete db.playerReports; delete db.opponentReviews; delete db.courtReviews;
      delete db.courts[0].autoSchedule;
      localStorage.setItem(CC.KEY, JSON.stringify(db));
      return JSON.stringify(db.bookings[0]);
    });
    await page.reload();
    check('Expired data gains future bookable slots without clearing history', await page.evaluate(b => CC.db.slots.some(CC.available) && JSON.stringify(CC.db.bookings[0]) === b && CC.db.slots.some(s => s.date === '2025-01-01'), originalBooking));
    const slotCount = await page.evaluate(() => CC.db.slots.length);
    await page.reload();
    check('Schedule refresh is idempotent', await page.evaluate(n => CC.db.slots.length === n, slotCount));
    await role('admin'); await go('admin-player-reports.html');
    check('Old community marker with missing tables no longer crashes', await page.evaluate(() => Array.isArray(CC.db.playerReports) && !document.body.textContent.includes('Không thể tải trang')));
    await role('player'); await go('court-detail.html?id=c1');
    check('Booking CTA is disabled until a time is chosen', await page.locator('[data-action=book-selected]').isDisabled());
    const day = await page.evaluate(() => CC.date(2));
    await page.click('.date-picker summary');
    while (!(await page.locator(`[data-booking-date="${day}"]`).count())) await page.click('[data-month-step="1"]');
    await page.click(`[data-booking-date="${day}"]`);
    await page.waitForURL('**/court-detail.html?*date=*');
    const slotId = await page.locator('[data-action=choose-slot]:enabled').first().getAttribute('data-id');
    await page.locator(`[data-action=choose-slot][data-id="${slotId}"]`).click();
    check('Slot selection enables explicit booking button and total', await page.locator('[data-action=book-selected]').isEnabled() && (await page.textContent('#selected-slot-summary')).includes('Tổng'));
    await page.screenshot({ path: path.join(out, 'booking-desktop-updated.png'), fullPage: true });
    await page.click('[data-action=book-selected]');
    await page.waitForURL('**/booking.html?*');
    await page.fill('[name=note]', 'Usability regression booking'); await page.check('[name=accept]');
    await page.click('#booking-form .btn'); await page.waitForURL('**/booking-success.html');
    const bookingId = await page.evaluate(() => CC.db.bookings.find(b => b.note === 'Usability regression booking').id);
    await go(`court-detail.html?id=c1&date=${day}`);
    check('A booked time is visibly disabled', await page.locator(`[data-action=choose-slot][data-id="${slotId}"]`).isDisabled());
    await role('venue'); await go('venue-booking-management.html');
    check('On-behalf booking is removed', await page.locator('[data-action=new-booking]').count() === 0);
    check('Domain also rejects booking on behalf', await page.evaluate(id => { try { CC.booking(id, '', 'u1'); return false; } catch { return true; } }, slotId));
    await page.click(`[data-action=booking-status][data-id="${bookingId}"][data-status=approved]`); await confirm();
    check('Owner can approve the real booking flow', await page.evaluate(id => CC.find('bookings', id).status === 'approved', bookingId));
    await go('venue-court-management.html');
    await page.click('[data-action=entity-new]');
    await page.fill('[name=name]', 'Sân kiểm thử ảnh'); await page.fill('[name=location]', 'Hà Nội');
    await page.setInputFiles('[name=courtPhoto]', path.join(__dirname, '../assets/images/figma-4.jpg'));
    await page.waitForFunction(() => document.querySelector('#court-photo-preview').src.startsWith('data:image/'));
    await save();
    const courtId = await page.evaluate(() => CC.db.courts.find(c => c.name === 'Sân kiểm thử ảnh').id);
    await page.reload();
    check('Uploaded court photo and automatic schedule persist', await page.evaluate(id => CC.find('courts', id).imageData.startsWith('data:image/jpeg') && CC.db.slots.some(s => s.courtId === id && CC.available(s)), courtId));
    await page.click(`[data-action=court-calendar][data-id="${courtId}"]`);
    check('Court calendar shows new court time slots', await page.locator('.calendar-slot.free').count() > 0);
    await page.click('#modal [data-action=close]');
    await page.click(`[data-action=entity-delete][data-table=courts][data-id="${courtId}"]`); await confirm();
    check('Court delete removes listing but keeps safe historical identity', await page.locator(`[data-action=court-calendar][data-id="${courtId}"]`).count() === 0 && await page.evaluate(id => CC.find('courts', id).status === 'deleted', courtId));
    check('Court with active booking cannot be deleted', await page.evaluate(() => { try { CC.deleteEntity('courts','c1'); return false; } catch(e) { return e.message.includes('đơn'); } }));
    await role('admin'); await go('admin-sports-report.html');
    await page.click('[data-action=entity-new]'); await page.fill('[name=name]', 'Báo cáo cần xoá'); await save();
    const reportId = await page.evaluate(() => CC.db.reports.find(r => r.name === 'Báo cáo cần xoá').id);
    await page.click(`[data-action=entity-delete][data-id="${reportId}"]`); await confirm();
    check('Admin can delete saved reports', await page.evaluate(id => !CC.find('reports', id), reportId));
    await role('organizer'); await go('organizer-event-management.html');
    await page.click('[data-action=entity-new]'); await page.fill('[name=name]', 'Sự kiện có giờ');
    await page.fill('[name=location]', 'Nhà thi đấu'); await page.fill('[name=start]', '18:00'); await page.fill('[name=end]', '17:00');
    await page.click('#dialog-form [type=submit]');
    await page.waitForSelector('.form-error:not([hidden])');
    check('Invalid event time is rejected', (await page.textContent('.form-error')).includes('kết thúc'));
    await page.fill('[name=end]', '20:00'); await save();
    const eventId = await page.evaluate(() => CC.db.events.find(e => e.name === 'Sự kiện có giờ').id);
    check('Event start and end time persist and are displayed', await page.evaluate(id => CC.find('events', id).start === '18:00' && document.body.textContent.includes('18:00–20:00'), eventId));
    await go(`organizer-player-roster.html?event=${eventId}`);
    check('Empty event never displays unrelated players', await page.locator('tbody tr').count() === 0 && (await page.textContent('main')).includes('Sự kiện chưa có người tham gia'));
    await page.click('[data-action=roster-add]'); await page.selectOption('[name=playerId]', 'u1'); await save();
    check('Adding participant shows only that event member', await page.locator('tbody tr').count() === 1);
    await page.click('[data-action=roster-toggle][data-id=u1]');
    check('Removing last participant returns to useful empty state', await page.locator('tbody tr').count() === 0);
    await go(`organizer-team-lineup.html?event=${eventId}`);
    check('Empty event disables team generation', await page.locator('#team-submit').isDisabled());
    await go('organizer-event-management.html');
    await page.click(`[data-action=entity-delete][data-id="${eventId}"]`); await confirm();
    check('Event deletion removes event from roster selector', await page.evaluate(id => !Organizer.ownEvents().some(e => e.id === id), eventId));
    // Inspect every authenticated route with each matching role at narrow mobile sizes.
    const routes = { player: ['player-court-search','player-open-matches','player-my-sports','player-match-create','player-skill-match'], venue: ['venue-court-management','venue-booking-management','venue-no-show-risk','venue-revenue','venue-reviews'], organizer: ['organizer-event-management','organizer-player-roster','organizer-team-lineup'], admin: ['admin-user-management','admin-player-reports','admin-sports-report','admin-sport-management'] };
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 844 });
      for (const [r, files] of Object.entries(routes)) {
        await role(r);
        for (const file of [...files, 'index', 'profile', 'settings', 'notifications', 'help']) {
          await go(file + '.html');
          check(`${width}px ${r}/${file}: no overflow or runtime error; account menu available`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && !document.body.textContent.includes('Không thể tải trang:') && !!document.querySelector('.account-menu summary')));
        }
      }
      await role('player'); await go(`court-detail.html?id=c1&date=${day}`);
      check(`Booking action visible immediately at ${width}px`, await page.locator('[data-action=book-selected]').evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
      await page.locator('[data-action=choose-slot]:not(:disabled)').first().click();
      check(`Mobile booking selection enables action at ${width}px`, await page.locator('[data-action=book-selected]').isEnabled());
      await page.screenshot({ path: path.join(out, `booking-mobile-${width}-updated.png`), fullPage: true });
      await page.click('.account-menu summary');
      check(`Account dropdown fits ${width}px`, await page.locator('.account-dropdown').evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
      await page.click('.account-dropdown [data-action=logout]');
      await page.waitForURL('**/login.html');
      check(`Logout works at ${width}px`, await page.evaluate(() => CC.me() === null));
    }
    check('No runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(out, 'usability-results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(`PASS: ${checks.length} checks`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
