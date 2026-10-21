/* Organizer: màn hình, biểu mẫu và sự kiện của role organizer. */
(() => {
  'use strict';
  const { $, esc, btn, link, badge, day, sport, option, sports, select, empty, toast, confirm, formDialog } = UI;
  
  let searchText = '',
    selectedStatus = '';
  const queryParams = () => new URLSearchParams(location.search);
  function bindFilters() {
    const input = $('[name=manage-search]');
    if (input) input.onchange = e => {
      searchText = e.target.value;
      renderPage();
    };
    const s = $('[name=manage-status]');
    if (s) s.onchange = e => {
      selectedStatus = e.target.value;
      renderPage();
    };
  }
  const matchesFilters = x => (!searchText || JSON.stringify(x).toLowerCase().includes(searchText.toLowerCase())) && (!selectedStatus || x.status === selectedStatus);
  const renderActions = (table, x) => `<div class="actions">${x.status !== 'archived' && x.status !== 'disabled' ? btn('Sửa', 'entity-edit', 'secondary small', `data-table="${table}" data-id="${x.id}"`) + btn(['users', 'players'].includes(table) ? 'Vô hiệu hóa' : 'Lưu trữ', 'entity-archive', 'ghost small', `data-table="${table}" data-id="${x.id}"`) : '<span class="muted">Đã ngừng hoạt động</span>'}${['courts', 'events', 'reports'].includes(table) ? btn('Xoá', 'entity-delete', 'danger small', `data-table="${table}" data-id="${x.id}"`) : ''}</div>`;
  const ownEvents = () => CC.db.events.filter(e => e.organizerId === CC.me().id && e.status !== 'deleted');
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderEvents() {
    const rows = ownEvents();
    Views.update("manage-events", {
      "eventCount": () => rows.length,
      "openEvents": () => rows.filter(e => e.status === 'open').length,
      "participantCount": () => rows.reduce((n, e) => n + e.playerIds.length, 0),
      "lineupCount": () => rows.filter(e => e.teams).length,
      "searchValue": () => esc(searchText),
      "statusOptions": () => option('', 'Tất cả', selectedStatus) + ['open', 'completed', 'archived'].map(s => option(s, CC.statuses[s], selectedStatus)).join(''),
      "eventCards": () => rows.filter(matchesFilters).map(e => `<article class="card"><div class="card-body"><div class="row mb"><span class="tag">${sport(e.sportId)}</span>${badge(e.status)}</div><h3>${esc(e.name)}</h3><p class="meta">${UI.icon('calendar')}${day(e.date)} · ${e.start || '08:00'}–${e.end || '10:00'}</p><p class="meta">${UI.icon('pin')}${esc(e.location)}</p><p class="muted small">${e.playerIds.length}/${e.capacity} thành viên · ${e.teams ? 'Đã có đội hình' : 'Chưa chia đội'}</p>${link('Xem sự kiện', `organizer-event-detail.html?id=${e.id}`, 'full secondary')}<div class="mt">${renderActions('events', e)}</div></div></article>`).join('') || empty('Chưa có sự kiện', 'Tạo sự kiện để bắt đầu thêm người chơi.')
    });
    bindFilters();
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderEventDetail() {
    const e = CC.find('events', queryParams().get('id'));
    if (!e || e.status === 'deleted') {
      App.error(404);
      return;
    }
    if (e.organizerId !== CC.me().id) {
      App.error(403);
      return;
    }
    Views.update("manage-eventDetail", {
      "eventName": () => esc(e.name),
      "editButton": () => `data-table="events" data-id="${e.id}"`,
      "eventStatus": () => esc(e.status),
      "statusLabel": () => esc(CC.statuses[e.status] || e.status),
      "eventSport": () => sport(e.sportId),
      "eventNote": () => esc(e.note),
      "eventDate": () => day(e.date),
      "startTime": () => e.start || '08:00',
      "endTime": () => e.end || '10:00',
      "eventLocation": () => esc(e.location),
      "rosterUrl": () => esc(`organizer-player-roster.html?event=${e.id}`),
      "lineupUrl": () => esc(`organizer-team-lineup.html?event=${e.id}`),
      "isOpen": () => e.status === 'open',
      "completeButton": () => `data-id="${e.id}" ${Community.ended(e) ? '' : 'disabled title="Có thể hoàn thành sau khi sự kiện kết thúc"'}`,
      "playerCount": () => e.playerIds.length,
      "capacity": () => e.capacity,
      "playerList": () => e.playerIds.map(p => `<div class="player-row"><span class="avatar">${esc(CC.find('players', p)?.name.slice(0, 1))}</span>${esc(CC.find('players', p)?.name)}</div>`).join('') || '<p class="muted">Chưa có thành viên.</p>'
    });
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderRoster() {
    const es = ownEvents().filter(e => e.status === 'open'),
      e = es.find(e => e.id === queryParams().get('event')) || es[0];
    const rows = e ? CC.db.players.filter(p => e.playerIds.includes(p.id)).filter(matchesFilters) : [];
    const canAdd = e && e.playerIds.length < e.capacity && CC.db.players.some(p => p.status === 'active' && !e.playerIds.includes(p.id));
    const tableRows1 = rows.map(p => [`<strong>${esc(p.name)}</strong><div class="muted">${p.userId ? 'Tài khoản thành viên' : 'Khách CLB'}</div>`, UI.level(p.levels[e?.sportId || 'badminton']), `${p.played} trận · ${p.noShows} lần vắng`, e?.playerIds.includes(p.id) ? '<span class="tag">Đã thêm</span>' : '—', `<div class="actions">${e && p.status === 'active' ? btn(e.playerIds.includes(p.id) ? 'Bỏ khỏi sự kiện' : 'Thêm vào sự kiện', 'roster-toggle', 'secondary small', `data-id="${p.id}" data-event="${e.id}"`) : ''}${renderActions('players', p)}</div>`]);
    Views.update("manage-roster", {
      "addButton": () => `data-event="${e?.id || ''}" ${canAdd ? '' : 'disabled'}`,
      "eventOptions": () => ownEvents().filter(e => e.status === 'open').map(e => option(e.id, e.name, e?.id)).join('') || option('', 'Chưa có sự kiện'),
      "eventSummary": () => e ? `${e.playerIds.length}/${e.capacity} người đã chọn · ${sport(e.sportId)}` : 'Tạo sự kiện trước để thêm thành viên.',
      "hasEvent": () => e,
      "lineupUrl": () => esc(`organizer-team-lineup.html?event=${e.id}`),
      "searchValue": () => esc(searchText),
      "statusOptions": () => option('', 'Tất cả', selectedStatus) + ['active', 'disabled'].map(s => option(s, CC.statuses[s], selectedStatus)).join(''),
      "playerCount": () => rows.length,
      "hasRows": () => tableRows1.length > 0,
      "tableRows": () => UI.tableRows(tableRows1),
      "emptyTitle": () => e ? e.playerIds.length ? 'Không có người phù hợp bộ lọc' : 'Sự kiện chưa có người tham gia' : 'Chưa có sự kiện đang mở',
      "emptyDescription": () => e ? 'Bấm Thêm vào sự kiện để chọn người chơi; danh sách này chỉ hiển thị người thuộc sự kiện đã chọn.' : 'Tạo sự kiện trước, sau đó thêm người chơi vào danh sách.'
    });
    bindFilters();
    $('[name=event]').onchange = ev => {
      location.href = 'organizer-player-roster.html?event=' + ev.target.value;
    };
  }
  // Chọn form đúng loại bản ghi, kiểm tra dữ liệu rồi lưu.
  function openEditDialog(tableName, key) {
    const x = key ? CC.find(tableName, key) : {};
    const labels = {
  "events": "sự kiện",
  "players": "người chơi"
};
    let fields = '';

    if (tableName === 'events') fields = Views.fragment("manage-edit-dialog-3", {
      "name": () => esc(x.name || ''),
      "sportOptions": () => sports(x.sportId),
      "date": () => esc(x.date || CC.date(3)),
      "dateAttributes": () => `required min="${CC.date()}"`,
      "startTime": () => esc(x.start || '08:00'),
      "endTime": () => esc(x.end || '10:00'),
      "locationField": () => 'location',
      "location": () => esc(x.location || ''),
      "capacity": () => esc(x.capacity || 16),
      "note": () => esc(x.note || '')
    });
    if (tableName === 'players') fields = Views.fragment("manage-edit-dialog-4", {
      "name": () => esc(x.name || ''),
      "levelFields": () => CC.db.sports.filter(s => s.status === 'active').map(s => select('Trình độ ' + s.name, 'level-' + s.id, UI.levels(x.levels?.[s.id] || 1))).join(''),
      "played": () => esc(x.played || 0),
      "noShows": () => esc(x.noShows || 0)
    });

    formDialog((key ? 'Chỉnh sửa ' : 'Thêm ') + labels[tableName], fields, key ? 'Lưu thay đổi' : 'Tạo ' + labels[tableName], async d => {
      
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
      
      if (tableName === 'players' && x.userId && x.name !== d.name) d.name = d.name.trim();
      
      CC.saveEntity(tableName, d, key);
      
    });
    
  }
  // Nút trong HTML khai báo data-action; xử lý các thao tác của role này.
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const id = a.dataset.id,
      t = a.dataset.table;
    try {
      switch (a.dataset.action) {
        case 'entity-new':
          openEditDialog(t);
          break;
        case 'entity-edit':
          openEditDialog(t, id);
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
              "playerOptions": () => candidates.map(p => option(p.id, p.name)).join('')
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

      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.Organizer = { events: renderEvents, eventDetail: renderEventDetail, roster: renderRoster, ownEvents };
})();
