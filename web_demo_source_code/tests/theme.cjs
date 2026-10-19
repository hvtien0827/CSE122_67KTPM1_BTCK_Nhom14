const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:5500';
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const context = await browser.newContext();
  const p = await context.newPage();
  const errors = [],
    results = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(base + '/index.html');
  await p.waitForSelector('.theme-toggle');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'light');
  await p.locator('.theme-toggle').click();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await p.locator('.theme-toggle').getAttribute('aria-pressed'), 'true');
  await p.reload();
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await p.goto(base + '/login.html');
  await p.waitForSelector('.theme-toggle');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await p.locator('.theme-toggle').focus();
  await p.keyboard.press('Space');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'light');
  assert.ok(await p.locator('.theme-toggle').evaluate((b) => document.activeElement === b));
  const other = await context.newPage();
  await other.goto(base + '/index.html');
  await other.waitForSelector('.theme-toggle');
  await p.locator('.theme-toggle').click();
  await other.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await other.close();
  const pages = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/pages.json'), 'utf8'));
  const publicPages = [
    'index',
    'player-court-search',
    'player-open-matches',
    'court-detail',
    'match-detail',
    'profile-public',
    'help',
    'terms',
    'privacy',
    '403',
    '404',
  ];
  const auth = [
    'login',
    'register',
    'forgot-password',
    'verification-sent',
    'verify-email',
    'registration-success',
    'recovery-sent',
    'verify-reset',
    'reset-password',
    'reset-success',
  ];
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: 960 });
    for (const theme of ['light', 'dark']) {
      for (const name of Object.keys(pages)) {
        let role = name.split('-')[0];
        if (!['player', 'venue', 'organizer', 'admin'].includes(role)) role = 'player';
        await p.evaluate(
          ({ role, guest, theme }) => {
            CC.logout();
            if (!guest) CC.login(CC.db.users.find((u) => u.role === role));
            localStorage.setItem('cc.theme', theme);
            sessionStorage.setItem(
              'cc.pending',
              JSON.stringify({
                email: 'player@courtconnect.demo',
                type: 'reset',
                code: '482915',
                expires: Date.now() + 300000,
                resend: Date.now() + 60000,
                verified: true,
              })
            );
          },
          { role, guest: publicPages.includes(name) || auth.includes(name), theme }
        );
        const suffix =
          {
            'court-detail': '?id=c1',
          'profile-public': '?id=u1',
            'match-detail': '?id=m1',
            'organizer-event-detail': '?id=e1',
            booking: '?slot=s-c1-2-16',
          }[name] || '';
        await p.goto(base + '/' + name + '.html' + suffix);
        await p.waitForSelector('h1');
        const info = await p.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          theme: document.documentElement.dataset.theme,
          toggles: document.querySelectorAll('.theme-toggle').length,
          error: document.body.textContent.includes('Không thể tải trang:'),
          bg: getComputedStyle(document.documentElement).backgroundColor,
          small: getComputedStyle(document.querySelector('.small,.tag,small') || document.body)
            .fontSize,
        }));
        results.push({ page: name, width, ...info });
        assert.ok(!info.overflow, name + ' ' + width + ' ' + theme + ' overflow');
        assert.ok(!info.error, name + ' runtime');
        assert.equal(info.theme, theme);
        assert.equal(info.toggles, 1);
        // Palette hiện hành: #0a0f0c (dark) và #f8faf8 (light).
        assert.equal(info.bg, theme === 'dark' ? 'rgb(10, 15, 12)' : 'rgb(248, 250, 248)');
        if (
          theme === 'dark' &&
          ['help', 'player-skill-match', 'login', 'admin-sports-report', 'index'].includes(name)
        ) {
          await p.screenshot({
            path: path.join(__dirname, 'artifacts', `${name}-${width}-dark.png`),
            fullPage: true,
          });
        }
      }
    }
  }
  await p.setViewportSize({ width: 1440, height: 960 });
  await p.evaluate(() => {
    CC.login(CC.db.users.find((u) => u.role === 'player'));
    localStorage.setItem('cc.theme', 'dark');
  });
  await p.goto(base + '/player-skill-match.html');
  await p.waitForSelector('.ai-banner');
  assert.ok(!(await p.textContent('.ai-banner')).includes('Bạn luôn kiểm soát quyết định'));
  await p.screenshot({
    path: path.join(__dirname, 'artifacts', 'skill-dark-desktop.png'),
    fullPage: true,
  });
  await p.locator('.theme-toggle').click();
  await p.screenshot({
    path: path.join(__dirname, 'artifacts', 'skill-light-desktop.png'),
    fullPage: true,
  });
  await p.goto(base + '/help.html');
  assert.ok(
    await p
      .locator('.demo-details summary')
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize) >= 15)
  );
  await p.evaluate(() => {
    CC.logout();
    localStorage.setItem('cc.theme', 'dark');
  });
  await p.goto(base + '/player-open-matches.html');
  const button = p.locator('.sidebar-bottom a.btn');
  assert.equal(await button.evaluate((e) => getComputedStyle(e).color), 'rgb(255, 255, 255)');
  assert.equal(
    await button.evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(14, 107, 55)'
  );
  await p.click('[data-action=create-match]');
  assert.equal(
    await p.locator('dialog').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(18, 25, 20)'
  );
  await p.screenshot({
    path: path.join(__dirname, 'artifacts', 'dialog-dark.png'),
    fullPage: true,
  });
  assert.equal(errors.length, 0);
  fs.writeFileSync(
    path.join(__dirname, 'artifacts', 'theme-results.json'),
    JSON.stringify(
      { pages: results.length, errors, results, persistence: true, keyboard: true, crossTab: true },
      null,
      2
    )
  );
  console.log(
    JSON.stringify({
      pageChecks: results.length,
      errors,
      persistence: true,
      keyboard: true,
      crossTab: true,
      banner: true,
      smallFonts: true,
      dialog: true,
      greenButtons: true,
    })
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
