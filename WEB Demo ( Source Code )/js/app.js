/* Điều hướng 28 trang, phân quyền và các màn hình dùng chung. */
(() => {
  const {
    $,
    esc,
    btn,
    link,
    field,
    select,
    option,
    textarea,
    table,
    pageHead,
    shell,
    toast,
    empty,
  } = UI;
  const page =
      location.pathname
        .split('/')
        .pop()
        .replace(/\.html$/, '') || 'index',
    q = () => new URLSearchParams(location.search);
  function error(code = 404) {
    shell(
      `<section class="error-page"><h1>${code === 403 ? 'Bạn chưa có quyền truy cập' : 'Không tìm thấy nội dung'}</h1><p>Mã lỗi ${code}. Hãy quay lại trang phù hợp với tài khoản.</p>${link('Về trang chủ', 'index.html')}${link('Đăng nhập', 'login.html', 'secondary')}</section>`
    );
  }
  function profile() {
    const u = CC.me(),
      p = CC.find('players', u.id);
    shell(
      pageHead('Hồ sơ cá nhân', 'Cập nhật thông tin và bảo vệ tài khoản.') +
        `<form class="panel" id="profile-form"><div class="notice error" id="profile-error" hidden></div>${field('Họ tên', 'name', 'text', u.name, 'required minlength="2" maxlength="80"')}${field('Email', 'email', 'email', u.email, 'readonly')}${field('Số điện thoại', 'phone', 'tel', u.phone || '', 'required pattern="0[0-9]{9}"')}<p class="small muted">Đổi số điện thoại cần xác thực lại. Số điện thoại không hiển thị trong bảng thông tin công khai.</p>${textarea('Giới thiệu', 'bio', u.bio || '')}${
          p
            ? CC.db.sports
                .filter((s) => s.status === 'active')
                .map((s) => select(s.name, 'level-' + s.id, UI.levels(p.levels[s.id] || 1)))
                .join('')
            : ''
        }<div class="actions"><button class="btn">Lưu hồ sơ</button>${btn('Đổi mật khẩu', 'change-password', 'secondary')}</div></form>`
    );
    $('#profile-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        const d = Object.fromEntries(new FormData(e.currentTarget));
        if (
          d.name.trim().length < 2 ||
          !/^0\d{9}$/.test(d.phone) ||
          CC.db.users.some((x) => x.id !== u.id && x.phone === d.phone)
        )
          throw Error('Tên hoặc số điện thoại không hợp lệ/đã sử dụng.');
        const changed = u.phone !== d.phone;
        CC.transaction(() => {
          u.name = d.name.trim();
          u.phone = d.phone;
          u.bio = d.bio.trim();
          if (changed) u.verified = false;
          if (p) {
            p.name = u.name;
            CC.db.sports.forEach((s) => {
              const n = Number(d['level-' + s.id]);
              if (n >= 1 && n <= 5) p.levels[s.id] = n;
            });
          }
        });
        if (changed) {
          Auth.issue(d.phone, 'register');
          CC.logout();
          location.href = 'verify-email.html';
          return;
        }
        renderPage();
        toast('Đã lưu hồ sơ.');
      } catch (err) {
        $('#profile-error').textContent = err.message;
        $('#profile-error').hidden = false;
      }
    };
  }
  function settings() {
    const u = CC.me();
    shell(
      pageHead('Cài đặt', 'Tùy chọn và dữ liệu mô phỏng.') +
        `<form id="settings-form" class="panel"><label class="check"><input type="checkbox" name="reminder" ${CC.db.settings[u.id]?.reminder ? 'checked' : ''}>Hiển thị nhắc nhở lịch chơi</label><button class="btn">Lưu tùy chọn</button></form><section class="panel"><h2>Dữ liệu trên trình duyệt</h2><p>Đây là demo HTML/CSS/JS dùng localStorage. SMS, AI và chat đều mô phỏng, không đồng bộ giữa các thiết bị.</p>${btn('Tải bản sao dữ liệu', 'export-data', 'secondary')}${btn('Khôi phục dữ liệu mẫu', 'reset-data', 'danger')}</section>`
    );
    $('#settings-form').onsubmit = (e) => {
      e.preventDefault();
      CC.transaction(
        () => (CC.db.settings[u.id] = { reminder: new FormData(e.currentTarget).has('reminder') })
      );
      toast('Đã lưu tùy chọn.');
    };
  }
  function notifications() {
    const rows = CC.db.notifications.filter((n) => n.userId === CC.me().id).slice();
    shell(
      pageHead(
        'Thông báo',
        'Thông báo hệ thống và kết quả các yêu cầu.',
        btn('Đánh dấu đã đọc', 'read-all', 'secondary')
      ) +
        rows
          .map(
            (n) =>
              `<article class="panel notification ${n.read ? '' : 'unread'}"><div><p>${esc(n.text)}</p><small>${new Date(n.createdAt).toLocaleString('vi-VN')}</small></div><div class="actions">${link('Xem', safeHref(n.href), 'secondary')}${n.read ? '' : btn('Đã đọc', 'read-notification', 'ghost', `data-id="${n.id}"`)}</div></article>`
          )
          .join('') +
        (rows.length ? '' : empty())
    );
  }
  function safeHref(href) {
    if (typeof href !== 'string' || !/^[A-Za-z-]+\.html(?:\?[^<>\s]*)?$/.test(href))
      return 'notifications.html';
    const name = href.split('?')[0].slice(0, -5);
    return routes[name] || Auth.pages.includes(name) ? href : 'notifications.html';
  }
  function joinRequests() {
    const u = CC.requireRole('player');
    const rows = CC.db.joinRequests.filter((r) => CC.find('matches', r.matchId)?.hostId === u.id);
    shell(
      pageHead('Yêu cầu tham gia trận', 'Bạn quyết định ai tham gia trận mình tạo.') +
        table(
          ['Trận', 'Người yêu cầu', 'Thông tin', 'Trạng thái', 'Quyết định'],
          rows
            .slice()
            .reverse()
            .map((r) => {
              const m = CC.find('matches', r.matchId);
              return [
                esc(m.name),
                Community.person(r.playerId),
                Community.info(r.playerId),
                UI.badge(r.status),
                r.status === 'pending'
                  ? btn(
                      'Chấp nhận',
                      'decide-join',
                      '',
                      `data-id="${r.id}" data-decision="approved"`
                    ) +
                    btn(
                      'Từ chối',
                      'decide-join',
                      'secondary',
                      `data-id="${r.id}" data-decision="rejected"`
                    )
                  : 'Đã xử lý',
              ];
            })
        )
    );
    UI.responsiveTables($('#main'));
  }
  function report() {
    const u = CC.me(),
      type = q().get('type') === 'court' ? 'court' : 'user',
      id = q().get('id') || '';
    const options = (kind, selected) =>
      (kind === 'court'
        ? CC.db.courts
        : CC.db.users.filter((x) => CC.roles[x.role] && x.id !== u.id)
      )
        .map((x) => option(x.id, x.name, selected))
        .join('');
    shell(
      pageHead(
        'Báo cáo người dùng hoặc sân',
        'Phản ánh sự việc có bằng chứng. Admin sẽ xem xét trước khi xử lý.'
      ) +
        `<form id="report-form" class="panel"><div id="report-error" class="notice error" hidden></div>${select('Loại đối tượng', 'targetType', option('user', 'Người dùng / chủ sân', type) + option('court', 'Sân', type))}${select('Đối tượng', 'targetId', options(type, id), 'required')}${select('Lý do', 'reason', ['Ứng xử không phù hợp', 'Không đến đúng hẹn', 'Thông tin sai lệch', 'Điều kiện sân không đúng', 'Khác'].map((x) => option(x, x)).join(''))}${textarea('Mô tả sự việc', 'comment')}${textarea('Bằng chứng: mô tả chi tiết hoặc liên kết ảnh/tài liệu', 'evidence')}<p class="small muted">Không cần gửi mật khẩu hoặc giấy tờ cá nhân. Bằng chứng là mô tả hoặc đường dẫn; demo không tải tệp lên máy chủ.</p><button class="btn">Gửi báo cáo</button></form><h2>Báo cáo của tôi</h2>` +
        table(
          ['Đối tượng', 'Nội dung', 'Kết quả'],
          CC.db.abuseReports
            .filter((r) => r.authorId === u.id)
            .slice()
            .reverse()
            .map((r) => [
              esc(CC.find(r.targetType === 'court' ? 'courts' : 'users', r.targetId)?.name),
              esc(r.comment),
              esc(
                {
                  pending: 'Chờ xử lý',
                  warned: 'Đã cảnh báo',
                  banned: 'Đã khóa',
                  dismissed: 'Không xử phạt',
                }[r.status]
              ) + `<p>${esc(r.decisionNote || '')}</p>`,
            ])
        )
    );
    $('[name=targetType]').onchange = (e) =>
      ($('[name=targetId]').innerHTML = options(e.target.value, ''));
    $('#report-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        Domain.sendReport(Object.fromEntries(new FormData(e.currentTarget)));
        report();
        toast('Báo cáo thành công.');
      } catch (err) {
        $('#report-error').textContent = err.message;
        $('#report-error').hidden = false;
      }
    };
    UI.responsiveTables($('#main'));
  }
  function chat() {
    const u = CC.me(),
      users = CC.db.users.filter((x) => x.id !== u.id && Domain.active(x.id)),
      target = q().get('with') || users[0]?.id,
      other = users.find((x) => x.id === target);
    shell(
      pageHead(
        'Trò chuyện',
        'Tin nhắn mô phỏng trong cùng trình duyệt, chưa có máy chủ thời gian thực.'
      ) +
        `<section class="panel">${select('Người nhận', 'chat-person', users.map((x) => option(x.id, x.name, target)).join(''))}${
          other
            ? `<h2>${esc(other.name)}</h2><div id="chat-log" class="chat-log" aria-live="polite">${
                CC.db.messages
                  .filter(
                    (m) =>
                      (m.from === u.id && m.to === target) || (m.from === target && m.to === u.id)
                  )
                  .map(
                    (m) =>
                      `<article class="chat-message ${m.from === u.id ? 'own' : ''}"><strong>${m.from === u.id ? 'Bạn' : esc(other.name)}</strong><p class="review-comment">${esc(m.text)}</p><small>${new Date(m.createdAt).toLocaleString('vi-VN')}</small></article>`
                  )
                  .join('') || '<p>Chưa có tin nhắn.</p>'
              }</div><form id="chat-form">${textarea('Tin nhắn', 'message')}<button class="btn">Gửi tin nhắn</button><p id="chat-error" class="notice error" hidden></p></form>`
            : empty('Người nhận không khả dụng', 'Chọn tài khoản đang hoạt động.')
        }</section>`
    );
    $('[name=chat-person]').onchange = (e) =>
      (location.href = 'chat.html?with=' + encodeURIComponent(e.target.value));
    if (other)
      $('#chat-form').onsubmit = (e) => {
        e.preventDefault();
        try {
          const text = new FormData(e.currentTarget).get('message').trim();
          if (!text || text.length > 1000 || !Domain.active(target))
            throw Error('Nhập nội dung tối đa 1000 ký tự và chọn người nhận hợp lệ.');
          CC.transaction(() => {
            CC.db.messages.push({
              id: CC.id('message'),
              from: u.id,
              to: target,
              text,
              createdAt: Domain.now(),
            });
            CC.notify(target, `${u.name} đã gửi tin nhắn.`, `chat.html?with=${u.id}`);
          });
          chat();
          toast('Đã gửi tin nhắn.');
        } catch (err) {
          $('#chat-error').textContent = err.message;
          $('#chat-error').hidden = false;
        }
      };
    $('#chat-log')?.scrollTo(0, $('#chat-log').scrollHeight);
  }
  function help() {
    shell(
      pageHead('Trợ giúp', 'Các bước sử dụng CourtConnect.') +
        `<section class="panel"><h2>Tài khoản mẫu</h2><p>Mật khẩu: <strong>Court123!</strong>. Mã SMS mô phỏng: <strong>482915</strong>, hiệu lực 5 phút.</p>${Object.entries(
          CC.roles
        )
          .map(([r, l]) => `<p><strong>${l}</strong>: ${r}@courtconnect.demo</p>`)
          .join(
            ''
          )}<h2>Người chơi</h2><p>Chọn sân và khung giờ → gửi yêu cầu → chủ sân duyệt. Đơn hoàn thành mới có thể đánh giá sân. Tham gia trận cần chủ trận chấp nhận.</p><h2>Chủ sân</h2><p>Đăng ký thông tin sân → xác thực số điện thoại → admin duyệt. Mọi thay đổi sân cũng cần admin duyệt trước khi công khai.</p><h2>Admin</h2><p>Duyệt chủ sân, duyệt thay đổi sân, xem bằng chứng báo cáo và gửi thông báo.</p><h2>Giới hạn demo</h2><p>Dữ liệu chỉ ở trình duyệt hiện tại. AI dùng quy tắc, không gửi SMS thật. Chỉ dùng thông tin giả lập.</p></section>`
    );
  }
  function privacy() {
    shell(
      pageHead('Quyền riêng tư và điều khoản sử dụng', 'Nguyên mẫu phục vụ học tập.') +
        `<article class="panel"><h2>Dữ liệu</h2><p>Tài khoản, lịch sân, tin nhắn và báo cáo lưu cục bộ bằng localStorage. Không nhập dữ liệu nhạy cảm thật. Kiểm soát quyền phía frontend không thay thế bảo mật máy chủ.</p><h2>Thông tin liên hệ</h2><p>Khi xác nhận đặt sân, bạn đồng ý cho chủ sân đó xem tên và số điện thoại liên hệ. Số điện thoại không hiển thị trong thông tin người chơi công khai.</p><h2>Đặt sân và trận đấu</h2><p>Đặt sân cần chủ sân duyệt. Tham gia trận cần chủ trận duyệt. Không đặt trùng lịch, không gửi yêu cầu trùng. Doanh thu mô phỏng, không thanh toán thật.</p><h2>Ứng xử</h2><p>Đánh giá đúng hoạt động đã tham gia, cung cấp bằng chứng khi báo cáo. Admin xem xét và giải thích quyết định, không tự kết luận vi phạm từ số báo cáo.</p><h2>Quản lý dữ liệu</h2><p>Cài đặt cho tải bản sao hoặc khôi phục dữ liệu mẫu. Các thiết bị không tự đồng bộ. Vai trò CLB cũ ngừng hoạt động, dữ liệu cũ được giữ trong vùng lịch sử.</p></article>`
    );
  }
  function courtPage() {
    if (q().has('slot')) {
      if (!CC.me()) {
        Player.searchCourts();
        UI.requireLogin(location.pathname.split('/').pop() + location.search);
        return;
      }
      if (CC.me().role !== 'player') return error(403);
      Player.bookingPage();
      return;
    }
    if (q().has('id')) {
      Player.courtDetail();
      const c = CC.find('courts', q().get('id'));
      if (c && c.status === 'active')
        $('#main').insertAdjacentHTML(
          'beforeend',
          `<section class="panel mt"><h2>Đánh giá sân</h2>${Community.reviewList(CC.db.courtReviews.filter((r) => r.courtId === c.id))}${link('Báo cáo sân', `Report.html?type=court&id=${c.id}`, 'secondary')}</section>`
        );
    } else Player.searchCourts();
  }
  function matchPage() {
    if (q().has('id')) {
      Player.matchDetail();
      const m = CC.find('matches', q().get('id'));
      if (m)
        $('#main').insertAdjacentHTML(
          'beforeend',
          `<section class="panel mt">${Community.opponentCards(m)}</section>`
        );
    } else Player.openMatches();
  }
  function activities() {
    Player.mySports();
    const requests = CC.db.joinRequests.filter((r) => r.playerId === CC.me().id);
    if (requests.length)
      $('[data-activity=matches]').insertAdjacentHTML(
        'beforeend',
        `<h2 class="mt">Yêu cầu tham gia đã gửi</h2>${table(
          ['Trận', 'Trạng thái'],
          requests.map((r) => [
            link(
              esc(CC.find('matches', r.matchId)?.name),
              `player-open-matches.html?id=${r.matchId}`,
              'ghost'
            ),
            UI.badge(r.status),
          ])
        )}`
      );
    UI.responsiveTables($('#main'));
    if (q().has('booked'))
      $('#main').insertAdjacentHTML(
        'afterbegin',
        '<div class="notice" role="status">Đặt sân thành công: yêu cầu đã gửi và đang chờ chủ sân duyệt.</div>'
      );
  }
  const routes = {
    index: Player.home,
    'player-court-search': courtPage,
    'player-open-matches': matchPage,
    'my-activities': activities,
    'player-match-create': Player.matchCreate,
    'player-skill-match': AI.skill,
    'Join-Requests': joinRequests,
    'venue-booking-management': Manage.bookings,
    'venue-court-management': Manage.courts,
    Revenue: () =>
      CC.me().approvalStatus === 'approved' ? Community.revenue() : Manage.pendingOwner(),
    'Admin-Dashboard': Manage.dashboard,
    'Court-Owner-Approval': Manage.ownerApproval,
    'Report-Management': Manage.reports,
    'System-Notifications': Manage.systemNotifications,
    profile,
    settings,
    notifications,
    Report: report,
    chat,
    help,
    privacy,
    error: () => error(q().get('code') === '403' ? 403 : 404),
  };
  const publicPages = [
    'index',
    'player-court-search',
    'player-open-matches',
    'help',
    'privacy',
    'error',
  ];
  const access = {
    'my-activities': 'player',
    'player-match-create': 'player',
    'player-skill-match': 'player',
    'Join-Requests': 'player',
    'venue-booking-management': 'venue',
    'venue-court-management': 'venue',
    Revenue: 'venue',
    'Admin-Dashboard': 'admin',
    'Court-Owner-Approval': 'admin',
    'Report-Management': 'admin',
    'System-Notifications': 'admin',
  };
  function renderPage() {
    document.title = (window.PAGE_TITLE || 'CourtConnect') + ' | CourtConnect';
    if (Auth.pages.includes(page)) return Auth.render(page);
    if (!routes[page]) return error(404);
    const u = CC.me();
    if (!publicPages.includes(page) && !u) {
      sessionStorage.setItem('cc.next', location.pathname.split('/').pop() + location.search);
      location.replace('login.html');
      return;
    }
    if (access[page] && access[page] !== u?.role) return error(403);
    if (!routes[page]) return error();
    try {
      routes[page]();
    } catch (err) {
      shell(
        `<h1>Không thể tải trang</h1><div class="notice error">${esc(err.message)}</div>${link('Về trang chủ', 'index.html')}`
      );
      console.error(err);
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    try {
      const { action, id } = a.dataset;
      if (action === 'decide-join') {
        Domain.decideJoin(id, a.dataset.decision);
        renderPage();
        toast('Đã xử lý yêu cầu tham gia.');
      }
      if (action === 'change-password') {
        const u = CC.me();
        if (!u?.phone) throw Error('Cập nhật số điện thoại trước.');
        Auth.issue(u.phone, 'reset');
        location.href = 'verify-reset.html';
      }
      if (action === 'read-all') {
        CC.transaction(() =>
          CC.db.notifications.filter((n) => n.userId === CC.me().id).forEach((n) => (n.read = true))
        );
        renderPage();
        toast('Đã đánh dấu đã đọc.');
      }
      if (action === 'read-notification') {
        const n = CC.find('notifications', id);
        if (n?.userId !== CC.me().id) throw Error('Không có quyền.');
        CC.transaction(() => (n.read = true));
        renderPage();
      }
      if (action === 'reset-data')
        UI.confirm(
          'Khôi phục dữ liệu mẫu?',
          'Thao tác xóa dữ liệu demo hiện tại của mọi tài khoản trên trình duyệt. Nên tải bản sao trước.',
          () => {
            localStorage.setItem(CC.KEY, JSON.stringify(CC.seed()));
            CC.logout();
            sessionStorage.removeItem('cc.pending');
            location.href = 'index.html';
          }
        );
      if (action === 'export-data') {
        const blob = new Blob([JSON.stringify(CC.db, null, 2)], { type: 'application/json' }),
          url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = 'courtconnect-backup.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.addEventListener('storage', (e) => {
    if ([CC.KEY, 'cc.session'].includes(e.key)) location.reload();
  });
  window.App = { error, allowedPages: [...Object.keys(routes), ...Auth.pages] };
  window.renderPage = renderPage;
  renderPage();
})();
