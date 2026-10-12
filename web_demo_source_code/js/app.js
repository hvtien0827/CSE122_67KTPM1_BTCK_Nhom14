/* Điều hướng các trang và chức năng dùng chung. Mỗi URL là một tệp HTML độc lập. */
(() => {
  'use strict';
  const {
    $,
    $$,
    esc,
    btn,
    link,
    field,
    select,
    textarea,
    option,
    empty,
    pageHead,
    toast,
    confirm,
    formDialog,
    shell,
  } = UI;
  const page =
    location.pathname
      .split('/')
      .pop()
      .replace(/\.html$/, '') || 'index';
  function error(code) {
    shell(
      `<div class="error-page"><div class="error-number">${code}</div><h1>${code === 403 ? 'Bạn chưa có quyền truy cập' : 'Không tìm thấy trang'}</h1><p class="muted">${code === 403 ? 'Trang này dành cho một vai trò khác. Bạn có thể đăng xuất và dùng tài khoản demo phù hợp.' : 'Liên kết hoặc bản ghi không còn tồn tại. Hãy quay lại để tiếp tục khám phá.'}</p><div class="actions" style="justify-content:center">${link('Về trang chủ', 'index.html')}${CC.me() ? btn('Đổi tài khoản', 'logout', 'secondary') : link('Đăng nhập', 'login.html', 'secondary')}</div></div>`
    );
  }
  function profile() {
    const u = CC.me(),
      p = CC.find('players', u.id);
    shell(
      pageHead('Hồ sơ của tôi', 'Giới thiệu bản thân với cộng đồng thể thao.') +
        `<div class="two-col"><form id="profile-form" class="panel"><h2>Thông tin cá nhân</h2><div class="notice error" id="profile-error" role="alert" hidden></div><div class="form-grid">${field('Họ và tên', 'name', 'text', u.name, 'required minlength="2" maxlength="80"')}${field('Số điện thoại', 'phone', 'tel', u.phone || '', 'pattern="[0-9+ ()-]{8,20}" maxlength="20"')}${field('Email', 'email', 'email', u.email, 'readonly')}${field('Vai trò', 'role', 'text', CC.roles[u.role], 'readonly')}</div><label class="row mb"><input type="checkbox" name="phonePublic" ${u.phonePublic ? 'checked' : ''}> Hiển thị số điện thoại trên hồ sơ công khai</label><h3>Mạng xã hội</h3><p class="muted small">Nhập liên kết https. Hồ sơ công khai chỉ hiển thị biểu tượng có thể bấm.</p><div class="form-grid">${Object.entries(
          Community.networks
        )
          .map(([k, [label]]) =>
            field(label, k, 'url', u.socialLinks?.[k] || '', 'placeholder="https://…"')
          )
          .join('')}</div>${textarea('Giới thiệu ngắn', 'bio', u.bio || '')}${
          p
            ? '<h3>Trình độ theo môn</h3><div class="form-grid">' +
              CC.db.sports
                .filter((s) => s.status === 'active')
                .map((s) => select(s.name, 'level-' + s.id, UI.levels(p.levels[s.id] || 1)))
                .join('') +
              '</div>'
            : ''
        }<button class="btn">Lưu hồ sơ</button></form><aside class="panel"><div class="auth-symbol">${esc(u.name.slice(0, 1))}</div><h2 class="center">${esc(u.name)}</h2><p class="center muted">${CC.roles[u.role]}</p><div class="divider"></div><p class="small muted">Trình độ theo từng môn giúp lựa chọn trận và chia đội phù hợp hơn. Bạn có thể cập nhật khi đã tiến bộ.</p>${link('Xem hồ sơ công khai', `profile-public.html?id=${u.id}`, 'secondary full')}${Community.socialIcons(u)}${link('Cài đặt tài khoản', 'settings.html', 'ghost full')}</aside></div>`
    );
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
    shell(
      pageHead(
        'Thông báo',
        'Cập nhật mới nhất về lịch sân và hoạt động.',
        btn('Đánh dấu tất cả đã đọc', 'read-all', 'secondary')
      ) +
        `<section class="panel" style="padding:0">${rows.map((n) => `<article class="notification ${n.read ? '' : 'unread'}"><span class="avatar">${UI.icon('bell')}</span><div><p>${esc(n.text)}</p><small class="muted">${new Date(n.createdAt).toLocaleString('vi-VN')}</small></div><div class="actions">${link('Xem', n.href, 'secondary small')}${n.read ? '' : btn('Đã đọc', 'read-notification', 'ghost small', `data-id="${n.id}"`)}</div></article>`).join('') || empty('Bạn đã cập nhật hết', 'Thông báo về đặt sân và trận đấu sẽ xuất hiện ở đây.')}</section>`
    );
  }
  function settings() {
    const u = CC.me(),
      settings = CC.db.settings[u.id] || { reminder: true };
    shell(
      pageHead('Cài đặt', 'Điều chỉnh trải nghiệm và quản lý dữ liệu demo.') +
        `<div class="two-col"><section><form class="panel" id="settings-form"><h2>Tùy chọn tài khoản</h2><label class="check"><input type="checkbox" name="reminder" ${settings.reminder ? 'checked' : ''}>Hiển thị lời nhắc kiểm tra lịch trong ứng dụng</label><p class="muted small">Tùy chọn cục bộ, không gửi email hay thông báo đẩy.</p><button class="btn">Lưu tùy chọn</button></form><section class="panel"><h2>Mật khẩu</h2><p class="muted">Thay đổi mật khẩu dùng trong bản demo trên trình duyệt này.</p>${btn('Đổi mật khẩu', 'change-password', 'secondary')}</section></section><section class="panel"><h2>Dữ liệu nguyên mẫu</h2><div class="notice">Dữ liệu lưu bằng localStorage trên trình duyệt hiện tại. Các máy khác nhau không tự đồng bộ. Phân quyền và xác thực ở đây là mô phỏng frontend.</div><p class="muted small">Khôi phục sẽ xóa các thay đổi demo của cả bốn vai trò trên trình duyệt này, bao gồm tài khoản bạn đã tạo.</p>${btn('Khôi phục dữ liệu mẫu', 'reset-data', 'danger')}<p class="muted small mt">Chỉ dùng thông tin mẫu, không nhập mật khẩu hoặc dữ liệu cá nhân thật.</p></section></div>`
    );
    $('#settings-form').onsubmit = (e) => {
      e.preventDefault();
      CC.transaction(
        () => (CC.db.settings[u.id] = { reminder: new FormData(e.currentTarget).has('reminder') })
      );
      toast('Đã lưu tùy chọn.');
    };
  }

  function help() {
    shell(
      pageHead('Trung tâm hỗ trợ', 'Mọi điều bạn cần để bắt đầu với CourtConnect.') +
        `<div class="help-grid"><section class="panel"><h2>Bắt đầu theo vai trò</h2><p class="muted">Đăng nhập bằng email của vai trò và mật khẩu mẫu <strong>Court123!</strong>.</p>${Object.entries(
          CC.roles
        )
          .map(
            ([r, l]) =>
              `<p><strong>${l}</strong><br><span class="small muted">${r}@courtconnect.demo</span></p>`
          )
          .join(
            ''
          )}${link('Đến trang đăng nhập', 'login.html', 'secondary')}</section><section class="panel"><h2>Câu hỏi thường gặp</h2>${[
          [
            'Làm thế nào để đặt sân?',
            'Tìm sân → xem chi tiết → chọn khung giờ còn trống → gửi yêu cầu. Sau đó chủ sân duyệt trong Quản lý đặt sân.',
          ],
          [
            'Tại sao chưa tạo được trận?',
            'Cần một lịch đặt sân đã được duyệt, ở tương lai và chưa có trận khác sử dụng.',
          ],
          [
            'Ba tính năng AI có gọi dịch vụ thật không?',
            'Không. Skill Match, Team Balancer và No-show Risk là mô phỏng JavaScript theo quy tắc có giải thích.',
          ],
          [
            'Vì sao máy khác không thấy dữ liệu của tôi?',
            'Dữ liệu lưu cục bộ trong trình duyệt. Bản demo chưa có backend hoặc cơ sở dữ liệu dùng chung.',
          ],
          [
            'Mã xác minh là gì?',
            'Mã demo là 482915, có hiệu lực 5 phút. Mỗi lần gửi lại cần chờ 60 giây. Không có email thật được gửi.',
          ],
          [
            'Làm sao bắt đầu lại demo?',
            'Vào Cài đặt → Khôi phục dữ liệu mẫu. Thao tác này xóa các thay đổi cục bộ sau khi xác nhận.',
          ],
        ]
          .map(
            ([t, d]) =>
              `<details class="demo-details"><summary>${t}</summary><p class="mt">${d}</p></details>`
          )
          .join('')}</section></div>`
    );
  }
  function legal(type) {
    const privacy = type === 'privacy';
    shell(
      pageHead(
        privacy ? 'Chính sách bảo mật' : 'Điều khoản sử dụng',
        'Thông tin áp dụng cho nguyên mẫu học phần CSE122.'
      ) +
        `<article class="panel legal">${privacy ? `<h2>Dữ liệu được lưu ở đâu?</h2><p>Thông tin tài khoản mẫu, lịch đặt sân, trận đấu, sự kiện, đánh giá và nhận định AI được lưu trong localStorage của trình duyệt. Phiên đăng nhập và mã xác minh mô phỏng có thể được lưu trong sessionStorage.</p><h2>Không có dịch vụ bên ngoài</h2><p>Nguyên mẫu không gửi email, không dùng Google OAuth, không gọi LLM và không xử lý thanh toán. Ảnh được dùng từ bộ thiết kế do nhóm cung cấp.</p><h2>Kiểm soát dữ liệu</h2><p>Bạn có thể cập nhật hồ sơ hoặc khôi phục dữ liệu mẫu trong Cài đặt. Xóa dữ liệu trang web trong trình duyệt cũng sẽ xóa toàn bộ dữ liệu demo.</p><h2>Thông tin thử nghiệm</h2><p>Chỉ dùng dữ liệu giả lập. Cơ chế tài khoản frontend không thay thế hệ thống bảo mật production; không nhập mật khẩu thật.</p>` : `<h2>Mục đích sử dụng</h2><p>CourtConnect là nguyên mẫu frontend phục vụ học tập. Các lịch sân, giá, tài khoản và giao dịch chỉ dùng để mô phỏng.</p><h2>Đặt sân và tham gia trận</h2><p>Yêu cầu đặt sân cần chủ sân duyệt. Đơn chờ duyệt giữ khung giờ; hủy hoặc từ chối sẽ mở lại. Người chơi không được tham gia trận đã đầy hoặc trùng lịch.</p><h2>Gợi ý thông minh</h2><p>Các tính năng AI sử dụng quy tắc với dữ liệu mẫu. Người dùng có thể sửa, từ chối và quyết định việc lưu kết quả.</p><h2>Ứng xử trong cộng đồng</h2><p>Tôn trọng đồng đội, xác nhận lịch rõ ràng và chủ động báo khi không thể tham gia. Đánh giá và báo cáo cần phản ánh đúng hoạt động đã tham gia.</p>`}<div class="actions mt">${link('Về trang chủ', 'index.html', 'secondary')}${link('Trung tâm hỗ trợ', 'help.html', 'ghost')}</div></article>`
    );
  }
  const routes = {
    index: Player.home,
    'player-court-search': Player.searchCourts,
    'player-open-matches': Player.openMatches,
    'court-detail': Player.courtDetail,
    booking: Player.bookingPage,
    'booking-success': () =>
      shell(
        `<div class="error-page"><div class="auth-symbol">✓</div><h1>Đã gửi yêu cầu đặt sân!</h1><p class="muted">Chủ sân sẽ kiểm tra và xác nhận. Theo dõi kết quả trong Hoạt động của tôi.</p>${link('Xem lịch đặt sân', 'player-my-sports.html')}</div>`
      ),
    'match-detail': Player.matchDetail,
    'player-my-sports': Player.mySports,
    'player-match-create': Player.matchCreate,
    'player-skill-match': AI.skill,
    'venue-court-management': Manage.courts,
    'venue-slot-management': () => location.replace('venue-court-management.html'),
    'venue-revenue': () => Community.revenue(),
    'venue-reviews': () => Community.courtReviews(),
    'profile-public': Community.publicProfile,
    'admin-player-reports': Community.reports,
    'venue-booking-management': Manage.bookings,
    'venue-no-show-risk': AI.risk,
    'organizer-event-management': Manage.events,
    'organizer-event-detail': Manage.eventDetail,
    'organizer-player-roster': Manage.roster,
    'organizer-team-lineup': AI.teams,
    'admin-sport-management': Manage.sports,
    'admin-user-management': Manage.users,
    'admin-sports-report': Manage.reports,
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
    if (Auth.pages.includes(page)) {
      Auth.render(page);
      return;
    }
    const u = CC.me();
    if (!publicPages.includes(page) && !u) {
      sessionStorage.setItem('cc.next', page + '.html' + location.search);
      location.replace('login.html');
      return;
    }
    let required = page.split('-')[0];
    if (['booking', 'booking-success'].includes(page)) required = 'player';
    if (!publicPages.includes(page) && CC.roles[required] && u.role !== required) {
      error(403);
      return;
    }
    if (!routes[page]) {
      error(404);
      return;
    }
    try {
      routes[page]();
      if (u && CC.db.settings[u.id]?.reminder && page === 'player-my-sports') {
        const node = document.createElement('div');
        node.className = 'notice';
        node.textContent = 'Nhớ kiểm tra trạng thái đặt sân và liên hệ đồng đội trước giờ chơi.';
        $('#main').prepend(node);
      }
    } catch (err) {
      shell(
        `<div class="notice error" role="alert">Không thể tải trang: ${esc(err.message)}</div>${btn('Thử lại', 'retry-page', 'secondary')}`
      );
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
            field(
              'Mật khẩu hiện tại',
              'old',
              'password',
              '',
              'required autocomplete="current-password"'
            ) +
              field(
                'Mật khẩu mới',
                'password',
                'password',
                '',
                'required minlength="8" maxlength="80" autocomplete="new-password"'
              ) +
              field(
                'Xác nhận mật khẩu mới',
                'confirm',
                'password',
                '',
                'required autocomplete="new-password"'
              ),
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
  window.App = { error };
  window.renderPage = renderPage;
  renderPage();
})();
