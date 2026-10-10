const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs'),
  assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  try {
    const p = await b.newPage();
    const errors = [],
      failures = [],
      links = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/index.html');
    await p.waitForFunction(() => !!window.Domain);
    const pages = JSON.parse(fs.readFileSync(root + '/docs/pages.json', 'utf8'));
    assert.equal(fs.readdirSync(root).filter((f) => f.endsWith('.html')).length, 28);
    for (const theme of ['light', 'dark'])
      for (const width of [320, 390, 768, 1440]) {
        await p.setViewportSize({ width, height: 900 });
        for (const name of Object.keys(pages)) {
          const role = /^(Admin|Court-Owner|Report-Management|System-)/.test(name)
            ? 'admin'
            : name.startsWith('venue-') || name === 'Revenue'
              ? 'venue'
              : 'player';
          await p.evaluate(
            ({ role, theme }) => {
              CC.login(CC.db.users.find((u) => u.email === role + '@courtconnect.demo'));
              localStorage.setItem('cc.theme', theme);
            },
            { role, theme }
          );
          await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/' + name + '.html');
          await p.waitForSelector('h1');
          const info = await p.evaluate(() => ({
            error: document.body.textContent.includes('Không thể tải trang'),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          }));
          if (info.error || info.overflow) failures.push({ name, width, theme, ...info });
          for (const href of await p
            .locator('a[href]')
            .evaluateAll((es) => es.map((e) => e.getAttribute('href')))) {
            if (
              href.includes('.html') &&
              !/^(https?:|#)/.test(href) &&
              !Object.keys(pages)
                .map((x) => x + '.html')
                .includes(href.split('?')[0])
            )
              links.push({ name, href });
          }
        }
      }
    console.log(
      JSON.stringify(
        { checks: 224, errors: [...new Set(errors)], failures, brokenLinks: links },
        null,
        2
      )
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    assert.deepEqual(links, []);
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
