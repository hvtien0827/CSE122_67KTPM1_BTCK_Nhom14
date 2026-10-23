/* Lịch sân, đánh giá và hồ sơ cộng đồng. Khởi tạo dữ liệu nằm trong store.js. */
(() => {
  'use strict';

  const { $, esc, btn, link, option, money, day, badge, empty } = UI;
  const ended = (s) => !!s && new Date(`${s.date}T${s.end}`) <= new Date();
  function eligibility(kind, id, target) {
    const u = CC.requireRole('player');
    if (kind === 'court') {
      const b = CC.find('bookings', id),
        s = CC.find('slots', b?.slotId);
      if (!b || b.playerId !== u.id || b.status !== 'completed' || !ended(s))
        throw Error('Chỉ đánh giá lượt thuê của bạn đã hoàn thành.');
      return {
        courtId: s.courtId,
        bookingId: id,
        authorId: u.id,
      };
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
    return {
      matchId: id,
      targetId: target,
      authorId: u.id,
    };
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
      const row = {
        ...info,
        stars,
        tags: selected,
        comment,
        createdAt: new Date().toISOString(),
      };
      if (old) Object.assign(old, row);
      else
        rows.push({
          id: CC.id('review'),
          ...row,
        });
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
      Views.fragment('community-reviewForm-dialog-1', {
        star1Checked: () => (old?.stars === 1 ? 'checked' : ''),
        star2Checked: () => (old?.stars === 2 ? 'checked' : ''),
        star3Checked: () => (old?.stars === 3 ? 'checked' : ''),
        star4Checked: () => (old?.stars === 4 ? 'checked' : ''),
        star5Checked: () => (old?.stars === 5 ? 'checked' : ''),
        quickTags: () =>
          tags[kind]
            .map(
              (t, i) =>
                `<label><input type="checkbox" name="tag${i}" ${old?.tags.includes(t) ? 'checked' : ''}> ${t}</label>`
            )
            .join(''),
        comment: () => esc(old?.comment || ''),
      }),
      'Lưu đánh giá',
      (d) =>
        saveReview(kind, id, target, {
          ...d,
          tags: tags[kind].filter((_, i) => d['tag' + i]),
        }),
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
      )}</p><div class="small">${UI.icon('star')} ${s.rating ? `${s.rating}/5 · ${s.count} đánh giá` : 'Chưa có đánh giá'}<br>Hủy / rút trận: ${pct(s.cancelled)}<br>Ghép đủ người: ${pct(s.success)}</div>${can ? `<div class="actions mt">${btn('Đánh giá', 'review-opponent', 'secondary small', `data-id="${esc(match.id)}" data-target="${esc(id)}"`)}${btn('Báo cáo', 'report-player', 'ghost small', `data-id="${esc(match.id)}" data-target="${esc(id)}"`)}</div>` : ''}</article>`;
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
              `<article class="person-card"><a href="profile-public.html?id=${esc(r.authorId)}">${esc(CC.find('users', r.authorId)?.name || 'Thành viên')}</a> <strong class="rating-stars" aria-label="${r.stars} trên 5 sao">${UI.icon('star').repeat(r.stars)}${UI.icon('starEmpty').repeat(5 - r.stars)} · ${r.stars}/5</strong><p class="small muted">${new Date(r.createdAt).toLocaleDateString('vi-VN')}</p><div class="actions">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div><p class="review-comment">${esc(r.comment)}</p></article>`
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
    const dates = Array.from(
      {
        length: 7,
      },
      (_, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    );
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
      Views.fragment('community-calendar-dialog-2', {
        selectedDate: () => esc(date),
        statusLegend: () =>
          Object.entries(labels)
            .map(([k, v]) => `<span class="calendar-key ${k}">${v}</span>`)
            .join(''),
        calendarHeight: () => max - min,
        timeAxis: () =>
          Array.from(
            {
              length: Math.floor((max - min) / 60) + 1,
            },
            (_, i) =>
              `<span style="top:${i * 60}px">${String(Math.floor(min / 60) + i).padStart(2, '0')}:00</span>`
          ).join(''),
        dayColumns: () =>
          dates
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
            .join(''),
      })
    );
    dialog.classList.add('calendar-dialog');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const agenda = document.createElement('section');
    agenda.className = 'calendar-agenda';
    const daily = slots
      .filter((s) => s.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
    agenda.innerHTML = `<h3>${day(date)}</h3><p class="small muted">Chọn ngày ở trên để xem lịch. Khoảng giờ không được liệt kê là chưa mở bán.</p>${daily.length ? daily.map((s) => `<button type="button" class="agenda-slot ${status(s)}" data-action="calendar-slot" data-id="${esc(s.id)}"><span><strong>${s.start} – ${s.end}</strong><small>${money(s.price)}</small></span><span>${labels[status(s)]} ${UI.icon('arrowRight')}</span></button>`).join('') : '<div class="notice">Chưa mở khung giờ trong ngày này.</div>'}`;
    $('.dialog-body', dialog).append(agenda);
    $('[data-action=calendar-prev]', dialog).innerHTML =
      UI.icon('arrowLeft') + (mobile ? ' Ngày trước' : ' 7 ngày');
    $('[data-action=calendar-next]', dialog).innerHTML =
      (mobile ? 'Ngày sau ' : '7 ngày ') + UI.icon('arrowRight');
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
      Views.fragment('community-slotForm-dialog-3', {
        date: () => esc(s?.date || date),
        startTime: () => esc(s?.start || '08:00'),
        endTime: () => esc(s?.end || '10:00'),
        price: () => esc(s?.price || c.price * 2),
      }),
      'Lưu khung giờ',
      (d) => {
        CC.saveEntity(
          'slots',
          {
            ...d,
            courtId,
            price: Number(d.price),
          },
          key
        );
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
    return {
      start,
      end,
    };
  }
  function revenueRows(period, date, courtId = '') {
    const ids = CC.db.courts.filter((c) => c.ownerId === CC.me().id).map((c) => c.id),
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
    const tableRows1 = ownCourts()
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
      });
    const tableRows2 = rows.map((b) => {
      const s = CC.find('slots', b.slotId);
      return [
        `${day(s.date)} · ${esc(CC.courtFor(s).name)}`,
        esc(CC.find('users', b.playerId)?.name),
        badge(b.status),
        money(s.price),
      ];
    });
    Views.update('community-revenue', {
      daySelected: () => (String('day') === String(period) ? 'selected' : ''),
      weekSelected: () => (String('week') === String(period) ? 'selected' : ''),
      monthSelected: () => (String('month') === String(period) ? 'selected' : ''),
      yearSelected: () => (String('year') === String(period) ? 'selected' : ''),
      selectedDate: () => esc(date),
      courtOptions: () => courtOptions(courtId),
      fromDate: () => start.toLocaleDateString('vi-VN'),
      toDate: () => last.toLocaleDateString('vi-VN'),
      completedRevenue: () => money(sum('completed')),
      expectedRevenue: () => money(sum('approved')),
      completedCount: () => rows.filter((b) => b.status === 'completed').length,
      hasCourtRows: () => tableRows1.length > 0,
      courtRows: () => UI.tableRows(tableRows1),
      hasBookingRows: () => tableRows2.length > 0,
      bookingRows: () => UI.tableRows(tableRows2),
    });
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
    const ids = CC.db.courts.filter((c) => c.ownerId === CC.me().id).map((c) => c.id),
      rows = CC.db.courtReviews.filter((r) => ids.includes(r.courtId) && (!id || r.courtId === id));
    Views.update('community-courtReviews', {
      courtOptions: () => courtOptions(id),
      reviewCount: () => rows.length,
      averageStars: () =>
        rows.length
          ? (rows.reduce((n, r) => n + r.stars, 0) / rows.length).toFixed(1) + '/5'
          : 'Chưa có',
      reviewCards: () =>
        rows
          .map(
            (r) =>
              `<section class="panel"><h3>${esc(CC.find('courts', r.courtId)?.name)}</h3>${reviewList([r])}</section>`
          )
          .join(''),
      hasReviews: () => rows.length,
    });
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
  // Bootstrap Icons không có logo Zalo; dùng biểu tượng hội thoại với nhãn Zalo.
  const socialIconsByNetwork = {
    facebook: 'facebook',
    instagram: 'instagram',
    tiktok: 'tiktok',
    youtube: 'youtube',
    zalo: 'chat-dots',
  };
  function socialIcons(u) {
    const links = Object.entries(u.socialLinks || {})
      .filter(([k]) => networks[k])
      .map(([k, url]) => {
        try {
          if (
            !socialLinks({
              [k]: url,
            })[k]
          )
            return '';
        } catch {
          return '';
        }
        return `<a class="social-icon social-${k}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${networks[k][0]} của ${esc(u.name)} (mở tab mới)" title="${networks[k][0]}"><i class="bi bi-${socialIconsByNetwork[k]}" aria-hidden="true"></i></a>`;
      })
      .join('');
    return links
      ? `<div class="social-links" aria-label="Liên kết mạng xã hội">${links}</div>`
      : '';
  }
  function publicProfile() {
    const u = CC.find('users', new URLSearchParams(location.search).get('id'));
    if (!u || u.status !== 'active') return App.error(404);
    Views.update('community-publicProfile', {
      userName: () => esc(u.name),
      roleLabel: () => CC.roles[u.role],
      bio: () => esc(u.bio || 'Chưa có giới thiệu.'),
      showPhone: () => u.phonePublic && u.phone,
      phone: () => esc(u.phone),
      socialLinks: () => socialIcons(u),
      isPlayer: () => u.role === 'player',
      playerStats: () => person(u.id) + explanation,
      reviewCards: () => reviewList(CC.db.opponentReviews.filter((r) => r.targetId === u.id)),
    });
  }
  function reports() {
    CC.requireRole('admin');
    const tableRows1 = (CC.db.playerReports || []).map((r) => [
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
    ]);
    Views.update('community-reports', {
      hasReports: () => tableRows1.length > 0,
      reportRows: () => UI.tableRows(tableRows1),
    });
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
          Views.fragment('community-actions-dialog-4', {
            date: () => day(s.date),
            startTime: () => s.start,
            endTime: () => s.end,
            price: () => money(s.price),
            hasBooking: () => b,
            bookingStatus: () => esc(b.status),
            bookingStatusLabel: () => esc(CC.statuses[b.status] || b.status),
            playerName: () => esc(CC.find('users', b.playerId)?.name),
            editAttributes: () => `data-id="${esc(id)}"`,
            slotOpen: () => s.status === 'open',
            archiveAttributes: () => `data-id="${esc(id)}"`,
            slotStatus: () => esc(s.status),
            slotStatusLabel: () => esc(CC.statuses[s.status] || s.status),
            calendarAttributes: () => `data-id="${s.courtId}"`,
          })
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
          Views.fragment('community-actions-dialog-5', {}),
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
