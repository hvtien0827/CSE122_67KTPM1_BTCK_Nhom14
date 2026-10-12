const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'tests', 'artifacts');
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [],
    results = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(base);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  const pages = JSON.parse(fs.readFileSync(path.join(root, 'docs/pages.json'), 'utf8'));
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
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of Object.keys(pages)) {
      let role = name.split('-')[0];
      if (!['player', 'venue', 'organizer', 'admin'].includes(role)) role = 'player';
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
      ].includes(name);
      await page.evaluate(
        ({ role, guest, auth }) => {
          CC.logout();
          if (!guest && !auth) CC.login(CC.db.users.find((u) => u.role === role));
          if (auth)
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
        { role, guest: publicPages.includes(name), auth }
      );
      const suffix =
        {
          'court-detail': '?id=c1',
          'profile-public': '?id=u1',
          'match-detail': '?id=m1',
          'organizer-event-detail': '?id=e1',
          booking: '?slot=s-c1-2-16',
        }[name] || '';
      await page.goto(`${base}/${name}.html${suffix}`);
      await page.waitForSelector('h1');
      await page.evaluate(async () => { const images=[...document.images]; images.forEach(i=>i.loading='eager'); await Promise.all(images.map(i=>i.decode().catch(()=>{}))); });
      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        title: document.querySelector('h1').textContent,
        error: document.body.textContent.includes('Không thể tải trang:'),
      }));
      results.push({ page: name, width, ...info });
      if (info.overflow || info.error) console.log('FAIL', name, width, info);
      if (
        [
          'index',
          'login',
          'player-court-search',
          'player-open-matches',
          'venue-booking-management',
          'organizer-team-lineup',
          'admin-sports-report',
        ].includes(name)
      )
        await page.screenshot({ path: path.join(out, `${name}-${width}.png`), fullPage: true });
    }
  }
  fs.writeFileSync(
    path.join(out, 'smoke-results.json'),
    JSON.stringify({ results, errors }, null, 2)
  );
  console.log(
    JSON.stringify(
      {
        pages: results.length,
        layoutFailures: results.filter((r) => r.overflow || r.error),
        errors,
      },
      null,
      2
    )
  );
  await browser.close();
  if (errors.length || results.some((r) => r.overflow || r.error)) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
