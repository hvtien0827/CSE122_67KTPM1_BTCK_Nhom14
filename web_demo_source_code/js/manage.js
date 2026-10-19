/* Quản lý sân, CLB và quản trị: bảng, bộ lọc, biểu mẫu và CRUD. */
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
    option,
    sports,
    field,
    select,
    textarea,
    empty,
    toast,
    confirm,
    formDialog
  } = UI;
  let roleFilter = '';
  let filter = '',
    statusFilter = '';
  const q = () => new URLSearchParams(location.search);
  function bind() {
    const input = $('[name=manage-search]');
    if (input) input.onchange = e => {
      filter = e.target.value;
      renderPage();
    };
    const s = $('[name=manage-status]');
    if (s) s.onchange = e => {
      statusFilter = e.target.value;
      renderPage();
    };
  }
  const match = x => (!filter || JSON.stringify(x).toLowerCase().includes(filter.toLowerCase())) && (!statusFilter || x.status === statusFilter);
  const acts = (table, x) => `<div class="actions">${x.status !== 'archived' && x.status !== 'disabled' ? btn('Sửa', 'entity-edit', 'secondary small', `data-table="${table}" data-id="${x.id}"`) + btn(['users', 'players'].includes(table) ? 'Vô hiệu hóa' : 'Lưu trữ', 'entity-archive', 'ghost small', `data-table="${table}" data-id="${x.id}"`) : '<span class="muted">Đã ngừng hoạt động</span>'}${['courts', 'events', 'reports'].includes(table) ? btn('Xoá', 'entity-delete', 'danger small', `data-table="${table}" data-id="${x.id}"`) : ''}</div>`;
  const activeCourts = () => CC.db.courts.filter(c => c.ownerId === CC.me().id && c.status === 'active');
  const ownEvents = () => CC.db.events.filter(e => e.organizerId === CC.me().id && e.status !== 'deleted');
  function courts() {
    const rows = CC.db.courts.filter(c => c.ownerId === CC.me().id && c.status !== 'deleted');
    const tableRows1 = rows.filter(match).map(c => [`<div class="court-table-info"><img src="${UI.courtImage(c)}" alt="" width="88" height="72"><div>${btn(esc(c.name), 'court-calendar', 'court-name-button', `data-id="${c.id}"`)}<p class="court-table-address">${esc(c.location)}</p></div></div>`, sport(c.sportId), money(c.price), badge(c.status), `<div class="court-table-actions">${btn(UI.icon('calendar') + 'Xem lịch sân', 'court-calendar', 'court-calendar-button', `data-id="${c.id}"`)}${acts('courts', c)}</div>`]);
    Views.update("manage-courts", {
      "rows-length-1": () => rows.length,
      "rows-filter-x-x-status-active-length-2": () => rows.filter(x => x.status === 'active').length,
      "new-set-rows-map-x-x-sportid-size-3": () => new Set(rows.map(x => x.sportId)).size,
      "rows-filter-x-x-status-archived-length-4": () => rows.filter(x => x.status === 'archived').length,
      "filter-5": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-6": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['courts' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-7": () => tableRows1.length > 0,
      "tablerows-tablerows1-8": () => UI.tableRows(tableRows1)
    });
    $('#main').classList.add('court-management');
    bind();
  }
  function slots() {
    const rows = CC.db.slots.filter(s => CC.courtFor(s)?.ownerId === CC.me().id);
    const tableRows1 = rows.filter(s => match({
      ...s,
      name: CC.courtFor(s)?.name
    })).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map(s => [esc(CC.courtFor(s)?.name), day(s.date), `${s.start} – ${s.end}`, money(s.price), s.status === 'archived' ? badge(s.status) : CC.available(s) ? '<span class="tag">Còn trống</span>' : '<span class="tag pending">Đã giữ / hết giờ</span>', acts('slots', s)]);
    Views.update("manage-slots", {
      "rows-length-1": () => rows.length,
      "rows-filter-cc-available-length-2": () => rows.filter(CC.available).length,
      "rows-filter-s-cc-db-bookings-some-b-b-slotid--3": () => rows.filter(s => CC.db.bookings.some(b => b.slotId === s.id && ['pending', 'approved'].includes(b.status))).length,
      "rows-filter-s-s-status-archived-length-4": () => rows.filter(s => s.status === 'archived').length,
      "filter-5": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-6": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['slots' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-7": () => tableRows1.length > 0,
      "tablerows-tablerows1-8": () => UI.tableRows(tableRows1)
    });
    bind();
  }
  function bookings() {
    const rows = CC.db.bookings.filter(b => CC.courtFor(CC.find('slots', b.slotId))?.ownerId === CC.me().id);
    const tableRows1 = rows.slice().reverse().filter(b => match({
      ...b,
      name: CC.find('users', b.playerId)?.name
    })).map(b => {
      const s = CC.find('slots', b.slotId),
        c = CC.courtFor(s);
      return [`<strong>${esc(CC.find('users', b.playerId)?.name)}</strong><div class="muted">${esc(c.name)}</div><div class="small">${esc(b.note)}</div>${b.risk ? `<span class="tag purple">${esc(b.risk.level)} · ${esc(b.risk.decision)}</span>` : ''}`, `${day(s.date)}<br>${s.start} – ${s.end}`, money(s.price), badge(b.status), `<div class="actions">${b.status === 'pending' ? btn('Duyệt', 'booking-status', 'small', `data-id="${b.id}" data-status="approved"`) + btn('Từ chối', 'booking-status', 'danger small', `data-id="${b.id}" data-status="rejected"`) : ''}${b.status === 'approved' ? btn('Hoàn thành', 'booking-status', 'secondary small', `data-id="${b.id}" data-status="completed" ${Community.ended(s) ? "" : 'disabled title="Có thể hoàn thành sau khi hết giờ thuê"'}`) : ''}${['pending', 'approved'].includes(b.status) ? btn('Hủy', 'booking-status', 'ghost small', `data-id="${b.id}" data-status="cancelled"`) : ''}</div>`];
    });
    Views.update("manage-bookings", {
      "rows-length-1": () => rows.length,
      "rows-filter-b-b-status-pending-length-2": () => rows.filter(b => b.status === 'pending').length,
      "rows-filter-b-b-status-approved-length-3": () => rows.filter(b => b.status === 'approved').length,
      "rows-filter-b-cancelled-rejected-includes-b-s-4": () => rows.filter(b => ['cancelled', 'rejected'].includes(b.status)).length,
      "filter-5": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-6": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }[undefined || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-7": () => tableRows1.length > 0,
      "tablerows-tablerows1-8": () => UI.tableRows(tableRows1)
    });
    UI.responsiveTables($('#main'));
    $('#main').classList.add('compact-management');
    bind();
  }
  function events() {
    const rows = ownEvents();
    Views.update("manage-events", {
      "rows-length-1": () => rows.length,
      "rows-filter-e-e-status-open-length-2": () => rows.filter(e => e.status === 'open').length,
      "rows-reduce-n-e-n-e-playerids-length-0-3": () => rows.reduce((n, e) => n + e.playerIds.length, 0),
      "rows-filter-e-e-teams-length-4": () => rows.filter(e => e.teams).length,
      "filter-5": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-6": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['events' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "rows-filter-match-map-e-article-class-card-di-7": () => rows.filter(match).map(e => `<article class="card"><div class="card-body"><div class="row mb"><span class="tag">${sport(e.sportId)}</span>${badge(e.status)}</div><h3>${esc(e.name)}</h3><p class="meta">${UI.icon('calendar')}${day(e.date)} · ${e.start || '08:00'}–${e.end || '10:00'}</p><p class="meta">${UI.icon('pin')}${esc(e.location)}</p><p class="muted small">${e.playerIds.length}/${e.capacity} thành viên · ${e.teams ? 'Đã có đội hình' : 'Chưa chia đội'}</p>${link('Xem sự kiện', `organizer-event-detail.html?id=${e.id}`, 'full secondary')}<div class="mt">${acts('events', e)}</div></div></article>`).join('') || empty('Chưa có sự kiện', 'Tạo sự kiện để bắt đầu thêm người chơi.')
    });
    bind();
  }
  function eventDetail() {
    const e = CC.find('events', q().get('id'));
    if (!e || e.status === 'deleted') {
      App.error(404);
      return;
    }
    if (e.organizerId !== CC.me().id) {
      App.error(403);
      return;
    }
    Views.update("manage-eventDetail", {
      "e-name-1": () => esc(e.name),
      "data-table-events-data-id-e-id-2": () => `data-table="events" data-id="${e.id}"`,
      "e-status-3": () => esc(e.status),
      "cc-statuses-e-status-e-status-4": () => esc(CC.statuses[e.status] || e.status),
      "sport-e-sportid-5": () => sport(e.sportId),
      "e-note-6": () => esc(e.note),
      "day-e-date-7": () => day(e.date),
      "e-start-08-00-8": () => e.start || '08:00',
      "e-end-10-00-9": () => e.end || '10:00',
      "e-location-10": () => esc(e.location),
      "organizer-player-roster-html-event-e-id-11": () => esc(`organizer-player-roster.html?event=${e.id}`),
      "organizer-team-lineup-html-event-e-id-12": () => esc(`organizer-team-lineup.html?event=${e.id}`),
      "e-status-open-13": () => e.status === 'open',
      "data-id-e-id-community-ended-e-disabled-title-14": () => `data-id="${e.id}" ${Community.ended(e) ? '' : 'disabled title="Có thể hoàn thành sau khi sự kiện kết thúc"'}`,
      "e-playerids-length-15": () => e.playerIds.length,
      "e-capacity-16": () => e.capacity,
      "e-playerids-map-p-div-class-player-row-span-c-17": () => e.playerIds.map(p => `<div class="player-row"><span class="avatar">${esc(CC.find('players', p)?.name.slice(0, 1))}</span>${esc(CC.find('players', p)?.name)}</div>`).join('') || '<p class="muted">Chưa có thành viên.</p>'
    });
  }
  function roster() {
    const es = ownEvents().filter(e => e.status === 'open'),
      e = es.find(e => e.id === q().get('event')) || es[0];
    const rows = e ? CC.db.players.filter(p => e.playerIds.includes(p.id)).filter(match) : [];
    const canAdd = e && e.playerIds.length < e.capacity && CC.db.players.some(p => p.status === 'active' && !e.playerIds.includes(p.id));
    const tableRows1 = rows.map(p => [`<strong>${esc(p.name)}</strong><div class="muted">${p.userId ? 'Tài khoản thành viên' : 'Khách CLB'}</div>`, UI.level(p.levels[e?.sportId || 'badminton']), `${p.played} trận · ${p.noShows} lần vắng`, e?.playerIds.includes(p.id) ? '<span class="tag">Đã thêm</span>' : '—', `<div class="actions">${e && p.status === 'active' ? btn(e.playerIds.includes(p.id) ? 'Bỏ khỏi sự kiện' : 'Thêm vào sự kiện', 'roster-toggle', 'secondary small', `data-id="${p.id}" data-event="${e.id}"`) : ''}${acts('players', p)}</div>`]);
    Views.update("manage-roster", {
      "data-event-e-id-canadd-disabled-1": () => `data-event="${e?.id || ''}" ${canAdd ? '' : 'disabled'}`,
      "ownevents-filter-e-e-status-open-map-e-option-2": () => ownEvents().filter(e => e.status === 'open').map(e => option(e.id, e.name, e?.id)).join('') || option('', 'Chưa có sự kiện'),
      "e-e-playerids-length-e-capacity-ng-i-ch-n-spo-3": () => e ? `${e.playerIds.length}/${e.capacity} người đã chọn · ${sport(e.sportId)}` : 'Tạo sự kiện trước để thêm thành viên.',
      "e-4": () => e,
      "organizer-team-lineup-html-event-e-id-5": () => esc(`organizer-team-lineup.html?event=${e.id}`),
      "filter-6": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-7": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['players' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "rows-length-8": () => rows.length,
      "tablerows1-length-0-9": () => tableRows1.length > 0,
      "tablerows-tablerows1-10": () => UI.tableRows(tableRows1),
      "e-e-playerids-length-kh-ng-c-ng-i-ph-h-p-b-l--11": () => e ? e.playerIds.length ? 'Không có người phù hợp bộ lọc' : 'Sự kiện chưa có người tham gia' : 'Chưa có sự kiện đang mở',
      "e-b-m-th-m-v-o-s-ki-n-ch-n-ng-i-ch-i-danh-s-c-12": () => e ? 'Bấm Thêm vào sự kiện để chọn người chơi; danh sách này chỉ hiển thị người thuộc sự kiện đã chọn.' : 'Tạo sự kiện trước, sau đó thêm người chơi vào danh sách.'
    });
    bind();
    $('[name=event]').onchange = ev => {
      location.href = 'organizer-player-roster.html?event=' + ev.target.value;
    };
  }
  function sportsPage() {
    const tableRows1 = CC.db.sports.filter(match).map(s => [`<strong>${esc(s.name)}</strong>`, CC.db.courts.filter(c => c.sportId === s.id && c.status === 'active').length, badge(s.status), acts('sports', s)]);
    Views.update("manage-sportsPage", {
      "filter-1": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-2": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['sports' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-3": () => tableRows1.length > 0,
      "tablerows-tablerows1-4": () => UI.tableRows(tableRows1)
    });
    bind();
  }
  function users() {
    const tableRows1 = CC.db.users.filter(u => (!roleFilter || u.role === roleFilter) && match(u)).map(u => [`<strong>${esc(u.name)}</strong><div class="muted">${esc(u.email)}</div>`, CC.roles[u.role], u.verified ? 'Đã xác minh' : 'Chưa xác minh', badge(u.status), acts('users', u) + (u.status === 'disabled' ? btn('Kích hoạt lại', 'activate-user', 'secondary small', `data-id="${u.id}"`) : '')]);
    Views.update("manage-users", {
      "t-t-c-object-entries-cc-roles-map-r-l-btn-l-c-1": () => [['', 'Tất cả'], ...Object.entries(CC.roles)].map(([r, l]) => btn(`${l} (${CC.db.users.filter(u => !r || u.role === r).length})`, 'filter-role', roleFilter === r ? '' : 'secondary', `data-role="${r}" aria-pressed="${roleFilter === r}"`)).join(''),
      "filter-2": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-3": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['users' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-4": () => tableRows1.length > 0,
      "tablerows-tablerows1-5": () => UI.tableRows(tableRows1)
    });
    bind();
  }
  function reports() {
    const counts = ['pending', 'approved', 'completed', 'cancelled', 'rejected'].map(s => [s, CC.db.bookings.filter(b => b.status === s).length]);
    const revenue = CC.db.bookings.filter(b => b.status === 'completed').reduce((n, b) => n + CC.find('slots', b.slotId).price, 0);
    const tableRows1 = CC.db.reports.filter(match).map(r => [`<strong>${esc(r.name)}</strong><div class="muted">${esc(r.note)}</div>`, `${r.from} → ${r.to}`, `${r.snapshot?.bookings || 0} đơn · ${money(r.snapshot?.revenue)}`, badge(r.status), `<div class="actions">${btn('Tải CSV', 'export-report', 'secondary small', `data-id="${r.id}"`)}${acts('reports', r)}</div>`]);
    Views.update("manage-reports", {
      "cc-db-players-filter-p-p-status-active-length-1": () => CC.db.players.filter(p => p.status === 'active').length,
      "cc-db-bookings-length-2": () => CC.db.bookings.length,
      "cc-db-matches-filter-m-m-status-open-length-3": () => CC.db.matches.filter(m => m.status === 'open').length,
      "money-revenue-4": () => money(revenue),
      "counts-map-s-n-div-class-chart-row-span-cc-st-5": () => counts.map(([s, n]) => `<div class="chart-row"><span>${CC.statuses[s]}</span><div class="chart-bg"><div class="chart-bar" style="width:${Math.max(1, n / Math.max(1, CC.db.bookings.length) * 100)}%"></div></div><strong>${n}</strong></div>`).join(''),
      "cc-db-sports-map-s-div-class-player-row-span--6": () => CC.db.sports.map(s => `<div class="player-row"><span class="avatar">${s.name.slice(0, 1)}</span><div><strong>${esc(s.name)}</strong><div class="muted small">${CC.db.courts.filter(c => c.sportId === s.id).length} sân · ${CC.db.events.filter(e => e.sportId === s.id).length} sự kiện</div></div></div>`).join(''),
      "filter-7": () => esc(filter),
      "option-t-t-c-statusfilter-courts-active-archi-8": () => option('', 'Tất cả', statusFilter) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }['reports' || 'bookings'].map(s => option(s, CC.statuses[s], statusFilter)).join(''),
      "tablerows1-length-0-9": () => tableRows1.length > 0,
      "tablerows-tablerows1-10": () => UI.tableRows(tableRows1)
    });
    bind();
  }
  async function readCourtPhoto(file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw Error('Chọn ảnh JPG, PNG hoặc WebP.');
    if (file.size > 5 * 1024 * 1024) throw Error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5 MB.');
    const bitmap = await createImageBitmap(file).catch(() => {
      throw Error('Không thể đọc ảnh. Hãy chọn ảnh khác.');
    });
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.78);
  }
  function edit(tableName, key) {
    const x = key ? CC.find(tableName, key) : {};
    const labels = {
      courts: 'sân',
      slots: 'khung giờ',
      events: 'sự kiện',
      players: 'người chơi',
      sports: 'môn thể thao',
      users: 'tài khoản',
      reports: 'báo cáo'
    };
    let fields = '';
    if (tableName === 'courts') fields = Views.fragment("manage-edit-dialog-1", {
      "x-name-1": () => esc(x.name || ''),
      "location-2": () => 'location',
      "x-location-3": () => esc(x.location || ''),
      "sports-x-sportid-4": () => sports(x.sportId),
      "x-price-100000-5": () => esc(x.price || 100000),
      "x-description-6": () => esc(x.description || ''),
      "x-amenities-g-i-xe-n-c-u-ng-7": () => esc(x.amenities || 'Gửi xe, Nước uống'),
      "courtimage-x-8": () => UI.courtImage(x),
      "x-autoschedule-false-checked-9": () => x.autoSchedule !== false ? 'checked' : '',
      "string-4-string-x-image-4-selected-10": () => String(4) === String(x.image ?? 4) ? 'selected' : '',
      "string-1-string-x-image-4-selected-11": () => String(1) === String(x.image ?? 4) ? 'selected' : '',
      "string-2-string-x-image-4-selected-12": () => String(2) === String(x.image ?? 4) ? 'selected' : ''
    });
    if (tableName === 'slots') fields = Views.fragment("manage-edit-dialog-2", {
      "activecourts-map-c-option-c-id-c-name-x-court-1": () => activeCourts().map(c => option(c.id, c.name, x.courtId)).join(''),
      "x-date-cc-date-1-2": () => esc(x.date || CC.date(1)),
      "required-min-cc-date-3": () => `required min="${CC.date()}"`,
      "x-start-10-00-4": () => esc(x.start || '10:00'),
      "x-end-12-00-5": () => esc(x.end || '12:00'),
      "x-price-200000-6": () => esc(x.price || 200000)
    });
    if (tableName === 'events') fields = Views.fragment("manage-edit-dialog-3", {
      "x-name-1": () => esc(x.name || ''),
      "sports-x-sportid-2": () => sports(x.sportId),
      "x-date-cc-date-3-3": () => esc(x.date || CC.date(3)),
      "required-min-cc-date-4": () => `required min="${CC.date()}"`,
      "x-start-08-00-5": () => esc(x.start || '08:00'),
      "x-end-10-00-6": () => esc(x.end || '10:00'),
      "location-7": () => 'location',
      "x-location-8": () => esc(x.location || ''),
      "x-capacity-16-9": () => esc(x.capacity || 16),
      "x-note-10": () => esc(x.note || '')
    });
    if (tableName === 'players') fields = Views.fragment("manage-edit-dialog-4", {
      "x-name-1": () => esc(x.name || ''),
      "cc-db-sports-filter-s-s-status-active-map-s-s-2": () => CC.db.sports.filter(s => s.status === 'active').map(s => select('Trình độ ' + s.name, 'level-' + s.id, UI.levels(x.levels?.[s.id] || 1))).join(''),
      "x-played-0-3": () => esc(x.played || 0),
      "x-noshows-0-4": () => esc(x.noShows || 0)
    });
    if (tableName === 'sports') fields = Views.fragment("manage-edit-dialog-5", {
      "x-name-1": () => esc(x.name || '')
    });
    if (tableName === 'users') fields = Views.fragment("manage-edit-dialog-6", {
      "x-name-1": () => esc(x.name || ''),
      "x-email-2": () => esc(x.email || ''),
      "key-disabled-3": () => key ? 'disabled' : '',
      "object-entries-cc-roles-map-r-l-option-r-l-x--4": () => Object.entries(CC.roles).map(([r, l]) => option(r, l, x.role)).join(''),
      "key-gi-nguy-n-vai-tr-b-o-to-n-d-li-u-li-n-k-t-5": () => key ? 'Giữ nguyên vai trò để bảo toàn dữ liệu liên kết.' : 'Tài khoản mẫu mới có mật khẩu Court123! và đã xác minh.'
    });
    if (tableName === 'reports') fields = Views.fragment("manage-edit-dialog-7", {
      "x-name-1": () => esc(x.name || ''),
      "x-from-cc-date-2": () => esc(x.from || CC.date()),
      "x-to-cc-date-7-3": () => esc(x.to || CC.date(7)),
      "x-note-4": () => esc(x.note || '')
    });
    formDialog((key ? 'Chỉnh sửa ' : 'Thêm ') + labels[tableName], fields, key ? 'Lưu thay đổi' : 'Tạo ' + labels[tableName], async d => {
      if (tableName === 'courts') {
        d.autoSchedule = d.autoSchedule === 'on';
        const file = d.courtPhoto;
        delete d.courtPhoto;
        if (file?.size) d.imageData = await readCourtPhoto(file);else if (String(d.image) !== String(x.image ?? 4)) d.imageData = '';
      }
      for (const k of ['price', 'image', 'capacity', 'played', 'noShows']) if (k in d) d[k] = Number(d[k]);
      if (tableName === 'players') {
        if (d.noShows > d.played) throw Error('Số lần vắng không được lớn hơn số trận.');
        d.levels = {
          ...(x.levels || {})
        };
        Object.keys(d).filter(k => k.startsWith('level-')).forEach(k => {
          d.levels[k.slice(6)] = +d[k];
          delete d[k];
        });
      }
      if (tableName === 'users' && key) d.role = x.role;
      if (tableName === 'players' && x.userId && x.name !== d.name) d.name = d.name.trim();
      if (tableName === 'reports') {
        if (d.to < d.from) throw Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
        const rows = CC.db.bookings.filter(b => {
          const s = CC.find('slots', b.slotId);
          return s.date >= d.from && s.date <= d.to;
        });
        d.snapshot = {
          bookings: rows.length,
          revenue: rows.filter(b => b.status === 'completed').reduce((n, b) => n + CC.find('slots', b.slotId).price, 0),
          createdAt: new Date().toISOString()
        };
      }
      CC.saveEntity(tableName, d, key);
      if (tableName === 'courts') CC.ensureSchedules();
    });
    if (tableName === 'courts') {
      $('[name=courtPhoto]').onchange = async event => {
        try {
          const file = event.target.files[0];
          $('#court-photo-preview').src = file ? await readCourtPhoto(file) : UI.courtImage(x);
        } catch (err) {
          event.target.value = '';
          toast(err.message, true);
        }
      };
      $('[name=image]').onchange = event => {
        $('[name=courtPhoto]').value = '';
        $('#court-photo-preview').src = UI.courtImage({
          image: event.target.value
        });
      };
    }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const id = a.dataset.id,
      t = a.dataset.table;
    try {
      switch (a.dataset.action) {
        case 'entity-new':
          edit(t);
          break;
        case 'entity-edit':
          edit(t, id);
          break;
        case 'entity-delete':
          confirm('Xoá ' + ({
            courts: 'sân',
            events: 'sự kiện',
            reports: 'báo cáo'
          }[t] || 'bản ghi') + '?', t === 'courts' ? 'Sân sẽ ngừng hiển thị và nhận đặt lịch. Lịch sử đơn đặt/đánh giá được giữ lại; cần xử lý các đơn đang chờ hoặc đã duyệt trước.' : t === 'events' ? 'Sự kiện sẽ bị xoá khỏi danh sách; danh sách tham gia và đội hình không còn sử dụng.' : 'Báo cáo đã lưu sẽ bị xoá. Dữ liệu đặt sân gốc không thay đổi.', () => {
            CC.deleteEntity(t, id);
            renderPage();
            toast('Đã xoá thành công.');
          });
          break;
        case 'roster-add':
          {
            const ev = CC.find('events', a.dataset.event);
            const candidates = CC.db.players.filter(p => p.status === 'active' && !ev.playerIds.includes(p.id));
            formDialog('Thêm người vào ' + esc(ev.name), Views.fragment("manage-actions-dialog-8", {
              "candidates-map-p-option-p-id-p-name-join-1": () => candidates.map(p => option(p.id, p.name)).join('')
            }), 'Thêm vào sự kiện', d => CC.roster(ev.id, d.playerId, true));
            break;
          }
        case 'entity-archive':
          confirm('Ngừng sử dụng bản ghi?', 'Bản ghi được giữ lại trong lịch sử. Các dữ liệu đang có ràng buộc sẽ cần được xử lý trước.', () => {
            CC.archive(t, id);
            renderPage();
            toast('Đã cập nhật trạng thái.');
          });
          break;
        case 'booking-status':
          confirm('Cập nhật đơn đặt sân?', `Trạng thái mới: ${CC.statuses[a.dataset.status]}. Người chơi sẽ nhận thông báo.`, () => {
            CC.setBooking(id, a.dataset.status);
            renderPage();
            toast('Đã cập nhật đơn đặt.');
          });
          break;
        case 'roster-toggle':
          {
            const ev = CC.find('events', a.dataset.event);
            CC.roster(ev.id, id, !ev.playerIds.includes(id));
            renderPage();
            toast('Đã cập nhật danh sách; đội hình cũ được xóa để chia lại.');
            break;
          }
        case 'complete-event':
          confirm('Hoàn thành sự kiện?', 'Danh sách và đội hình sẽ được khóa sau khi hoàn thành.', () => {
            const ev = CC.find('events', id);
            CC.requireRole('organizer');
            if (ev.organizerId !== CC.me().id || new Date(`${ev.date}T${ev.end || '23:59'}`) > new Date()) throw Error('Chỉ hoàn thành sự kiện thuộc bạn sau giờ kết thúc.');
            CC.transaction(() => ev.status = 'completed');
            renderPage();
          });
          break;
        case 'activate-user':
          CC.requireRole('admin');
          CC.transaction(() => {
            CC.find('users', id).status = 'active';
            const p = CC.find('players', id);
            if (p) p.status = 'active';
          });
          renderPage();
          toast('Đã kích hoạt tài khoản.');
          break;
        case 'export-report':
          {
            CC.requireRole('admin');
            const r = CC.find('reports', id);
            const cell = s => '"' + String(s ?? '').replace(/"/g, '""').replace(/^[=+@-]/, "'") + '"';
            const csv = '\uFEFF' + [['Tên', 'Từ', 'Đến', 'Số đơn', 'Doanh thu hoàn thành', 'Ghi chú'], [r.name, r.from, r.to, r.snapshot.bookings, r.snapshot.revenue, r.note]].map(row => row.map(cell).join(',')).join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], {
              type: 'text/csv;charset=utf-8'
            }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'courtconnect-report.csv';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            break;
          }
      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action="filter-role"]');
    if (a) {
      roleFilter = a.dataset.role;
      renderPage();
    }
  });
  window.Manage = {
    courts,
    slots,
    bookings,
    events,
    eventDetail,
    roster,
    sports: sportsPage,
    users,
    reports,
    ownEvents
  };
})();
