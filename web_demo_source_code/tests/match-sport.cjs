const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  const errors = [];
  let checks = 0;
  const check = (value, label) => { assert.ok(value, label); checks++; };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/index.html');
    const fixture = await page.evaluate(() => {
      const user = CC.db.users.find(u => u.role === 'player');
      CC.login(user);
      const sports = CC.db.sports.filter(s => s.status === 'active').slice(0, 2);
      CC.transaction(() => {
        CC.db.bookings = CC.db.bookings.filter(b => b.playerId !== user.id);
        CC.db.sports.push({ id: 'test-empty-sport', name: 'Môn chưa có lịch', status: 'active' });
        CC.db.sports.push({ id: 'test-archived-sport', name: 'Môn đã lưu trữ', status: 'archived' });
        sports.forEach((sport, i) => {
          const court = CC.db.courts.find(c => c.sportId === sport.id && c.status === 'active');
          CC.db.slots.push({ id: 'test-sport-slot-' + i, courtId: court.id, date: CC.date(40 + i), start: '08:00', end: '10:00', price: 100000, status: 'open' });
          CC.db.bookings.push({ id: 'test-sport-booking-' + i, slotId: 'test-sport-slot-' + i, playerId: user.id, status: 'approved' });
        });
        const court = CC.db.courts.find(c => c.sportId === sports[0].id && c.status === 'active');
        for (const [suffix, status, offset] of [['pending', 'pending', 42], ['past', 'approved', -40]]) {
          CC.db.slots.push({ id: 'test-' + suffix, courtId: court.id, date: CC.date(offset), start: '08:00', end: '10:00', price: 100000, status: 'open' });
          CC.db.bookings.push({ id: 'test-booking-' + suffix, slotId: 'test-' + suffix, playerId: user.id, status });
        }
      });
      return { sports: sports.map(s => s.id), userId: user.id };
    });
    await page.goto(base + '/player-match-create.html');
    const sport = page.locator('#match-form [name=sportId]');
    const slot = page.locator('#match-form [name=slotId]');
    const submit = page.locator('#match-form button');
    check(await sport.isVisible(), 'Sport selector visible');
    check(await sport.inputValue() === fixture.sports[0], 'Initial sport follows first eligible booking');
    check(await slot.locator('option').count() === 1 && await slot.inputValue() === 'test-sport-slot-0', 'Only approved future slots of selected sport');
    check(await sport.locator('option[value=test-archived-sport]').count() === 0, 'Archived sport excluded');
    await page.fill('#match-form [name=name]', 'Trận kiểm tra chọn môn');
    await page.fill('#match-form [name=note]', 'Giữ nguyên ghi chú khi đổi môn');
    await page.fill('#match-form [name=capacity]', '6');
    await sport.selectOption('test-empty-sport');
    check(await slot.isDisabled() && await submit.isDisabled(), 'No booking disables slot and save');
    check((await page.locator('#match-slot-hint').innerText()).includes('Chưa có lịch sân phù hợp'), 'Empty sport explains next step');
    check(await page.inputValue('#match-form [name=name]') === 'Trận kiểm tra chọn môn', 'Name retained on sport change');
    check(await page.inputValue('#match-form [name=note]') === 'Giữ nguyên ghi chú khi đổi môn', 'Note retained on sport change');
    check(await page.inputValue('#match-form [name=capacity]') === '6', 'Capacity retained on sport change');
    await sport.selectOption(fixture.sports[1]);
    check(!await slot.isDisabled() && !await submit.isDisabled(), 'Eligible sport enables form again');
    check(await slot.inputValue() === 'test-sport-slot-1' && await slot.locator('option').count() === 1, 'Changing sport filters correct slot');
    await slot.evaluate(n => { n.add(new Option('Lịch sai môn', 'test-sport-slot-0')); n.value = 'test-sport-slot-0'; });
    await submit.click();
    check((await page.locator('#match-error').innerText()).includes('thuộc môn thể thao'), 'Mismatched sport and slot rejected');
    await slot.selectOption('test-sport-slot-1');
    await submit.click();
    await page.waitForURL('**/player-my-sports.html');
    const saved = await page.evaluate(() => CC.db.matches.find(m => m.name === 'Trận kiểm tra chọn môn'));
    check(saved?.slotId === 'test-sport-slot-1', 'Create persists chosen sport court slot');
    check(!Object.hasOwn(saved, 'sportId'), 'No redundant sportId stored on match');
    await page.goto(base + '/player-match-create.html?id=' + saved.id);
    check(await sport.inputValue() === fixture.sports[1] && await slot.inputValue() === saved.slotId, 'Edit restores correct sport and booking');
    await sport.selectOption(fixture.sports[0]);
    await submit.click();
    await page.waitForURL('**/player-my-sports.html');
    check(await page.evaluate(id => CC.find('matches', id).slotId === 'test-sport-slot-0', saved.id), 'Edit can change to approved booking of another sport');
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/player-match-create.html?id=' + saved.id);
      check(await sport.isVisible(), 'Mobile selector visible ' + width);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No overflow ' + width);
    }
    await page.evaluate(() => CC.transaction(() => { CC.db.bookings = CC.db.bookings.filter(b => b.playerId !== CC.me().id); }));
    await page.goto(base + '/player-match-create.html');
    check(await sport.isVisible() && await slot.isDisabled() && await submit.isDisabled(), 'No approved bookings remains usable with disabled save');
    assert.deepEqual(errors, []);
    console.log(`PASS: ${checks} match sport checks; create/edit/filter/empty/tampering/mobile; no runtime errors.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
