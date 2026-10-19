const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.BROWSER_PATH});
  const errors = [], checks = [];
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const trigger = input => input.locator('..').locator('.cc-date-trigger');
    for (const theme of ['light', 'dark']) {
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({width, height: 844});
        await page.goto(base + '/player-court-search.html');
        await page.evaluate(theme => localStorage.setItem('cc.theme', theme), theme);
        await page.reload();
        const input = page.locator('[name=date]');
        const control = trigger(input);
        await control.click();
        const popup = page.locator('#shared-calendar');
        check(`${theme}/${width}: calendar visible`, await popup.isVisible());
        check(`${theme}/${width}: popup fits viewport`, await popup.evaluate(node => {
          const r = node.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
        }));
        check(`${theme}/${width}: 42 day cells`, await popup.locator('[data-calendar-date]').count() === 42);
        check(`${theme}/${width}: theme matches surface`, await popup.evaluate(node => {
          const probe = document.createElement('span');
          probe.style.background = 'var(--surface)'; document.body.append(probe);
          const matches = getComputedStyle(node).backgroundColor === getComputedStyle(probe).backgroundColor;
          probe.remove(); return matches;
        }));
        await page.keyboard.press('ArrowRight');
        const next = await page.evaluate(() => CC.date(1));
        check(`${theme}/${width}: keyboard moves date`, await page.evaluate(next => document.activeElement.dataset.calendarDate === next, next));
        await page.keyboard.press('Enter');
        check(`${theme}/${width}: ISO form value preserved`, await input.inputValue() === next);
        check(`${theme}/${width}: localized display`, (await control.innerText()).includes(next.split('-').reverse().join('/')));
        check(`${theme}/${width}: selection closes popup`, !(await popup.isVisible()));
        await control.click();
        check(`${theme}/${width}: selection retained`, await popup.locator(`[data-calendar-date="${next}"]`).getAttribute('aria-pressed') === 'true');
        await popup.locator('[data-calendar-clear]').click();
        check(`${theme}/${width}: clear date`, await input.inputValue() === '');
        await control.click();
        await page.keyboard.press('Escape');
        check(`${theme}/${width}: Escape returns focus`, await control.evaluate(node => node === document.activeElement) && !(await popup.isVisible()));
        await control.click();
        await page.locator('h1').click();
        check(`${theme}/${width}: outside click closes`, !(await popup.isVisible()));
      }
    }
    await page.setViewportSize({width: 1440, height: 960});
    await page.goto(base + '/player-open-matches.html');
    let input = page.locator('[name=date]');
    await trigger(input).click();
    const popup = page.locator('#shared-calendar');
    await popup.locator('[data-date-years]').selectOption('2028');
    await popup.locator('[data-date-months]').selectOption('1');
    await popup.locator('[data-calendar-date="2028-02-29"]').click();
    check('Leap date works across year/month selectors', await input.inputValue() === '2028-02-29');
    await page.locator('#filters button:not([type]), #filters button[type=submit]').click();
    check('Match filter receives chosen day', await input.inputValue() === '2028-02-29' && await page.locator('.cards .card').count() === 0);
    await page.click('[data-action=clear-filter]');
    check('Clear filter synchronizes calendar display', await input.inputValue() === '' && (await trigger(input).innerText()).includes('Chọn ngày'));
    await page.evaluate(() => CC.login(CC.db.users.find(user => user.role === 'player')));
    await page.goto(base + '/player-skill-match.html');
    input = page.locator('#skill-form [name=date]');
    await page.evaluate(() => {
      const input = document.querySelector('#skill-form [name=date]');
      input.min = CC.date(1); input.max = CC.date(3); input.value = CC.date(1);
      DatePicker.enhance(document);
    });
    await trigger(input).click();
    const before = await page.evaluate(() => CC.date());
    check('Minimum date is disabled', await popup.locator(`[data-calendar-date="${before}"]`).isDisabled());
    check('Today respects minimum date', await popup.locator('[data-calendar-today]').isDisabled());
    check('Required field cannot be cleared', !(await popup.locator('[data-calendar-clear]').isVisible()));
    await page.keyboard.press('Escape');
    await page.evaluate(() => CC.login(CC.db.users.find(user => user.role === 'venue')));
    await page.goto(base + '/venue-revenue.html');
    input = page.locator('[name=revenue-date]');
    await trigger(input).click();
    await popup.locator('[data-calendar-today]').click();
    check('Revenue refresh retains chosen value', await input.inputValue() === await page.evaluate(() => CC.date()));
    await page.goto(base + '/venue-court-management.html');
    await page.locator('[data-action=court-calendar]').first().click();
    await page.click('[data-action=calendar-new]');
    input = page.locator('#modal [name=date]');
    await trigger(input).click();
    check('Calendar works above modal', await popup.isVisible() && await popup.evaluate(node => !!node.closest('dialog[open]')));
    await page.keyboard.press('Escape');
    check('Escape closes calendar while keeping form', await page.locator('#modal').isVisible() && !(await popup.isVisible()));
    await input.fill(await page.evaluate(() => CC.date(8)));
    check('Programmatic/native date changes synchronize', (await trigger(input).innerText()).includes((await input.inputValue()).split('-').reverse().join('/')));
    check('No runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(__dirname, 'artifacts/date-picker-results.json'), JSON.stringify({checks, errors}, null, 2));
    console.log(`PASS ${checks.length} shared calendar checks`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
