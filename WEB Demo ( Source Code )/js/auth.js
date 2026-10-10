/* Xác thực số điện thoại mô phỏng. Không gửi SMS thật. */
(() => {
  const { $, esc, btn, link, field, select, option, shell, toast } = UI;
  const pages = [
    'login',
    'register',
    'forgot-password',
    'verify-email',
    'verify-reset',
    'reset-password',
  ];
  const titles = {
    login: 'Đăng nhập',
    register: 'Đăng ký tài khoản',
    'forgot-password': 'Quên mật khẩu',
    'verify-email': 'Xác thực số điện thoại',
    'verify-reset': 'Xác thực đổi mật khẩu',
    'reset-password': 'Đặt lại mật khẩu',
  };
  const pending = () => {
    try {
      return JSON.parse(sessionStorage.getItem('cc.pending'));
    } catch {
      return null;
    }
  };
  function issue(phone, type) {
    sessionStorage.setItem(
      'cc.pending',
      JSON.stringify({
        phone,
        type,
        code: '482915',
        expires: Date.now() + 300000,
        resend: Date.now() + 60000,
        verified: false,
      })
    );
  }
  function password(p) {
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,80}$/.test(p))
      throw Error('Mật khẩu cần 8–80 ký tự, gồm chữ và số.');
  }
  const pass = (label, name) =>
    field(
      label,
      name,
      'password',
      '',
      'required minlength="8" maxlength="80" autocomplete="new-password"'
    );
  function success(title, text) {
    shell(
      `<section class="auth-card"><div class="auth-symbol">✓</div><h1>${title}</h1><p>${text}</p>${link('Đăng nhập', 'login.html', 'full')}</section>`,
      true
    );
  }
  function render(page) {
    const p = pending();
    let body = '';
    if (page === 'login')
      body =
        field('Email hoặc số điện thoại', 'login', 'text', '', 'required autocomplete="username"') +
        pass('Mật khẩu', 'password') +
        `<label class="check"><input type="checkbox" name="remember">Ghi nhớ đăng nhập</label><button class="btn full">Đăng nhập</button><p>${link('Quên mật khẩu', 'forgot-password.html', 'ghost')}${link('Đăng ký', 'register.html', 'ghost')}</p><details><summary>3 tài khoản mẫu</summary><p>Mật khẩu: <strong>Court123!</strong></p>${Object.entries(
          CC.roles
        )
          .map(([r, l]) => btn(l, 'demo-login', 'secondary', `data-role="${r}"`))
          .join('')}</details>`;
    if (page === 'register')
      body =
        select(
          'Bạn muốn sử dụng với vai trò nào?',
          'role',
          option('player', 'Người chơi') + option('venue', 'Chủ sân')
        ) +
        field('Họ và tên', 'name', 'text', '', 'required minlength="2" maxlength="80"') +
        field('Email', 'email', 'email', '', 'required autocomplete="email"') +
        field(
          'Số điện thoại',
          'phone',
          'tel',
          '',
          'required pattern="0[0-9]{9}" placeholder="10 chữ số, bắt đầu bằng 0"'
        ) +
        `<fieldset id="owner-fields" hidden disabled><legend>Thông tin sân để admin xét duyệt</legend>${field('Tên sân', 'courtName', 'text', '', 'required minlength="2"')}${field('Địa chỉ sân', 'location', 'text', '', 'required')}${select('Môn thể thao', 'sportId', UI.sports('badminton'))}${field('Giá mỗi giờ (đ)', 'price', 'number', 100000, 'required min="1000"')}${UI.textarea('Mô tả sân', 'description')}</fieldset>` +
        pass('Mật khẩu', 'password') +
        pass('Xác nhận mật khẩu', 'confirm') +
        `<label class="check"><input type="checkbox" name="terms" required>Tôi đồng ý với <a href="privacy.html">điều khoản và quyền riêng tư</a>.</label><button class="btn full">Đăng ký và nhận mã</button>`;
    if (page === 'forgot-password')
      body =
        field(
          'Số điện thoại đã đăng ký',
          'phone',
          'tel',
          CC.me()?.phone || '',
          'required pattern="0[0-9]{9}"'
        ) + '<button class="btn full">Gửi mã xác thực</button>';
    if (['verify-email', 'verify-reset'].includes(page))
      body = `<div class="notice">Đã tạo mã xác thực mô phỏng cho số ${esc(p?.phone || 'chưa có yêu cầu')}. Không gửi SMS thật. Mã demo: <strong>482915</strong>.</div>${field('Mã xác thực 6 chữ số', 'code', 'text', '', 'required pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code"')}<p id="expiry" class="small muted"></p>${btn('Gửi lại mã', 'resend', 'secondary', 'id="resend"')}<button id="verify-submit" class="btn">Xác nhận</button><p>${link('Yêu cầu mã khác', page === 'verify-email' ? 'register.html' : 'forgot-password.html', 'ghost')}</p>`;
    if (page === 'reset-password')
      body =
        pass('Mật khẩu mới', 'password') +
        pass('Xác nhận mật khẩu mới', 'confirm') +
        '<button class="btn full">Lưu mật khẩu mới</button>';
    shell(
      `<section class="auth-card"><div class="auth-top"><div class="auth-symbol">C</div><h1>${titles[page]}</h1><p>Tài khoản CourtConnect · Bản demo cục bộ</p></div><form id="auth-form"><div id="auth-error" class="notice error" hidden role="alert"></div>${body}</form></section>`,
      true
    );
    const error = (msg) => {
      const el = $('#auth-error');
      el.textContent = msg;
      el.hidden = false;
    };
    if (page === 'register')
      $('[name=role]').onchange = (e) => {
        const on = e.target.value === 'venue';
        $('#owner-fields').hidden = !on;
        $('#owner-fields').disabled = !on;
      };
    $('#auth-form').onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.currentTarget));
      try {
        if (page === 'login') {
          const u = CC.db.users.find(
            (u) =>
              (u.email === d.login.trim().toLowerCase() || u.phone === d.login.trim()) &&
              u.password === d.password
          );
          if (!u) throw Error('Tài khoản hoặc mật khẩu không đúng.');
          if (u.status !== 'active' || !CC.roles[u.role])
            throw Error(u.retiredReason || 'Tài khoản đã bị khóa.');
          if (!u.verified) {
            issue(u.phone, 'register');
            location.href = 'verify-email.html';
            return;
          }
          CC.login(u, !!d.remember);
          const next = sessionStorage.getItem('cc.next');
          sessionStorage.removeItem('cc.next');
          location.href =
            next &&
            /^[A-Za-z-]+\.html(?:\?[^<>\s]*)?$/.test(next) &&
            App.allowedPages.includes(next.split('?')[0].slice(0, -5))
              ? next
              : UI.homeFor(u.role);
        }
        if (page === 'register') {
          password(d.password);
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          if (
            !['player', 'venue'].includes(d.role) ||
            d.name.trim().length < 2 ||
            !/^0\d{9}$/.test(d.phone)
          )
            throw Error('Kiểm tra họ tên, số điện thoại và vai trò.');
          if (
            CC.db.users.some((u) => u.email === d.email.trim().toLowerCase() || u.phone === d.phone)
          )
            throw Error('Email hoặc số điện thoại đã được sử dụng.');
          const court = d.role === 'venue' ? Domain.courtData({ ...d, name: d.courtName }) : null;
          CC.transaction(() => {
            const id = CC.id('u');
            CC.db.users.push({
              id,
              name: d.name.trim(),
              email: d.email.trim().toLowerCase(),
              phone: d.phone,
              password: d.password,
              role: d.role,
              status: 'active',
              verified: false,
              ...(court ? { approvalStatus: 'pending' } : {}),
            });
            if (court)
              CC.db.ownerApplications.push({
                id: CC.id('application'),
                userId: id,
                court,
                status: 'pending',
                reason: '',
                createdAt: Domain.now(),
              });
            else
              CC.db.players.push({
                id,
                userId: id,
                name: d.name.trim(),
                levels: { badminton: 1, pickleball: 1 },
                status: 'active',
                played: 0,
                noShows: 0,
              });
          });
          issue(d.phone, 'register');
          location.href = 'verify-email.html';
        }
        if (page === 'forgot-password') {
          if (!/^0\d{9}$/.test(d.phone)) throw Error('Số điện thoại không hợp lệ.');
          issue(d.phone, 'reset');
          location.href = 'verify-reset.html';
        }
        if (page === 'verify-email' || page === 'verify-reset') {
          const p = pending();
          if (
            !p ||
            p.type !== (page === 'verify-email' ? 'register' : 'reset') ||
            Date.now() > p.expires ||
            d.code !== p.code
          )
            throw Error('Mã không đúng hoặc đã hết hạn.');
          const u = CC.db.users.find(
            (u) => u.phone === p.phone && u.status === 'active' && CC.roles[u.role]
          );
          if (!u) throw Error('Không thể xác minh số điện thoại này.');
          if (page === 'verify-email') {
            CC.transaction(() => {
              u.verified = true;
              if (u.role === 'venue')
                Domain.notifyAdmins(
                  'Có chủ sân đã xác thực cần xét duyệt.',
                  'Court-Owner-Approval.html'
                );
            });
            sessionStorage.removeItem('cc.pending');
            success(
              'Đăng ký thành công',
              u.role === 'venue'
                ? 'Số điện thoại đã xác thực. Hồ sơ chủ sân đang chờ admin duyệt.'
                : 'Số điện thoại đã được xác thực. Bạn có thể đăng nhập.'
            );
          } else {
            p.verified = true;
            sessionStorage.setItem('cc.pending', JSON.stringify(p));
            location.href = 'reset-password.html';
          }
        }
        if (page === 'reset-password') {
          const p = pending();
          if (!p || p.type !== 'reset' || !p.verified || Date.now() > p.expires)
            throw Error('Cần xác thực yêu cầu đổi mật khẩu trước.');
          password(d.password);
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          const u = CC.db.users.find(
            (u) => u.phone === p.phone && u.status === 'active' && CC.roles[u.role]
          );
          if (!u) throw Error('Tài khoản không hợp lệ.');
          CC.transaction(() => {
            u.password = d.password;
          });
          CC.logout();
          sessionStorage.removeItem('cc.pending');
          success('Đặt lại mật khẩu thành công', 'Đăng nhập lại bằng mật khẩu mới.');
        }
      } catch (err) {
        error(err.message);
      }
    };
    document.querySelectorAll('[data-action=demo-login]').forEach(
      (b) =>
        (b.onclick = () => {
          const u = CC.db.users.find((u) => u.email === b.dataset.role + '@courtconnect.demo');
          $('[name=login]').value = u.email;
          $('[name=password]').value = 'Court123!';
          $('#auth-form').requestSubmit();
        })
    );
    if (['verify-email', 'verify-reset'].includes(page)) {
      const tick = () => {
        if (!$('#expiry')) return;
        const p = pending(),
          seconds = Math.max(0, Math.ceil(((p?.expires || 0) - Date.now()) / 1000)),
          wait = Math.max(0, Math.ceil(((p?.resend || 0) - Date.now()) / 1000));
        $('#expiry').textContent = `Mã còn hiệu lực ${seconds} giây.`;
        $('#verify-submit').disabled = !seconds;
        $('#resend').disabled = !p || wait > 0;
        $('#resend').textContent = wait ? `Gửi lại sau ${wait}s` : 'Gửi lại mã';
      };
      tick();
      const timer = setInterval(() => ($('#expiry') ? tick() : clearInterval(timer)), 1000);
      $('#resend').onclick = () => {
        const p = pending();
        if (p && Date.now() >= p.resend) {
          issue(p.phone, p.type);
          tick();
          toast('Đã tạo mã mô phỏng mới: 482915.');
        }
      };
    }
  }
  window.Auth = { pages, render, issue, pending };
})();
