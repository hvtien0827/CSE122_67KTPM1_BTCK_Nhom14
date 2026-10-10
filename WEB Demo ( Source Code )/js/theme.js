/* Run before CSS to restore the theme without flashing a white page. */
(() => {
  'use strict';
  const key = 'cc.theme';
  const moon = '<path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z"/>';
  const sun =
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  function savedTheme() {
    try {
      return localStorage.getItem(key) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
  function markup() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const label = dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
    return `<button type="button" class="icon-btn theme-toggle" data-action="toggle-theme" aria-label="${label}" title="${label}" aria-pressed="${dark}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dark ? sun : moon}</svg></button>`;
  }
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
      const focused = document.activeElement === button;
      const template = document.createElement('template');
      template.innerHTML = markup();
      const replacement = template.content.firstElementChild;
      button.replaceWith(replacement);
      if (focused) replacement.focus();
    });
  }
  apply(savedTheme());
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-action="toggle-theme"]')) return;
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    try {
      localStorage.setItem(key, theme);
    } catch {
      /* The toggle still works for this page. */
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) apply(savedTheme());
  });
  window.Theme = { button: markup };
})();
