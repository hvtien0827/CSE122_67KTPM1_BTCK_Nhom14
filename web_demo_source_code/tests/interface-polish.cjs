const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = path.join(__dirname, 'artifacts');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  const go = file => page.goto(`${base}/${file}`);
  const role = id => page.evaluate(id => CC.login(CC.find('users', id)), id);
  const fit = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  try {
    await go('index.html'); await role('u1');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => localStorage.setItem('cc.theme', theme), theme);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({width, height:900});
        await go('player-court-search.html');
        check(`${theme}/${width} court cards fit`, await fit());
        if (width === 1440) {
          const positions = await page.locator('.court-card .court-card-bottom').evaluateAll(els => els.slice(0,3).map(el => el.getBoundingClientRect().top));
          check(`${theme} card prices and actions align`, Math.max(...positions) - Math.min(...positions) <= 1);
        }
        await page.screenshot({path:path.join(out,`polish-courts-${theme}-${width}.png`),fullPage:true});
        await go('court-detail.html?id=c1');
        await page.click('.date-picker summary');
        check(`${theme}/${width} custom calendar fits`, await page.locator('.date-popover').evaluate(el => {const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
        const today = await page.evaluate(() => CC.date());
        check(`${theme}/${width} past dates disabled`, await page.locator('[data-booking-date]').evaluateAll((els, today) => els.filter(el => el.dataset.bookingDate < today).every(el => el.disabled), today));
        await page.locator(`[data-booking-date="${today}"]`).focus();
        await page.keyboard.press('ArrowRight');
        check(`${theme}/${width} calendar arrow navigation`, await page.evaluate(() => document.activeElement.dataset.bookingDate === CC.date(1)));
        await page.keyboard.press('Escape');
        check(`${theme}/${width} calendar escape returns focus`, await page.evaluate(() => !document.querySelector('.date-picker').open && document.activeElement.matches('.date-picker summary')));
        await page.click('.date-picker summary');
        await page.click('[data-month-step="1"]');
        await page.click('[data-month-step="-1"]');
        await page.screenshot({path:path.join(out,`polish-calendar-${theme}-${width}.png`),fullPage:true});
        const next = await page.evaluate(() => CC.date(1));
        while (!(await page.locator(`[data-booking-date="${next}"]`).count())) await page.click('[data-month-step="1"]');
        await page.click(`[data-booking-date="${next}"]`);
        await page.waitForURL(url => url.searchParams.get('date') === next);
        check(`${theme}/${width} calendar selection changes slots`, await page.locator('[name=slotDate]').inputValue() === next);
        for (const file of ['profile','notifications','settings','help']) {
          await go(file+'.html');
          check(`${theme}/${width} ${file} current account tab`, await page.locator(`.sidebar a[href="${file}.html"].active[aria-current=page]`).count() === 1);
        }
        await page.click('.account-menu summary');
        check(`${theme}/${width} account dropdown fits`, await page.locator('.account-dropdown').evaluate(el => {const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
        await page.screenshot({path:path.join(out,`polish-account-${theme}-${width}.png`)});
        await role('u2'); await go('venue-court-management.html');
        check(`${theme}/${width} venue table fits`, await fit());
        await page.screenshot({path:path.join(out,`polish-venue-${theme}-${width}.png`),fullPage:true});
        await page.locator('.court-calendar-button').first().click();
        check(`${theme}/${width} court calendar opens`, await page.locator('#modal').isVisible());
        await role('u1');
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await go('profile.html');
    const socials = {facebook:'https://facebook.com/courtconnect',instagram:'https://instagram.com/courtconnect',tiktok:'https://www.tiktok.com/@courtconnect',youtube:'https://youtube.com/@courtconnect',zalo:'https://zalo.me/0912345678'};
    for (const [name,url] of Object.entries(socials)) await page.fill(`[name=${name}]`,url);
    await page.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();
    await page.reload();
    check('All saved social links have vector icons', await page.locator('.profile-summary .social-links a svg').count() === 5);
    for(const [name,url] of Object.entries(socials)) check(`${name} link correct`, await page.locator(`.social-${name}`).getAttribute('href') === url);
    await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0,0); });
    await page.screenshot({path:path.join(out,'polish-profile-dark.png'),fullPage:true});
    await go('profile-public.html?id=u1');
    check('Public profile shows all five social icons', await page.locator('.social-links a svg').count() === 5);
    check('No runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(out,'interface-polish-results.json'),JSON.stringify({checks,errors},null,2));
    console.log(`PASS ${checks.length} interface checks`);
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1;});
