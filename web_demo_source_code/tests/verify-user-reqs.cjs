const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const artifactDir = 'C:\\Users\\Tien\\.gemini\\antigravity\\brain\\28331c61-32b5-48f8-9857-8322e6fa4249';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.evaluate(() => {
    CC.login(CC.find('users', 'u1')); // Nguyen Minh Anh (player)
    localStorage.setItem('cc.theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
  });

  await page.goto('http://127.0.0.1:4173/index.html');
  await page.waitForSelector('.hero');

  // Check Requirement 1: No 3-bar icon next to name on top-right, but clicking name/avatar opens menu
  const req1 = await page.evaluate(() => {
    const summary = document.querySelector('.account-menu summary');
    const hasAccountIcon = !!summary.querySelector('.account-menu-icon');
    const headerNav = document.querySelector('.header-nav');
    // check if any button with 3 bars exists inside header-nav
    const hamburgerInHeaderNav = Array.from(headerNav.querySelectorAll('button')).some(b => b.textContent.includes('☰'));
    return { hasAccountIcon, hamburgerInHeaderNav };
  });
  assert.equal(req1.hasAccountIcon, false, 'No account-menu-icon next to user name');
  assert.equal(req1.hamburgerInHeaderNav, false, 'No hamburger button in header-nav');

  // Click name to test menu opens
  await page.click('.account-menu summary');
  const isMenuOpen = await page.evaluate(() => document.querySelector('.account-menu').hasAttribute('open'));
  assert.equal(isMenuOpen, true, 'Account menu opens when clicking user name');
  await page.screenshot({ path: path.join(artifactDir, 'test_req1_account_menu.png') });

  // Close account menu
  await page.click('body');

  // Check Requirement 3: Hero visual badge is gone
  const hasBadge = await page.evaluate(() => !!document.querySelector('.hero-visual-badge'));
  assert.equal(hasBadge, false, 'Hero visual badge removed');

  // Check Requirement 2: Top-left 3-bar button exists
  const hasTopLeftToggle = await page.evaluate(() => !!document.querySelector('.header-left [data-action="toggle-sidebar"]'));
  assert.equal(hasTopLeftToggle, true, 'Top-left sidebar toggle exists');

  // On index: initially sidebar is not open
  let homeSidebarOpen = await page.evaluate(() => document.querySelector('.home-sidebar')?.classList.contains('is-open'));
  assert.equal(homeSidebarOpen, false, 'Home sidebar initially closed');

  // Click top-left button -> sidebar opens!
  await page.click('.header-left [data-action="toggle-sidebar"]');
  homeSidebarOpen = await page.evaluate(() => document.querySelector('.home-sidebar')?.classList.contains('is-open'));
  assert.equal(homeSidebarOpen, true, 'Home sidebar opened after click');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(artifactDir, 'test_req2_sidebar_open.png'), fullPage: false });

  // Click top-left button again -> sidebar closes!
  await page.click('.header-left [data-action="toggle-sidebar"]');
  homeSidebarOpen = await page.evaluate(() => document.querySelector('.home-sidebar')?.classList.contains('is-open'));
  assert.equal(homeSidebarOpen, false, 'Home sidebar closed after second click');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(artifactDir, 'test_req2_sidebar_closed.png'), fullPage: false });

  // On other page: sidebar is open by default, and clicking top-left toggle does NOT close it
  await page.goto('http://127.0.0.1:4173/player-court-search.html');
  await page.waitForSelector('.sidebar');
  const sidebarVisibleOther = await page.evaluate(() => {
    const sb = document.querySelector('.sidebar');
    return sb && window.getComputedStyle(sb).display !== 'none';
  });
  assert.equal(sidebarVisibleOther, true, 'Sidebar on other pages is open/visible by default');

  // Click toggle on other page
  await page.click('.header-left [data-action="toggle-sidebar"]');
  const sidebarStillVisible = await page.evaluate(() => {
    const sb = document.querySelector('.sidebar');
    return sb && window.getComputedStyle(sb).display !== 'none';
  });
  assert.equal(sidebarStillVisible, true, 'Sidebar on other pages does NOT close on toggle click');

  console.log('ALL 3 REQUIREMENTS VERIFIED SUCCESSFULLY!');
  await browser.close();
})();
