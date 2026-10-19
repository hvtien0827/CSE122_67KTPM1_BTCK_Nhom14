(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  const icons = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    logout: '<path d="M9 4H4v16h5M13 8l4 4-4 4M8 12h12"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    court: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18M6 4v16M18 4v16"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    chart: '<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V4"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1v3l-2 2 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-2V7l-3-1-1-3Z"/>',
    home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>'
  };
  const icon = n => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.court}</svg>`;
  const btn = (text, action = '', style = '', attrs = '') => `<button type="button" class="btn ${style}" ${action ? `data-action="${action}"` : ''} ${attrs}>${text}</button>`;
  const link = (text, href, style = '') => `<a class="btn ${style}" href="${esc(href)}">${text}</a>`;
  const badge = status => `<span class="tag ${esc(status)}">${esc(CC.statuses[status] || status)}</span>`;
  const money = n => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
  const day = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  }) : '—';
  const sport = id => CC.find('sports', id)?.name || 'Môn đã xóa';
  const level = n => ['', 'Mới chơi', 'Cơ bản', 'Trung bình', 'Khá', 'Nâng cao'][n] || 'Chưa có';
  const option = (value, label, selected) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
  const sports = (selected, all = false) => (all ? option('', 'Tất cả môn', selected) : '') + CC.db.sports.filter(s => s.status === 'active').map(s => option(s.id, s.name, selected)).join('');
  const levels = (selected, all = false) => (all ? option('', 'Mọi trình độ', selected) : '') + [1, 2, 3, 4, 5].map(n => option(n, level(n), selected)).join('');
  const field = (label, name, type = 'text', value = '', extra = '') => `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const select = (label, name, options, extra = '') => `<label class="field">${label}<select name="${name}" ${extra}>${options}</select></label>`;
  const textarea = (label, name, value = '') => `<label class="field">${label}<textarea name="${name}" maxlength="1000">${esc(value)}</textarea></label>`;
  const empty = (title = 'Chưa có dữ liệu', description = 'Hãy tạo dữ liệu đầu tiên hoặc thử điều kiện khác.', action = '') => `<div class="empty"><div class="auth-symbol">${icon('search')}</div><h3>${title}</h3><p>${description}</p>${action}</div>`;
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
    toastTimer = setTimeout(() => node.hidden = true, 5000);
  }
  function modal(title, body) {
    const d = $('#modal');
    if (!d) throw new Error('Thiếu dialog trong HTML');
    d.classList.remove('calendar-dialog');
    $('#dialog-title', d).innerHTML = title;
    const content = $('.dialog-body', d);
    window.DatePicker?.close();
    content.replaceChildren();
    if (body instanceof Node) content.append(body);else content.innerHTML = body;
    window.DatePicker?.enhance(d);
    if (!d.open) d.showModal();
    return d;
  }
  function close() {
    $('#modal')?.close();
  }
  function confirm(title, text, onYes) {
    const d = modal(title, Views.fragment("ui-confirm-dialog-1", {
      "text-1": () => text
    }));
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
    const form = document.querySelector('#dialog-form-template').content.cloneNode(true);
    const fieldsRoot = form.querySelector('[data-dialog-fields]');
    if (fields instanceof Node) fieldsRoot.append(fields);else fieldsRoot.innerHTML = fields;
    form.querySelector('[type=submit]').textContent = submit;
    const d = modal(title, form);
    $('#dialog-form', d).onsubmit = async e => {
      e.preventDefault();
      const f = e.currentTarget;
      const submitButton = f.querySelector('[type=submit]');
      if (submitButton.disabled) return;
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      try {
        await onSave(Object.fromEntries(new FormData(f)), f);
        close();
        if (window.renderPage) renderPage();
        toast(successMessage);
      } catch (err) {
        const n = $('.form-error', f);
        n.textContent = err.message;
        n.hidden = false;
        n.scrollIntoView({
          block: 'nearest'
        });
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    };
  }
  function requireLogin(href) {
    if (CC.me()) return true;
    sessionStorage.setItem('cc.next', href || location.pathname.split('/').pop() + location.search);
    modal('Đăng nhập để tiếp tục', Views.fragment("ui-requireLogin-dialog-2", {}));
    return false;
  }
  const navs = {
    player: [['player-court-search.html', 'Tìm sân', 'search'], ['player-open-matches.html', 'Tìm trận đấu', 'users'], ['player-my-sports.html', 'Hoạt động của tôi', 'calendar'], ['player-skill-match.html', 'Ghép trận thông minh', 'chart'], ['player-match-create.html', 'Tạo trận đấu', 'calendar']],
    venue: [['venue-court-management.html', 'Quản lý sân', 'court'], ['venue-revenue.html', 'Thống kê doanh thu', 'chart'], ['venue-reviews.html', 'Đánh giá sân', 'users'], ['venue-booking-management.html', 'Quản lý đặt sân', 'calendar'], ['venue-no-show-risk.html', 'Cảnh báo vắng mặt', 'shield']],
    organizer: [['organizer-event-management.html', 'Sự kiện CLB', 'calendar'], ['organizer-player-roster.html', 'Danh sách người chơi', 'users'], ['organizer-team-lineup.html', 'Đội hình & chia đội', 'court']],
    admin: [['admin-sport-management.html', 'Môn thể thao', 'court'], ['admin-user-management.html', 'Quản lý tài khoản', 'users'], ['admin-sports-report.html', 'Báo cáo hoạt động', 'chart'], ['admin-player-reports.html', 'Báo cáo người chơi', 'shield']]
  };
  const homeFor = role => navs[role]?.[0][0] || 'index.html';
  // Guest previews remain public, but signed-in accounts must use their own role.
  const roleForPage = href => {
    const page = href.split('?')[0].replace(/\.html$/, '');
    if (['court-detail', 'match-detail', 'booking', 'booking-success'].includes(page)) return 'player';
    const prefix = page.split('-')[0];
    return Object.hasOwn(navs, prefix) ? prefix : null;
  };
  const brand = '<a class="brand" href="index.html"><span class="brand-icon">C</span>CourtConnect</a>';
  const courtImage = c => esc(/^data:image\/(jpeg|png|webp);base64,/.test(c.imageData || '') ? c.imageData : `assets/images/figma-${[1, 2, 4].includes(Number(c.image)) ? Number(c.image) : 4}.jpg`);
  function courtCard(c) {
    const reviews = CC.db.courtReviews?.filter(r => r.courtId === c.id) || [];
    const rating = reviews.length ? `★ ${(reviews.reduce((n, r) => n + r.stars, 0) / reviews.length).toFixed(1)} · ${reviews.length} đánh giá` : 'Chưa có đánh giá';
    return `<article class="card court-card"><img class="card-image" src="${courtImage(c)}" alt="${esc(c.name)}" loading="lazy"><div class="card-body"><div class="court-card-meta"><span class="tag">${esc(sport(c.sportId))}</span><span class="court-rating">${rating}</span></div><h3>${esc(c.name)}</h3><p class="meta court-address">${icon('pin')}<span>${esc(c.location)}</span></p><div class="court-card-bottom"><p class="court-price"><strong>${money(c.price)}</strong><span>/ giờ</span></p>${link('Đặt sân · Xem giờ trống', `court-detail.html?id=${c.id}`, 'full')}</div></div></article>`;
  }
  function matchCard(m) {
    const s = CC.find('slots', m.slotId),
      c = CC.courtFor(s);
    if (!s || !c) return '';
    return `<article class="card"><div class="card-body"><div class="row mb"><span class="tag">${esc(sport(c.sportId))}</span><span class="spacer"></span><span class="small muted">${m.playerIds.length}/${m.capacity} người</span></div><h3>${esc(m.name)}</h3><p class="meta">${icon('pin')}${esc(c.name)}</p><p class="meta">${icon('calendar')}${day(s.date)}</p><p class="meta">${icon('clock')}${s.start} – ${s.end}</p><div class="divider"></div><div class="row match-card-level"><span class="tag">Trình độ ${level(m.level)}</span>${m.status !== 'open' ? badge(m.status) : ''}</div>${link(m.playerIds.length >= m.capacity ? 'Xem trận · Đã đủ người' : 'Xem trận & tham gia', `match-detail.html?id=${m.id}`, 'full')}</div></article>`;
  }
  // The mobile navigation is a non-modal dropdown anchored to its trigger.
  const mobileViewport = window.matchMedia('(max-width: 760px)');
  function positionMobileMenu() {
    const trigger = $('button[data-action="toggle-sidebar"]');
    const menu = $('#site-navigation');
    if (!trigger || !menu || !mobileViewport.matches) return;
    const rect = trigger.getBoundingClientRect();
    const viewportBottom = window.visualViewport ? window.visualViewport.offsetTop + window.visualViewport.height : window.innerHeight;
    const top = rect.bottom + 10;
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    menu.style.setProperty('--mobile-menu-top', `${top}px`);
    menu.style.setProperty('--mobile-menu-width', `${width}px`);
    menu.style.setProperty('--mobile-menu-right', `${window.innerWidth - left - width}px`);
    menu.style.setProperty('--mobile-menu-height', `${Math.max(0, viewportBottom - top - 12)}px`);
  }
  function setMobileMenu(open, moveFocus = false) {
    const trigger = $('button[data-action="toggle-sidebar"]');
    const menu = $('#site-navigation');
    if (!trigger || !menu) return;
    open = open && mobileViewport.matches;
    if (open) positionMobileMenu();
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    trigger.innerHTML = open ? '<span aria-hidden="true">×</span>' : icon('menu');
    if (moveFocus) {
      if (open) menu.querySelector('a, button')?.focus({
        preventScroll: true
      });else trigger.focus({
        preventScroll: true
      });
    }
  }
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('#site-navigation, button[data-action="toggle-sidebar"]')) setMobileMenu(false);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#site-navigation a, #site-navigation button')) setMobileMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#site-navigation')?.classList.contains('is-open')) {
      event.preventDefault();
      setMobileMenu(false, true);
    }
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('#site-navigation, button[data-action="toggle-sidebar"]')) setMobileMenu(false);
  });
  window.addEventListener('resize', () => {
    if (!mobileViewport.matches) setMobileMenu(false);else positionMobileMenu();
  });
  window.addEventListener('scroll', positionMobileMenu, {
    passive: true
  });
  window.visualViewport?.addEventListener('resize', positionMobileMenu);
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    if (a.dataset.action === 'close') close();
    if (a.dataset.action === 'logout') {
      CC.logout();
      location.href = 'login.html';
    }
    if (a.dataset.action === 'toggle-sidebar') {
      if (mobileViewport.matches) {
        setMobileMenu(!$('#site-navigation')?.classList.contains('is-open'), e.detail === 0);
        return;
      }
      const page = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
      if (page === 'index') {
        const sb = $('.home-sidebar');
        if (sb) {
          const open = sb.classList.toggle('is-open');
          $('.home-sidebar-backdrop')?.classList.toggle('is-open', open);
          a.setAttribute('aria-expanded', String(open));
        }
      }
    }
    if (a.dataset.action === 'password') {
      const input = a.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      a.textContent = input.type === 'password' ? 'Hiện' : 'Ẩn';
    }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.home-sidebar-backdrop, .home-sidebar a, .home-sidebar button')) {
      const sb = $('.home-sidebar');
      if (sb && sb.classList.contains('is-open')) {
        sb.classList.remove('is-open');
        $('.home-sidebar-backdrop')?.classList.remove('is-open');
        $('[data-action="toggle-sidebar"]')?.setAttribute('aria-expanded', 'false');
      }
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('.home-sidebar')?.classList.contains('is-open')) {
      $('.home-sidebar').classList.remove('is-open');
      $('.home-sidebar-backdrop')?.classList.remove('is-open');
      $('[data-action="toggle-sidebar"]')?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.account-menu[open]').forEach(menu => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.account-menu[open]').forEach(menu => {
      menu.open = false;
      menu.querySelector('summary').focus();
    });
  });
  function responsiveTables(root = document) {
    root.querySelectorAll('.table-wrap').forEach(wrap => {
      wrap.classList.add('mobile-records');
      const headers = [...wrap.querySelectorAll('thead th')].map(th => th.textContent);
      wrap.querySelectorAll('tbody tr').forEach(row => [...row.cells].forEach((cell, i) => {
        cell.dataset.label = headers[i];
      }));
    });
  }
  function bindBookingDatePicker() {
    const picker = $('.date-picker');
    if (!picker) return;
    picker.addEventListener('toggle', () => {
      if (picker.open && window.innerWidth <= 760) picker.scrollIntoView({
        block: 'start',
        behavior: 'instant'
      });
    });
    const input = $('[name=slotDate]');
    const today = CC.date();
    let month = new Date(input.value.slice(0, 7) + '-01T12:00:00');
    const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const render = () => {
      $('.date-month', picker).textContent = `Tháng ${month.getMonth() + 1}, ${month.getFullYear()}`;
      $('[data-month-step="-1"]', picker).disabled = key(month).slice(0, 7) <= today.slice(0, 7);
      const pad = (month.getDay() + 6) % 7;
      const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      $('.date-days', picker).innerHTML = '<span></span>'.repeat(pad) + Array.from({
        length: count
      }, (_, i) => {
        const date = key(new Date(month.getFullYear(), month.getMonth(), i + 1));
        return `<button type="button" class="date-day ${date === today ? 'is-today' : ''}" data-booking-date="${date}" aria-label="${i + 1} tháng ${month.getMonth() + 1} năm ${month.getFullYear()}" aria-pressed="${date === input.value}" ${date < today ? 'disabled' : ''} ${date === today ? 'aria-current="date"' : ''}>${i + 1}</button>`;
      }).join('');
    };
    picker.addEventListener('click', event => {
      const step = event.target.closest('[data-month-step]');
      if (step) {
        month.setMonth(month.getMonth() + Number(step.dataset.monthStep));
        render();
        return;
      }
      const day = event.target.closest('[data-booking-date], [data-date-today]');
      if (!day) return;
      input.value = day.dataset.bookingDate || today;
      picker.open = false;
      picker.querySelector('summary').focus();
      input.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        picker.open = false;
        picker.querySelector('summary').focus();
        return;
      }
      const button = event.target.closest('[data-booking-date]');
      if (!button || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const date = new Date(button.dataset.bookingDate + 'T12:00:00');
      date.setDate(date.getDate() + {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7
      }[event.key]);
      if (key(date) < today) return;
      month = new Date(date.getFullYear(), date.getMonth(), 1, 12);
      render();
      $(`[data-booking-date="${key(date)}"]`, picker)?.focus();
    });
    render();
  }
  document.addEventListener('click', event => {
    $$('.date-picker[open]').forEach(picker => {
      if (!picker.contains(event.target)) picker.open = false;
    });
  });
  function updateChrome() {
    const user = CC.me();
    const auth = document.body.dataset.layout === 'auth';
    const home = document.body.dataset.layout === 'home';
    document.querySelector('.header')?.classList.toggle('guest-header', !user && !auth);
    $$('[data-session]').forEach(node => node.hidden = node.dataset.session === 'member' ? !user : !!user);
    $$('[data-user-name]').forEach(node => node.textContent = user?.name || '');
    $$('[data-user-initial]').forEach(node => node.textContent = user?.name.split(' ').pop()[0] || '');
    $$('[data-user-role]').forEach(node => node.textContent = CC.roles[user?.role] || '');
    $$('[data-user-home]').forEach(node => node.href = homeFor(user?.role));
    $$('[data-navigation-role]').forEach(node => node.textContent = user ? CC.roles[user.role] : 'Khám phá');
    $$('[data-nav-role]').forEach(node => node.hidden = node.dataset.navRole !== (user?.role || 'player'));
    $$('#site-navigation a').forEach(node => {
      const active = node.getAttribute('href') === location.pathname.split('/').pop();
      node.classList.toggle('active', active);
      if (active) node.setAttribute('aria-current', 'page');else node.removeAttribute('aria-current');
    });
    const navigation = $('#site-navigation');
    if (navigation) navigation.hidden = home && !user;
    const backdrop = $('.home-sidebar-backdrop');
    if (backdrop) backdrop.hidden = !user;
    const error = $('[data-load-error]');
    if (error) {
      error.hidden = !CC.loadError;
      error.textContent = CC.loadError || '';
    }
    Theme.refresh();
  }
  const tableRows = rows => rows.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('');
  document.querySelector('#modal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  window.UI = {
    updateChrome,
    tableRows,
    bindBookingDatePicker,
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
    toast,
    modal,
    close,
    confirm,
    formDialog,
    requireLogin,
    homeFor,
    roleForPage,
    courtImage,
    courtCard,
    matchCard
  };
})();
