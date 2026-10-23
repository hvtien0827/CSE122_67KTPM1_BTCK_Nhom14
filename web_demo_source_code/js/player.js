/* Trang công khai và luồng Người chơi. */
(() => {
  const {
    $,
    $$,
    esc,
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
    empty,
    toast,
    confirm,
    formDialog,
    requireLogin,
    courtCard,
    matchCard,
  } = UI;
  const q = () => new URLSearchParams(location.search);
  const filters = {};
  const getFilters = () =>
    filters[document.body.dataset.route || location.pathname.split('/').pop()] || {};
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
    Views.update('player-home', {
      matchCards: () => matches.map(matchCard).join('') || empty(),
      courtCards: () => courts.map(courtCard).join('') || empty(),
      joinUrl: () => esc(CC.me() ? 'player-open-matches.html' : 'register.html'),
    });
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
    Views.update('player-searchCourts', {
      searchValue: () => esc(f.search || ''),
      sportOptions: () => sports(f.sport, true),
      selectedDate: () => esc(f.date || ''),
      resultCount: () => rows.length,
      courtCards: () =>
        rows.map(courtCard).join('') ||
        empty('Không tìm thấy sân', 'Thử đổi tên, môn thể thao hoặc ngày chơi.'),
    });
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
    Views.update('player-openMatches', {
      searchValue: () => esc(f.search || ''),
      sportOptions: () => sports(f.sport, true),
      levelOptions: () => levels(f.level, true),
      selectedDate: () => esc(f.date || ''),
      resultCount: () => rows.length,
      matchCards: () =>
        rows.map(matchCard).join('') ||
        empty('Chưa có trận phù hợp', 'Đổi điều kiện lọc hoặc tạo trận của riêng bạn.'),
    });
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
    const requested = q().get('date');
    const chosen = /^\d{4}-\d{2}-\d{2}$/.test(requested || '') ? requested : dates[0] || CC.date();
    const slots = CC.db.slots
      .filter((s) => s.courtId === c.id && s.date === chosen && s.status === 'open')
      .sort((a, b) => a.start.localeCompare(b.start));
    const availableCount = slots.filter(CC.available).length;
    Views.update('player-courtDetail', {
      courtName: () => esc(c.name),
      courtLocation: () => esc(c.location),
      hourlyPrice: () => money(c.price),
      selectedDate: () => esc(chosen),
      dateLabel: () =>
        new Date(chosen + 'T12:00:00').toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      availableCount: () => availableCount,
      slotButtons: () =>
        slots
          .map(
            (slot) =>
              `<button type="button" class="slot" data-action="choose-slot" data-id="${slot.id}" aria-pressed="false" ${CC.available(slot) ? '' : 'disabled'}><strong>${slot.start}–${slot.end}</strong><small>${money(slot.price)}</small><span>${CC.available(slot) ? 'Còn trống · Chọn' : CC.future(slot) ? 'Đã có người đặt' : 'Đã qua giờ'}</span></button>`
          )
          .join('') ||
        '<div class="notice">Ngày này chưa mở lịch. Chọn ngày khác hoặc xem ngày có lịch bên dưới.</div>',
      noSlots: () => !availableCount && dates.some((d) => d !== chosen),
      nextDateUrl: () =>
        esc(`court-detail.html?id=${c.id}&date=${dates.find((d) => d !== chosen)}`),
      courtImage: () => UI.courtImage(c),
      courtHeading: () => esc(c.name),
      sportName: () => sport(c.sportId),
      description: () => esc(c.description),
      amenities: () =>
        (c.amenities || 'Gửi xe, Nước uống')
          .split(',')
          .map((x) => `<span class="tag">${UI.icon('check')} ${esc(x.trim())}</span>`)
          .join(''),
    });
    $('#court-review-list').innerHTML = Community.reviewList(
      CC.db.courtReviews.filter((r) => r.courtId === c.id)
    );
    UI.bindBookingDatePicker();
    $('[name=slotDate]').onchange = (event) => {
      if (event.target.value)
        location.href = `court-detail.html?id=${c.id}&date=${event.target.value}`;
    };
  }
  function bookingPage() {
    const s = CC.find('slots', q().get('slot')),
      c = CC.courtFor(s);
    if (!s || !c) {
      App.error(404);
      return;
    }
    Views.update('player-bookingPage', {
      playerName: () => esc(CC.me().name),
      submitDisabled: () => (CC.available(s) ? '' : 'disabled'),
      slotAvailable: () => !CC.available(s),
      courtImage: () => UI.courtImage(c),
      courtName: () => esc(c.name),
      courtHeading: () => esc(c.name),
      courtLocation: () => esc(c.location),
      bookingDate: () => day(s.date),
      startTime: () => s.start,
      endTime: () => s.end,
      totalPrice: () => money(s.price),
    });
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
    Views.update('player-matchDetail', {
      matchName: () => esc(m.name),
      courtImage: () => UI.courtImage(c),
      courtName: () => esc(c.name),
      sportName: () => sport(c.sportId),
      matchStatus: () => esc(m.status),
      statusLabel: () => esc(CC.statuses[m.status] || m.status),
      levelLabel: () => level(m.level),
      matchNote: () => esc(m.note),
      courtHeading: () => esc(c.name),
      courtLocation: () => esc(c.location),
      matchDate: () => day(s.date),
      startTime: () => s.start,
      endTime: () => s.end,
      playerCount: () => m.playerIds.length,
      capacity: () => m.capacity,
      capacityPercent: () => Math.min(100, (m.playerIds.length / m.capacity) * 100),
      playerRows: () =>
        m.playerIds
          .map(
            (id) =>
              `<div class="player-row"><span class="avatar">${esc((CC.find('players', id)?.name || '?').slice(0, 1))}</span><div><strong>${esc(CC.find('players', id)?.name || 'Người chơi')}</strong><div class="small muted">${id === m.hostId ? 'Chủ trận' : 'Thành viên'}</div></div></div>`
          )
          .join(''),
      hasJoined: () => joined,
      joinButton: () =>
        `data-id="${m.id}" ${m.playerIds.length >= m.capacity || m.status !== 'open' || !CC.future(s) ? 'disabled' : ''}`,
      joinLabel: () => (m.playerIds.length >= m.capacity ? 'Trận đã đủ người' : 'Tham gia trận'),
    });
    $('#opponent-cards').innerHTML = Community.opponentCards(m);
  }
  let activityView = 'all';
  function mySports() {
    const u = CC.me(),
      bookings = CC.db.bookings.filter((b) => b.playerId === u.id),
      matches = CC.db.matches.filter((m) => m.playerIds.includes(u.id) || m.hostId === u.id);
    const tableRows1 = bookings
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
      });
    const tableRows2 = matches.map((m) => {
      const s = CC.find('slots', m.slotId);
      return [
        `<a href="match-detail.html?id=${m.id}"><strong>${esc(m.name)}</strong></a>`,
        `${day(s.date)}<br>${s.start} – ${s.end}`,
        `${m.playerIds.length}/${m.capacity}`,
        badge(m.status),
        m.status === 'open'
          ? `<div class="actions">${m.hostId === u.id ? link('Sửa', `player-match-create.html?id=${m.id}`, 'secondary small') + btn('Hủy trận', 'cancel-match', 'danger small', `data-id="${m.id}"`) : btn('Rút khỏi trận', 'leave-match', 'secondary small', `data-id="${m.id}"`)}</div>`
          : m.status === 'completed'
            ? link('Đánh giá / báo cáo bạn chơi', `match-detail.html?id=${m.id}`, 'secondary small')
            : '—',
      ];
    });
    Views.update('player-mySports', {
      allButtonClass: () => (activityView === 'all' ? '' : 'secondary'),
      allButtonAttributes: () => `data-view="${'all'}" aria-pressed="${activityView === 'all'}"`,
      bookingsButtonClass: () => (activityView === 'bookings' ? '' : 'secondary'),
      bookingsButtonAttributes: () =>
        `data-view="${'bookings'}" aria-pressed="${activityView === 'bookings'}"`,
      matchesButtonClass: () => (activityView === 'matches' ? '' : 'secondary'),
      matchesButtonAttributes: () =>
        `data-view="${'matches'}" aria-pressed="${activityView === 'matches'}"`,
      bookingCount: () => bookings.length,
      pendingCount: () => bookings.filter((b) => b.status === 'pending').length,
      approvedCount: () => bookings.filter((b) => b.status === 'approved').length,
      openMatchCount: () => matches.filter((m) => m.status === 'open').length,
      hasBookings: () => tableRows1.length > 0,
      bookingRows: () => UI.tableRows(tableRows1),
      hasMatches: () => tableRows2.length > 0,
      matchRows: () => UI.tableRows(tableRows2),
    });
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
    document.querySelector(`[data-action="activity-filter"][data-view="${activityView}"]`).focus({
      preventScroll: true,
    });
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
          CC.sportActive(CC.courtFor(s)?.sportId) &&
          !CC.db.matches.some((x) => x.id !== m?.id && x.slotId === s.id && x.status === 'open')
      );
    const activeSports = CC.db.sports.filter((s) => s.status === 'active');
    const initialSport =
      CC.courtFor(CC.find('slots', m?.slotId))?.sportId ||
      CC.courtFor(slots[0])?.sportId ||
      activeSports[0]?.id ||
      '';
    const slotsForSport = (sportId) => slots.filter((s) => CC.courtFor(s).sportId === sportId);
    const slotOptions = (available, selected) =>
      available
        .map((s) => option(s.id, `${CC.courtFor(s).name} · ${day(s.date)} ${s.start}`, selected))
        .join('') || option('', 'Chưa có lịch sân được duyệt cho môn này');
    Views.update('player-matchCreate', {
      formTitle: () => (m ? 'Chỉnh sửa trận đấu' : 'Tạo trận đấu'),
      matchName: () => esc(m?.name || ''),
      sportOptions: () =>
        activeSports.map((s) => option(s.id, s.name, initialSport)).join('') ||
        option('', 'Chưa có môn thể thao đang hoạt động'),
      slotOptions: () => slotOptions(slotsForSport(initialSport), m?.slotId),
      levelOptions: () => levels(m?.level || 3),
      capacity: () => esc(m?.capacity || 4),
      note: () => esc(m?.note || ''),
      submitDisabled: () => (slotsForSport(initialSport).length ? '' : 'disabled'),
    });
    const form = $('#match-form');
    const sportSelect = form.elements.namedItem('sportId');
    const slotSelect = form.elements.namedItem('slotId');
    function updateSlots() {
      const available = slotsForSport(sportSelect.value);
      const selected = slotSelect.value;
      slotSelect.innerHTML = slotOptions(available, selected);
      slotSelect.disabled = available.length === 0;
      form.querySelector('button[type="submit"], button:not([type])').disabled =
        available.length === 0;
      $('#match-slot-hint').textContent = available.length
        ? 'Chỉ hiển thị lịch sân của môn đã chọn, được duyệt và chưa có trận đang mở.'
        : 'Chưa có lịch sân phù hợp cho môn này. Hãy đặt sân và chờ chủ sân duyệt trước.';
    }
    // Chỉ cập nhật danh sách lịch, giữ tên trận, ghi chú và các thông tin đang nhập.
    sportSelect.onchange = () => {
      updateSlots();
      $('#match-error').hidden = true;
    };
    updateSlots();
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const d = Object.fromEntries(new FormData(e.currentTarget));
        if (!slotsForSport(d.sportId).some((s) => s.id === d.slotId))
          throw Error('Chọn lịch sân đã duyệt thuộc môn thể thao đã chọn.');
        // Môn của trận được xác định từ slot → sân; không lưu thêm một sportId dễ lệch dữ liệu.
        delete d.sportId;
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
        case 'choose-slot': {
          const slot = CC.find('slots', id);
          if (!CC.available(slot)) throw Error('Khung giờ không còn trống. Chọn khung giờ khác.');
          $$('[data-action=choose-slot]').forEach((button) =>
            button.setAttribute('aria-pressed', String(button === a))
          );
          $('#selected-slot-summary').textContent =
            `${day(slot.date)} · ${slot.start}–${slot.end} · Tổng ${money(slot.price)}`;
          const button = $('[data-action=book-selected]');
          button.disabled = false;
          button.dataset.id = id;
          button.textContent = `Đặt sân · ${money(slot.price)}`;
          break;
        }
        case 'book-selected':
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
          formDialog(
            'Sửa ghi chú',
            Views.fragment('player-actions-dialog-1', {
              note: () => esc(b.note),
            }),
            'Lưu ghi chú',
            (d) => {
              if (b.playerId !== CC.me().id) throw Error('Không có quyền.');
              CC.transaction(() => (b.note = d.note));
            }
          );
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
