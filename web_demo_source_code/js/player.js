/* Trang công khai và luồng Người chơi. */
(() => {
  const {
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
    table,
    pageHead,
    stats,
    toast,
    modal,
    close,
    confirm,
    formDialog,
    requireLogin,
    shell,
    courtCard,
    matchCard,
  } = UI;
  const q = () => new URLSearchParams(location.search);
  const filters = {};
  const getFilters = () =>
    filters[document.body.dataset.route || location.pathname.split('/').pop()] || {};
  function filterBar(kind) {
    const f = getFilters();
    return `<form class="filter-bar" id="filters">${field('Tìm kiếm', 'search', 'search', f.search || '', 'placeholder="Tên, địa điểm…"')}${select('Môn thể thao', 'sport', sports(f.sport, true))}${kind === 'matches' ? select('Trình độ', 'level', levels(f.level, true)) : ''}${field('Ngày chơi', 'date', 'date', f.date || '')}<button class="btn">${icon('search')} Tìm kiếm</button>${btn('Xóa lọc', 'clear-filter', 'ghost')}</form>`;
  }
  function bindFilters() {
    const f = $('#filters');
    if (!f) return;
    f.onsubmit = (e) => {
      e.preventDefault();
      filters[location.pathname.split('/').pop()] = Object.fromEntries(new FormData(f));
      renderPage();
    };
    $('[data-action=clear-filter]').onclick = () => {
      filters[location.pathname.split('/').pop()] = {};
      renderPage();
    };
  }
  function home() {
    const courts = CC.db.courts
        .filter((c) => c.status === 'active' && CC.sportActive(c.sportId))
        .slice(0, 3),
      matches = CC.db.matches
        .filter((m) => m.status === 'open' && CC.future(CC.find('slots', m.slotId)))
        .slice(0, 3);
    document.body.innerHTML =
      UI.header() +
      `<main id="main"><section class="hero"><div class="container hero-grid"><div><h1>Tìm cộng đồng thể thao của bạn</h1><p>Kết nối với người chơi gần bạn, tạo trận đấu và tìm sân phù hợp chỉ trong vài bước.</p><div class="actions">${link('Tìm người chơi', 'player-open-matches.html')}${btn('Tạo trận đấu', 'create-match', 'secondary')}</div></div><img class="hero-image" src="assets/images/figma-9.jpg" alt="Những người chơi cầu lông cùng thi đấu trong nhà"></div></section><section class="section"><div class="container"><div class="section-heading"><div><div class="eyebrow">Kết nối ngay</div><h2>Gợi ý trận đấu</h2><p class="muted">Những trận đấu đang tìm thêm đồng đội gần bạn.</p></div>${link('Xem tất cả →', 'player-open-matches.html', 'ghost')}</div><div class="cards">${matches.map(matchCard).join('') || empty()}</div></div></section><section class="section soft"><div class="container"><div class="section-heading"><div><div class="eyebrow">Sân nổi bật</div><h2>Đặt sân gần bạn</h2><p class="muted">Chọn sân phù hợp và sẵn sàng cho trận đấu tiếp theo.</p></div>${link('Khám phá sân →', 'player-court-search.html', 'ghost')}</div><div class="cards">${courts.map(courtCard).join('') || empty()}</div></div></section><section class="cta"><h2>Sẵn sàng ra sân ngay?</h2><p>Tham gia CourtConnect và bắt đầu kết nối với người chơi quanh bạn.</p>${link('Bắt đầu', CC.me() ? 'player-open-matches.html' : 'register.html')}</section></main>` +
      UI.footer();
  }
  function searchCourts() {
    const f = getFilters(),
      rows = CC.db.courts.filter(
        (c) =>
          c.status === 'active' &&
          CC.sportActive(c.sportId) &&
          (!f.sport || c.sportId === f.sport) &&
          (!f.search ||
            (c.name + ' ' + c.location).toLowerCase().includes(f.search.toLowerCase())) &&
          (!f.date ||
            CC.db.slots.some((s) => s.courtId === c.id && s.date === f.date && CC.available(s)))
      );
    shell(
      pageHead('Tìm sân cho trận đấu tiếp theo', 'Khám phá không gian thể thao phù hợp với bạn.') +
        filterBar('courts') +
        `<div class="row mb"><strong>${rows.length} sân phù hợp</strong><span class="spacer"></span><span class="muted small">Cầu lông · Pickleball · Cộng đồng</span></div><div class="cards">${rows.map(courtCard).join('') || empty('Không tìm thấy sân', 'Thử đổi tên, môn thể thao hoặc ngày chơi.')}</div>`
    );
    bindFilters();
  }
  function openMatches() {
    const f = getFilters(),
      rows = CC.db.matches.filter((m) => {
        const s = CC.find('slots', m.slotId),
          c = CC.courtFor(s);
        return (
          m.status === 'open' &&
          CC.future(s) &&
          CC.sportActive(c?.sportId) &&
          (!f.sport || c.sportId === f.sport) &&
          (!f.level || m.level === +f.level) &&
          (!f.date || s.date === f.date) &&
          (!f.search ||
            (m.name + ' ' + c.name + ' ' + c.location)
              .toLowerCase()
              .includes(f.search.toLowerCase()))
        );
      });
    shell(
      pageHead(
        'Tìm trận đấu',
        'Có đồng đội phù hợp, mỗi trận đấu đều vui hơn.',
        btn('+ Tạo trận đấu', 'create-match')
      ) +
        `<div class="ai-banner"><div class="ai-icon">✧</div><div><h2>Đúng trình độ. Đúng thời gian.</h2><p>Skill Match giúp tìm trận phù hợp và giải thích từng gợi ý.</p></div>${link('Tìm trận cùng AI →', 'player-skill-match.html')}</div>` +
        filterBar('matches') +
        `<p class="small muted mb">${rows.length} trận đang mở</p><div class="cards">${rows.map(matchCard).join('') || empty('Chưa có trận phù hợp', 'Đổi điều kiện lọc hoặc tạo trận của riêng bạn.')}</div>`
    );
    bindFilters();
  }
  function courtDetail() {
    const c = CC.find('courts', q().get('id'));
    if (!c || c.status !== 'active') {
      App.error(404);
      return;
    }
    const dates = [
      ...new Set(
        CC.db.slots
          .filter((s) => s.courtId === c.id && CC.future(s) && s.status === 'open')
          .map((s) => s.date)
      ),
    ].sort();
    const chosen = q().get('date') || dates[0] || CC.date(1);
    const slots = CC.db.slots.filter(
      (s) => s.courtId === c.id && s.date === chosen && s.status === 'open'
    );
    shell(
      pageHead(
        esc(c.name),
        esc(c.location),
        link('← Tìm sân', 'player-court-search.html', 'secondary')
      ) +
        `<div class="two-col"><div><img class="details-hero" src="assets/images/figma-${c.image ?? 4}.jpg" alt="${esc(c.name)}"><section class="panel"><span class="tag">${sport(c.sportId)}</span><h2 class="mt">Một không gian để hết mình</h2><p class="muted">${esc(c.description)}</p><div class="divider"></div><h3>Tiện ích sân</h3><div class="actions">${(
          c.amenities || 'Gửi xe, Nước uống'
        )
          .split(',')
          .map((x) => `<span class="tag">✓ ${esc(x.trim())}</span>`)
          .join(
            ''
          )}</div></section></div><section class="panel"><div class="eyebrow">Lịch sân trực tiếp trong demo</div><h2>${money(c.price)} <small class="muted">/ giờ</small></h2><p class="muted small">Chọn ngày và khung giờ. Đơn cần chủ sân xác nhận.</p>${select('Ngày chơi', 'slotDate', dates.map((d) => option(d, day(d), chosen)).join('') || option('', 'Chưa có lịch'))}<div class="slot-grid">${slots.map((s) => `<button class="slot" data-action="choose-slot" data-id="${s.id}" ${CC.available(s) ? '' : 'disabled'}>${s.start} – ${s.end}<small>${CC.available(s) ? money(s.price) : 'Không còn trống'}</small></button>`).join('') || '<p class="muted">Chưa có khung giờ.</p>'}</div><div class="notice mt">Bạn có thể xem trạng thái và hủy đơn trong Hoạt động của tôi.</div></section></div>`
    );
    $('[name=slotDate]').onchange = (e) => {
      location.href = `court-detail.html?id=${c.id}&date=${e.target.value}`;
    };
  }
  function bookingPage() {
    const s = CC.find('slots', q().get('slot')),
      c = CC.courtFor(s);
    if (!s || !c) {
      App.error(404);
      return;
    }
    shell(
      pageHead('Xác nhận đặt sân', 'Kiểm tra lịch và gửi yêu cầu tới chủ sân.') +
        `<div class="two-col"><form id="booking-form" class="panel"><h2>Thông tin đặt sân</h2><div class="notice error" id="booking-error" hidden role="alert"></div>${field('Người đặt', 'name', 'text', CC.me().name, 'readonly')}${textarea('Ghi chú cho chủ sân', 'note')}<label class="check"><input name="accept" type="checkbox" required><span>Tôi đã kiểm tra lịch và đồng ý gửi yêu cầu đặt sân.</span></label><button class="btn" ${CC.available(s) ? '' : 'disabled'}>Gửi yêu cầu đặt sân</button>${!CC.available(s) ? '<p class="notice warning mt">Khung giờ không còn trống. Vui lòng chọn lại.</p>' : ''}</form><aside class="panel"><img class="card-image" src="assets/images/figma-${c.image ?? 4}.jpg" alt="${esc(c.name)}"><h3 class="mt">${esc(c.name)}</h3><p class="muted">${esc(c.location)}</p><div class="details-list"><div><span>Ngày</span><strong>${day(s.date)}</strong></div><div><span>Khung giờ</span><strong>${s.start} – ${s.end}</strong></div><div><span>Tổng giá</span><strong class="green">${money(s.price)}</strong></div></div><div class="notice mt">Không thu tiền thật trong nguyên mẫu.</div></aside></div>`
    );
    $('#booking-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        CC.booking(s.id, new FormData(e.currentTarget).get('note'));
        location.href = 'booking-success.html';
      } catch (err) {
        $('#booking-error').textContent = err.message;
        $('#booking-error').hidden = false;
      }
    };
  }
  function matchDetail() {
    const m = CC.find('matches', q().get('id')),
      s = CC.find('slots', m?.slotId),
      c = CC.courtFor(s);
    if (!m || !c) {
      App.error(404);
      return;
    }
    const joined = m.playerIds.includes(CC.me()?.id);
    shell(
      pageHead(
        esc(m.name),
        'Cùng ra sân, cùng kết nối.',
        link('← Tìm trận', 'player-open-matches.html', 'secondary')
      ) +
        `<div class="two-col"><div><img class="details-hero" src="assets/images/figma-${c.image ?? 4}.jpg" alt="${esc(c.name)}"><section class="panel"><div class="row mb"><span class="tag">${sport(c.sportId)}</span>${badge(m.status)}<span class="tag">${level(m.level)}</span></div><h2>Thông tin trận đấu</h2><p class="muted">${esc(m.note)}</p><p class="meta">${icon('pin')}${esc(c.name)} · ${esc(c.location)}</p><p class="meta">${icon('calendar')}${day(s.date)} · ${s.start} – ${s.end}</p></section></div><section class="panel"><h2>Đồng đội của bạn</h2><p class="muted">${m.playerIds.length}/${m.capacity} người đã tham gia</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, (m.playerIds.length / m.capacity) * 100)}%"></div></div>${m.playerIds.map((id) => `<div class="player-row"><span class="avatar">${esc((CC.find('players', id)?.name || '?').slice(0, 1))}</span><div><strong>${esc(CC.find('players', id)?.name || 'Người chơi')}</strong><div class="small muted">${id === m.hostId ? 'Chủ trận' : 'Thành viên'}</div></div></div>`).join('')}<div class="mt">${joined ? `<div class="notice">Bạn đang tham gia trận này.</div>${link('Quản lý hoạt động', 'player-my-sports.html', 'full')}` : btn(m.playerIds.length >= m.capacity ? 'Trận đã đủ người' : 'Tham gia trận', 'join-match', 'full', `data-id="${m.id}" ${m.playerIds.length >= m.capacity || m.status !== 'open' || !CC.future(s) ? 'disabled' : ''}`)}</div></section></div>`
    );
  }
  let activityView = 'all';
  function mySports() {
    const u = CC.me(),
      bookings = CC.db.bookings.filter((b) => b.playerId === u.id),
      matches = CC.db.matches.filter((m) => m.playerIds.includes(u.id) || m.hostId === u.id);
    shell(
      pageHead(
        'Hoạt động của tôi',
        'Mọi lịch sân và đồng đội, trong một nơi.',
        btn('+ Tạo trận', 'create-match')
      ) +
        `<div class="activity-filters" role="group" aria-label="Lọc hoạt động">${[
          ['all', 'Tất cả'],
          ['bookings', 'Lịch đặt sân'],
          ['matches', 'Trận đấu của tôi'],
        ]
          .map(([value, label]) =>
            btn(
              label,
              'activity-filter',
              activityView === value ? '' : 'secondary',
              `data-view="${value}" aria-pressed="${activityView === value}"`
            )
          )
          .join('')}</div>` +
        stats([
          ['Đơn đặt sân', bookings.length],
          ['Chờ duyệt', bookings.filter((b) => b.status === 'pending').length],
          ['Lịch đã duyệt', bookings.filter((b) => b.status === 'approved').length],
          ['Trận đang tham gia', matches.filter((m) => m.status === 'open').length],
        ]) +
        `<section data-activity="bookings"><div class="panel-title"><h2>Lịch đặt sân</h2>${link('Đặt sân mới', 'player-court-search.html', 'secondary small')}</div>` +
        table(
          ['Sân / Lịch', 'Tổng giá', 'Trạng thái', 'Thao tác'],
          bookings
            .slice()
            .reverse()
            .map((b) => {
              const s = CC.find('slots', b.slotId),
                c = CC.courtFor(s);
              return [
                `<strong>${esc(c.name)}</strong><div class="muted">${day(s.date)} · ${s.start} – ${s.end}</div>`,
                money(s.price),
                badge(b.status),
                `<div class="actions">${['pending', 'approved'].includes(b.status) ? btn('Ghi chú', 'booking-note', 'secondary small', `data-id="${b.id}"`) + btn('Hủy đơn', 'cancel-booking', 'danger small', `data-id="${b.id}"`) : b.status === 'completed' && Community.ended(s) ? btn('Đánh giá sân', 'review-court', 'secondary small', `data-id="${b.id}"`) : '—'}</div>`,
              ];
            })
        ) +
        `</section><section data-activity="matches"><div class="panel-title"><h2>Trận đấu của tôi</h2></div>` +
        table(
          ['Trận đấu', 'Lịch', 'Thành viên', 'Trạng thái', 'Thao tác'],
          matches.map((m) => {
            const s = CC.find('slots', m.slotId);
            return [
              `<a href="match-detail.html?id=${m.id}"><strong>${esc(m.name)}</strong></a>`,
              `${day(s.date)}<br>${s.start} – ${s.end}`,
              `${m.playerIds.length}/${m.capacity}`,
              badge(m.status),
              m.status === 'open'
                ? `<div class="actions">${m.hostId === u.id ? link('Sửa', `player-match-create.html?id=${m.id}`, 'secondary small') + btn('Hủy trận', 'cancel-match', 'danger small', `data-id="${m.id}"`) : btn('Rút khỏi trận', 'leave-match', 'secondary small', `data-id="${m.id}"`)}</div>`
                : m.status === 'completed'
                  ? link(
                      'Đánh giá / báo cáo bạn chơi',
                      `match-detail.html?id=${m.id}`,
                      'secondary small'
                    )
                  : '—',
            ];
          })
        ) +
        '</section>'
    );
    UI.responsiveTables($('#main'));
    $('#main').classList.add('compact-management');
    document.querySelectorAll('[data-activity]').forEach((section) => {
      section.hidden = activityView !== 'all' && section.dataset.activity !== activityView;
    });
  }
  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action="activity-filter"]');
    if (!button) return;
    activityView = button.dataset.view;
    mySports();
    document
      .querySelector(`[data-action="activity-filter"][data-view="${activityView}"]`)
      .focus({ preventScroll: true });
  });
  function matchCreate() {
    const u = CC.me(),
      m = CC.find('matches', q().get('id'));
    if (m && m.hostId !== u.id) {
      App.error(403);
      return;
    }
    const slots = CC.db.bookings
      .filter((b) => b.playerId === u.id && b.status === 'approved')
      .map((b) => CC.find('slots', b.slotId))
      .filter(
        (s) =>
          CC.future(s) &&
          !CC.db.matches.some((x) => x.id !== m?.id && x.slotId === s.id && x.status === 'open')
      );
    shell(
      pageHead(
        m ? 'Chỉnh sửa trận đấu' : 'Tạo trận đấu',
        'Sử dụng lịch sân đã được duyệt để mời đồng đội.'
      ) +
        `<div class="two-col"><form class="panel" id="match-form"><div id="match-error" class="notice error" role="alert" hidden></div>${field('Tên trận đấu', 'name', 'text', m?.name || '', 'required minlength="3" maxlength="100"')}${select('Lịch sân đã duyệt', 'slotId', slots.map((s) => option(s.id, `${CC.courtFor(s).name} · ${day(s.date)} ${s.start}`, m?.slotId)).join('') || option('', 'Chưa có lịch sân được duyệt'), 'required')}<div class="form-grid">${select('Trình độ', 'level', levels(m?.level || 3))}${field('Số người tối đa', 'capacity', 'number', m?.capacity || 4, 'required min="2" max="24" step="1"')}</div>${textarea('Mô tả / Lưu ý', 'note', m?.note || '')}<button class="btn" ${slots.length ? '' : 'disabled'}>Lưu trận đấu</button></form><aside class="panel"><div class="auth-symbol">${icon('users')}</div><h3>Hẹn một trận thật vui</h3><p class="muted">Chọn trình độ phù hợp, số người cần tìm và ghi chú rõ ràng cho đồng đội.</p><div class="notice">Chưa có lịch sân? Hãy đặt sân và chờ chủ sân duyệt trước.</div>${link('Tìm & đặt sân', 'player-court-search.html', 'secondary full')}</aside></div>`
    );
    $('#match-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        const d = Object.fromEntries(new FormData(e.currentTarget));
        d.level = +d.level;
        d.capacity = +d.capacity;
        CC.saveMatch(d, m?.id);
        location.href = 'player-my-sports.html';
      } catch (err) {
        $('#match-error').textContent = err.message;
        $('#match-error').hidden = false;
      }
    };
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const id = a.dataset.id;
    try {
      switch (a.dataset.action) {
        case 'create-match':
          if (requireLogin('player-match-create.html'))
            location.href = CC.me().role === 'player' ? 'player-match-create.html' : '403.html';
          break;
        case 'choose-slot':
          if (requireLogin('booking.html?slot=' + id))
            location.href = CC.me().role === 'player' ? 'booking.html?slot=' + id : '403.html';
          break;
        case 'join-match':
          if (requireLogin('match-detail.html?id=' + id)) {
            CC.joinMatch(id);
            renderPage();
            toast('Đã tham gia trận. Hẹn gặp bạn trên sân!');
          }
          break;
        case 'cancel-booking':
          confirm(
            'Hủy yêu cầu đặt sân?',
            'Khung giờ sẽ được mở lại. Nếu có trận liên quan, trận cũng sẽ bị hủy.',
            () => {
              CC.setBooking(id, 'cancelled');
              renderPage();
              toast('Đã hủy đơn đặt sân.');
            }
          );
          break;
        case 'booking-note': {
          const b = CC.find('bookings', id);
          formDialog('Sửa ghi chú', textarea('Ghi chú', 'note', b.note), 'Lưu ghi chú', (d) => {
            if (b.playerId !== CC.me().id) throw Error('Không có quyền.');
            CC.transaction(() => (b.note = d.note));
          });
          break;
        }
        case 'leave-match':
          confirm('Rút khỏi trận?', 'Vị trí của bạn sẽ được nhường cho người chơi khác.', () => {
            CC.leaveMatch(id);
            renderPage();
            toast('Đã rút khỏi trận.');
          });
          break;
        case 'cancel-match':
          confirm(
            'Hủy trận đấu?',
            'Lịch đặt sân vẫn giữ nguyên; bạn có thể hủy riêng trong danh sách đơn đặt.',
            () => {
              CC.cancelMatch(id);
              renderPage();
              toast('Đã hủy trận.');
            }
          );
          break;
      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.Player = {
    home,
    searchCourts,
    openMatches,
    courtDetail,
    bookingPage,
    matchDetail,
    mySports,
    matchCreate,
  };
})();
