(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (x) =>
    String(x ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const icons = {
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    court:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18M6 4v16M18 4v16"/>',
    users:
      '<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    chart: '<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V4"/>',
    bell: '<path d="M5 16h14l-2-4V8a5 5 0 0 0-10 0v4ZM10 20h4"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1v3l-2 2 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-2V7l-3-1-1-3Z"/>',
    home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  };
  const icon = (n) =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.court}</svg>`;
  const btn = (text, action = '', style = '', attrs = '') =>
    `<button type="button" class="btn ${style}" ${action ? `data-action="${action}"` : ''} ${attrs}>${text}</button>`;
  const link = (text, href, style = '') =>
    `<a class="btn ${style}" href="${esc(href)}">${text}</a>`;
  const badge = (status) =>
    `<span class="tag ${esc(status)}">${esc(CC.statuses[status] || status)}</span>`;
  const money = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
  const day = (d) =>
    d
      ? new Date(d + 'T12:00:00').toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        })
      : '—';
  const sport = (id) => CC.find('sports', id)?.name || 'Môn đã xóa';
  const level = (n) => ['', 'Mới chơi', 'Cơ bản', 'Trung bình', 'Khá', 'Nâng cao'][n] || 'Chưa có';
  const option = (value, label, selected) =>
    `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
  const sports = (selected, all = false) =>
    (all ? option('', 'Tất cả môn', selected) : '') +
    CC.db.sports
      .filter((s) => s.status === 'active')
      .map((s) => option(s.id, s.name, selected))
      .join('');
  const levels = (selected, all = false) =>
    (all ? option('', 'Mọi trình độ', selected) : '') +
    [1, 2, 3, 4, 5].map((n) => option(n, level(n), selected)).join('');
  const field = (label, name, type = 'text', value = '', extra = '') =>
    `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const select = (label, name, options, extra = '') =>
    `<label class="field">${label}<select name="${name}" ${extra}>${options}</select></label>`;
  const textarea = (label, name, value = '') =>
    `<label class="field">${label}<textarea name="${name}" maxlength="1000">${esc(value)}</textarea></label>`;
  const empty = (
    title = 'Chưa có dữ liệu',
    description = 'Hãy tạo dữ liệu đầu tiên hoặc thử điều kiện khác.',
    action = ''
  ) =>
    `<div class="empty"><div class="auth-symbol">${icon('search')}</div><h3>${title}</h3><p>${description}</p>${action}</div>`;
  const table = (heads, rows) =>
    rows.length
      ? `<div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      : empty();
  const pageHead = (title, sub, action = '') =>
    `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;
  const stats = (items) =>
    `<div class="stats">${items.map(([label, n]) => `<div class="stat"><span>${label}</span><strong>${n}</strong></div>`).join('')}</div>`;
  let toastTimer;
  function toast(message, error = false) {
    let node = $('#toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'toast';
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.className = 'toast' + (error ? ' error' : '');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (node.hidden = true), 5000);
  }
  function modal(title, body) {
    let d = $('#modal');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'modal';
      document.body.append(d);
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close();
      });
    }
    d.classList.remove('calendar-dialog');
    d.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-btn" data-action="close" aria-label="Đóng">×</button></div><div class="dialog-body">${body}</div>`;
    d.setAttribute('aria-labelledby', 'dialog-title');
    d.showModal();
    return d;
  }
  function close() {
    $('#modal')?.close();
  }
  function confirm(title, text, onYes) {
    const d = modal(
      title,
      `<p class="muted">${text}</p><div class="actions">${btn('Quay lại', 'close', 'secondary')}${btn('Xác nhận', 'confirm')}</div>`
    );
    $('[data-action=confirm]', d).onclick = () => {
      try {
        onYes();
        close();
      } catch (e) {
        toast(e.message, true);
      }
    };
  }
  function formDialog(title, fields, submit, onSave, successMessage = 'Đã lưu thay đổi.') {
    const d = modal(
      title,
      `<form id="dialog-form"><div class="form-error notice error" role="alert" hidden></div>${fields}<div class="actions">${btn('Hủy', 'close', 'secondary')}<button class="btn" type="submit">${submit}</button></div></form>`
    );
    $('#dialog-form', d).onsubmit = async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      try {
        await onSave(Object.fromEntries(new FormData(f)), f);
        close();
        if (window.renderPage) renderPage();
        toast(successMessage);
      } catch (err) {
        const n = $('.form-error', f);
        n.textContent = err.message;
        n.hidden = false;
        n.scrollIntoView({ block: 'nearest' });
      }
    };
  }
  function requireLogin(href) {
    if (CC.me()) return true;
    sessionStorage.setItem('cc.next', href || location.pathname.split('/').pop() + location.search);
    modal(
      'Đăng nhập để tiếp tục',
      `<div class="auth-symbol">${icon('shield')}</div><p class="muted">Bạn cần đăng nhập trước khi tạo trận, tham gia trận đấu, đặt sân.</p><div class="actions">${btn('Để sau', 'close', 'secondary')}${link('Đăng nhập', 'login.html')}</div>`
    );
    return false;
  }
  const navs = {
    player: [
      ['player-court-search.html', 'Tìm sân', 'search'],
      ['player-open-matches.html', 'Tìm trận đấu', 'users'],
      ['my-activities.html', 'Hoạt động của tôi', 'calendar'],
      ['player-match-create.html', 'Tạo trận đấu', 'court'],
      ['Join-Requests.html', 'Yêu cầu tham gia', 'users'],
      ['player-skill-match.html', 'Ghép trận thông minh', 'chart'],
    ],
    venue: [
      ['venue-booking-management.html', 'Quản lý đặt sân', 'calendar'],
      ['venue-court-management.html', 'Quản lý sân', 'court'],
      ['Revenue.html', 'Doanh thu', 'chart'],
    ],
    admin: [
      ['Admin-Dashboard.html', 'Quản lý tổng', 'chart'],
      ['Court-Owner-Approval.html', 'Duyệt chủ sân', 'court'],
      ['Report-Management.html', 'Quản lý báo cáo', 'shield'],
      ['System-Notifications.html', 'Gửi thông báo', 'bell'],
    ],
  };
  const homeFor = (role) => navs[role]?.[0][0] || 'index.html';
  const brand =
    '<a class="brand" href="index.html"><span class="brand-icon">C</span>CourtConnect</a>';
  function header(auth = false) {
    const u = CC.me();
    return `<a class="skip" href="#main">Bỏ qua điều hướng</a><header class="header ${!u && !auth ? 'guest-header' : ''}"><div class="container header-inner">${brand}${auth ? `<nav class="auth-header-nav" aria-label="Điều hướng tài khoản">${Theme.button()}<a href="index.html" class="small">← Về trang chủ</a></nav>` : `<nav class="header-nav" aria-label="Điều hướng chính">${Theme.button()}${u ? `<a class="optional" href="${homeFor(u.role)}">${CC.roles[u.role]}</a><a class="icon-btn" href="notifications.html" aria-label="Thông báo">${icon('bell')}</a><a href="profile.html" class="row"><span class="avatar">${esc(u.name.split(' ').pop()[0])}</span><span class="user-name small">${esc(u.name)}</span></a>${btn('☰', 'menu', 'secondary mobile-toggle', 'aria-label="Mở menu" aria-expanded="false" aria-controls="site-navigation"')}` : `<a class="optional" href="player-court-search.html">Tìm sân</a><a class="optional" href="player-open-matches.html">Tìm trận đấu</a>${link('Đăng nhập', 'login.html', 'ghost')}${link('Đăng ký', 'register.html')}`}</nav>`}</div></header>`;
  }
  function footer(auth = false) {
    return auth
      ? `<footer class="auth-footer"><span>© 2026 CourtConnect. Tất cả quyền được bảo lưu.</span><nav><a href="privacy.html">Điều khoản sử dụng</a><a href="privacy.html">Chính sách bảo mật</a><a href="help.html">Hỗ trợ khách hàng</a></nav></footer>`
      : `<footer class="footer"><div class="container"><div class="footer-grid"><div>${brand}<p>Kết nối người yêu thể thao, cùng nhau ra sân và tạo nên những trận đấu đáng nhớ.</p></div><div><h3>Tính năng</h3><a href="player-skill-match.html">Tìm người chơi</a><a href="player-match-create.html">Tạo trận đấu</a><a href="player-court-search.html">Sân gần bạn</a><a href="player-open-matches.html">Tìm trận đấu</a></div><div><h3>Thông tin</h3><a href="help.html">Trung tâm hỗ trợ</a><a href="privacy.html">Điều khoản sử dụng</a><a href="privacy.html">Chính sách bảo mật</a><a href="login.html">Khám phá 3 vai trò</a></div></div><div class="footer-bottom"><span>© 2026 CourtConnect</span><span>Nguyên mẫu học phần CSE122 · Dữ liệu mô phỏng</span></div></div></footer>`;
  }
  function shell(content, auth = false) {
    const u = CC.me(),
      page = location.pathname.split('/').pop();
    if (auth) {
      document.body.innerHTML =
        header(true) + `<main id="main" class="auth-main">${content}</main>` + footer(true);
      return;
    }
    const nav = navs[u?.role] || navs.player;
    document.body.innerHTML =
      header() +
      `<div class="workspace"><aside id="site-navigation" class="sidebar" aria-label="Chức năng"><div class="sidebar-label">${u ? CC.roles[u.role] : 'Khám phá'}</div>${nav.map(([href, label, i]) => `<a href="${href}" class="${page === href ? 'active' : ''}" ${page === href ? 'aria-current="page"' : ''}>${icon(i)}${label}</a>`).join('')}<a href="chat.html">${icon('users')}Trò chuyện</a><div class="sidebar-label mt">Tài khoản</div><a href="profile.html">${icon('users')}Hồ sơ của tôi</a><a href="notifications.html">${icon('bell')}Thông báo</a><a href="settings.html">${icon('settings')}Cài đặt</a><a href="help.html">${icon('shield')}Trợ giúp</a><div class="sidebar-bottom"><div class="role-note">${u ? `Đang dùng vai trò<br><strong>${CC.roles[u.role]}</strong>` : 'Đăng nhập để lưu hoạt động và kết nối bạn chơi.'}</div>${u ? btn('Đăng xuất / đổi vai trò', 'logout', 'ghost full mt') : link('Đăng nhập', 'login.html', 'full mt')}</div></aside><main id="main" class="page"><div class="breadcrumbs">CourtConnect / ${u ? CC.roles[u.role] : 'Khám phá'}</div>${CC.loadError ? `<div class="notice error">${esc(CC.loadError)}</div>` : ''}${content}</main></div>`;
  }
  function courtCard(c) {
    return `<article class="card"><img class="card-image" src="assets/images/figma-${c.image ?? 4}.jpg" alt="${esc(c.name)}" loading="lazy"><div class="card-body"><div class="row mb"><span class="tag">${esc(sport(c.sportId))}</span><span class="muted small spacer"></span><span class="small green" title="Đánh giá mẫu dùng để minh họa">${(() => {
      const rows = CC.db.courtReviews?.filter((r) => r.courtId === c.id) || [];
      return rows.length
        ? '★ ' +
            (rows.reduce((n, r) => n + r.stars, 0) / rows.length).toFixed(1) +
            ' · ' +
            rows.length +
            ' đánh giá'
        : 'Chưa có đánh giá';
    })()}</span></div><h3>${esc(c.name)}</h3><p class="meta">${icon('pin')}${esc(c.location)}</p><div class="row"><strong class="green">${money(c.price)}<small class="muted"> / giờ</small></strong></div>${link('Xem sân & đặt lịch', `player-court-search.html?id=${c.id}`, 'full')}</div></article>`;
  }
  function matchCard(m) {
    const s = CC.find('slots', m.slotId),
      c = CC.courtFor(s);
    if (!s || !c) return '';
    return `<article class="card"><div class="card-body"><div class="row mb"><span class="tag">${esc(sport(c.sportId))}</span><span class="spacer"></span><span class="small muted">${m.playerIds.length}/${m.capacity} người</span></div><h3>${esc(m.name)}</h3><p class="meta">${icon('pin')}${esc(c.name)}</p><p class="meta">${icon('calendar')}${day(s.date)}</p><p class="meta">${icon('clock')}${s.start} – ${s.end}</p><div class="divider"></div><div class="row"><span class="tag">Trình độ ${level(m.level)}</span>${m.status !== 'open' ? badge(m.status) : ''}</div>${link(m.playerIds.length >= m.capacity ? 'Xem trận · Đã đủ người' : 'Xem trận & tham gia', `player-open-matches.html?id=${m.id}`, 'full')}</div></article>`;
  }
  // The mobile navigation is a non-modal dropdown anchored to its trigger.
  const mobileViewport = window.matchMedia('(max-width: 760px)');
  function positionMobileMenu() {
    const trigger = $('[data-action="menu"]');
    const menu = $('#site-navigation');
    if (!trigger || !menu || !mobileViewport.matches) return;
    const rect = trigger.getBoundingClientRect();
    const viewportBottom = window.visualViewport
      ? window.visualViewport.offsetTop + window.visualViewport.height
      : window.innerHeight;
    const top = rect.bottom + 10;
    menu.style.setProperty('--mobile-menu-top', `${top}px`);
    menu.style.setProperty(
      '--mobile-menu-width',
      `${Math.min(320, Math.max(0, rect.right - 12))}px`
    );
    menu.style.setProperty(
      '--mobile-menu-right',
      `${Math.max(12, window.innerWidth - rect.right)}px`
    );
    menu.style.setProperty('--mobile-menu-height', `${Math.max(0, viewportBottom - top - 12)}px`);
  }
  function setMobileMenu(open, moveFocus = false) {
    const trigger = $('[data-action="menu"]');
    const menu = $('#site-navigation');
    if (!trigger || !menu) return;
    open = open && mobileViewport.matches;
    if (open) positionMobileMenu();
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    trigger.textContent = open ? '×' : '☰';
    if (moveFocus) {
      if (open) menu.querySelector('a, button')?.focus({ preventScroll: true });
      else trigger.focus({ preventScroll: true });
    }
  }
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('#site-navigation, [data-action="menu"]')) setMobileMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('#site-navigation a, #site-navigation button')) setMobileMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#site-navigation')?.classList.contains('is-open')) {
      event.preventDefault();
      setMobileMenu(false, true);
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('#site-navigation, [data-action="menu"]')) setMobileMenu(false);
  });
  window.addEventListener('resize', () => {
    if (!mobileViewport.matches) setMobileMenu(false);
    else positionMobileMenu();
  });
  window.addEventListener('scroll', positionMobileMenu, { passive: true });
  window.visualViewport?.addEventListener('resize', positionMobileMenu);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    if (a.dataset.action === 'close') close();
    if (a.dataset.action === 'logout') {
      CC.logout();
      location.href = 'login.html';
    }
    if (a.dataset.action === 'menu') {
      setMobileMenu(!$('.sidebar')?.classList.contains('is-open'), e.detail === 0);
    }
    if (a.dataset.action === 'password') {
      const input = a.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      a.textContent = input.type === 'password' ? 'Hiện' : 'Ẩn';
    }
  });
  function responsiveTables(root = document) {
    root.querySelectorAll('.table-wrap').forEach((wrap) => {
      wrap.classList.add('mobile-records');
      const headers = [...wrap.querySelectorAll('thead th')].map((th) => th.textContent);
      wrap.querySelectorAll('tbody tr').forEach((row) =>
        [...row.cells].forEach((cell, i) => {
          cell.dataset.label = headers[i];
        })
      );
    });
  }
  window.UI = {
    responsiveTables,
    $,
    $$,
    esc,
    icon,
    btn,
    link,
    badge,
    money,
    day,
    sport,
    level,
    option,
    sports,
    levels,
    field,
    select,
    textarea,
    empty,
    table,
    pageHead,
    stats,
    toast,
    modal,
    close,
    confirm,
    formDialog,
    requireLogin,
    homeFor,
    header,
    footer,
    shell,
    courtCard,
    matchCard,
  };
})();
