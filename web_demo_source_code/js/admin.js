/* Admin: màn hình, biểu mẫu và sự kiện của role admin. */
(() => {
  'use strict';
  const { $, esc, btn, badge, money, option, toast, confirm, formDialog } = UI;
  let selectedRole = '';
  let searchText = '',
    selectedStatus = '';

  function bindFilters() {
    const input = $('[name=manage-search]');
    if (input)
      input.onchange = (e) => {
        searchText = e.target.value;
        renderPage();
      };
    const s = $('[name=manage-status]');
    if (s)
      s.onchange = (e) => {
        selectedStatus = e.target.value;
        renderPage();
      };
  }
  const matchesFilters = (x) =>
    (!searchText || JSON.stringify(x).toLowerCase().includes(searchText.toLowerCase())) &&
    (!selectedStatus || x.status === selectedStatus);
  const renderActions = (table, x) =>
    `<div class="actions">${x.status !== 'archived' && x.status !== 'disabled' ? btn('Sửa', 'entity-edit', 'secondary small', `data-table="${table}" data-id="${x.id}"`) + btn(table === 'users' ? 'Vô hiệu hóa' : 'Lưu trữ', 'entity-archive', 'ghost small', `data-table="${table}" data-id="${x.id}"`) : '<span class="muted">Đã ngừng hoạt động</span>'}${table === 'reports' ? btn('Xoá', 'entity-delete', 'danger small', `data-table="${table}" data-id="${x.id}"`) : ''}</div>`;
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderSportsPage() {
    const tableRows1 = CC.db.sports
      .filter(matchesFilters)
      .map((s) => [
        `<strong>${esc(s.name)}</strong>`,
        CC.db.courts.filter((c) => c.sportId === s.id && c.status === 'active').length,
        badge(s.status),
        renderActions('sports', s),
      ]);
    Views.update('manage-sportsPage', {
      searchValue: () => esc(searchText),
      statusOptions: () =>
        option('', 'Tất cả', selectedStatus) +
        ['active', 'archived'].map((s) => option(s, CC.statuses[s], selectedStatus)).join(''),
      hasRows: () => tableRows1.length > 0,
      tableRows: () => UI.tableRows(tableRows1),
    });
    bindFilters();
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderUsers() {
    const tableRows1 = CC.db.users
      .filter((u) => (!selectedRole || u.role === selectedRole) && matchesFilters(u))
      .map((u) => [
        `<strong>${esc(u.name)}</strong><div class="muted">${esc(u.email)}</div>`,
        CC.roles[u.role],
        u.verified ? 'Đã xác minh' : 'Chưa xác minh',
        badge(u.status),
        renderActions('users', u) +
          (u.status === 'disabled'
            ? btn('Kích hoạt lại', 'activate-user', 'secondary small', `data-id="${u.id}"`)
            : ''),
      ]);
    Views.update('manage-users', {
      roleButtons: () =>
        [['', 'Tất cả'], ...Object.entries(CC.roles)]
          .map(([r, l]) =>
            btn(
              `${l} (${CC.db.users.filter((u) => !r || u.role === r).length})`,
              'filter-role',
              selectedRole === r ? '' : 'secondary',
              `data-role="${r}" aria-pressed="${selectedRole === r}"`
            )
          )
          .join(''),
      searchValue: () => esc(searchText),
      statusOptions: () =>
        option('', 'Tất cả', selectedStatus) +
        ['active', 'disabled'].map((s) => option(s, CC.statuses[s], selectedStatus)).join(''),
      hasRows: () => tableRows1.length > 0,
      tableRows: () => UI.tableRows(tableRows1),
    });
    bindFilters();
  }
  // Cập nhật dữ liệu của màn hình; bố cục nằm trong HTML.
  function renderReports() {
    const counts = ['pending', 'approved', 'completed', 'cancelled', 'rejected'].map((s) => [
      s,
      CC.db.bookings.filter((b) => b.status === s).length,
    ]);
    const revenue = CC.db.bookings
      .filter((b) => b.status === 'completed')
      .reduce((n, b) => n + CC.find('slots', b.slotId).price, 0);
    const tableRows1 = CC.db.reports
      .filter(matchesFilters)
      .map((r) => [
        `<strong>${esc(r.name)}</strong><div class="muted">${esc(r.note)}</div>`,
        `${r.from} → ${r.to}`,
        `${r.snapshot?.bookings || 0} đơn · ${money(r.snapshot?.revenue)}`,
        badge(r.status),
        `<div class="actions">${btn('Tải CSV', 'export-report', 'secondary small', `data-id="${r.id}"`)}${renderActions('reports', r)}</div>`,
      ]);
    Views.update('manage-reports', {
      activePlayers: () => CC.db.players.filter((p) => p.status === 'active').length,
      bookingCount: () => CC.db.bookings.length,
      openMatches: () => CC.db.matches.filter((m) => m.status === 'open').length,
      completedRevenue: () => money(revenue),
      statusChart: () =>
        counts
          .map(
            ([s, n]) =>
              `<div class="chart-row"><span>${CC.statuses[s]}</span><div class="chart-bg"><div class="chart-bar" style="width:${Math.max(1, (n / Math.max(1, CC.db.bookings.length)) * 100)}%"></div></div><strong>${n}</strong></div>`
          )
          .join(''),
      sportSummary: () =>
        CC.db.sports
          .map(
            (s) =>
              `<div class="player-row"><span class="avatar">${s.name.slice(0, 1)}</span><div><strong>${esc(s.name)}</strong><div class="muted small">${CC.db.courts.filter((c) => c.sportId === s.id).length} sân · ${CC.db.events.filter((e) => e.sportId === s.id).length} sự kiện</div></div></div>`
          )
          .join(''),
      searchValue: () => esc(searchText),
      statusOptions: () =>
        option('', 'Tất cả', selectedStatus) +
        ['active', 'archived'].map((s) => option(s, CC.statuses[s], selectedStatus)).join(''),
      hasRows: () => tableRows1.length > 0,
      tableRows: () => UI.tableRows(tableRows1),
    });
    bindFilters();
  }
  // Chọn form đúng loại bản ghi, kiểm tra dữ liệu rồi lưu.
  function openEditDialog(tableName, key) {
    const x = key ? CC.find(tableName, key) : {};
    const labels = {
      sports: 'môn thể thao',
      users: 'tài khoản',
      reports: 'báo cáo',
    };
    let fields = '';

    if (tableName === 'sports')
      fields = Views.fragment('manage-edit-dialog-5', {
        name: () => esc(x.name || ''),
      });
    if (tableName === 'users')
      fields = Views.fragment('manage-edit-dialog-6', {
        name: () => esc(x.name || ''),
        email: () => esc(x.email || ''),
        roleDisabled: () => (key ? 'disabled' : ''),
        roleOptions: () =>
          Object.entries(CC.roles)
            .map(([r, l]) => option(r, l, x.role))
            .join(''),
        roleHint: () =>
          key
            ? 'Giữ nguyên vai trò để bảo toàn dữ liệu liên kết.'
            : 'Tài khoản mẫu mới có mật khẩu Court123! và đã xác minh.',
      });
    if (tableName === 'reports')
      fields = Views.fragment('manage-edit-dialog-7', {
        name: () => esc(x.name || ''),
        fromDate: () => esc(x.from || CC.date()),
        toDate: () => esc(x.to || CC.date(7)),
        note: () => esc(x.note || ''),
      });
    formDialog(
      (key ? 'Chỉnh sửa ' : 'Thêm ') + labels[tableName],
      fields,
      key ? 'Lưu thay đổi' : 'Tạo ' + labels[tableName],
      async (d) => {
        if (tableName === 'users' && key) d.role = x.role;

        if (tableName === 'reports') {
          if (d.to < d.from) throw Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
          const rows = CC.db.bookings.filter((b) => {
            const s = CC.find('slots', b.slotId);
            return s.date >= d.from && s.date <= d.to;
          });
          d.snapshot = {
            bookings: rows.length,
            revenue: rows
              .filter((b) => b.status === 'completed')
              .reduce((n, b) => n + CC.find('slots', b.slotId).price, 0),
            createdAt: new Date().toISOString(),
          };
        }
        CC.saveEntity(tableName, d, key);
      }
    );
  }
  // Nút trong HTML khai báo data-action; xử lý các thao tác của role này.
  document.addEventListener('click', (e) => {
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
          confirm(
            'Xoá báo cáo?',
            'Báo cáo đã lưu sẽ bị xoá. Dữ liệu đặt sân gốc không thay đổi.',
            () => {
              CC.deleteEntity(t, id);
              renderPage();
              toast('Đã xoá thành công.');
            }
          );
          break;

        case 'entity-archive':
          confirm(
            'Ngừng sử dụng bản ghi?',
            'Bản ghi được giữ lại trong lịch sử. Các dữ liệu đang có ràng buộc sẽ cần được xử lý trước.',
            () => {
              CC.archive(t, id);
              renderPage();
              toast('Đã cập nhật trạng thái.');
            }
          );
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
        case 'export-report': {
          CC.requireRole('admin');
          const r = CC.find('reports', id);
          const cell = (s) =>
            '"' +
            String(s ?? '')
              .replace(/"/g, '""')
              .replace(/^[=+@-]/, "'") +
            '"';
          const csv =
            '\uFEFF' +
            [
              ['Tên', 'Từ', 'Đến', 'Số đơn', 'Doanh thu hoàn thành', 'Ghi chú'],
              [r.name, r.from, r.to, r.snapshot.bookings, r.snapshot.revenue, r.note],
            ]
              .map((row) => row.map(cell).join(','))
              .join('\r\n');
          const url = URL.createObjectURL(
            new Blob([csv], {
              type: 'text/csv;charset=utf-8',
            })
          );
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
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action="filter-role"]');
    if (a) {
      selectedRole = a.dataset.role;
      renderPage();
    }
  });
  window.Admin = { sports: renderSportsPage, users: renderUsers, reports: renderReports };
})();
