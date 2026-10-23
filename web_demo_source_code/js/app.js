/* Điều hướng các trang và chức năng dùng chung. Mỗi URL là một tệp HTML độc lập. */
(() => {
  'use strict';

  const { $, esc, btn, link, field, select, empty, toast, confirm, formDialog } = UI;
  const page =
    location.pathname
      .split('/')
      .pop()
      .replace(/\.html$/, '') || 'index';
  function error(code) {
    Views.update('app-error', {
      errorCode: () => code,
      errorTitle: () => (code === 403 ? 'Bạn chưa có quyền truy cập' : 'Không tìm thấy trang'),
      errorMessage: () =>
        code === 403
          ? 'Trang này dành cho một vai trò khác. Bạn có thể đăng xuất và dùng tài khoản demo phù hợp.'
          : 'Liên kết hoặc bản ghi không còn tồn tại. Hãy quay lại để tiếp tục khám phá.',
      isLoggedIn: () => CC.me(),
    });
  }
  function profile() {
    const u = CC.me(),
      p = CC.find('players', u.id);
    Views.update('app-profile', {
      userName: () => esc(u.name),
      phone: () => esc(u.phone || ''),
      email: () => esc(u.email),
      roleLabel: () => esc(CC.roles[u.role]),
      phonePublicChecked: () => (u.phonePublic ? 'checked' : ''),
      socialFields: () =>
        Object.entries(Community.networks)
          .map(([k, [label]]) =>
            field(label, k, 'url', u.socialLinks?.[k] || '', 'placeholder="https://…"')
          )
          .join(''),
      bio: () => esc(u.bio || ''),
      hasPlayer: () => p,
      levelFields: () =>
        CC.db.sports
          .filter((s) => s.status === 'active')
          .map((s) => select(s.name, 'level-' + s.id, UI.levels(p.levels[s.id] || 1)))
          .join(''),
      avatarInitial: () => esc(u.name.slice(0, 1)),
      profileName: () => esc(u.name),
      profileRole: () => CC.roles[u.role],
      publicProfileUrl: () => esc(`profile-public.html?id=${u.id}`),
      socialLinks: () => Community.socialIcons(u),
    });
    $('#profile-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        const d = Object.fromEntries(new FormData(e.currentTarget));
        if (d.name.trim().length < 2) throw Error('Tên phải có ít nhất 2 ký tự.');
        const socials = Community.socialLinks(d);
        CC.transaction(() => {
          u.phonePublic = d.phonePublic === 'on';
          u.socialLinks = socials;
          u.name = d.name.trim();
          u.phone = d.phone;
          u.bio = d.bio;
          if (p) {
            p.name = u.name;
            Object.keys(d)
              .filter((k) => k.startsWith('level-'))
              .forEach((k) => (p.levels[k.slice(6)] = +d[k]));
          }
        });
        renderPage();
        toast('Đã lưu hồ sơ.');
      } catch (err) {
        $('#profile-error').textContent = err.message;
        $('#profile-error').hidden = false;
      }
    };
  }
  function notifications() {
    const u = CC.me(),
      rows = CC.db.notifications.filter((n) => n.userId === u.id);
    Views.update('app-notifications', {
      notificationCards: () =>
        rows
          .map(
            (n) =>
              `<article class="notification ${n.read ? '' : 'unread'}"><span class="avatar">${UI.icon('bell')}</span><div><p>${esc(n.text)}</p><small class="muted">${new Date(n.createdAt).toLocaleString('vi-VN')}</small></div><div class="actions">${link('Xem', n.href, 'secondary small')}${n.read ? '' : btn('Đã đọc', 'read-notification', 'ghost small', `data-id="${n.id}"`)}</div></article>`
          )
          .join('') ||
        empty('Bạn đã cập nhật hết', 'Thông báo về đặt sân và trận đấu sẽ xuất hiện ở đây.'),
    });
  }
  function settings() {
    const u = CC.me(),
      settings = CC.db.settings[u.id] || {
        reminder: true,
      };
    Views.update('app-settings', {
      reminderChecked: () => (settings.reminder ? 'checked' : ''),
    });
    $('#settings-form').onsubmit = (e) => {
      e.preventDefault();
      CC.transaction(
        () =>
          (CC.db.settings[u.id] = {
            reminder: new FormData(e.currentTarget).has('reminder'),
          })
      );
      toast('Đã lưu tùy chọn.');
    };
  }
  function help() {
    Views.update('app-help', {
      demoAccounts: () =>
        Object.entries(CC.roles)
          .map(
            ([r, l]) =>
              `<p><strong>${l}</strong><br><span class="small muted">${r}@courtconnect.demo</span></p>`
          )
          .join(''),
    });
  }
  function legal(type) {
    const privacy = type === 'privacy';
    privacy ? Views.update('app-legal-privacy', {}) : Views.update('app-legal-terms', {});
  }
  const routes = {
    index: () => Player.home(),
    'player-court-search': () => Player.searchCourts(),
    'player-open-matches': () => Player.openMatches(),
    'court-detail': () => Player.courtDetail(),
    booking: () => Player.bookingPage(),
    'booking-success': () => Views.update('app-booking-success', {}),
    'match-detail': () => Player.matchDetail(),
    'player-my-sports': () => Player.mySports(),
    'player-match-create': () => Player.matchCreate(),
    'player-skill-match': () => AI.skill(),
    'venue-court-management': () => Venue.courts(),
    'venue-slot-management': () => location.replace('venue-court-management.html'),
    'venue-revenue': () => Community.revenue(),
    'venue-reviews': () => Community.courtReviews(),
    'profile-public': () => Community.publicProfile(),
    'admin-player-reports': () => Community.reports(),
    'venue-booking-management': () => Venue.bookings(),
    'organizer-event-management': () => Organizer.events(),
    'organizer-event-detail': () => Organizer.eventDetail(),
    'organizer-player-roster': () => Organizer.roster(),
    'organizer-team-lineup': () => AI.teams(),
    'admin-sport-management': () => Admin.sports(),
    'admin-user-management': () => Admin.users(),
    'admin-sports-report': () => Admin.reports(),
    profile,
    settings,
    notifications,
    chat: () => location.replace('player-my-sports.html'),
    help,
    terms: () => legal('terms'),
    privacy: () => legal('privacy'),
    403: () => error(403),
    404: () => error(404),
  };
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
  function renderPage() {
    document.title = (window.PAGE_TITLE || 'CourtConnect') + ' | CourtConnect';
    if (window.Auth?.pages.includes(page)) {
      Auth.render(page);
      return;
    }
    const u = CC.me();
    if (page === 'index' && u && u.role !== 'player') {
      location.replace(UI.homeFor(u.role));
      return;
    }
    if (!publicPages.includes(page) && !u) {
      sessionStorage.setItem('cc.next', page + '.html' + location.search);
      location.replace('login.html');
      return;
    }
    const required = UI.roleForPage(page);
    if (u && required && u.role !== required) {
      error(403);
      return;
    }
    if (!routes[page]) {
      error(404);
      return;
    }
    try {
      CC.ensureSchedules();
      routes[page]();
      UI.responsiveTables(document);
      if (u && CC.db.settings[u.id]?.reminder && page === 'player-my-sports') {
        const node = document.createElement('div');
        node.className = 'notice';
        node.textContent = 'Nhớ kiểm tra trạng thái đặt sân và liên hệ đồng đội trước giờ chơi.';
        $('#main').prepend(node);
      }
    } catch (err) {
      Views.update('app-renderPage', {
        errorMessage: () => esc(err.message),
      });
      console.error(err);
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    try {
      switch (a.dataset.action) {
        case 'retry-page':
          renderPage();
          break;
        case 'read-all':
          CC.transaction(() =>
            CC.db.notifications
              .filter((n) => n.userId === CC.me().id)
              .forEach((n) => (n.read = true))
          );
          renderPage();
          toast('Đã đánh dấu tất cả.');
          break;
        case 'read-notification': {
          const n = CC.find('notifications', a.dataset.id);
          if (n.userId !== CC.me().id) throw Error('Không có quyền.');
          CC.transaction(() => (n.read = true));
          renderPage();
          break;
        }
        case 'reset-data':
          confirm(
            'Khôi phục toàn bộ dữ liệu demo?',
            'Tài khoản tự tạo, đơn đặt, trận, sự kiện và đánh giá sẽ bị xóa khỏi trình duyệt này. Thao tác không thể hoàn tác.',
            () => {
              localStorage.setItem(CC.KEY, JSON.stringify(CC.seed()));
              CC.logout();
              sessionStorage.removeItem('cc.pending');
              location.href = 'index.html';
            }
          );
          break;
        case 'change-password':
          formDialog(
            'Đổi mật khẩu',
            Views.fragment('app-actions-dialog-1', {}),
            'Đổi mật khẩu',
            (d) => {
              const u = CC.me();
              if (d.old !== u.password) throw Error('Mật khẩu hiện tại không đúng.');
              if (!/^(?=.*[A-Za-z])(?=.*\d).{8,80}$/.test(d.password))
                throw Error('Mật khẩu cần từ 8 ký tự, có chữ và số.');
              if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
              CC.transaction(() => (u.password = d.password));
            }
          );
          break;
      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.addEventListener('storage', (e) => {
    if (e.key === CC.KEY || e.key === 'cc.session') {
      location.reload();
    }
  });
  window.App = {
    error,
  };
  window.renderPage = renderPage;
  renderPage();
})();
