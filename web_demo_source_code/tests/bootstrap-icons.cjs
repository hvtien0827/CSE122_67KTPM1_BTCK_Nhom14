const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const cdn = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/bootstrap-icons.min.css';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const names = new Set();
for (const file of htmlFiles) {
  const html = read(file);
  assert.equal(html.split(cdn).length - 1, 1, file + ': one pinned CDN');
  assert.ok(html.indexOf(cdn) < html.indexOf('href="css/common.css"'), file + ': style order');
  assert.ok(html.includes('href="assets/favicon.png" type="image/png"'), file + ': PNG favicon');
  for (const m of html.matchAll(/class="bi bi-([\w-]+)"/g)) names.add(m[1]);
}
for (const dir of ['.', 'js', 'css', 'assets']) {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const file = path.join(dir, name);
    assert.ok(!/\.svg$/i.test(name), file + ': no SVG asset');
    if (/\.(html|js|css)$/.test(name)) {
      assert.ok(
        !/<svg\b|<path\b|image\/svg|favicon\.svg/i.test(read(file)),
        file + ': no SVG markup'
      );
    }
  }
}
assert.ok(
  fs
    .readFileSync(path.join(root, 'assets/favicon.png'))
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
);
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  const page = await browser.newPage();
  const errors = [],
    network = [],
    results = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.url().startsWith('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/'))
      network.push({ url: r.url(), status: r.status() });
  });
  page.on('requestfailed', (r) => {
    if (r.url().includes('bootstrap-icons@')) errors.push(r.failure().errorText);
  });
  const checkGlyphs = async () => {
    const missing = await page.evaluate(async () => {
      await document.fonts.load('20px "bootstrap-icons"');
      return [...document.querySelectorAll('.bi')]
        .filter((e) => {
          const s = getComputedStyle(e, '::before');
          return (
            s.fontFamily !== 'bootstrap-icons' ||
            !s.content ||
            ['none', 'normal', '""'].includes(s.content) ||
            e.getAttribute('aria-hidden') !== 'true'
          );
        })
        .map((e) => e.className);
    });
    assert.deepEqual(missing, [], page.url() + ': valid decorative font glyphs');
    assert.equal(await page.locator('svg').count(), 0, 'no SVG in live DOM');
  };
  try {
    await page.goto(base + '/index.html');
    const helpers = await page.evaluate(() =>
      [
        'menu',
        'logout',
        'search',
        'court',
        'users',
        'calendar',
        'pin',
        'clock',
        'chart',
        'bell',
        'settings',
        'home',
        'check',
        'shield',
        'close',
        'prev',
        'next',
        'arrowLeft',
        'arrowRight',
        'star',
        'starEmpty',
        'ai',
        'plus',
      ].map((n) => UI.icon(n))
    );
    // Exercise every statically used icon, social icon and dynamic helper, even in hidden templates.
    await page.evaluate(
      ({ names, helpers }) => {
        const probe = document.createElement('div');
        probe.id = 'icon-probe';
        probe.innerHTML =
          helpers.join('') +
          [...names, 'sun', 'moon', 'facebook', 'instagram', 'tiktok', 'youtube', 'chat-dots']
            .map((n) => `<i class="bi bi-${n}" aria-hidden="true"></i>`)
            .join('');
        document.body.append(probe);
      },
      { names: [...names], helpers }
    );
    await checkGlyphs();
    await page.locator('#icon-probe').evaluate((e) => e.remove());
    const pages = JSON.parse(read('docs/pages.json'));
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 960 });
        for (const name of Object.keys(pages)) {
          const role = /^(venue|organizer|admin)-/.exec(name)?.[1] || 'player';
          const auth =
            /^(login|register|forgot-password|verification-sent|verify-email|registration-success|recovery-sent|verify-reset|reset-password|reset-success)$/.test(
              name
            );
          await page.evaluate(
            ({ role, theme, auth }) => {
              CC.logout();
              if (!auth) CC.login(CC.db.users.find((u) => u.role === role));
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
            { role, theme, auth }
          );
          const query =
            {
              'court-detail': '?id=c1',
              'profile-public': '?id=u1',
              'match-detail': '?id=m1',
              'organizer-event-detail': '?id=e1',
              booking: '?slot=s-c1-2-16',
            }[name] || '';
          await page.goto(`${base}/${name}.html${query}`);
          await page.waitForSelector('h1');
          await checkGlyphs();
          assert.equal(await page.getAttribute('html', 'data-theme'), theme);
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            name + ': fits viewport'
          );
          results.push({ name, width, theme });
        }
      }
    const homes = {
      player: 'player-open-matches',
      venue: 'venue-court-management',
      organizer: 'organizer-event-management',
      admin: 'admin-sport-management',
    };
    for (const [role, home] of Object.entries(homes)) {
      await page.evaluate((role) => CC.login(CC.db.users.find((u) => u.role === role)), role);
      await page.goto(`${base}/${home}.html`);
      const toggle = page.locator('[data-action=toggle-sidebar]');
      await toggle.click();
      assert.equal(
        await toggle.getAttribute('aria-expanded'),
        'true',
        role + ': mobile menu opens'
      );
      assert.equal(await toggle.locator('.bi-x-lg').count(), 1);
      await toggle.click();
      assert.equal(
        await toggle.getAttribute('aria-expanded'),
        'false',
        role + ': mobile menu closes'
      );
      assert.equal(await toggle.locator('.bi-list').count(), 1);
      await page.locator('.theme-toggle').click();
      assert.equal(await page.locator('.theme-toggle .bi-moon').count(), 1, 'dark to light icon');
      await page.locator('.theme-toggle').click();
      assert.equal(await page.locator('.theme-toggle .bi-sun').count(), 1, 'light to dark icon');
      await checkGlyphs();
      await page.setViewportSize({ width: 1440, height: 960 });
      assert.equal(await toggle.isVisible(), false, role + ': workspace desktop menu stays hidden');
      await page.setViewportSize({ width: 390, height: 960 });
    }
    assert.ok(
      network.some((r) => r.url === cdn && r.status === 200),
      'real CDN stylesheet loaded'
    );
    assert.ok(
      network.some((r) => /\.woff2?(\?|$)/.test(r.url) && r.status === 200),
      'real CDN font loaded'
    );
    assert.deepEqual(errors, []);
    fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
    fs.writeFileSync(
      path.join(__dirname, 'artifacts/bootstrap-icons-results.json'),
      JSON.stringify(
        {
          html: htmlFiles.length,
          pageChecks: results.length,
          staticGlyphs: names.size,
          network: [...new Map(network.map(r => [r.url, r])).values()],
          errors,
        },
        null,
        2
      )
    );
    console.log(
      `PASS: ${htmlFiles.length} HTML; ${results.length} page/theme/viewport checks; all icon glyphs load from real CDN; four mobile menus and theme toggles work.`
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
