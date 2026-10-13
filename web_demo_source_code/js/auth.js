/* Luồng tài khoản mô phỏng cục bộ; không gửi email, không kết nối OAuth. */
(() => {
  const { $, $$, esc, btn, link, field, toast, shell, homeFor } = UI;
  const password = (label, name) =>
    `<label class="field">${label}<span class="password-wrap"><input type="password" name="${name}" required minlength="8" maxlength="80" autocomplete="${name === 'password' ? 'current-password' : 'new-password'}" placeholder="Ít nhất 8 ký tự, gồm chữ và số"><button type="button" data-action="password">Hiện</button></span></label>`;
  const pending = () => {
    try {
      return JSON.parse(sessionStorage.getItem('cc.pending') || 'null');
    } catch {
      return null;
    }
  };
  const setPending = (p) => sessionStorage.setItem('cc.pending', JSON.stringify(p));
  const issue = (email, type) =>
    setPending({
      email,
      type,
      code: '482915',
      expires: Date.now() + 300000,
      resend: Date.now() + 60000,
      verified: false,
    });
  function goAfterLogin(u) {
    const next = sessionStorage.getItem('cc.next');
    sessionStorage.removeItem('cc.next');
    const allowed =
      next &&
      /^[a-z0-9-]+\.html(?:\?[^\s<>]*)?$/.test(next) &&
      (!UI.roleForPage(next) || UI.roleForPage(next) === u.role);
    location.href = allowed ? next : homeFor(u.role);
  }
  function validPassword(p) {
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,80}$/.test(p))
      throw Error('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số.');
  }
  const descriptions = {
    login: ['Đăng nhập', 'Chào mừng bạn trở lại CourtConnect'],
    register: ['Tạo tài khoản', 'Khám phá cộng đồng và đặt sân nhanh chóng'],
    'forgot-password': [
      'Quên mật khẩu?',
      'Nhập email bạn dùng để đăng ký. Chúng tôi sẽ mô phỏng gửi mã xác nhận để đặt lại mật khẩu.',
    ],
    'verification-sent': ['Kiểm tra email của bạn', 'Mã xác minh đã sẵn sàng trong bản demo.'],
    'verify-email': ['Xác minh email', 'Hoàn tất xác minh để bắt đầu kết nối.'],
    'registration-success': [
      'Tài khoản đã sẵn sàng!',
      'Email đã được xác minh thành công. Hãy đăng nhập ngay để kết nối bạn bè và đặt sân chơi.',
    ],
    'recovery-sent': [
      'Kiểm tra email của bạn',
      'Nếu email đã được đăng ký, bạn có thể dùng mã mô phỏng để đặt lại mật khẩu.',
    ],
    'verify-reset': ['Nhập mã xác nhận', 'Xác minh yêu cầu khôi phục tài khoản.'],
    'reset-password': ['Đặt mật khẩu mới', '1. Email → 2. Xác minh → 3. Mật khẩu mới'],
    'reset-success': ['Đổi mật khẩu thành công', 'Bạn có thể đăng nhập bằng mật khẩu mới.'],
  };
  function renderAuth(page) {
    const [title, sub] = descriptions[page];
    let body = '',
      p = pending();
    if (page === 'login')
      body = `${field('Email', 'email', 'email', '', 'required autocomplete="email" placeholder="Nhập địa chỉ email"')}${password('Mật khẩu', 'password')}<div class="row mb"><label class="check" style="margin:0"><input type="checkbox" name="remember">Ghi nhớ đăng nhập</label><span class="spacer"></span><a class="small" href="forgot-password.html">Quên mật khẩu?</a></div><button class="btn full" type="submit">Đăng nhập</button><div class="or">Hoặc</div>${btn('ⓖ Tiếp tục với Google', 'google', 'secondary full')}<p class="auth-bottom">Chưa có tài khoản? <a href="register.html">Đăng ký ngay</a></p><details class="demo-details"><summary>Trải nghiệm nhanh với 4 tài khoản mẫu</summary><p>Mật khẩu chung: <strong>Court123!</strong></p><div class="demo-grid">${Object.entries(
        CC.roles
      )
        .map(([r, l]) => btn(l, 'demo-login', 'secondary small', `data-role="${r}"`))
        .join('')}</div><p>Tài khoản/email chỉ mô phỏng trên trình duyệt này.</p></details>`;
    if (page === 'register')
      body = `${field('Họ và tên', 'name', 'text', '', 'required minlength="2" maxlength="80" autocomplete="name" placeholder="Nhập đầy đủ họ và tên"')}${field('Email', 'email', 'email', p?.type === 'register' ? p.email : '', 'required autocomplete="email" placeholder="Nhập địa chỉ email"')}${password('Mật khẩu', 'password')}${password('Xác nhận mật khẩu', 'confirm')}<label class="check"><input type="checkbox" name="terms" required><span>Tôi đồng ý với <a href="terms.html">Điều khoản sử dụng</a> và <a href="privacy.html">Chính sách bảo mật</a> của CourtConnect.</span></label><button class="btn full">Tạo tài khoản</button><div class="or">Hoặc</div>${btn('ⓖ Đăng ký bằng Google', 'google', 'secondary full')}<p class="auth-bottom">Đã có tài khoản? <a href="login.html">Đăng nhập</a></p>`;
    if (page === 'forgot-password')
      body = `${field('Email', 'email', 'email', '', 'required placeholder="Nhập địa chỉ email của bạn"')}<button class="btn full">Gửi mã xác nhận</button><p class="auth-bottom"><a href="login.html">Quay lại đăng nhập</a></p>`;
    if (['verification-sent', 'recovery-sent'].includes(page))
      body = `<p class="center muted">${esc(p?.email || 'Chưa có yêu cầu xác minh')}</p><div class="notice">Demo không gửi email thật. Mã thử nghiệm: <strong>482915</strong>, có hiệu lực 5 phút.</div>${link('Nhập mã xác minh', page === 'verification-sent' ? 'verify-email.html' : 'verify-reset.html', 'full')}<p class="auth-bottom"><a href="${page === 'verification-sent' ? 'register' : 'forgot-password'}.html">Thay đổi email nhận mã</a></p>`;
    if (['verify-email', 'verify-reset'].includes(page))
      body = `<p class="center muted small">Mã dành cho ${esc(p?.email || '—')} · <a href="${page === 'verify-email' ? 'register' : 'forgot-password'}.html">Thay đổi</a></p><div class="otp-inputs">${Array.from({ length: 6 }, (_, i) => `<input type="text" name="otp${i}" aria-label="Chữ số ${i + 1}" inputmode="numeric" pattern="[0-9]" maxlength="1" required ${i === 0 ? 'autocomplete="one-time-code"' : ''}>`).join('')}</div><p class="center small muted">Mã có hiệu lực trong <strong id="expiry">05:00</strong></p><p class="center small">Chưa nhận được mã? ${btn('Gửi lại mã', 'resend', 'ghost small', 'id="resend"')}</p><button class="btn full" id="verify-submit">Xác nhận mã</button><p class="small muted center mt">Mã mô phỏng: 482915 · không gửi email thật.</p>`;
    if (page === 'reset-password')
      body = `${password('Mật khẩu mới', 'password')}${password('Xác nhận mật khẩu mới', 'confirm')}<button class="btn full">Lưu mật khẩu mới</button>`;
    if (['registration-success', 'reset-success'].includes(page))
      body = `${link('Đăng nhập ngay', 'login.html', 'full')}<p class="auth-bottom"><a href="index.html">← Quay lại trang chủ</a></p>`;
    shell(
      `<div class="auth-card"><div class="auth-top"><div class="auth-symbol">${page.includes('success') ? '✓' : page.includes('sent') ? '✉' : 'C'}</div><h1>${title}</h1><p>${sub}</p></div><form id="auth-form"><div id="auth-error" class="notice error" role="alert" hidden></div>${body}</form></div>`,
      true
    );
    const error = (msg) => {
      const n = $('#auth-error');
      n.innerHTML = msg;
      n.hidden = false;
    };
    $('#auth-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.currentTarget,
        d = Object.fromEntries(new FormData(f));
      const submit = f.querySelector('button:not([type="button"])');
      if (submit) {
        submit.disabled = true;
        submit.dataset.text = submit.textContent;
        submit.textContent = 'Đang xử lý…';
      }
      await new Promise((r) => setTimeout(r, 350));
      try {
        if (page === 'login') {
          const u = CC.db.users.find(
            (u) => u.email === d.email.trim().toLowerCase() && u.password === d.password
          );
          if (!u) throw Error('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
          if (u.status !== 'active') throw Error('Tài khoản đã bị vô hiệu hóa.');
          if (!u.verified) {
            issue(u.email, 'register');
            error(
              'Tài khoản chưa được xác minh. <a href="verification-sent.html">Xác minh email</a>'
            );
            return;
          }
          CC.login(u, !!d.remember);
          goAfterLogin(u);
        }
        if (page === 'register') {
          validPassword(d.password);
          if (d.name.trim().length < 2) throw Error('Vui lòng nhập họ và tên.');
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          if (CC.db.users.some((u) => u.email === d.email.trim().toLowerCase()))
            throw Error('Email đã được đăng ký. Hãy đăng nhập hoặc khôi phục mật khẩu.');
          CC.transaction(() => {
            const id = CC.id('u');
            CC.db.users.push({
              id,
              name: d.name.trim(),
              email: d.email.trim().toLowerCase(),
              password: d.password,
              verified: false,
              role: 'player',
              status: 'active',
              phone: '',
            });
            CC.db.players.push({
              id,
              userId: id,
              name: d.name.trim(),
              levels: { badminton: 1, pickleball: 1 },
              played: 0,
              noShows: 0,
              status: 'active',
            });
          });
          issue(d.email.trim().toLowerCase(), 'register');
          location.href = 'verification-sent.html';
        }
        if (page === 'forgot-password') {
          issue(d.email.trim().toLowerCase(), 'reset');
          location.href = 'recovery-sent.html';
        }
        if (['verify-email', 'verify-reset'].includes(page)) {
          p = pending();
          if (!p || p.type !== (page === 'verify-email' ? 'register' : 'reset'))
            throw Error('Chưa có yêu cầu phù hợp. Hãy quay lại bước nhập email.');
          if (Date.now() > p.expires) throw Error('Mã xác minh đã hết hạn. Vui lòng gửi lại mã.');
          const code = Array.from({ length: 6 }, (_, i) => d['otp' + i]).join('');
          if (code !== p.code) throw Error('Mã xác minh không chính xác. Vui lòng thử lại.');
          const u = CC.db.users.find((u) => u.email === p.email);
          if (!u) throw Error('Không thể xác minh. Kiểm tra lại địa chỉ email.');
          if (page === 'verify-email') {
            CC.transaction(() => (u.verified = true));
            sessionStorage.removeItem('cc.pending');
            location.href = 'registration-success.html';
          } else {
            p.verified = true;
            setPending(p);
            location.href = 'reset-password.html';
          }
        }
        if (page === 'reset-password') {
          p = pending();
          if (!p?.verified || p.type !== 'reset' || Date.now() > p.expires)
            throw Error('Phiên khôi phục chưa xác minh hoặc đã hết hạn. Hãy yêu cầu mã mới.');
          validPassword(d.password);
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          const u = CC.db.users.find((u) => u.email === p.email);
          if (!u) throw Error('Không tìm thấy tài khoản.');
          CC.transaction(() => (u.password = d.password));
          sessionStorage.removeItem('cc.pending');
          CC.logout();
          location.href = 'reset-success.html';
        }
      } catch (err) {
        error(esc(err.message));
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = submit.dataset.text;
        }
      }
    };
    $$('[data-action=demo-login]').forEach(
      (b) =>
        (b.onclick = () => {
          const u = CC.db.users.find((u) => u.email === `${b.dataset.role}@courtconnect.demo`);
          $('[name=email]').value = u.email;
          $('[name=password]').value = 'Court123!';
          $('#auth-form').requestSubmit();
        })
    );
    $('[data-action=google]')?.addEventListener('click', () =>
      UI.modal(
        'Đăng nhập Google',
        `<p class="muted">Nguyên mẫu chưa kết nối Google OAuth. Bạn có thể dùng tài khoản mẫu hoặc đăng ký bằng email mô phỏng.</p><div class="actions">${btn('Đã hiểu', 'close')}</div>`
      )
    );
    if (['verify-email', 'verify-reset'].includes(page)) {
      const inputs = $$('.otp-inputs input');
      inputs.forEach((n, i) => {
        n.oninput = () => {
          n.value = n.value.replace(/\D/g, '').slice(-1);
          if (n.value) inputs[i + 1]?.focus();
        };
        n.onkeydown = (e) => {
          if (e.key === 'Backspace' && !n.value) inputs[i - 1]?.focus();
        };
        n.onpaste = (e) => {
          e.preventDefault();
          const s = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
          s.split('').forEach((v, k) => {
            if (inputs[k]) inputs[k].value = v;
          });
          inputs[Math.min(s.length, 5)].focus();
        };
      });
      const tick = () => {
        if (!$('#expiry')) return;
        const p = pending(),
          seconds = Math.max(0, Math.ceil(((p?.expires || 0) - Date.now()) / 1000));
        $('#expiry').textContent =
          String(Math.floor(seconds / 60)).padStart(2, '0') +
          ':' +
          String(seconds % 60).padStart(2, '0');
        const wait = Math.max(0, Math.ceil(((p?.resend || 0) - Date.now()) / 1000));
        $('#resend').disabled = wait > 0;
        $('#resend').textContent = wait ? 'Gửi lại sau ' + wait + 's' : 'Gửi lại mã';
        $('#verify-submit').disabled = seconds === 0;
        if (seconds === 0) error('Mã xác minh đã hết hạn. Hãy gửi lại mã.');
      };
      tick();
      const timer = setInterval(() => {
        if (!$('#expiry')) clearInterval(timer);
        else tick();
      }, 1000);
      $('#resend').onclick = () => {
        const p = pending();
        if (!p) {
          error('Hãy nhập email trước.');
          return;
        }
        issue(p.email, p.type);
        $('#auth-error').hidden = true;
        tick();
        toast('Mã demo mới: 482915');
      };
    }
  }
  window.Auth = { render: renderAuth, pages: Object.keys(descriptions) };
})();
