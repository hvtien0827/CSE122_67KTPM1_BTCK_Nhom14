const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  try {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/index.html');
    await p.waitForFunction(() => !!window.Domain);
    const checks = await p.evaluate(() => {
      const checks = [],
        yes = (n, v) => {
          if (!v) throw Error(n);
          checks.push(n);
        },
        denied = (n, fn) => {
          let blocked = false;
          try {
            fn();
          } catch {
            blocked = true;
          }
          yes(n, blocked);
        },
        as = (id) => CC.login(CC.find('users', id));
      as('u1');
      denied('Player cannot approve owner', () =>
        Domain.decideOwner('app-demo-owner-pending', 'approved')
      );
      denied('Player cannot edit slots', () =>
        CC.saveEntity('slots', {
          courtId: 'c1',
          date: CC.date(9),
          start: '10:00',
          end: '12:00',
          price: 100000,
        })
      );
      denied('Player cannot book for another', () => CC.booking('s-c1-5-08', '', 'u5'));
      denied('Nonowner cannot access revenue', () => Community.revenueRows('year', CC.date()));
      denied('Self report rejected', () =>
        Domain.sendReport({
          targetType: 'user',
          targetId: 'u1',
          reason: 'X',
          comment: 'Y',
          evidence: 'Z',
        })
      );
      denied('Report needs evidence', () =>
        Domain.sendReport({
          targetType: 'user',
          targetId: 'u8',
          reason: 'X',
          comment: 'Y',
          evidence: '',
        })
      );
      as('u8');
      Domain.requestJoin('m2');
      let r = CC.db.joinRequests.at(-1);
      as('u1');
      denied('Only host can approve join', () => Domain.decideJoin(r.id, 'approved'));
      as('u5');
      CC.transaction(() => (CC.find('matches', 'm2').capacity = 1));
      denied('Capacity rechecked at approval', () => Domain.decideJoin(r.id, 'approved'));
      CC.transaction(() => (CC.find('matches', 'm2').capacity = 4));
      const s = CC.find('slots', CC.find('matches', 'm2').slotId);
      CC.transaction(() => {
        CC.db.slots.push({ ...s, id: 'conflict-slot', courtId: 'c4' });
        CC.db.bookings.push({
          id: 'conflict-booking',
          slotId: 'conflict-slot',
          playerId: 'u8',
          status: 'approved',
        });
      });
      denied('Conflict rechecked at approval', () => Domain.decideJoin(r.id, 'approved'));
      CC.transaction(() => (CC.find('bookings', 'conflict-booking').status = 'cancelled'));
      Domain.decideJoin(r.id, 'rejected');
      yes('Rejected applicant stays out', !CC.find('matches', 'm2').playerIds.includes('u8'));
      as('u2');
      const before = CC.find('courts', 'c1').name;
      Domain.courtRequest('update', 'c1', { ...CC.find('courts', 'c1'), name: 'Không công khai' });
      const cid = CC.db.courtChanges.at(-1).id;
      yes('Proposed change does not alter public data', CC.find('courts', 'c1').name === before);
      denied('Duplicate pending change blocked', () => Domain.courtRequest('delete', 'c1'));
      as('u4');
      denied('Court rejection needs reason', () => Domain.decideCourt(cid, 'rejected', ''));
      Domain.decideCourt(cid, 'rejected', 'Giữ dữ liệu cũ');
      yes('Rejected change keeps old court', CC.find('courts', 'c1').name === before);
      as('u2');
      Domain.courtRequest('delete', 'c1');
      const del = CC.db.courtChanges.at(-1).id;
      as('u4');
      denied('Deletion blocked by existing active bookings', () =>
        Domain.decideCourt(del, 'approved')
      );
      Domain.decideCourt(del, 'rejected', 'Còn lịch');
      as('u2');
      Domain.courtRequest('create', null, {
        name: 'Sân xóa thử',
        location: 'Hà Nội',
        sportId: 'badminton',
        price: 100000,
      });
      let create = CC.db.courtChanges.at(-1).id;
      as('u4');
      Domain.decideCourt(create, 'approved');
      let court = CC.find('courtChanges', create).courtId;
      as('u2');
      Domain.courtRequest('delete', court);
      let d = CC.db.courtChanges.at(-1).id;
      as('u4');
      Domain.decideCourt(d, 'approved');
      yes(
        'Approved deletion preserves archived record',
        CC.find('courts', court).status === 'archived'
      );
      Domain.broadcast({ audience: 'venue', text: 'Recall me' });
      const broadcast = CC.db.broadcasts.at(-1);
      yes(
        'Broadcast IDs attached to every recipient notification',
        CC.db.notifications.filter((n) => n.broadcastId === broadcast.id).length ===
          broadcast.recipients.length
      );
      as('u1');
      Domain.sendReport({
        targetType: 'user',
        targetId: 'u8',
        reason: 'X',
        comment: 'Y',
        evidence: 'Z',
      });
      const report = CC.db.abuseReports.at(-1).id;
      as('u4');
      Domain.resolveReport(report, 'banned', 'Kiểm tra bằng chứng mẫu');
      yes(
        'Ban invalidates player state',
        CC.find('users', 'u8').status === 'disabled' &&
          CC.find('players', 'u8').status === 'disabled'
      );
      as('u8');
      yes('Banned session not authenticated', CC.me() === null);
      as('u1');
      yes(
        'Cancellation rates only count player initiated actions',
        Domain.counts('u5').recentCancelled === 2
      );
      yes('Monday range correct', Community.periodRange('week', '2026-09-27').start.getDay() === 1);
      yes(
        'December annual bound correct',
        Community.periodRange('year', '2026-12-31').end.getFullYear() === 2027
      );
      return checks;
    });
    checks.forEach((n) => console.log('PASS ' + n));
    await p.evaluate(() => CC.login(CC.find('users', 'u4')));
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/System-Notifications.html');
    const id = await p.evaluate(() => CC.db.broadcasts.at(-1).id);
    await p.locator(`[data-action=recall-broadcast][data-id="${id}"]`).click();
    await p.locator('[data-action=confirm]').click();
    assert.ok(await p.evaluate((id) => !CC.db.notifications.some((n) => n.broadcastId === id), id));
    console.log('PASS Broadcast recall removes recipient notifications');
    await p.evaluate(() => CC.login(CC.find('users', 'u2')));
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4173') + '/venue-booking-management.html'
    );
    await p.locator('[data-action=calendar-next]').click();
    assert.equal(await p.locator('#venue-calendar .calendar-agenda:visible').count(), 1);
    await p.locator('.agenda-slot.approved').first().click();
    assert.ok((await p.locator('#modal').innerText()).includes('090000'));
    await p.locator('[data-action=close]').click();
    await p.locator('.theme-toggle').click();
    console.log('PASS Mobile calendar day navigation and private booking contact');
    // Simulate pre-refactor data, preserving old custom work.
    await p.evaluate(() => {
      const old = CC.seed();
      old.users.push({
        id: 'old-organizer',
        role: 'organizer',
        name: 'CLB cũ',
        email: 'old@example.test',
        phone: '',
        password: 'Court123!',
        verified: true,
        status: 'active',
      });
      old.events = [{ id: 'old-event', name: 'Giữ lịch sử' }];
      old.users[0].bio = 'Keep my changes';
      old.notifications.push({
        id: 'old-notification',
        userId: 'u1',
        text: 'Old route',
        href: 'organizer-event-management.html',
      });
      localStorage.setItem(CC.KEY, JSON.stringify(old));
    });
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/index.html');
    assert.ok(
      await p.evaluate(
        () =>
          CC.db.legacy.events[0].name === 'Giữ lịch sử' &&
          CC.find('users', 'old-organizer').status === 'disabled' &&
          CC.find('users', 'old-organizer').role === 'organizer' &&
          CC.find('users', 'u1').bio === 'Keep my changes'
      )
    );
    const counts = await p.evaluate(() => [
      CC.db.matches.length,
      CC.db.ownerApplications.length,
      CC.db.messages.length,
    ]);
    await p.reload();
    assert.deepEqual(
      await p.evaluate(() => [
        CC.db.matches.length,
        CC.db.ownerApplications.length,
        CC.db.messages.length,
      ]),
      counts
    );
    console.log(
      'PASS Old data migration preserves custom data and retires role without duplication'
    );
    assert.deepEqual(errors, []);
    console.log('Completed ' + (checks.length + 4) + ' edge checks.');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
