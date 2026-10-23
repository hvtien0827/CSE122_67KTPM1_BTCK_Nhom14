// Kiểm tra HTML là nguồn bố cục, thay đổi HTML không bị controller ghi đè.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
const dependencies = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/page-dependencies.json'), 'utf8')
);
const cssFiles = [
  'common.css',
  'navigation.css',
  'date-picker.css',
  'player.css',
  'venue.css',
  'organizer.css',
  'admin.css',
  'auth.css',
  'home.css',
];

(async () => {
  assert.equal(pages.length, 43);
  assert.deepEqual(
    fs
      .readdirSync(path.join(root, 'css'))
      .filter((name) => name.endsWith('.css'))
      .sort(),
    cssFiles.sort()
  );
  for (const name of pages) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    assert.match(html, /<main\b/, name);
    assert.match(html, /<h1\b/, name);
    assert.match(html, /data-page-view=/, name);
    assert.match(html, /href="css\/common.css"/, name);
    assert.equal(
      (html.match(/rel="stylesheet"/g) || []).length,
      dependencies[name].styles.length,
      name
    );
    assert.ok(!html.includes('css/style.css'), name);
    assert.ok(!html.includes('Đang mở CourtConnect'), name);
  }
  for (const name of fs.readdirSync(path.join(root, 'js'))) {
    assert.doesNotMatch(
      fs.readFileSync(path.join(root, 'js', name), 'utf8'),
      /document\.body\.innerHTML\s*=/,
      name
    );
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
  });
  try {
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const page = await noJS.newPage();
    for (const name of [
      'index',
      'login',
      'register',
      'player-court-search',
      'player-open-matches',
      'player-match-create',
      'venue-court-management',
      'admin-user-management',
      'organizer-event-management',
      'help',
      'privacy',
      'terms',
    ]) {
      await page.goto(`${base}/${name}.html`);
      assert.ok(await page.locator('h1').isVisible(), `${name}: tiêu đề có sẵn trong HTML`);
      assert.ok((await page.locator('h1').innerText()).trim().length > 0, name);
    }
    await page.goto(`${base}/login.html`);
    assert.equal(await page.locator('#auth-form [name=email]').count(), 1);
    assert.equal(await page.locator('#auth-form [name=password]').count(), 1);
    await noJS.close();

    const context = await browser.newContext();
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', (error) => errors.push(error.message));
    // Simulate a teammate editing just the HTML file, without editing JavaScript.
    await p.route('**/player-court-search.html', async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        '<h1>Tìm và đặt sân</h1>',
        '<h1>Tiêu đề do nhóm sửa trong HTML</h1>'
      );
      await route.fulfill({ response, body });
    });
    await p.goto(`${base}/player-court-search.html`);
    assert.equal(await p.locator('h1').innerText(), 'Tiêu đề do nhóm sửa trong HTML');
    await p.evaluate(() => {
      window.originalHeading = document.querySelector('h1');
    });
    await p.fill('[name=search]', 'không có sân nào phù hợp');
    await p.locator('#filters button[type=submit], #filters button:not([type])').click();
    assert.equal(await p.locator('.court-card').count(), 0);
    assert.ok(await p.evaluate(() => window.originalHeading === document.querySelector('h1')));
    await p.click('[data-action=clear-filter]');
    assert.ok((await p.locator('.court-card').count()) > 0);
    assert.equal(await p.locator('h1').innerText(), 'Tiêu đề do nhóm sửa trong HTML');
    // Persisted form data must remain escaped after moving bindings into HTML attributes.
    await p.evaluate(() => {
      CC.login(CC.find('users', 'u1'));
      CC.transaction(() => {
        CC.me().name = 'Tên "thử" <script> & kiểm tra';
      });
    });
    await p.goto(`${base}/profile.html`);
    assert.equal(await p.inputValue('[name=name]'), 'Tên "thử" <script> & kiểm tra');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      'PASS: 43 static HTML pages, nine CSS files, no-JS layouts, persistent HTML edits, dynamic filters and escaped form values.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
