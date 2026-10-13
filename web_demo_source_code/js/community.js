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
  function eligibility(kind, id, target) {
    const u = CC.requireRole('player');
    if (kind === 'court') {
      const b = CC.find('bookings', id),
        s = CC.find('slots', b?.slotId);
      if (!b || b.playerId !== u.id || b.status !== 'completed' || !ended(s))
        throw Error('Chỉ đánh giá lượt thuê của bạn đã hoàn thành.');
      return { courtId: s.courtId, bookingId: id, authorId: u.id };
    }
    const m = CC.find('matches', id),
      s = CC.find('slots', m?.slotId);
    if (
      !m ||
      m.status !== 'completed' ||
      !ended(s) ||
      !m.playerIds.includes(u.id) ||
      target === u.id ||
      !m.playerIds.includes(target)
    )
      throw Error('Chỉ đánh giá/báo cáo người cùng tham gia trận đã hoàn thành.');
    return { matchId: id, targetId: target, authorId: u.id };
  }
  const tags = {
    court: ['Sân đẹp', 'Sạch sẽ', 'Ánh sáng tốt', 'Chủ sân nhiệt tình', 'Cần cải thiện'],
    opponent: ['Đối cứng', 'Chơi nhiệt tình', 'Đúng giờ', 'Chơi đẹp', 'Cần cải thiện'],
  };
  function saveReview(kind, id, target, data) {
    if (!['court', 'opponent'].includes(kind)) throw Error('Loại đánh giá không hợp lệ.');
    const info = eligibility(kind, id, target),
      stars = Number(data.stars),
      comment = String(data.comment || '').trim();
    if (!Number.isInteger(stars) || stars < 1 || stars > 5 || comment.length > 1000)
      throw Error('Chọn 1–5 sao, bình luận tối đa 1000 ký tự.');
    const selected = (data.tags || []).filter((t) => tags[kind].includes(t));
    CC.transaction(() => {
      const rows = CC.db[kind === 'court' ? 'courtReviews' : 'opponentReviews'];
      const old = rows.find(
        (r) =>
          r.authorId === info.authorId &&
          (kind === 'court' ? r.bookingId === id : r.matchId === id && r.targetId === target)
      );
      const row = { ...info, stars, tags: selected, comment, createdAt: new Date().toISOString() };
      if (old) Object.assign(old, row);
      else rows.push({ id: CC.id('review'), ...row });
    });
  }
  function reviewForm(kind, id, target) {
    eligibility(kind, id, target);
    const old = CC.db[kind === 'court' ? 'courtReviews' : 'opponentReviews'].find(
      (r) =>
        r.authorId === CC.me().id &&
        (kind === 'court' ? r.bookingId === id : r.matchId === id && r.targetId === target)
    );
    UI.formDialog(
      kind === 'court' ? 'Đánh giá sân' : 'Đánh giá bạn chơi',
      `<fieldset class="star-picker"><legend>Điểm đánh giá</legend>${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="stars" value="${n}" required ${old?.stars === n ? 'checked' : ''}><span>${'★'.repeat(n)}<small>${n} sao</small></span></label>`).join('')}</fieldset><fieldset class="quick-tags"><legend>Đánh giá nhanh (có thể chọn nhiều)</legend>${tags[kind].map((t, i) => `<label><input type="checkbox" name="tag${i}" ${old?.tags.includes(t) ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>${textarea('Bình luận', 'comment', old?.comment || '')}`,
      'Lưu đánh giá',
      (d) =>
        saveReview(kind, id, target, { ...d, tags: tags[kind].filter((_, i) => d['tag' + i]) }),
      'Đánh giá thành công.'
    );
  }
  function report(id, target, d) {
    const info = eligibility('opponent', id, target);
    if (
      !['Không đến sân', 'Ứng xử không phù hợp', 'Gian lận trình độ', 'Khác'].includes(d.reason) ||
      !d.comment?.trim() ||
      d.comment.length > 1000
    )
      throw Error('Chọn lý do và mô tả sự việc (tối đa 1000 ký tự).');
    if (
      CC.db.playerReports.some(
        (r) => r.matchId === id && r.targetId === target && r.authorId === info.authorId
      )
    )
      throw Error('Bạn đã báo cáo người này trong trận này.');
    CC.transaction(() =>
      CC.db.playerReports.push({
        id: CC.id('report'),
        ...info,
        reason: d.reason,
        comment: d.comment.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    );
  }
  function playerStats(id) {
    const matches = CC.db.matches.filter(
      (m) => m.playerIds.includes(id) || m.withdrawnIds?.includes(id) || m.hostId === id
    );
    const cancelled = matches.filter(
      (m) => m.cancelledBy === id || m.withdrawnIds?.includes(id)
    ).length;
    const success = matches.filter(
      (m) => m.matchedAtCapacity || m.playerIds.length >= m.capacity
    ).length;
    const reviews = CC.db.opponentReviews.filter((r) => r.targetId === id);
    return {
      total: matches.length,
      cancelled,
      success,
      rating: reviews.length
        ? (reviews.reduce((n, r) => n + r.stars, 0) / reviews.length).toFixed(1)
        : null,
      count: reviews.length,
    };
  }
  function person(id, match) {
    const u = CC.find('users', id);
    if (!u) return '';
    const s = playerStats(id),
      p = CC.find('players', id),
      pct = (n) =>
        s.total ? `${Math.round((n / s.total) * 100)}% (${n}/${s.total})` : 'Chưa có dữ liệu';
    const can =
      match?.status === 'completed' &&
      ended(CC.find('slots', match.slotId)) &&
      match.playerIds.includes(CC.me()?.id) &&
      id !== CC.me()?.id;
    return `<article class="person-card"><a href="profile-public.html?id=${esc(id)}"><strong>${esc(u.name)}</strong></a><p class="small muted">${Object.entries(
      p?.levels || {}
    )
      .map(([k, v]) => `${esc(UI.sport(k))}: ${UI.level(v)}`)
      .join(
        ' · '
      )}</p><div class="small">★ ${s.rating ? `${s.rating}/5 · ${s.count} đánh giá` : 'Chưa có đánh giá'}<br>Hủy / rút trận: ${pct(s.cancelled)}<br>Ghép đủ người: ${pct(s.success)}</div>${can ? `<div class="actions mt">${btn('Đánh giá', 'review-opponent', 'secondary small', `data-id="${esc(match.id)}" data-target="${esc(id)}"`)}${btn('Báo cáo', 'report-player', 'ghost small', `data-id="${esc(match.id)}" data-target="${esc(id)}"`)}</div>` : ''}</article>`;
  }
  const explanation =
    '<p class="small muted">Tỉ lệ tính trên số trận đã tham gia (kể cả đã rút). Hủy/rút chỉ tính thao tác của người đó; ghép thành công là trận từng đủ người, không phải dự đoán thắng. Dữ liệu lịch sử trong bản demo.</p>';
  const opponentCards = (m) =>
    `<section class="opponent-list"><h3>Thông số bạn chơi / đối thủ</h3>${
      m.playerIds
        .filter((id) => id !== CC.me()?.id)
        .map((id) => person(id, m))
        .join('') || '<p>Chưa có người chơi khác.</p>'
    }${explanation}</section>`;
  function reviewList(rows) {
    return rows.length
      ? rows
          .slice()
          .reverse()
          .map(
            (r) =>
              `<article class="person-card"><a href="profile-public.html?id=${esc(r.authorId)}">${esc(CC.find('users', r.authorId)?.name || 'Thành viên')}</a> <strong class="rating-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)} · ${r.stars}/5</strong><p class="small muted">${new Date(r.createdAt).toLocaleDateString('vi-VN')}</p><div class="actions">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div><p class="review-comment">${esc(r.comment)}</p></article>`
          )
          .join('')
      : empty('Chưa có đánh giá', 'Đánh giá sẽ xuất hiện sau khi người chơi hoàn thành hoạt động.');
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
  function calendar(id, date = CC.date(0)) {
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
    const dialog = UI.modal(
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
                  `<button class="calendar-slot ${status(s)}" style="top:${minutes(s.start) - min}px;height:${Math.max(24, minutes(s.end) - minutes(s.start) - 3)}px" data-action="calendar-slot" data-id="${esc(s.id)}"><strong>${s.start}–${s.end}</strong><br>${labels[status(s)]}</button>`
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
    agenda.innerHTML = `<h3>${day(date)}</h3><p class="small muted">Chọn ngày ở trên để xem lịch. Khoảng giờ không được liệt kê là chưa mở bán.</p>${daily.length ? daily.map((s) => `<button type="button" class="agenda-slot ${status(s)}" data-action="calendar-slot" data-id="${esc(s.id)}"><span><strong>${s.start} – ${s.end}</strong><small>${money(s.price)}</small></span><span>${labels[status(s)]} →</span></button>`).join('') : '<div class="notice">Chưa mở khung giờ trong ngày này.</div>'}`;
    $('.dialog-body', dialog).append(agenda);
    $('[data-action=calendar-prev]', dialog).textContent = mobile ? '← Ngày trước' : '← 7 ngày';
    $('[data-action=calendar-next]', dialog).textContent = mobile ? 'Ngày sau →' : '7 ngày →';
    $('[name=calendar-date]', dialog).onchange = (e) => calendar(id, e.target.value);
    const shift = (n) => {
      base.setDate(base.getDate() + n);
      calendar(
        id,
        `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
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
    const ids = CC.db.courts.filter(c => c.ownerId === CC.me().id).map((c) => c.id),
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
  function courtReviews(id = '') {
    const ids = CC.db.courts.filter(c => c.ownerId === CC.me().id).map((c) => c.id),
      rows = CC.db.courtReviews.filter((r) => ids.includes(r.courtId) && (!id || r.courtId === id));
    shell(
      pageHead('Đánh giá sân', 'Phản hồi từ người thuê đã hoàn thành lượt đặt sân.') +
        select('Sân', 'review-court', courtOptions(id)) +
        stats([
          ['Đánh giá', rows.length],
          [
            'Điểm trung bình',
            rows.length
              ? (rows.reduce((n, r) => n + r.stars, 0) / rows.length).toFixed(1) + '/5'
              : 'Chưa có',
          ],
        ]) +
        rows
          .map(
            (r) =>
              `<section class="panel"><h3>${esc(CC.find('courts', r.courtId)?.name)}</h3>${reviewList([r])}</section>`
          )
          .join('') +
        (rows.length ? '' : empty())
    );
    $('[name=review-court]').onchange = (e) => courtReviews(e.target.value);
  }
  const networks = {
    facebook: ['Facebook', 'f', ['facebook.com', 'fb.com']],
    instagram: ['Instagram', '◎', ['instagram.com']],
    tiktok: ['TikTok', '♪', ['tiktok.com']],
    youtube: ['YouTube', '▶', ['youtube.com', 'youtu.be']],
    zalo: ['Zalo', 'Z', ['zalo.me']],
  };
  function socialLinks(data) {
    const result = {};
    for (const [key, [label, , hosts]] of Object.entries(networks)) {
      const raw = String(data[key] || '').trim();
      if (!raw) continue;
      let u;
      try {
        u = new URL(raw);
      } catch {
        throw Error(`Đường dẫn ${label} không hợp lệ.`);
      }
      if (
        u.protocol !== 'https:' ||
        u.username ||
        u.password ||
        !hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))
      )
        throw Error(`Dùng liên kết https của ${label}.`);
      result[key] = u.href;
    }
    return result;
  }
  // Inline vector marks stay crisp in both themes; only saved, valid links appear.
  const socialMarks = {
    facebook: '<path fill="currentColor" d="M14 22v-9h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5C17 1.2 16 1 15 1c-3 0-5 2-5 5v3H7v4h3v9z"/>',
    instagram: '<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></g><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
    tiktok: '<path fill="currentColor" d="M14 2h3c.4 2.4 1.8 4 4 4.4v3.2c-1.6 0-3-.5-4-1.3V16a6 6 0 1 1-6-6v3.3a2.8 2.8 0 1 0 3 2.7z"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10 8 6 4-6 4z" fill="currentColor"/>',
    zalo: '<path d="M4 3h16v13a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="12" y="14" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="8" fill="currentColor">Zalo</text>',
  };
  function socialIcons(u) {
    const links = Object.entries(u.socialLinks || {}).filter(([k]) => networks[k]).map(([k, url]) => {
      try { if (!socialLinks({ [k]: url })[k]) return ''; } catch { return ''; }
      return `<a class="social-icon social-${k}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${networks[k][0]} của ${esc(u.name)} (mở tab mới)" title="${networks[k][0]}"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">${socialMarks[k]}</svg></a>`;
    }).join('');
    return links ? `<div class="social-links" aria-label="Liên kết mạng xã hội">${links}</div>` : '';
  }
  function publicProfile() {
    const u = CC.find('users', new URLSearchParams(location.search).get('id'));
    if (!u || u.status !== 'active') return App.error(404);
    shell(
      pageHead(esc(u.name), CC.roles[u.role]) +
        `<section class="panel"><p>${esc(u.bio || 'Chưa có giới thiệu.')}</p>${u.phonePublic && u.phone ? `<p>Điện thoại: ${esc(u.phone)}</p>` : ''}${socialIcons(u)}</section>` +
        (u.role === 'player'
          ? person(u.id) +
            explanation +
            `<h2 class="mt">Đánh giá từ bạn chơi</h2>` +
            reviewList(CC.db.opponentReviews.filter((r) => r.targetId === u.id))
          : '')
    );
  }
  function reports() {
    CC.requireRole('admin');
    shell(
      pageHead(
        'Báo cáo người chơi',
        'Xem phản ánh từ các trận đã hoàn thành. Báo cáo không tự động khóa tài khoản.'
      ) +
        table(
          ['Người gửi / trận', 'Người bị báo cáo', 'Nội dung', 'Xử lý'],
          (CC.db.playerReports || []).map((r) => [
            `${esc(CC.find('users', r.authorId)?.name)}<br>${esc(CC.find('matches', r.matchId)?.name)}`,
            link(
              esc(CC.find('users', r.targetId)?.name),
              `profile-public.html?id=${r.targetId}`,
              'ghost small'
            ),
            `${esc(r.reason)}<p class="review-comment">${esc(r.comment)}</p>`,
            r.status === 'pending'
              ? btn('Đã xem xét', 'resolve-player-report', 'secondary', `data-id="${esc(r.id)}"`)
              : 'Đã xem xét',
          ])
        )
    );
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const { action, id, target } = a.dataset;
    try {
      if (action === 'court-calendar') calendar(id);
      if (action === 'calendar-slot') {
        const s = CC.find('slots', id);
        if (!s || !ownCourts().some((c) => c.id === s.courtId)) throw Error('Không có quyền.');
        const b = CC.db.bookings.find(
          (b) => b.slotId === id && ['pending', 'approved', 'completed'].includes(b.status)
        );
        UI.modal(
          'Chi tiết khung giờ',
          `<p>${day(s.date)} · ${s.start}–${s.end}</p><p>${money(s.price)}</p>${b ? `<p>${badge(b.status)} · ${esc(CC.find('users', b.playerId)?.name)}</p>${link('Quản lý đặt sân', 'venue-booking-management.html')}` : `${btn('Sửa khung giờ', 'calendar-edit', '', `data-id="${esc(id)}"`)} ${s.status === 'open' ? btn('Đóng khung giờ', 'calendar-archive', 'secondary', `data-id="${esc(id)}"`) : badge(s.status)}`}<div class="mt">${btn('← Về lịch sân', 'court-calendar', 'ghost', `data-id="${s.courtId}"`)}</div>`
        );
      }
      if (action === 'calendar-edit') {
        const s = CC.find('slots', id);
        slotForm(s.courtId, s.date, id);
      }
      if (action === 'calendar-archive') {
        const s = CC.find('slots', id);
        CC.archive('slots', id);
        calendar(s.courtId, s.date);
      }
      if (action === 'review-court') reviewForm('court', id);
      if (action === 'review-opponent') reviewForm('opponent', id, target);
      if (action === 'report-player') {
        eligibility('opponent', id, target);
        UI.formDialog(
          'Báo cáo người chơi',
          select(
            'Lý do',
            'reason',
            ['Không đến sân', 'Ứng xử không phù hợp', 'Gian lận trình độ', 'Khác']
              .map((v) => option(v, v))
              .join('')
          ) + textarea('Mô tả sự việc (bắt buộc)', 'comment'),
          'Gửi quản trị viên',
          (d) => report(id, target, d),
          'Báo cáo thành công.'
        );
      }
      if (action === 'resolve-player-report') {
        CC.requireRole('admin');
        CC.transaction(() => {
          const r = CC.find('playerReports', id);
          if (!r) throw Error('Báo cáo không tồn tại.');
          r.status = 'resolved';
          r.reviewedBy = CC.me().id;
        });
        renderPage();
        UI.toast('Đã đánh dấu báo cáo được xem xét.');
      }
    } catch (err) {
      UI.toast(err.message, true);
    }
  });
  const oldDetail = Player.matchDetail;
  Player.matchDetail = () => {
    oldDetail();
    const m = CC.find('matches', new URLSearchParams(location.search).get('id'));
    if (m)
      $('#main').insertAdjacentHTML(
        'beforeend',
        `<section class="panel mt">${opponentCards(m)}</section>`
      );
  };
  const oldCourt = Player.courtDetail;
  Player.courtDetail = () => {
    oldCourt();
    const id = new URLSearchParams(location.search).get('id');
    if (CC.find('courts', id))
      $('#main').insertAdjacentHTML(
        'beforeend',
        `<section class="panel mt"><h2>Đánh giá từ người thuê</h2>${reviewList(CC.db.courtReviews.filter((r) => r.courtId === id))}</section>`
      );
  };
  window.Community = {
    saveReview,
    report,
    playerStats,
    opponentCards,
    reviewList,
    calendar,
    revenue,
    revenueRows,
    periodRange,
    courtReviews,
    socialLinks,
    socialIcons,
    networks,
    publicProfile,
    reports,
    ended,
  };
})();
