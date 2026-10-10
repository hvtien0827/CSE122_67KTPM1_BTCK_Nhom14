/* Lịch sân, đánh giá và hồ sơ cộng đồng. Dữ liệu được nâng cấp một lần. */
(() => {
  'use strict';
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
    money,
    day,
    badge,
    empty,
    stats,
  } = UI;
  const ended = (s) => !!s && new Date(`${s.date}T${s.end}`) <= new Date();
  if (!CC.loadError && !CC.db.communityVersion)
    CC.transaction(() => {
      const db = CC.db;
      db.courtReviews ||= [];
      db.opponentReviews ||= [];
      db.playerReports ||= [];
      db.users.forEach((u) => {
        u.phonePublic ??= false;
        u.socialLinks ||= {};
      });
      if (['u1', 'u5', 'u6', 'u7'].every((id) => CC.find('users', id)) && CC.find('courts', 'c1')) {
        [-14, -7, -2, 2, 4].forEach((offset, i) => {
          const id = `community-${i}`,
            date = CC.date(offset),
            completed = offset < 0;
          const slot = {
            id,
            courtId: 'c1',
            date,
            start: '10:00',
            end: '12:00',
            price: 240000,
            status: 'open',
          };
          if (
            db.slots.some(
              (s) =>
                s.courtId === 'c1' && s.date === date && s.start < slot.end && s.end > slot.start
            )
          )
            return;
          db.slots.push(slot);
          db.bookings.push({
            id,
            slotId: id,
            playerId: 'u1',
            status: completed ? 'completed' : 'approved',
            note: 'Lịch mẫu để trải nghiệm',
            createdAt: new Date().toISOString(),
          });
          db.matches.push({
            id,
            slotId: id,
            name: completed ? `Giao lưu đã đấu ${i + 1}` : `Hẹn ra sân ${i - 2}`,
            level: 3,
            capacity: 4,
            hostId: 'u1',
            playerIds: ['u1', 'u5', 'u6', 'u7'],
            status: completed ? 'completed' : 'open',
            matchedAtCapacity: true,
            note: 'Trận mẫu của CourtConnect',
          });
        });
        const b = db.bookings.find((b) => b.id === 'community-0');
        if (b)
          db.courtReviews.push({
            id: 'review-demo',
            bookingId: b.id,
            courtId: 'c1',
            authorId: 'u1',
            stars: 5,
            tags: ['Sân đẹp', 'Sạch sẽ'],
            comment: 'Sân thoáng, ánh sáng tốt. Nhóm mình chơi rất thoải mái.',
            createdAt: new Date().toISOString(),
          });
      }
      db.matches.forEach((m) => {
        if (m.playerIds.length >= m.capacity) m.matchedAtCapacity = true;
      });
      db.communityVersion = 1;
    });

  function reviewList(rows) {
    return rows.length
      ? rows
          .slice()
          .reverse()
          .map(
            (r) =>
              `<article class="person-card"><strong>${esc(CC.find('users', r.authorId)?.name || 'Thành viên')}</strong> <span class="rating-stars">${'★'.repeat(r.stars)} · ${r.stars}/5</span><p class="review-comment">${esc(r.comment)}</p></article>`
          )
          .join('')
      : empty('Chưa có đánh giá', 'Người thuê có thể đánh giá sau khi hoàn thành.');
  }
  function review(id) {
    const u = CC.requireRole('player'),
      b = CC.find('bookings', id),
      s = CC.find('slots', b?.slotId);
    if (!b || b.playerId !== u.id || b.status !== 'completed' || !ended(s))
      throw Error('Chỉ đánh giá lượt thuê của bạn đã hoàn thành.');
    const old = CC.db.courtReviews.find((r) => r.bookingId === id && r.authorId === u.id);
    UI.formDialog(
      'Đánh giá sân',
      select(
        'Số sao',
        'stars',
        [1, 2, 3, 4, 5].map((n) => option(n, '★'.repeat(n), old?.stars || 5)).join('')
      ) + textarea('Bình luận', 'comment', old?.comment || ''),
      'Gửi đánh giá',
      (d) => {
        if (![1, 2, 3, 4, 5].includes(+d.stars)) throw Error('Chọn 1–5 sao.');
        CC.transaction(() => {
          const row = {
            bookingId: id,
            authorId: u.id,
            courtId: s.courtId,
            stars: +d.stars,
            comment: d.comment.trim(),
            createdAt: new Date().toISOString(),
          };
          if (old) Object.assign(old, row);
          else CC.db.courtReviews.push({ id: CC.id('review'), ...row });
        });
      },
      'Đánh giá thành công.'
    );
  }
  function slotContact(s) {
    const b = CC.db.bookings.find(
      (b) => b.slotId === s.id && ['pending', 'approved', 'completed'].includes(b.status)
    );
    if (!b) return `${s.start}–${s.end}`;
    const u = CC.find('users', b.playerId);
    return `${s.start}–${s.end} · ${b.contactName || u?.name || ''} · ${b.contactPhone || u?.phone || 'Chưa có số điện thoại'}`;
  }
  const ownCourts = () => CC.db.courts.filter((c) => c.ownerId === CC.requireRole('venue').id);
  function courtOptions(selected) {
    return (
      option('', 'Tất cả sân', selected) +
      ownCourts()
        .map((c) => option(c.id, c.name, selected))
        .join('')
    );
  }
  function calendar(id, date = CC.date(0), embedded = false) {
    const c = ownCourts().find((c) => c.id === id);
    if (!c) throw Error('Không có quyền xem lịch sân này.');
    const base = new Date(date + 'T12:00:00');
    if (Number.isNaN(+base)) return;
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const slots = CC.db.slots.filter((s) => s.courtId === id && dates.includes(s.date));
    const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    const min = Math.min(6 * 60, ...slots.map((s) => minutes(s.start))),
      max = Math.max(22 * 60, ...slots.map((s) => minutes(s.end)));
    const status = (s) => {
      const b = CC.db.bookings.find(
        (b) => b.slotId === s.id && ['pending', 'approved', 'completed'].includes(b.status)
      );
      return b
        ? b.status
        : s.status === 'open' && CC.future(s) && c.status === 'active'
          ? 'free'
          : 'closed';
    };
    const labels = {
      free: 'Đang trống',
      pending: 'Chờ duyệt',
      approved: 'Đã có người thuê',
      completed: 'Đã thuê xong',
      closed: 'Đã đóng / đã qua',
    };
    const makeDialog = embedded
      ? (title, body) => {
          const el = document.createElement('section');
          el.className = 'panel calendar-inline';
          el.id = 'venue-calendar';
          el.innerHTML = `<h2>${title}</h2><div class="dialog-body">${body}</div>`;
          const old = $('#venue-calendar');
          if (old) old.replaceWith(el);
          else $('#main').append(el);
          return el;
        }
      : UI.modal;
    const dialog = makeDialog(
      `Lịch sân · ${esc(c.name)}`,
      `<div class="filter-bar">${field('Bắt đầu từ ngày', 'calendar-date', 'date', date)}${btn('← 7 ngày', 'calendar-prev', 'secondary')}${btn('7 ngày →', 'calendar-next', 'secondary')}${btn('+ Mở khung giờ', 'calendar-new', '')}</div><p class="small muted">Bấm khung giờ để xem chi tiết. Vùng không có lịch là chưa mở bán.</p><div class="actions">${Object.entries(
        labels
      )
        .map(([k, v]) => `<span class="calendar-key ${k}">${v}</span>`)
        .join(
          ''
        )}</div><div class="calendar-scroll"><div class="calendar-grid"><div class="calendar-axis"><div class="calendar-heading">Giờ</div><div style="height:${max - min}px">${Array.from({ length: Math.floor((max - min) / 60) + 1 }, (_, i) => `<span style="top:${i * 60}px">${String(Math.floor(min / 60) + i).padStart(2, '0')}:00</span>`).join('')}</div></div>${dates
        .map(
          (d) =>
            `<div><div class="calendar-heading">${day(d)}</div><div class="calendar-day" style="height:${max - min}px">${slots
              .filter((s) => s.date === d)
              .map(
                (s) =>
                  `<button class="calendar-slot ${status(s)}" style="top:${minutes(s.start) - min}px;height:${Math.max(24, minutes(s.end) - minutes(s.start) - 3)}px" title="${esc(slotContact(s))}" data-action="calendar-slot" data-id="${esc(s.id)}"><strong>${s.start}–${s.end}</strong><br>${labels[status(s)]}</button>`
              )
              .join('')}</div></div>`
        )
        .join('')}</div></div>`
    );
    dialog.classList.add('calendar-dialog');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const agenda = document.createElement('section');
    agenda.className = 'calendar-agenda';
    const daily = slots
      .filter((s) => s.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
    agenda.innerHTML = `<h3>${day(date)}</h3><p class="small muted">Chọn ngày ở trên để xem lịch. Khoảng giờ không được liệt kê là chưa mở bán.</p>${daily.length ? daily.map((s) => `<button type="button" class="agenda-slot ${status(s)}" title="${esc(slotContact(s))}" data-action="calendar-slot" data-id="${esc(s.id)}"><span><strong>${s.start} – ${s.end}</strong><small>${money(s.price)}</small></span><span>${labels[status(s)]} →</span></button>`).join('') : '<div class="notice">Chưa mở khung giờ trong ngày này.</div>'}`;
    $('.dialog-body', dialog).append(agenda);
    $('[data-action=calendar-prev]', dialog).textContent = mobile ? '← Ngày trước' : '← 7 ngày';
    $('[data-action=calendar-next]', dialog).textContent = mobile ? 'Ngày sau →' : '7 ngày →';
    $('[name=calendar-date]', dialog).onchange = (e) => calendar(id, e.target.value, embedded);
    const shift = (n) => {
      base.setDate(base.getDate() + n);
      calendar(
        id,
        `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`,
        embedded
      );
    };
    $('[data-action=calendar-prev]', dialog).onclick = () =>
      shift(window.matchMedia('(max-width: 760px)').matches ? -1 : -7);
    $('[data-action=calendar-next]', dialog).onclick = () =>
      shift(window.matchMedia('(max-width: 760px)').matches ? 1 : 7);
    $('[data-action=calendar-new]', dialog).onclick = () => slotForm(id, date);
  }
  function slotForm(courtId, date, key) {
    if (!ownCourts().some((c) => c.id === courtId)) throw Error('Không có quyền.');
    const s = CC.find('slots', key),
      c = CC.find('courts', courtId);
    UI.formDialog(
      key ? 'Sửa khung giờ' : 'Mở khung giờ',
      field('Ngày', 'date', 'date', s?.date || date, 'required') +
        field('Từ giờ', 'start', 'time', s?.start || '08:00', 'required') +
        field('Đến giờ', 'end', 'time', s?.end || '10:00', 'required') +
        field(
          'Giá toàn khung (đ)',
          'price',
          'number',
          s?.price || c.price * 2,
          'required min="1000"'
        ),
      'Lưu khung giờ',
      (d) => {
        CC.saveEntity('slots', { ...d, courtId, price: Number(d.price) }, key);
        setTimeout(() => calendar(courtId, d.date), 0);
      }
    );
  }
  function periodRange(period, date) {
    const start = new Date(date + 'T00:00:00');
    if (Number.isNaN(+start)) throw Error('Ngày không hợp lệ.');
    if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (period === 'month') start.setDate(1);
    if (period === 'year') start.setMonth(0, 1);
    const end = new Date(start);
    if (period === 'year') end.setFullYear(end.getFullYear() + 1);
    else if (period === 'month') end.setMonth(end.getMonth() + 1);
    else end.setDate(end.getDate() + (period === 'week' ? 7 : 1));
    return { start, end };
  }
  function revenueRows(period, date, courtId = '') {
    const ids = ownCourts().map((c) => c.id),
      { start, end } = periodRange(period, date);
    return CC.db.bookings.filter((b) => {
      const s = CC.find('slots', b.slotId),
        d = new Date(s?.date + 'T00:00:00');
      return (
        s && ids.includes(s.courtId) && (!courtId || courtId === s.courtId) && d >= start && d < end
      );
    });
  }
  function revenue(period = 'month', date = CC.date(0), courtId = '') {
    const rows = revenueRows(period, date, courtId),
      sum = (status) =>
        rows
          .filter((b) => b.status === status)
          .reduce((n, b) => n + CC.find('slots', b.slotId).price, 0),
      { start, end } = periodRange(period, date);
    const last = new Date(+end - 1);
    shell(
      pageHead(
        'Thống kê doanh thu',
        'Doanh thu tính theo ngày sử dụng sân, từ các đơn đã hoàn thành.'
      ) +
        `<div class="filter-bar">${select(
          'Khoảng thời gian',
          'revenue-period',
          [
            ['day', 'Ngày'],
            ['week', 'Tuần'],
            ['month', 'Tháng'],
            ['year', 'Năm'],
          ]
            .map(([v, l]) => option(v, l, period))
            .join('')
        )}${field('Ngày tham chiếu', 'revenue-date', 'date', date, 'required')}${select('Sân', 'revenue-court', courtOptions(courtId))}</div><p class="muted">${start.toLocaleDateString('vi-VN')} – ${last.toLocaleDateString('vi-VN')} · Tuần bắt đầu thứ Hai.</p>` +
        stats([
          ['Doanh thu hoàn thành', money(sum('completed'))],
          ['Dự kiến (đã duyệt)', money(sum('approved'))],
          ['Lượt thuê hoàn thành', rows.filter((b) => b.status === 'completed').length],
        ]) +
        `<h2>Doanh thu theo sân</h2>` +
        table(
          ['Sân', 'Lượt hoàn thành', 'Doanh thu'],
          ownCourts()
            .filter((c) => !courtId || c.id === courtId)
            .map((c) => {
              const bs = rows.filter(
                (b) => b.status === 'completed' && CC.find('slots', b.slotId).courtId === c.id
              );
              return [
                esc(c.name),
                bs.length,
                money(bs.reduce((n, b) => n + CC.find('slots', b.slotId).price, 0)),
              ];
            })
        ) +
        `<h2 class="mt">Chi tiết lượt thuê</h2>` +
        table(
          ['Ngày / sân', 'Người thuê', 'Trạng thái', 'Giá trị'],
          rows.map((b) => {
            const s = CC.find('slots', b.slotId);
            return [
              `${day(s.date)} · ${esc(CC.courtFor(s).name)}`,
              esc(CC.find('users', b.playerId)?.name),
              badge(b.status),
              money(s.price),
            ];
          })
        )
    );
    ['revenue-period', 'revenue-date', 'revenue-court'].forEach(
      (name) =>
        ($(`[name=${name}]`).onchange = () => {
          if ($('[name=revenue-date]').value)
            revenue(
              $('[name=revenue-period]').value,
              $('[name=revenue-date]').value,
              $('[name=revenue-court]').value
            );
        })
    );
  }

  function info(id, booking = false) {
    const u = CC.find('users', id);
    if (!u) return '<p>Không tìm thấy người dùng.</p>';
    const c = Domain.counts(id);
    return `<h3>${esc(u.name)}</h3>${stats(
      booking
        ? [
            ['Lượt đặt', c.booked],
            ['Hoàn thành', c.bookingCompleted],
            ['Tự hủy', c.bookingCancelled],
            ['Bị báo cáo', c.reports],
          ]
        : [
            ['Ghép đủ người', c.matched],
            ['Hoàn thành', c.completed],
            ['Tự hủy/rút', c.cancelled],
            ['Bị báo cáo', c.reports],
          ]
    )}<p class="small muted">Số liệu từ lịch sử trong ứng dụng. Báo cáo chưa đồng nghĩa vi phạm đã xác nhận.</p>${booking && c.recentCancelled >= 2 ? `<div class="notice warning">AI mô phỏng cảnh báo: tự hủy ${c.recentCancelled} lượt đặt trong 30 ngày gần nhất. Chủ sân quyết định duyệt.</div>` : ''}`;
  }
  function person(id, booking = false) {
    return btn(
      esc(CC.find('users', id)?.name || 'Thành viên'),
      'person-info',
      'ghost small',
      `data-id="${esc(id)}" data-booking="${booking}" aria-haspopup="dialog"`
    );
  }
  function opponentCards(m) {
    return `<section class="opponent-list"><h3>Thông tin người chơi</h3>${m.playerIds.map((id) => person(id)).join('')}</section>`;
  }
  let tip;
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest('[data-action=person-info]');
    if (!el || el.contains(e.relatedTarget)) return;
    tip?.remove();
    tip = document.createElement('div');
    tip.className = 'person-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML = info(el.dataset.id, el.dataset.booking === 'true');
    document.body.append(tip);
    const r = el.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(r.left, innerWidth - tip.offsetWidth - 8)) + 'px';
    tip.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - tip.offsetHeight - 8)) + 'px';
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-action=person-info]')) {
      tip?.remove();
      tip = null;
    }
  });
  window.addEventListener(
    'scroll',
    () => {
      tip?.remove();
      tip = null;
    },
    true
  );
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const { action, id } = a.dataset;
    try {
      if (action === 'person-info') {
        tip?.remove();
        UI.modal(
          'Thông tin người dùng',
          info(id, a.dataset.booking === 'true') +
            `<div class="actions">${link('Báo cáo', `Report.html?type=user&id=${id}`, 'secondary')}${link('Nhắn tin', `chat.html?with=${id}`)}</div>`
        );
      }
      if (action === 'review-court') review(id);
      if (action === 'court-calendar') calendar(id);
      if (action === 'calendar-slot') {
        const s = CC.find('slots', id);
        if (!s || !ownCourts().some((c) => c.id === s.courtId)) throw Error('Không có quyền.');
        const b = CC.db.bookings.find(
          (b) => b.slotId === id && ['pending', 'approved', 'completed'].includes(b.status)
        );
        UI.modal(
          'Chi tiết khung giờ',
          `<p>${day(s.date)} · ${s.start}–${s.end} · ${money(s.price)}</p>${b ? `<p>${badge(b.status)}</p><p>${esc(slotContact(s))}</p>${info(b.playerId, true)}${b.status === 'pending' ? btn('Duyệt', 'booking-status', '', `data-id="${b.id}" data-status="approved"`) + btn('Từ chối', 'booking-status', 'danger', `data-id="${b.id}" data-status="rejected"`) : ''}` : btn('Sửa khung giờ', 'calendar-edit', '', `data-id="${id}"`) + btn('Đóng khung giờ', 'calendar-archive', 'secondary', `data-id="${id}"`)}<p>${link('Về quản lý đặt sân', 'venue-booking-management.html', 'ghost')}</p>`
        );
      }
      if (action === 'calendar-edit') {
        const s = CC.find('slots', id);
        slotForm(s.courtId, s.date, id);
      }
      if (action === 'calendar-archive') {
        const s = CC.find('slots', id);
        CC.archive('slots', id);
        UI.close();
        renderPage();
        UI.toast('Đã đóng khung giờ.');
      }
    } catch (err) {
      UI.toast(err.message, true);
    }
  });
  window.Community = {
    calendar,
    revenue,
    revenueRows,
    periodRange,
    reviewList,
    opponentCards,
    person,
    info,
    ended,
  };
})();
