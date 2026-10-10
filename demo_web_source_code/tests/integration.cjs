const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  try {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } }),
      errors = [],
      checks = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const base = (process.env.BASE_URL || 'http://127.0.0.1:4173') + '/';
    const go = async (f) => {
      await p.goto(base + f);
      await p.waitForSelector('h1');
      assert.ok(!(await p.locator('body').innerText()).includes('Không thể tải trang'));
    };
    const check = (n, v) => {
      assert.ok(v, n);
      checks.push(n);
      console.log('PASS ' + n);
    };
    const login = async (id) =>
      p.evaluate((id) => {
        CC.login(CC.find('users', id));
      }, id);
    const submit = async () => {
      await p.locator('#dialog-form button[type=submit]').click();
      await p.waitForTimeout(80);
    };
    await go('index.html');
    check('Three roles', await p.evaluate(() => Object.keys(CC.roles).length === 3));
    await go('register.html');
    await p.locator('[name=role]').selectOption('venue');
    await p.locator('[name=name]').fill('Chủ sân kiểm thử');
    await p.locator('[name=email]').fill('new-owner@example.test');
    await p.locator('[name=phone]').fill('0912345678');
    await p.locator('[name=courtName]').fill('Sân đăng ký kiểm thử');
    await p.locator('[name=location]').fill('12 Hà Nội');
    await p.locator('[name=password]').fill('Court123!');
    await p.locator('[name=confirm]').fill('Court123!');
    await p.locator('[name=terms]').check();
    await p.locator('#auth-form button:not([type=button])').click();
    await p.waitForURL('**/verify-email.html');
    await p.locator('[name=code]').fill('000000');
    await p.locator('#verify-submit').click();
    check('Wrong phone OTP rejected', await p.locator('#auth-error').isVisible());
    await p.locator('[name=code]').fill('482915');
    await p.locator('#verify-submit').click();
    check(
      'Registration success inline',
      (await p.locator('h1').innerText()) === 'Đăng ký thành công'
    );
    const uid = await p.evaluate(
      () => CC.db.users.find((u) => u.email === 'new-owner@example.test').id
    );
    await login(uid);
    await go('venue-court-management.html');
    check('Owner held for approval', (await p.locator('h1').innerText()) === 'Hồ sơ chủ sân');
    check(
      'Pending owner domain guard',
      await p.evaluate(() => {
        try {
          Domain.courtRequest('create', null, {
            name: 'XX',
            location: 'XX',
            sportId: 'badminton',
            price: 100000,
          });
          return false;
        } catch {
          return true;
        }
      })
    );
    await login('u4');
    await go('Court-Owner-Approval.html');
    const appid = await p.evaluate(
      (id) => CC.db.ownerApplications.find((a) => a.userId === id).id,
      uid
    );
    await p
      .locator(`[data-action=decide-owner][data-id="${appid}"][data-decision=rejected]`)
      .click();
    await p.locator('[name=reason]').fill('Cần bổ sung mô tả sân.');
    await submit();
    check(
      'Owner rejected with reason',
      await p.evaluate((id) => CC.find('users', id).approvalStatus === 'rejected', uid)
    );
    await login(uid);
    await go('venue-court-management.html');
    await p.locator('[data-action=resubmit-owner]').click();
    await p.locator('[name=description]').fill('Sân đầy đủ tiện nghi.');
    await submit();
    const app2 = await p.evaluate(
      (id) => CC.db.ownerApplications.filter((a) => a.userId === id).at(-1).id,
      uid
    );
    await login('u4');
    await go('Court-Owner-Approval.html');
    await p
      .locator(`[data-action=decide-owner][data-id="${app2}"][data-decision=approved]`)
      .click();
    await submit();
    check(
      'Owner approval publishes court',
      await p.evaluate(
        (id) =>
          CC.find('users', id).approvalStatus === 'approved' &&
          CC.db.courts.some((c) => c.ownerId === id),
        uid
      )
    );
    await login('u2');
    await go('venue-court-management.html');
    await p.locator('[data-action=edit-court][data-id=c1]').click();
    await p.locator('[name=name]').fill('Sân tên mới chờ duyệt');
    await submit();
    check(
      'Court unchanged before approval',
      await p.evaluate(() => !CC.find('courts', 'c1').name.includes('tên mới'))
    );
    const change = await p.evaluate(
      () => CC.db.courtChanges.filter((c) => c.courtId === 'c1').at(-1).id
    );
    await login('u4');
    await go('Admin-Dashboard.html?tab=courts');
    await p
      .locator(`[data-action=decide-court][data-id="${change}"][data-decision=approved]`)
      .click();
    await submit();
    check(
      'Court changed after approval',
      await p.evaluate(() => CC.find('courts', 'c1').name.includes('tên mới'))
    );
    await login('u1');
    await go('player-court-search.html?id=c1');
    await p.locator('[data-action=choose-slot]:not([disabled])').first().click();
    await p.waitForURL('**/player-court-search.html?slot=*');
    check(
      'Booking contact consent visible',
      (await p.locator('#main').innerText()).includes('số điện thoại')
    );
    await p.locator('[name=accept]').check();
    await p.locator('#booking-form button').click();
    await p.waitForURL('**/my-activities.html?booked=1');
    const bid = await p.evaluate(() => CC.db.bookings.at(-1).id);
    check(
      'Booking success and saved contact',
      await p.evaluate((id) => CC.find('bookings', id).contactPhone === '0900000001', bid)
    );
    await login('u2');
    await go('venue-booking-management.html');
    check(
      'Weekly timetable inline',
      (await p.locator('#venue-calendar .calendar-grid').count()) === 1
    );
    await p.locator(`[data-action=booking-status][data-id="${bid}"][data-status=approved]`).click();
    await p.locator('[data-action=confirm]').click();
    check(
      'Owner approves booking',
      await p.evaluate((id) => CC.find('bookings', id).status === 'approved', bid)
    );
    check(
      '30-day cancellation warning',
      await p.evaluate(() => Domain.counts('u5').recentCancelled === 2)
    );
    await login('u1');
    await go('player-match-create.html');
    await p.locator('[name=name]').fill('Trận tạo kiểm thử');
    const sid = await p.evaluate((id) => CC.find('bookings', id).slotId, bid);
    await p.locator('[name=slotId]').selectOption(sid);
    await p.locator('#match-form button').click();
    await p.waitForURL('**/my-activities.html');
    check(
      'Create match works',
      await p.evaluate(() => CC.db.matches.some((m) => m.name === 'Trận tạo kiểm thử'))
    );
    await login('u8');
    await go('player-open-matches.html?id=m2');
    await p.locator('[data-action=join-match]').click();
    check(
      'Join only creates pending request',
      await p.evaluate(
        () =>
          !CC.find('matches', 'm2').playerIds.includes('u8') &&
          CC.db.joinRequests.some(
            (r) => r.matchId === 'm2' && r.playerId === 'u8' && r.status === 'pending'
          )
      )
    );
    const rid = await p.evaluate(
      () => CC.db.joinRequests.find((r) => r.matchId === 'm2' && r.playerId === 'u8').id
    );
    check(
      'Duplicate request rejected',
      await p.evaluate(() => {
        try {
          Domain.requestJoin('m2');
          return false;
        } catch {
          return true;
        }
      })
    );
    await login('u5');
    await go('Join-Requests.html');
    await p.locator(`[data-action=decide-join][data-id="${rid}"][data-decision=approved]`).click();
    check(
      'Host approves membership',
      await p.evaluate(() => CC.find('matches', 'm2').playerIds.includes('u8'))
    );
    await login('u1');
    await go('my-activities.html');
    await p.locator('[data-view=bookings]').click();
    check(
      'Activity filter hides matches',
      !(await p.locator('[data-activity=matches]').isVisible())
    );
    await p.locator('[data-action=review-court]').first().click();
    await p.locator('[name=comment]').fill('Sân tốt kiểm thử');
    await submit();
    check(
      'Court review success toast',
      (await p.locator('#toast').innerText()) === 'Đánh giá thành công.'
    );
    await go('player-open-matches.html?id=m2');
    await p.locator('[data-action=person-info]').first().click();
    check(
      'Player info has report/chat and no phone',
      (await p.locator('#modal a[href^="Report.html"]').count()) === 1 &&
        !(await p.locator('#modal').innerText()).includes('0900000005')
    );
    await go('Report.html?type=court&id=c1');
    await p.locator('[name=comment]').fill('Báo cáo sân cần kiểm tra.');
    await p.locator('[name=evidence]').fill('Mô tả bằng chứng kiểm thử.');
    await p.locator('#report-form button').click();
    check('Report success', (await p.locator('#toast').innerText()) === 'Báo cáo thành công.');
    const reportid = await p.evaluate(() => CC.db.abuseReports.at(-1).id);
    await login('u4');
    await go('Report-Management.html');
    await p.locator(`[data-action=resolve-report][data-id="${reportid}"]`).click();
    await p.locator('[name=decision]').selectOption('warned');
    await p.locator('[name=note]').fill('Cần cải thiện thông tin sân.');
    await submit();
    check(
      'Admin warns court owner',
      await p.evaluate(
        (id) =>
          CC.find('abuseReports', id).status === 'warned' &&
          CC.db.violations.some((v) => v.userId === 'u2'),
        reportid
      )
    );
    await go('System-Notifications.html');
    await p.locator('[name=text]').fill('Thông báo thử nghiệm cho người chơi');
    await p.locator('[name=audience]').selectOption('player');
    await p.locator('#broadcast-form button').click();
    check(
      'Broadcast targets players',
      await p.evaluate(() => {
        const r = CC.db.broadcasts.at(-1);
        return r.recipients.includes('u1') && !r.recipients.includes('u2');
      })
    );
    await login('u1');
    await go('notifications.html');
    check(
      'Recipient sees broadcast',
      (await p.locator('#main').innerText()).includes('Thông báo thử nghiệm')
    );
    await go('chat.html?with=u2');
    await p.locator('[name=message]').fill('Tin nhắn kiểm thử');
    await p.locator('#chat-form button').click();
    await login('u2');
    await go('chat.html?with=u1');
    check(
      'Chat delivered locally',
      (await p.locator('#chat-log').innerText()).includes('Tin nhắn kiểm thử')
    );
    await go('Revenue.html');
    for (const v of ['day', 'week', 'month', 'year']) {
      await p.locator('[name=revenue-period]').selectOption(v);
      check('Revenue filter ' + v, (await p.locator('[name=revenue-period]').inputValue()) === v);
    }
    await go('profile.html');
    await p.locator('[data-action=change-password]').click();
    await p.waitForURL('**/verify-reset.html');
    await p.locator('[name=code]').fill('482915');
    await p.locator('#verify-submit').click();
    await p.waitForURL('**/reset-password.html');
    await p.locator('[name=password]').fill('Changed123!');
    await p.locator('[name=confirm]').fill('Changed123!');
    await p.locator('#auth-form button').click();
    check('Reset success inline', (await p.locator('h1').innerText()).includes('thành công'));
    await go('reset-password.html');
    await p.locator('[name=password]').fill('Blocked123!');
    await p.locator('[name=confirm]').fill('Blocked123!');
    await p.locator('#auth-form button').click();
    check('Reset cannot bypass OTP', await p.locator('#auth-error').isVisible());
    await login('u1');
    await go('Admin-Dashboard.html');
    check('Role guard', (await p.locator('h1').innerText()).includes('chưa có quyền'));
    await go('player-skill-match.html');
    await p.locator('#skill-form').evaluate((f) => f.requestSubmit());
    await p.waitForTimeout(800);
    check(
      'Skill match responds',
      await p
        .locator('#ai-result')
        .innerText()
        .then((t) => t.length > 10)
    );
    check('No runtime errors', errors.length === 0);
    console.log('Completed ' + checks.length + ' flow checks.');
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
