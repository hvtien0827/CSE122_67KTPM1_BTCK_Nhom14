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
    toast,
    modal,
    close,
    confirm,
    formDialog,
    requireLogin,
    courtCard,
    matchCard
  } = UI;
  const q = () => new URLSearchParams(location.search);
  const filters = {};
  const getFilters = () => filters[document.body.dataset.route || location.pathname.split('/').pop()] || {};
  function bindFilters() {
    const f = $('#filters');
    if (!f) return;
    f.onsubmit = e => {
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
    const courts = CC.db.courts.filter(c => c.status === 'active' && CC.sportActive(c.sportId)).slice(0, 3),
      matches = CC.db.matches.filter(m => m.status === 'open' && CC.future(CC.find('slots', m.slotId))).slice(0, 3);
    Views.update("player-home", {
      "matches-map-matchcard-join-empty-1": () => matches.map(matchCard).join('') || empty(),
      "courts-map-courtcard-join-empty-2": () => courts.map(courtCard).join('') || empty(),
      "cc-me-player-open-matches-html-register-html-3": () => esc(CC.me() ? 'player-open-matches.html' : 'register.html')
    });
  }
  function searchCourts() {
    const f = getFilters(),
      rows = CC.db.courts.filter(c => c.status === 'active' && CC.sportActive(c.sportId) && (!f.sport || c.sportId === f.sport) && (!f.search || (c.name + ' ' + c.location).toLowerCase().includes(f.search.toLowerCase())) && (!f.date || CC.db.slots.some(s => s.courtId === c.id && s.date === f.date && CC.available(s))));
    Views.update("player-searchCourts", {
      "f-search-1": () => esc(f.search || ''),
      "sports-f-sport-true-2": () => sports(f.sport, true),
      "f-date-3": () => esc(f.date || ''),
      "rows-length-4": () => rows.length,
      "rows-map-courtcard-join-empty-kh-ng-t-m-th-y--5": () => rows.map(courtCard).join('') || empty('Không tìm thấy sân', 'Thử đổi tên, môn thể thao hoặc ngày chơi.')
    });
    bindFilters();
  }
  function openMatches() {
    const f = getFilters(),
      rows = CC.db.matches.filter(m => {
        const s = CC.find('slots', m.slotId),
          c = CC.courtFor(s);
        return m.status === 'open' && CC.future(s) && CC.sportActive(c?.sportId) && (!f.sport || c.sportId === f.sport) && (!f.level || m.level === +f.level) && (!f.date || s.date === f.date) && (!f.search || (m.name + ' ' + c.name + ' ' + c.location).toLowerCase().includes(f.search.toLowerCase()));
      });
    Views.update("player-openMatches", {
      "f-search-1": () => esc(f.search || ''),
      "sports-f-sport-true-2": () => sports(f.sport, true),
      "levels-f-level-true-3": () => levels(f.level, true),
      "f-date-4": () => esc(f.date || ''),
      "rows-length-5": () => rows.length,
      "rows-map-matchcard-join-empty-ch-a-c-tr-n-ph--6": () => rows.map(matchCard).join('') || empty('Chưa có trận phù hợp', 'Đổi điều kiện lọc hoặc tạo trận của riêng bạn.')
    });
    bindFilters();
  }
  function courtDetail() {
    const c = CC.find('courts', q().get('id'));
    if (!c || c.status !== 'active') {
      App.error(404);
      return;
    }
    const dates = [...new Set(CC.db.slots.filter(s => s.courtId === c.id && CC.future(s) && s.status === 'open').map(s => s.date))].sort();
    const requested = q().get('date');
    const chosen = /^\d{4}-\d{2}-\d{2}$/.test(requested || '') ? requested : dates[0] || CC.date();
    const slots = CC.db.slots.filter(s => s.courtId === c.id && s.date === chosen && s.status === 'open').sort((a, b) => a.start.localeCompare(b.start));
    const availableCount = slots.filter(CC.available).length;
    Views.update("player-courtDetail", {
      "c-name-1": () => esc(c.name),
      "c-location-2": () => esc(c.location),
      "money-c-price-3": () => money(c.price),
      "chosen-4": () => esc(chosen),
      "new-date-chosen-t12-00-00-tolocaledatestring--5": () => new Date(chosen + 'T12:00:00').toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      "availablecount-6": () => availableCount,
      "slots-map-slot-button-type-button-class-slot--7": () => slots.map(slot => `<button type="button" class="slot" data-action="choose-slot" data-id="${slot.id}" aria-pressed="false" ${CC.available(slot) ? '' : 'disabled'}><strong>${slot.start}–${slot.end}</strong><small>${money(slot.price)}</small><span>${CC.available(slot) ? 'Còn trống · Chọn' : CC.future(slot) ? 'Đã có người đặt' : 'Đã qua giờ'}</span></button>`).join('') || '<div class="notice">Ngày này chưa mở lịch. Chọn ngày khác hoặc xem ngày có lịch bên dưới.</div>',
      "availablecount-dates-some-d-d-chosen-8": () => !availableCount && dates.some(d => d !== chosen),
      "court-detail-html-id-c-id-date-dates-find-d-d-9": () => esc(`court-detail.html?id=${c.id}&date=${dates.find(d => d !== chosen)}`),
      "courtimage-c-10": () => UI.courtImage(c),
      "c-name-11": () => esc(c.name),
      "sport-c-sportid-12": () => sport(c.sportId),
      "c-description-13": () => esc(c.description),
      "c-amenities-g-i-xe-n-c-u-ng-split-map-x-span--14": () => (c.amenities || 'Gửi xe, Nước uống').split(',').map(x => `<span class="tag">✓ ${esc(x.trim())}</span>`).join('')
    });
    UI.bindBookingDatePicker();
    $('[name=slotDate]').onchange = event => {
      if (event.target.value) location.href = `court-detail.html?id=${c.id}&date=${event.target.value}`;
    };
  }
  function bookingPage() {
    const s = CC.find('slots', q().get('slot')),
      c = CC.courtFor(s);
    if (!s || !c) {
      App.error(404);
      return;
    }
    Views.update("player-bookingPage", {
      "cc-me-name-1": () => esc(CC.me().name),
      "cc-available-s-disabled-2": () => CC.available(s) ? '' : 'disabled',
      "cc-available-s-3": () => !CC.available(s),
      "courtimage-c-4": () => UI.courtImage(c),
      "c-name-5": () => esc(c.name),
      "c-name-6": () => esc(c.name),
      "c-location-7": () => esc(c.location),
      "day-s-date-8": () => day(s.date),
      "s-start-9": () => s.start,
      "s-end-10": () => s.end,
      "money-s-price-11": () => money(s.price)
    });
    $('#booking-form').onsubmit = e => {
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
    Views.update("player-matchDetail", {
      "m-name-1": () => esc(m.name),
      "courtimage-c-2": () => UI.courtImage(c),
      "c-name-3": () => esc(c.name),
      "sport-c-sportid-4": () => sport(c.sportId),
      "m-status-5": () => esc(m.status),
      "cc-statuses-m-status-m-status-6": () => esc(CC.statuses[m.status] || m.status),
      "level-m-level-7": () => level(m.level),
      "m-note-8": () => esc(m.note),
      "c-name-9": () => esc(c.name),
      "c-location-10": () => esc(c.location),
      "day-s-date-11": () => day(s.date),
      "s-start-12": () => s.start,
      "s-end-13": () => s.end,
      "m-playerids-length-14": () => m.playerIds.length,
      "m-capacity-15": () => m.capacity,
      "math-min-100-m-playerids-length-m-capacity-10-16": () => Math.min(100, m.playerIds.length / m.capacity * 100),
      "m-playerids-map-id-div-class-player-row-span--17": () => m.playerIds.map(id => `<div class="player-row"><span class="avatar">${esc((CC.find('players', id)?.name || '?').slice(0, 1))}</span><div><strong>${esc(CC.find('players', id)?.name || 'Người chơi')}</strong><div class="small muted">${id === m.hostId ? 'Chủ trận' : 'Thành viên'}</div></div></div>`).join(''),
      "joined-18": () => joined,
      "data-id-m-id-m-playerids-length-m-capacity-m--19": () => `data-id="${m.id}" ${m.playerIds.length >= m.capacity || m.status !== 'open' || !CC.future(s) ? 'disabled' : ''}`,
      "m-playerids-length-m-capacity-tr-n-ng-i-tham--20": () => m.playerIds.length >= m.capacity ? 'Trận đã đủ người' : 'Tham gia trận'
    });
  }
  let activityView = 'all';
  function mySports() {
    const u = CC.me(),
      bookings = CC.db.bookings.filter(b => b.playerId === u.id),
      matches = CC.db.matches.filter(m => m.playerIds.includes(u.id) || m.hostId === u.id);
    const tableRows1 = bookings.slice().reverse().map(b => {
      const s = CC.find('slots', b.slotId),
        c = CC.courtFor(s);
      return [`<strong>${esc(c.name)}</strong><div class="muted">${day(s.date)} · ${s.start} – ${s.end}</div>`, money(s.price), badge(b.status), `<div class="actions">${['pending', 'approved'].includes(b.status) ? btn('Ghi chú', 'booking-note', 'secondary small', `data-id="${b.id}"`) + btn('Hủy đơn', 'cancel-booking', 'danger small', `data-id="${b.id}"`) : b.status === 'completed' && Community.ended(s) ? btn('Đánh giá sân', 'review-court', 'secondary small', `data-id="${b.id}"`) : '—'}</div>`];
    });
    const tableRows2 = matches.map(m => {
      const s = CC.find('slots', m.slotId);
      return [`<a href="match-detail.html?id=${m.id}"><strong>${esc(m.name)}</strong></a>`, `${day(s.date)}<br>${s.start} – ${s.end}`, `${m.playerIds.length}/${m.capacity}`, badge(m.status), m.status === 'open' ? `<div class="actions">${m.hostId === u.id ? link('Sửa', `player-match-create.html?id=${m.id}`, 'secondary small') + btn('Hủy trận', 'cancel-match', 'danger small', `data-id="${m.id}"`) : btn('Rút khỏi trận', 'leave-match', 'secondary small', `data-id="${m.id}"`)}</div>` : m.status === 'completed' ? link('Đánh giá / báo cáo bạn chơi', `match-detail.html?id=${m.id}`, 'secondary small') : '—'];
    });
    Views.update("player-mySports", {
      "activityview-all-secondary-1": () => activityView === "all" ? '' : 'secondary',
      "data-view-all-aria-pressed-activityview-all-2": () => `data-view="${"all"}" aria-pressed="${activityView === "all"}"`,
      "activityview-bookings-secondary-3": () => activityView === "bookings" ? '' : 'secondary',
      "data-view-bookings-aria-pressed-activityview--4": () => `data-view="${"bookings"}" aria-pressed="${activityView === "bookings"}"`,
      "activityview-matches-secondary-5": () => activityView === "matches" ? '' : 'secondary',
      "data-view-matches-aria-pressed-activityview-m-6": () => `data-view="${"matches"}" aria-pressed="${activityView === "matches"}"`,
      "bookings-length-7": () => bookings.length,
      "bookings-filter-b-b-status-pending-length-8": () => bookings.filter(b => b.status === 'pending').length,
      "bookings-filter-b-b-status-approved-length-9": () => bookings.filter(b => b.status === 'approved').length,
      "matches-filter-m-m-status-open-length-10": () => matches.filter(m => m.status === 'open').length,
      "tablerows1-length-0-11": () => tableRows1.length > 0,
      "tablerows-tablerows1-12": () => UI.tableRows(tableRows1),
      "tablerows2-length-0-13": () => tableRows2.length > 0,
      "tablerows-tablerows2-14": () => UI.tableRows(tableRows2)
    });
    UI.responsiveTables($('#main'));
    $('#main').classList.add('compact-management');
    document.querySelectorAll('[data-activity]').forEach(section => {
      section.hidden = activityView !== 'all' && section.dataset.activity !== activityView;
    });
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-action="activity-filter"]');
    if (!button) return;
    activityView = button.dataset.view;
    mySports();
    document.querySelector(`[data-action="activity-filter"][data-view="${activityView}"]`).focus({
      preventScroll: true
    });
  });
  function matchCreate() {
    const u = CC.me(),
      m = CC.find('matches', q().get('id'));
    if (m && m.hostId !== u.id) {
      App.error(403);
      return;
    }
    const slots = CC.db.bookings.filter(b => b.playerId === u.id && b.status === 'approved').map(b => CC.find('slots', b.slotId)).filter(s => CC.future(s) && !CC.db.matches.some(x => x.id !== m?.id && x.slotId === s.id && x.status === 'open'));
    Views.update("player-matchCreate", {
      "m-ch-nh-s-a-tr-n-u-t-o-tr-n-u-1": () => m ? 'Chỉnh sửa trận đấu' : 'Tạo trận đấu',
      "m-name-2": () => esc(m?.name || ''),
      "slots-map-s-option-s-id-cc-courtfor-s-name-da-3": () => slots.map(s => option(s.id, `${CC.courtFor(s).name} · ${day(s.date)} ${s.start}`, m?.slotId)).join('') || option('', 'Chưa có lịch sân được duyệt'),
      "levels-m-level-3-4": () => levels(m?.level || 3),
      "m-capacity-4-5": () => esc(m?.capacity || 4),
      "m-note-6": () => esc(m?.note || ''),
      "slots-length-disabled-7": () => slots.length ? '' : 'disabled'
    });
    $('#match-form').onsubmit = e => {
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
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const id = a.dataset.id;
    try {
      switch (a.dataset.action) {
        case 'create-match':
          if (requireLogin('player-match-create.html')) location.href = CC.me().role === 'player' ? 'player-match-create.html' : '403.html';
          break;
        case 'choose-slot':
          {
            const slot = CC.find('slots', id);
            if (!CC.available(slot)) throw Error('Khung giờ không còn trống. Chọn khung giờ khác.');
            $$('[data-action=choose-slot]').forEach(button => button.setAttribute('aria-pressed', String(button === a)));
            $('#selected-slot-summary').textContent = `${day(slot.date)} · ${slot.start}–${slot.end} · Tổng ${money(slot.price)}`;
            const button = $('[data-action=book-selected]');
            button.disabled = false;
            button.dataset.id = id;
            button.textContent = `Đặt sân · ${money(slot.price)}`;
            break;
          }
        case 'book-selected':
          if (requireLogin('booking.html?slot=' + id)) location.href = CC.me().role === 'player' ? 'booking.html?slot=' + id : '403.html';
          break;
        case 'join-match':
          if (requireLogin('match-detail.html?id=' + id)) {
            CC.joinMatch(id);
            renderPage();
            toast('Đã tham gia trận. Hẹn gặp bạn trên sân!');
          }
          break;
        case 'cancel-booking':
          confirm('Hủy yêu cầu đặt sân?', 'Khung giờ sẽ được mở lại. Nếu có trận liên quan, trận cũng sẽ bị hủy.', () => {
            CC.setBooking(id, 'cancelled');
            renderPage();
            toast('Đã hủy đơn đặt sân.');
          });
          break;
        case 'booking-note':
          {
            const b = CC.find('bookings', id);
            formDialog('Sửa ghi chú', Views.fragment("player-actions-dialog-1", {
              "b-note-1": () => esc(b.note)
            }), 'Lưu ghi chú', d => {
              if (b.playerId !== CC.me().id) throw Error('Không có quyền.');
              CC.transaction(() => b.note = d.note);
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
          confirm('Hủy trận đấu?', 'Lịch đặt sân vẫn giữ nguyên; bạn có thể hủy riêng trong danh sách đơn đặt.', () => {
            CC.cancelMatch(id);
            renderPage();
            toast('Đã hủy trận.');
          });
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
    matchCreate
  };
})();
