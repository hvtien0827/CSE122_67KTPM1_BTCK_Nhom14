const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const context = await browser.newContext();
  const errors = [],
    checks = [];
  const check = (name, value) => {
    assert.ok(value, name);
    checks.push(name);
  };
  const track = (p) => p.on('pageerror', (e) => errors.push(e.message));
  const login = async (page, email, password) => {
    await page.goto(base + '/login.html');
    await page.fill('[name=email]', email);
    await page.fill('[name=password]', password);
    await page.click('#auth-form button[type=submit]');
    await page.waitForURL((url) => !url.pathname.endsWith('login.html'));
  };
  // Nâng cấp dữ liệu cũ chỉ thêm tài khoản demo, không reset dữ liệu hay đổi mật khẩu đã sửa.
  const vm = require('node:vm');
  const source = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  const load = () => {
    const env = { window: {}, localStorage: storage, sessionStorage: { getItem: () => null } };
    vm.runInNewContext(source, env);
    return env.window.CC;
  };
  let cc = load();
  const old = JSON.parse(JSON.stringify(cc.db));
  old.users = old.users.filter((u) => u.id !== 'demo-player-2');
  old.players = old.players.filter((u) => u.id !== 'demo-player-2');
  const originalBookings = JSON.stringify(old.bookings);
  storage.setItem(cc.KEY, JSON.stringify(old));
  cc = load();
  check(
    'Old storage gets one demo account without changing bookings',
    cc.db.users.filter((u) => u.email === 'p2@demo.vn').length === 1 &&
      JSON.stringify(cc.db.bookings) === originalBookings
  );
  cc.db.users.find((u) => u.id === 'demo-player-2').password = 'CustomPass123!';
  cc.db.users.find((u) => u.id === 'demo-player-2').status = 'disabled';
  storage.setItem(cc.KEY, JSON.stringify(cc.db));
  cc = load();
  check(
    'Reload preserves changed password and disabled demo account',
    cc.db.users.find((u) => u.id === 'demo-player-2').password === 'CustomPass123!' &&
      cc.db.users.find((u) => u.id === 'demo-player-2').status === 'disabled' &&
      cc.db.users.filter((u) => u.id === 'demo-player-2').length === 1
  );
  try {
    const host = await context.newPage();
    track(host);
    await host.goto(base + '/index.html');
    const fixture = await host.evaluate(() => {
      CC.login(CC.find('users', 'u1'));
      const court = {
        id: 'skill-qa-court',
        name: 'Sân kiểm thử ghép trận',
        location: 'Địa chỉ kiểm thử',
        sportId: 'badminton',
        ownerId: 'u2',
        price: 100000,
        status: 'active',
        autoSchedule: false,
        image: 0,
      };
      const slot = {
        id: 'skill-qa-slot',
        courtId: court.id,
        date: CC.date(10),
        start: '06:00',
        end: '08:00',
        price: 200000,
        status: 'open',
      };
      CC.transaction(() => {
        CC.db.courts.push(court);
        CC.db.slots.push(slot);
        CC.db.bookings.push({
          id: 'skill-qa-booking',
          slotId: slot.id,
          playerId: 'u1',
          status: 'approved',
          note: '',
        });
      });
      return { date: slot.date, courtId: court.id, slotId: slot.id };
    });
    await host.goto(base + '/player-match-create.html');
    await host.fill('[name=name]', 'Trận demo tương tác hai Player');
    await host.selectOption('[name=sportId]', 'badminton');
    await host.selectOption('[name=slotId]', fixture.slotId);
    await host.selectOption('[name=level]', '2');
    await host.fill('[name=capacity]', '2');
    await host.click('#match-form button[type=submit],#match-form button:not([type])');
    await host.waitForURL('**/player-my-sports.html');
    const id = await host.evaluate(
      () => CC.db.matches.find((m) => m.name === 'Trận demo tương tác hai Player').id
    );
    check('Host creates real match through UI', !!id);
    const guest = await context.newPage();
    track(guest);
    await login(guest, 'p2@demo.vn', '123456');
    check(
      'Short demo credentials work through login form',
      await guest.evaluate(() => CC.me().id === 'demo-player-2')
    );
    await guest.goto(base + '/player-skill-match.html');
    await guest.selectOption('[name=sport]', 'badminton');
    await guest.selectOption('[name=level]', '2');
    await guest.fill('[name=date]', fixture.date);
    await guest.fill('[name=start]', '06:00');
    await guest.fill('[name=end]', '08:00');
    await guest.click('#skill-submit');
    const join = guest.locator(`[data-action=skill-join][data-id="${id}"]`);
    await join.waitFor();
    check(
      'No explanation badge or old accept/save toolbar',
      (await guest
        .locator(
          '[data-action=skill-accept],[data-action=skill-save],[data-action=skill-reject],[data-action=skill-edit],[data-action=skill-again]'
        )
        .count()) === 0 &&
        !(await guest.locator('#ai-result').innerText()).includes('Có giải thích')
    );
    await guest.locator(`#ai-result a[href="match-detail.html?id=${id}"]`).click();
    await guest.goto(`${base}/court-detail.html?id=${fixture.courtId}`);
    await guest.goBack();
    await guest.goBack();
    await join.waitFor();
    check(
      'Search results and all criteria survive returning from details',
      (await guest.inputValue('[name=date]')) === fixture.date &&
        (await guest.inputValue('[name=start]')) === '06:00' &&
        (await guest.inputValue('[name=end]')) === '08:00'
    );
    if (process.env.SKILL_PREVIEW_DIR) {
      fs.mkdirSync(process.env.SKILL_PREVIEW_DIR, { recursive: true });
      await guest.setViewportSize({ width: 1440, height: 960 });
      await guest.evaluate(() => document.fonts.ready);
      await guest.screenshot({
        path: path.join(process.env.SKILL_PREVIEW_DIR, 'suggestions-desktop.png'),
        fullPage: true,
      });
    }
    await join.click();
    const leave = guest.locator(`#saved-skills [data-action=skill-leave][data-id="${id}"]`);
    await leave.waitFor();
    check(
      'Join immediately updates real membership and saves a single card',
      (await guest.evaluate(
        (id) => CC.find('matches', id).playerIds.filter((p) => p === CC.me().id).length === 1,
        id
      )) && (await leave.count()) === 1
    );
    check(
      'Saved card has details and cancellation actions',
      (await guest.locator(`#saved-skills a[href="match-detail.html?id=${id}"]`).count()) === 1 &&
        (await guest.getByRole('heading', { name: 'Trận đấu đã lưu', exact: true }).count()) === 1
    );
    if (process.env.SKILL_PREVIEW_DIR) {
      for (const width of [1440, 390])
        for (const theme of ['light', 'dark']) {
          await guest.setViewportSize({ width, height: 960 });
          await guest.evaluate((theme) => {
            localStorage.setItem('cc.theme', theme);
            Theme.refresh();
          }, theme);
          await guest.evaluate(() => {
            document.activeElement?.blur();
            window.scrollTo(0, 0);
          });
          await guest.mouse.move(0, 0);
          await guest.waitForTimeout(350);
          await guest
            .locator('#toast')
            .evaluateAll((els) => els.forEach((el) => (el.hidden = true)));
          await guest.screenshot({
            path: path.join(process.env.SKILL_PREVIEW_DIR, `joined-${theme}-${width}.png`),
            fullPage: true,
          });
        }
    }
    await host.waitForFunction(
      (id) => CC.find('matches', id).playerIds.includes('demo-player-2'),
      id
    );
    check(
      'Host tab sees participant and notification',
      await host.evaluate(
        (id) =>
          CC.db.notifications.some(
            (n) =>
              n.userId === 'u1' &&
              n.text.includes(CC.find('matches', id).name) &&
              n.text.includes('vừa tham gia')
          ),
        id
      )
    );
    check(
      'Duplicate join rejected',
      await guest.evaluate((id) => {
        try {
          CC.joinMatch(id);
          return false;
        } catch (e) {
          return e.message.includes('đã tham gia');
        }
      }, id)
    );
    check(
      'Joining an overlapping match is rejected without changing membership',
      await guest.evaluate((id) => {
        const slot = CC.find('slots', CC.find('matches', id).slotId);
        CC.transaction(() => {
          CC.db.slots.push({ ...slot, id: 'skill-overlap-slot', courtId: 'c2' });
          CC.db.bookings.push({
            id: 'skill-overlap-booking',
            slotId: 'skill-overlap-slot',
            playerId: 'u6',
            status: 'approved',
          });
          CC.db.matches.push({
            id: 'skill-overlap-match',
            name: 'Trận trùng lịch',
            slotId: 'skill-overlap-slot',
            hostId: 'u6',
            playerIds: ['u6'],
            capacity: 4,
            level: 2,
            status: 'open',
          });
        });
        try {
          CC.joinMatch('skill-overlap-match');
          return false;
        } catch (error) {
          return (
            error.message.includes('Trùng lịch') &&
            CC.find('matches', 'skill-overlap-match').playerIds.length === 1
          );
        }
      }, id)
    );
    const third = await context.newPage();
    track(third);
    await login(third, 'player4@courtconnect.demo', 'Court123!');
    await third.goto(`${base}/match-detail.html?id=${id}`);
    check(
      'Last seat cannot be overbooked',
      await third.evaluate((id) => {
        try {
          CC.joinMatch(id);
          return false;
        } catch (e) {
          return e.message.includes('đủ người');
        }
      }, id)
    );
    await guest.reload();
    await leave.waitFor();
    check('Saved membership survives reload', (await leave.count()) === 1);
    await leave.click();
    await host.waitForFunction((id) => CC.find('matches', id).playerIds.length === 1, id);
    check('Cancellation releases seat and removes saved card', (await leave.count()) === 0);
    await third.reload();
    await third.click('[data-action=join-match]');
    check(
      'Another player can take released seat through details',
      await third.evaluate((id) => CC.find('matches', id).playerIds.includes(CC.me().id), id)
    );
    await third.goto(base + '/player-my-sports.html');
    await third.click(`[data-action=leave-match][data-id="${id}"]`);
    await third.click('[data-action=confirm]');
    await guest.waitForFunction((id) => CC.find('matches', id).playerIds.length === 1, id);
    await join.waitFor();
    await join.click();
    await leave.waitFor();
    check('Rejoining does not duplicate saved cards', (await leave.count()) === 1);
    await guest.setViewportSize({ width: 390, height: 960 });
    await guest.reload();
    await leave.waitFor();
    check(
      'Mobile cards fit viewport',
      await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
    );
    await guest.setViewportSize({ width: 320, height: 900 });
    check(
      'Narrow mobile cards fit viewport',
      await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
    );
    await host.waitForFunction(
      (id) => CC.find('matches', id).playerIds.includes('demo-player-2'),
      id
    );
    await host.locator(`[data-action=cancel-match][data-id="${id}"]`).click();
    await host.click('[data-action=confirm]');
    await guest.waitForFunction((id) => CC.find('matches', id).status === 'cancelled', id);
    check(
      'Host cancellation disables leaving and removes match from suggestions',
      (await leave.isDisabled()) && (await join.count()) === 0
    );
    await guest.evaluate(() => CC.login(CC.find('users', 'u1')));
    await guest.goto(base + '/player-skill-match.html');
    check(
      'Search draft and saved membership are isolated per player',
      (await guest.inputValue('[name=date]')) !== fixture.date &&
        (await guest.locator('#saved-skills [data-action=skill-leave]').count()) === 0
    );
    check('No runtime errors', errors.length === 0);
    fs.writeFileSync(
      path.join(__dirname, 'artifacts/skill-participation-results.json'),
      JSON.stringify({ checks, errors }, null, 2)
    );
    console.log(
      `PASS: ${checks.length} Skill Match participation checks; real host creation, two players, full seat, cancellation, persistence, mobile and account isolation.`
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
