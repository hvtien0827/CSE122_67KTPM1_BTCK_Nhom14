/* Venue: màn hình, biểu mẫu và sự kiện của role venue. */
(() => {
  'use strict';
  const { $, esc, btn, badge, money, day, sport, option, sports, toast, confirm, formDialog } = UI;
  
  let searchText = '',
    selectedStatus = '';
  
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
  const activeCourts = () => CC.db.courts.filter(c => c.ownerId === CC.me().id && c.status === 'active');
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderCourts() {
    const rows = CC.db.courts.filter(c => c.ownerId === CC.me().id && c.status !== 'deleted');
    const tableRows1 = rows.filter(matchesFilters).map(c => [`<div class="court-table-info"><img src="${UI.courtImage(c)}" alt="" width="88" height="72"><div>${btn(esc(c.name), 'court-calendar', 'court-name-button', `data-id="${c.id}"`)}<p class="court-table-address">${esc(c.location)}</p></div></div>`, sport(c.sportId), money(c.price), badge(c.status), `<div class="court-table-actions">${btn(UI.icon('calendar') + 'Xem lịch sân', 'court-calendar', 'court-calendar-button', `data-id="${c.id}"`)}${renderActions('courts', c)}</div>`]);
    Views.update("manage-courts", {
      "totalCourts": () => rows.length,
      "activeCourts": () => rows.filter(x => x.status === 'active').length,
      "sportCount": () => new Set(rows.map(x => x.sportId)).size,
      "archivedCourts": () => rows.filter(x => x.status === 'archived').length,
      "searchValue": () => esc(searchText),
      "statusOptions": () => option('', 'Tất cả', selectedStatus) + ['active', 'archived'].map(s => option(s, CC.statuses[s], selectedStatus)).join(''),
      "hasRows": () => tableRows1.length > 0,
      "tableRows": () => UI.tableRows(tableRows1)
    });
    $('#main').classList.add('court-management');
    bindFilters();
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderSlots() {
    const rows = CC.db.slots.filter(s => CC.courtFor(s)?.ownerId === CC.me().id);
    const tableRows1 = rows.filter(s => matchesFilters({
      ...s,
      name: CC.courtFor(s)?.name
    })).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map(s => [esc(CC.courtFor(s)?.name), day(s.date), `${s.start} – ${s.end}`, money(s.price), s.status === 'archived' ? badge(s.status) : CC.available(s) ? '<span class="tag">Còn trống</span>' : '<span class="tag pending">Đã giữ / hết giờ</span>', renderActions('slots', s)]);
    Views.update("manage-slots", {
      "totalSlots": () => rows.length,
      "availableSlots": () => rows.filter(CC.available).length,
      "reservedSlots": () => rows.filter(s => CC.db.bookings.some(b => b.slotId === s.id && ['pending', 'approved'].includes(b.status))).length,
      "archivedSlots": () => rows.filter(s => s.status === 'archived').length,
      "searchValue": () => esc(searchText),
      "statusOptions": () => option('', 'Tất cả', selectedStatus) + ['open', 'archived'].map(s => option(s, CC.statuses[s], selectedStatus)).join(''),
      "hasRows": () => tableRows1.length > 0,
      "tableRows": () => UI.tableRows(tableRows1)
    });
    bindFilters();
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderBookings() {
    const rows = CC.db.bookings.filter(b => CC.courtFor(CC.find('slots', b.slotId))?.ownerId === CC.me().id);
    const tableRows1 = rows.slice().reverse().filter(b => matchesFilters({
      ...b,
      name: CC.find('users', b.playerId)?.name
    })).map(b => {
      const s = CC.find('slots', b.slotId),
        c = CC.courtFor(s);
      return [`<strong>${esc(CC.find('users', b.playerId)?.name)}</strong><div class="muted">${esc(c.name)}</div><div class="small">${esc(b.note)}</div>${b.risk ? `<span class="tag purple">${esc(b.risk.level)} · ${esc(b.risk.decision)}</span>` : ''}`, `${day(s.date)}<br>${s.start} – ${s.end}`, money(s.price), badge(b.status), `<div class="actions">${b.status === 'pending' ? btn('Duyệt', 'booking-status', 'small', `data-id="${b.id}" data-status="approved"`) + btn('Từ chối', 'booking-status', 'danger small', `data-id="${b.id}" data-status="rejected"`) : ''}${b.status === 'approved' ? btn('Hoàn thành', 'booking-status', 'secondary small', `data-id="${b.id}" data-status="completed" ${Community.ended(s) ? "" : 'disabled title="Có thể hoàn thành sau khi hết giờ thuê"'}`) : ''}${['pending', 'approved'].includes(b.status) ? btn('Hủy', 'booking-status', 'ghost small', `data-id="${b.id}" data-status="cancelled"`) : ''}</div>`];
    });
    Views.update("manage-bookings", {
      "totalBookings": () => rows.length,
      "pendingBookings": () => rows.filter(b => b.status === 'pending').length,
      "approvedBookings": () => rows.filter(b => b.status === 'approved').length,
      "closedBookings": () => rows.filter(b => ['cancelled', 'rejected'].includes(b.status)).length,
      "searchValue": () => esc(searchText),
      "statusOptions": () => option('', 'Tất cả', selectedStatus) + {
        courts: ['active', 'archived'],
        slots: ['open', 'archived'],
        events: ['open', 'completed', 'archived'],
        players: ['active', 'disabled'],
        users: ['active', 'disabled'],
        sports: ['active', 'archived'],
        reports: ['active', 'archived'],
        bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
      }[undefined || 'bookings'].map(s => option(s, CC.statuses[s], selectedStatus)).join(''),
      "hasRows": () => tableRows1.length > 0,
      "tableRows": () => UI.tableRows(tableRows1)
    });
    UI.responsiveTables($('#main'));
    $('#main').classList.add('compact-management');
    bindFilters();
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
  // Chọn form đúng loại bản ghi, kiểm tra dữ liệu rồi lưu.
  function openEditDialog(tableName, key) {
    const x = key ? CC.find(tableName, key) : {};
    const labels = {
  "courts": "sân",
  "slots": "khung giờ"
};
    let fields = '';
    if (tableName === 'courts') fields = Views.fragment("manage-edit-dialog-1", {
      "name": () => esc(x.name || ''),
      "locationField": () => 'location',
      "location": () => esc(x.location || ''),
      "sportOptions": () => sports(x.sportId),
      "price": () => esc(x.price || 100000),
      "description": () => esc(x.description || ''),
      "amenities": () => esc(x.amenities || 'Gửi xe, Nước uống'),
      "imagePreview": () => UI.courtImage(x),
      "autoScheduleChecked": () => x.autoSchedule !== false ? 'checked' : '',
      "image4Selected": () => String(4) === String(x.image ?? 4) ? 'selected' : '',
      "image1Selected": () => String(1) === String(x.image ?? 4) ? 'selected' : '',
      "image2Selected": () => String(2) === String(x.image ?? 4) ? 'selected' : ''
    });
    if (tableName === 'slots') fields = Views.fragment("manage-edit-dialog-2", {
      "courtOptions": () => activeCourts().map(c => option(c.id, c.name, x.courtId)).join(''),
      "date": () => esc(x.date || CC.date(1)),
      "dateAttributes": () => `required min="${CC.date()}"`,
      "startTime": () => esc(x.start || '10:00'),
      "endTime": () => esc(x.end || '12:00'),
      "price": () => esc(x.price || 200000)
    });

    formDialog((key ? 'Chỉnh sửa ' : 'Thêm ') + labels[tableName], fields, key ? 'Lưu thay đổi' : 'Tạo ' + labels[tableName], async d => {
      if (tableName === 'courts') {
        d.autoSchedule = d.autoSchedule === 'on';
        const file = d.courtPhoto;
        delete d.courtPhoto;
        if (file?.size) d.imageData = await readCourtPhoto(file);else if (String(d.image) !== String(x.image ?? 4)) d.imageData = '';
      }
      for (const k of ['price', 'image', 'capacity', 'played', 'noShows']) if (k in d) d[k] = Number(d[k]);

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

      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.Venue = { courts: renderCourts, slots: renderSlots, bookings: renderBookings };
})();
