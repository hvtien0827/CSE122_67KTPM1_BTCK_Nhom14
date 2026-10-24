/* Run before CSS to restore the theme without flashing a white page. */
(() => {
  'use strict';
  const key = 'cc.theme';
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
    return `<button type="button" class="icon-btn theme-toggle" data-action="toggle-theme" aria-label="${label}" title="${label}" aria-pressed="${dark}"><i class="bi bi-${dark ? 'sun' : 'moon'}" aria-hidden="true"></i></button>`;
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
  window.Theme = { refresh: () => apply(savedTheme()) };
})();
