/* Luồng tài khoản mô phỏng cục bộ; không gửi email, không kết nối OAuth. */
(() => {
  const {
    $,
    $$,
    esc,
    btn,
    link,
    field,
    toast,
    homeFor
  } = UI;
  const pending = () => {
    try {
      return JSON.parse(sessionStorage.getItem('cc.pending') || 'null');
    } catch {
      return null;
    }
  };
  const setPending = p => sessionStorage.setItem('cc.pending', JSON.stringify(p));
  const issue = (email, type) => setPending({
    email,
    type,
    code: '482915',
    expires: Date.now() + 300000,
    resend: Date.now() + 60000,
    verified: false
  });
  function goAfterLogin(u) {
    const next = sessionStorage.getItem('cc.next');
    sessionStorage.removeItem('cc.next');
    const allowed = next && /^[a-z0-9-]+\.html(?:\?[^\s<>]*)?$/.test(next) && (!UI.roleForPage(next) || UI.roleForPage(next) === u.role);
    location.href = allowed ? next : homeFor(u.role);
  }
  function validPassword(p) {
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,80}$/.test(p)) throw Error('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số.');
  }
  function renderAuth(page) {
    let p = pending();
    switch (page) {
      case "login":
        Views.update("auth-login", {
          "demoAccountButtons": () => Object.entries(CC.roles).map(([r, l]) => btn(l, 'demo-login', 'secondary small', `data-role="${r}"`)).join('')
        });
        break;
      case "register":
        Views.update("auth-register", {
          "email": () => esc(p?.type === 'register' ? p.email : '')
        });
        break;
      case "forgot-password":
        Views.update("auth-forgot-password", {});
        break;
      case "verification-sent":
        Views.update("auth-verification-sent", {
          "emailLabel": () => esc(p?.email || 'Chưa có yêu cầu xác minh')
        });
        break;
      case "verify-email":
        Views.update("auth-verify-email", {
          "email": () => esc(p?.email || '—')
        });
        break;
      case "registration-success":
        Views.update("auth-registration-success", {});
        break;
      case "recovery-sent":
        Views.update("auth-recovery-sent", {
          "emailLabel": () => esc(p?.email || 'Chưa có yêu cầu xác minh')
        });
        break;
      case "verify-reset":
        Views.update("auth-verify-reset", {
          "email": () => esc(p?.email || '—')
        });
        break;
      case "reset-password":
        Views.update("auth-reset-password", {});
        break;
      case "reset-success":
        Views.update("auth-reset-success", {});
        break;
    }
    const error = msg => {
      const n = $('#auth-error');
      n.innerHTML = msg;
      n.hidden = false;
    };
    $('#auth-form').onsubmit = async e => {
      e.preventDefault();
      const f = e.currentTarget,
        d = Object.fromEntries(new FormData(f));
      const submit = f.querySelector('button:not([type="button"])');
      if (submit) {
        submit.disabled = true;
        submit.dataset.text = submit.textContent;
        submit.textContent = 'Đang xử lý…';
      }
      await new Promise(r => setTimeout(r, 350));
      try {
        if (page === 'login') {
          const u = CC.db.users.find(u => u.email === d.email.trim().toLowerCase() && u.password === d.password);
          if (!u) throw Error('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
          if (u.status !== 'active') throw Error('Tài khoản đã bị vô hiệu hóa.');
          if (!u.verified) {
            issue(u.email, 'register');
            error('Tài khoản chưa được xác minh. <a href="verification-sent.html">Xác minh email</a>');
            return;
          }
          CC.login(u, !!d.remember);
          goAfterLogin(u);
        }
        if (page === 'register') {
          validPassword(d.password);
          if (d.name.trim().length < 2) throw Error('Vui lòng nhập họ và tên.');
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          if (CC.db.users.some(u => u.email === d.email.trim().toLowerCase())) throw Error('Email đã được đăng ký. Hãy đăng nhập hoặc khôi phục mật khẩu.');
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
              phone: ''
            });
            CC.db.players.push({
              id,
              userId: id,
              name: d.name.trim(),
              levels: {
                badminton: 1,
                pickleball: 1
              },
              played: 0,
              noShows: 0,
              status: 'active'
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
          if (!p || p.type !== (page === 'verify-email' ? 'register' : 'reset')) throw Error('Chưa có yêu cầu phù hợp. Hãy quay lại bước nhập email.');
          if (Date.now() > p.expires) throw Error('Mã xác minh đã hết hạn. Vui lòng gửi lại mã.');
          const code = Array.from({
            length: 6
          }, (_, i) => d['otp' + i]).join('');
          if (code !== p.code) throw Error('Mã xác minh không chính xác. Vui lòng thử lại.');
          const u = CC.db.users.find(u => u.email === p.email);
          if (!u) throw Error('Không thể xác minh. Kiểm tra lại địa chỉ email.');
          if (page === 'verify-email') {
            CC.transaction(() => u.verified = true);
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
          if (!p?.verified || p.type !== 'reset' || Date.now() > p.expires) throw Error('Phiên khôi phục chưa xác minh hoặc đã hết hạn. Hãy yêu cầu mã mới.');
          validPassword(d.password);
          if (d.password !== d.confirm) throw Error('Mật khẩu xác nhận không khớp.');
          const u = CC.db.users.find(u => u.email === p.email);
          if (!u) throw Error('Không tìm thấy tài khoản.');
          CC.transaction(() => u.password = d.password);
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
    $$('[data-action=demo-login]').forEach(b => b.onclick = () => {
      const u = CC.db.users.find(u => u.email === `${b.dataset.role}@courtconnect.demo`);
      $('[name=email]').value = u.email;
      $('[name=password]').value = 'Court123!';
      $('#auth-form').requestSubmit();
    });
    $('[data-action=google]')?.addEventListener('click', () => UI.modal('Đăng nhập Google', Views.fragment("auth-renderAuth-dialog-1", {})));
    if (['verify-email', 'verify-reset'].includes(page)) {
      const inputs = $$('.otp-inputs input');
      inputs.forEach((n, i) => {
        n.oninput = () => {
          n.value = n.value.replace(/\D/g, '').slice(-1);
          if (n.value) inputs[i + 1]?.focus();
        };
        n.onkeydown = e => {
          if (e.key === 'Backspace' && !n.value) inputs[i - 1]?.focus();
        };
        n.onpaste = e => {
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
        $('#expiry').textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
        const wait = Math.max(0, Math.ceil(((p?.resend || 0) - Date.now()) / 1000));
        $('#resend').disabled = wait > 0;
        $('#resend').textContent = wait ? 'Gửi lại sau ' + wait + 's' : 'Gửi lại mã';
        $('#verify-submit').disabled = seconds === 0;
        if (seconds === 0) error('Mã xác minh đã hết hạn. Hãy gửi lại mã.');
      };
      tick();
      const timer = setInterval(() => {
        if (!$('#expiry')) clearInterval(timer);else tick();
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
  window.Auth = {
    render: renderAuth,
    pages: ["login", "register", "forgot-password", "verification-sent", "verify-email", "registration-success", "recovery-sent", "verify-reset", "reset-password", "reset-success"]
  };
})();
