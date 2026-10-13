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
    table,
    pageHead,
    stats,
    toast,
    confirm,
    formDialog,
    shell,
  } = UI;
  let roleFilter = '';
  let filter = '',
    statusFilter = '';
  const q = () => new URLSearchParams(location.search);
  const controls = (create, tableName) =>
    `<div class="filter-bar">${field('Tìm kiếm', 'manage-search', 'search', filter, 'placeholder="Tên, email, địa điểm…"')}${select('Trạng thái', 'manage-status', option('', 'Tất cả', statusFilter) + ({ courts: ['active', 'archived'], slots: ['open', 'archived'], events: ['open', 'completed', 'archived'], players: ['active', 'disabled'], users: ['active', 'disabled'], sports: ['active', 'archived'], reports: ['active', 'archived'], bookings: ['pending', 'approved', 'rejected', 'cancelled', 'completed'] }[tableName || 'bookings']).map((s) => option(s, CC.statuses[s], statusFilter)).join(''))}${create ? btn('+ ' + create, 'entity-new', '', `data-table="${tableName}"`) : ''}</div>`;
  function bind() {
    const input = $('[name=manage-search]');
    if (input)
      input.onchange = (e) => {
        filter = e.target.value;
        renderPage();
      };
    const s = $('[name=manage-status]');
    if (s)
      s.onchange = (e) => {
        statusFilter = e.target.value;
        renderPage();
      };
  }
  const match = (x) =>
    (!filter || JSON.stringify(x).toLowerCase().includes(filter.toLowerCase())) &&
    (!statusFilter || x.status === statusFilter);
  const acts = (table, x) =>
    `<div class="actions">${x.status !== 'archived' && x.status !== 'disabled' ? btn('Sửa', 'entity-edit', 'secondary small', `data-table="${table}" data-id="${x.id}"`) + btn(['users', 'players'].includes(table) ? 'Vô hiệu hóa' : 'Lưu trữ', 'entity-archive', 'ghost small', `data-table="${table}" data-id="${x.id}"`) : '<span class="muted">Đã ngừng hoạt động</span>'}${['courts', 'events', 'reports'].includes(table) ? btn('Xoá', 'entity-delete', 'danger small', `data-table="${table}" data-id="${x.id}"`) : ''}</div>`;
  const activeCourts = () =>
    CC.db.courts.filter((c) => c.ownerId === CC.me().id && c.status === 'active');
  const ownEvents = () => CC.db.events.filter((e) => e.organizerId === CC.me().id && e.status !== 'deleted');
  const eventSelector = (selected) =>
    select(
      'Sự kiện',
      'event',
      ownEvents()
        .filter((e) => e.status === 'open')
        .map((e) => option(e.id, e.name, selected))
        .join('') || option('', 'Chưa có sự kiện')
    );
  function courts() {
    const rows = CC.db.courts.filter((c) => c.ownerId === CC.me().id && c.status !== 'deleted');
    shell(
      pageHead(
        'Quản lý sân',
        'Thêm sân, chọn ảnh và bấm Xem lịch sân để quản lý các giờ trống/đã thuê.',
        btn('+ Thêm sân', 'entity-new', '', 'data-table="courts"')
      ) +
        stats([
          ['Tổng sân', rows.length],
          ['Đang hoạt động', rows.filter((x) => x.status === 'active').length],
          ['Môn thể thao', new Set(rows.map((x) => x.sportId)).size],
          ['Đã lưu trữ', rows.filter((x) => x.status === 'archived').length],
        ]) +
        controls('', 'courts') +
        table(
          ['Sân thể thao', 'Môn', 'Giá / giờ', 'Trạng thái', 'Thao tác'],
          rows
            .filter(match)
            .map((c) => [
              `<div class="court-table-info"><img src="${UI.courtImage(c)}" alt="" width="88" height="72"><div>${btn(esc(c.name), 'court-calendar', 'court-name-button', `data-id="${c.id}"`)}<p class="court-table-address">${esc(c.location)}</p></div></div>`,
              sport(c.sportId),
              money(c.price),
              badge(c.status),
              `<div class="court-table-actions">${btn(UI.icon('calendar') + 'Xem lịch sân', 'court-calendar', 'court-calendar-button', `data-id="${c.id}"`)}${acts('courts', c)}</div>`,
            ])
        )
    );
    $('#main').classList.add('court-management');
    bind();
  }
  function slots() {
    const rows = CC.db.slots.filter((s) => CC.courtFor(s)?.ownerId === CC.me().id);
    shell(
      pageHead(
        'Quản lý khung giờ',
        'Mở lịch, cập nhật giá và theo dõi tình trạng sân.',
        btn('+ Tạo khung giờ', 'entity-new', '', 'data-table="slots"')
      ) +
        stats([
          ['Khung giờ', rows.length],
          ['Còn trống', rows.filter(CC.available).length],
          [
            'Có đơn đặt',
            rows.filter((s) =>
              CC.db.bookings.some(
                (b) => b.slotId === s.id && ['pending', 'approved'].includes(b.status)
              )
            ).length,
          ],
          ['Đã lưu trữ', rows.filter((s) => s.status === 'archived').length],
        ]) +
        controls('Tạo khung giờ', 'slots') +
        table(
          ['Sân', 'Ngày', 'Khung giờ', 'Giá', 'Tình trạng', 'Thao tác'],
          rows
            .filter((s) => match({ ...s, name: CC.courtFor(s)?.name }))
            .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
            .map((s) => [
              esc(CC.courtFor(s)?.name),
              day(s.date),
              `${s.start} – ${s.end}`,
              money(s.price),
              s.status === 'archived'
                ? badge(s.status)
                : CC.available(s)
                  ? '<span class="tag">Còn trống</span>'
                  : '<span class="tag pending">Đã giữ / hết giờ</span>',
              acts('slots', s),
            ])
        )
    );
    bind();
  }
  function bookings() {
    const rows = CC.db.bookings.filter(
      (b) => CC.courtFor(CC.find('slots', b.slotId))?.ownerId === CC.me().id
    );
    shell(
      pageHead(
        'Quản lý đặt sân',
        'Chọn yêu cầu để duyệt, từ chối hoặc hủy. Hoàn thành đơn sau khi giờ thuê kết thúc.'
      ) +
        stats([
          ['Tổng yêu cầu', rows.length],
          ['Chờ duyệt', rows.filter((b) => b.status === 'pending').length],
          ['Đã duyệt', rows.filter((b) => b.status === 'approved').length],
          [
            'Đã hủy / từ chối',
            rows.filter((b) => ['cancelled', 'rejected'].includes(b.status)).length,
          ],
        ]) +
        `<p class="mb small muted">Cần xem lịch sử vắng mặt trước khi duyệt? ${link('Xem phân tích rủi ro →', 'venue-no-show-risk.html', 'ghost small')}</p>` +
        controls() +
        table(
          ['Người đặt / Sân', 'Thời gian', 'Giá', 'Trạng thái', 'Thao tác'],
          rows
            .slice()
            .reverse()
            .filter((b) => match({ ...b, name: CC.find('users', b.playerId)?.name }))
            .map((b) => {
              const s = CC.find('slots', b.slotId),
                c = CC.courtFor(s);
              return [
                `<strong>${esc(CC.find('users', b.playerId)?.name)}</strong><div class="muted">${esc(c.name)}</div><div class="small">${esc(b.note)}</div>${b.risk ? `<span class="tag purple">${esc(b.risk.level)} · ${esc(b.risk.decision)}</span>` : ''}`,
                `${day(s.date)}<br>${s.start} – ${s.end}`,
                money(s.price),
                badge(b.status),
                `<div class="actions">${b.status === 'pending' ? btn('Duyệt', 'booking-status', 'small', `data-id="${b.id}" data-status="approved"`) + btn('Từ chối', 'booking-status', 'danger small', `data-id="${b.id}" data-status="rejected"`) : ''}${b.status === 'approved' ? btn('Hoàn thành', 'booking-status', 'secondary small', `data-id="${b.id}" data-status="completed" ${Community.ended(s) ? "" : 'disabled title="Có thể hoàn thành sau khi hết giờ thuê"'}`) : ''}${['pending', 'approved'].includes(b.status) ? btn('Hủy', 'booking-status', 'ghost small', `data-id="${b.id}" data-status="cancelled"`) : ''}</div>`,
              ];
            })
        )
    );
    UI.responsiveTables($('#main'));
    $('#main').classList.add('compact-management');
    bind();
  }
  function events() {
    const rows = ownEvents();
    shell(
      pageHead(
        'Sự kiện câu lạc bộ',
        'Tạo sự kiện có ngày, giờ; sau đó thêm người chơi và chia đội.',
        btn('+ Tạo sự kiện', 'entity-new', '', 'data-table="events"')
      ) +
        stats([
          ['Sự kiện', rows.length],
          ['Đang mở', rows.filter((e) => e.status === 'open').length],
          ['Lượt đăng ký', rows.reduce((n, e) => n + e.playerIds.length, 0)],
          ['Đã chia đội', rows.filter((e) => e.teams).length],
        ]) +
        controls('', 'events') +
        `<div class="cards">${
          rows
            .filter(match)
            .map(
              (e) =>
                `<article class="card"><div class="card-body"><div class="row mb"><span class="tag">${sport(e.sportId)}</span>${badge(e.status)}</div><h3>${esc(e.name)}</h3><p class="meta">${UI.icon('calendar')}${day(e.date)} · ${e.start || '08:00'}–${e.end || '10:00'}</p><p class="meta">${UI.icon('pin')}${esc(e.location)}</p><p class="muted small">${e.playerIds.length}/${e.capacity} thành viên · ${e.teams ? 'Đã có đội hình' : 'Chưa chia đội'}</p>${link('Xem sự kiện', `organizer-event-detail.html?id=${e.id}`, 'full secondary')}<div class="mt">${acts('events', e)}</div></div></article>`
            )
            .join('') || empty('Chưa có sự kiện', 'Tạo sự kiện để bắt đầu thêm người chơi.')
        }</div>`
    );
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
    shell(
      pageHead(
        esc(e.name),
        'Theo dõi kế hoạch và đội hình của CLB.',
        btn('Chỉnh sửa', 'entity-edit', 'secondary', `data-table="events" data-id="${e.id}"`)
      ) +
        `<div class="two-col"><section class="panel"><div class="row mb">${badge(e.status)}<span class="tag">${sport(e.sportId)}</span></div><h2>Thông tin sự kiện</h2><p class="muted">${esc(e.note)}</p><p>${day(e.date)} · ${e.start || '08:00'}–${e.end || '10:00'} · ${esc(e.location)}</p><div class="actions">${link('Quản lý danh sách', `organizer-player-roster.html?event=${e.id}`)}${link('Chia đội', `organizer-team-lineup.html?event=${e.id}`, 'secondary')}${e.status === 'open' ? btn('Hoàn thành sự kiện', 'complete-event', 'secondary', `data-id="${e.id}" ${Community.ended(e) ? '' : 'disabled title="Có thể hoàn thành sau khi sự kiện kết thúc"'}`) : ''}</div></section><section class="panel"><h2>Thành viên (${e.playerIds.length}/${e.capacity})</h2>${e.playerIds.map((p) => `<div class="player-row"><span class="avatar">${esc(CC.find('players', p)?.name.slice(0, 1))}</span>${esc(CC.find('players', p)?.name)}</div>`).join('') || '<p class="muted">Chưa có thành viên.</p>'}</section></div>`
    );
  }
  function roster() {
    const es = ownEvents().filter((e) => e.status === 'open'),
      e = es.find((e) => e.id === q().get('event')) || es[0];
    const rows = e ? CC.db.players.filter(p => e.playerIds.includes(p.id)).filter(match) : [];
    const canAdd = e && e.playerIds.length < e.capacity && CC.db.players.some(p => p.status === 'active' && !e.playerIds.includes(p.id));
    shell(
      pageHead(
        'Danh sách người chơi',
        'Chọn sự kiện để xem đúng người đã tham gia. Dùng Thêm vào sự kiện để chọn người mới.',
        `<div class="actions">${btn('+ Thêm vào sự kiện', 'roster-add', '', `data-event="${e?.id || ''}" ${canAdd ? '' : 'disabled'}`)}${btn('Tạo hồ sơ người chơi', 'entity-new', 'secondary', 'data-table="players"')}</div>`
      ) +
        `<div class="panel">${eventSelector(e?.id)}<div class="row"><span class="muted small">${e ? `${e.playerIds.length}/${e.capacity} người đã chọn · ${sport(e.sportId)}` : 'Tạo sự kiện trước để thêm thành viên.'}</span><span class="spacer"></span>${e ? link('Chia đội →', `organizer-team-lineup.html?event=${e.id}`, 'secondary small') : link('Tạo sự kiện', 'organizer-event-management.html', 'secondary small')}</div></div>` +
        controls('', 'players') +
        (rows.length ? table(
          ['Người chơi', 'Trình độ', 'Lịch sử mẫu', 'Trong sự kiện', 'Thao tác'],
          rows.map((p) => [
            `<strong>${esc(p.name)}</strong><div class="muted">${p.userId ? 'Tài khoản thành viên' : 'Khách CLB'}</div>`,
            UI.level(p.levels[e?.sportId || 'badminton']),
            `${p.played} trận · ${p.noShows} lần vắng`,
            e?.playerIds.includes(p.id) ? '<span class="tag">Đã thêm</span>' : '—',
            `<div class="actions">${e && p.status === 'active' ? btn(e.playerIds.includes(p.id) ? 'Bỏ khỏi sự kiện' : 'Thêm vào sự kiện', 'roster-toggle', 'secondary small', `data-id="${p.id}" data-event="${e.id}"`) : ''}${acts('players', p)}</div>`,
          ])
        ) : empty(e ? (e.playerIds.length ? 'Không có người phù hợp bộ lọc' : 'Sự kiện chưa có người tham gia') : 'Chưa có sự kiện đang mở', e ? 'Bấm Thêm vào sự kiện để chọn người chơi; danh sách này chỉ hiển thị người thuộc sự kiện đã chọn.' : 'Tạo sự kiện trước, sau đó thêm người chơi vào danh sách.'))
    );
    bind();
    $('[name=event]').onchange = (ev) => {
      location.href = 'organizer-player-roster.html?event=' + ev.target.value;
    };
  }
  function sportsPage() {
    shell(
      pageHead(
        'Danh mục môn thể thao',
        'Một danh mục thống nhất cho sân, trận và sự kiện.',
        btn('+ Thêm môn', 'entity-new', '', 'data-table="sports"')
      ) +
        controls('', 'sports') +
        table(
          ['Môn thể thao', 'Số sân', 'Trạng thái', 'Thao tác'],
          CC.db.sports
            .filter(match)
            .map((s) => [
              `<strong>${esc(s.name)}</strong>`,
              CC.db.courts.filter((c) => c.sportId === s.id && c.status === 'active').length,
              badge(s.status),
              acts('sports', s),
            ])
        )
    );
    bind();
  }
  function users() {
    shell(
      pageHead(
        'Quản lý tài khoản',
        'Theo dõi thành viên và quyền truy cập.',
        btn('+ Tạo tài khoản', 'entity-new', '', 'data-table="users"')
      ) +
        `<div class="role-filters actions mb" aria-label="Lọc theo vai trò">${[['', 'Tất cả'], ...Object.entries(CC.roles)].map(([r, l]) => btn(`${l} (${CC.db.users.filter((u) => !r || u.role === r).length})`, 'filter-role', roleFilter === r ? '' : 'secondary', `data-role="${r}" aria-pressed="${roleFilter === r}"`)).join('')}</div>` +
        controls('', 'users') +
        table(
          ['Tài khoản', 'Vai trò', 'Xác minh', 'Trạng thái', 'Thao tác'],
          CC.db.users
            .filter((u) => (!roleFilter || u.role === roleFilter) && match(u))
            .map((u) => [
              `<strong>${esc(u.name)}</strong><div class="muted">${esc(u.email)}</div>`,
              CC.roles[u.role],
              u.verified ? 'Đã xác minh' : 'Chưa xác minh',
              badge(u.status),
              acts('users', u) +
                (u.status === 'disabled'
                  ? btn('Kích hoạt lại', 'activate-user', 'secondary small', `data-id="${u.id}"`)
                  : ''),
            ])
        )
    );
    bind();
  }
  function reports() {
    const counts = ['pending', 'approved', 'completed', 'cancelled', 'rejected'].map((s) => [
      s,
      CC.db.bookings.filter((b) => b.status === s).length,
    ]);
    const revenue = CC.db.bookings
      .filter((b) => b.status === 'completed')
      .reduce((n, b) => n + CC.find('slots', b.slotId).price, 0);
    shell(
      pageHead(
        'Báo cáo hoạt động',
        'Đọc dữ liệu thực tế của bản demo, lưu báo cáo theo khoảng ngày.',
        btn('+ Tạo báo cáo', 'entity-new', '', 'data-table="reports"')
      ) +
        stats([
          ['Người chơi', CC.db.players.filter((p) => p.status === 'active').length],
          ['Đơn đặt sân', CC.db.bookings.length],
          ['Trận đang mở', CC.db.matches.filter((m) => m.status === 'open').length],
          ['Doanh thu hoàn thành', money(revenue)],
        ]) +
        `<div class="two-col"><section class="panel"><h2>Trạng thái đặt sân</h2>${counts.map(([s, n]) => `<div class="chart-row"><span>${CC.statuses[s]}</span><div class="chart-bg"><div class="chart-bar" style="width:${Math.max(1, (n / Math.max(1, CC.db.bookings.length)) * 100)}%"></div></div><strong>${n}</strong></div>`).join('')}</section><section class="panel"><h2>Phân bố môn thể thao</h2>${CC.db.sports.map((s) => `<div class="player-row"><span class="avatar">${s.name.slice(0, 1)}</span><div><strong>${esc(s.name)}</strong><div class="muted small">${CC.db.courts.filter((c) => c.sportId === s.id).length} sân · ${CC.db.events.filter((e) => e.sportId === s.id).length} sự kiện</div></div></div>`).join('')}</section></div>` +
        controls('', 'reports') +
        table(
          ['Báo cáo', 'Khoảng thời gian', 'Kết quả đã lưu', 'Trạng thái', 'Thao tác'],
          CC.db.reports
            .filter(match)
            .map((r) => [
              `<strong>${esc(r.name)}</strong><div class="muted">${esc(r.note)}</div>`,
              `${r.from} → ${r.to}`,
              `${r.snapshot?.bookings || 0} đơn · ${money(r.snapshot?.revenue)}`,
              badge(r.status),
              `<div class="actions">${btn('Tải CSV', 'export-report', 'secondary small', `data-id="${r.id}"`)}${acts('reports', r)}</div>`,
            ])
        )
    );
    bind();
  }
  async function readCourtPhoto(file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw Error('Chọn ảnh JPG, PNG hoặc WebP.');
    if (file.size > 5 * 1024 * 1024) throw Error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5 MB.');
    const bitmap = await createImageBitmap(file).catch(() => { throw Error('Không thể đọc ảnh. Hãy chọn ảnh khác.'); });
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
      reports: 'báo cáo',
    };
    let fields = '';
    if (tableName === 'courts')
      fields =
        field('Tên sân', 'name', 'text', x.name || '', 'required minlength="3" maxlength="100"') +
        field('Địa chỉ', 'location', 'text', x.location || '', 'required maxlength="180"') +
        select('Môn thể thao', 'sportId', sports(x.sportId)) +
        field(
          'Giá / giờ (đ)',
          'price',
          'number',
          x.price || 100000,
          'required min="0" max="10000000" step="1000"'
        ) +
        textarea('Mô tả', 'description', x.description || '') +
        field(
          'Tiện ích, cách nhau bằng dấu phẩy',
          'amenities',
          'text',
          x.amenities || 'Gửi xe, Nước uống',
          'maxlength="200"'
        ) +
        `<label class="field">Tải ảnh sân từ máy<input type="file" name="courtPhoto" accept="image/jpeg,image/png,image/webp"></label><p class="small muted">Chọn JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh được thu nhỏ để lưu trên trình duyệt.</p><img id="court-photo-preview" class="court-photo-preview" src="${UI.courtImage(x)}" alt="Xem trước ảnh sân">` +
        `<label class="check"><input type="checkbox" name="autoSchedule" ${x.autoSchedule !== false ? 'checked' : ''}> Tự mở lịch 08:00–22:00, mỗi lượt 2 giờ, cho 30 ngày tới</label><p class="small muted">Có thể tắt tự mở và tạo giờ riêng trong Lịch sân. Tắt không xoá các khung giờ đã mở.</p>` +
        select(
          'Hoặc chọn ảnh mẫu',
          'image',
          [4, 1, 2].map((n, i) => option(n, 'Ảnh sân ' + (i + 1), x.image ?? 4)).join('')
        );
    if (tableName === 'slots')
      fields =
        select(
          'Sân',
          'courtId',
          activeCourts()
            .map((c) => option(c.id, c.name, x.courtId))
            .join(''),
          'required'
        ) +
        field('Ngày', 'date', 'date', x.date || CC.date(1), `required min="${CC.date()}"`) +
        `<div class="form-grid">${field('Bắt đầu', 'start', 'time', x.start || '10:00', 'required')}${field('Kết thúc', 'end', 'time', x.end || '12:00', 'required')}</div>` +
        field(
          'Giá toàn khung giờ (đ)',
          'price',
          'number',
          x.price || 200000,
          'required min="0" max="10000000" step="1000"'
        );
    if (tableName === 'events')
      fields =
        field(
          'Tên sự kiện',
          'name',
          'text',
          x.name || '',
          'required minlength="3" maxlength="100"'
        ) +
        select('Môn thể thao', 'sportId', sports(x.sportId)) +
        field('Ngày tổ chức', 'date', 'date', x.date || CC.date(3), `required min="${CC.date()}"`) +
        `<div class="form-grid">${field('Giờ bắt đầu', 'start', 'time', x.start || '08:00', 'required')}${field('Giờ kết thúc', 'end', 'time', x.end || '10:00', 'required')}</div>` +
        field('Địa điểm', 'location', 'text', x.location || '', 'required maxlength="180"') +
        field(
          'Số người tối đa',
          'capacity',
          'number',
          x.capacity || 16,
          'required min="2" max="100" step="1"'
        ) +
        textarea('Ghi chú', 'note', x.note || '');
    if (tableName === 'players')
      fields =
        field('Họ và tên', 'name', 'text', x.name || '', 'required minlength="2" maxlength="80"') +
        CC.db.sports
          .filter((s) => s.status === 'active')
          .map((s) =>
            select('Trình độ ' + s.name, 'level-' + s.id, UI.levels(x.levels?.[s.id] || 1))
          )
          .join('') +
        field(
          'Số trận trong lịch sử mẫu',
          'played',
          'number',
          x.played || 0,
          'required min="0" max="10000" step="1"'
        ) +
        field(
          'Số lần vắng',
          'noShows',
          'number',
          x.noShows || 0,
          'required min="0" max="10000" step="1"'
        );
    if (tableName === 'sports')
      fields = field(
        'Tên môn thể thao',
        'name',
        'text',
        x.name || '',
        'required minlength="2" maxlength="60"'
      );
    if (tableName === 'users')
      fields =
        field('Họ và tên', 'name', 'text', x.name || '', 'required minlength="2" maxlength="80"') +
        field('Email', 'email', 'email', x.email || '', 'required maxlength="120"') +
        select(
          'Vai trò',
          'role',
          Object.entries(CC.roles)
            .map(([r, l]) => option(r, l, x.role))
            .join(''),
          key ? 'disabled' : ''
        ) +
        `<p class="notice">${key ? 'Giữ nguyên vai trò để bảo toàn dữ liệu liên kết.' : 'Tài khoản mẫu mới có mật khẩu Court123! và đã xác minh.'}</p>`;
    if (tableName === 'reports')
      fields =
        field(
          'Tên báo cáo',
          'name',
          'text',
          x.name || '',
          'required minlength="3" maxlength="100"'
        ) +
        field('Từ ngày', 'from', 'date', x.from || CC.date(), 'required') +
        field('Đến ngày', 'to', 'date', x.to || CC.date(7), 'required') +
        textarea('Ghi chú', 'note', x.note || '');
    formDialog((key ? 'Chỉnh sửa ' : 'Thêm ') + labels[tableName], fields, key ? 'Lưu thay đổi' : 'Tạo ' + labels[tableName], async (d) => {
      if (tableName === 'courts') {
        d.autoSchedule = d.autoSchedule === 'on';
        const file = d.courtPhoto;
        delete d.courtPhoto;
        if (file?.size) d.imageData = await readCourtPhoto(file);
        else if (String(d.image) !== String(x.image ?? 4)) d.imageData = '';
      }
      for (const k of ['price', 'image', 'capacity', 'played', 'noShows'])
        if (k in d) d[k] = Number(d[k]);
      if (tableName === 'players') {
        if (d.noShows > d.played) throw Error('Số lần vắng không được lớn hơn số trận.');
        d.levels = { ...(x.levels || {}) };
        Object.keys(d)
          .filter((k) => k.startsWith('level-'))
          .forEach((k) => {
            d.levels[k.slice(6)] = +d[k];
            delete d[k];
          });
      }
      if (tableName === 'users' && key) d.role = x.role;
      if (tableName === 'players' && x.userId && x.name !== d.name) d.name = d.name.trim();
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
      if (tableName === 'courts') CC.ensureSchedules();
    });
    if (tableName === 'courts') {
      $('[name=courtPhoto]').onchange = async (event) => {
        try {
          const file = event.target.files[0];
          $('#court-photo-preview').src = file ? await readCourtPhoto(file) : UI.courtImage(x);
        } catch (err) { event.target.value = ''; toast(err.message, true); }
      };
      $('[name=image]').onchange = event => {
        $('[name=courtPhoto]').value = '';
        $('#court-photo-preview').src = UI.courtImage({ image: event.target.value });
      };
    }
  }
  document.addEventListener('click', (e) => {
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
          confirm('Xoá ' + ({courts: 'sân', events: 'sự kiện', reports: 'báo cáo'}[t] || 'bản ghi') + '?',
            t === 'courts' ? 'Sân sẽ ngừng hiển thị và nhận đặt lịch. Lịch sử đơn đặt/đánh giá được giữ lại; cần xử lý các đơn đang chờ hoặc đã duyệt trước.' : t === 'events' ? 'Sự kiện sẽ bị xoá khỏi danh sách; danh sách tham gia và đội hình không còn sử dụng.' : 'Báo cáo đã lưu sẽ bị xoá. Dữ liệu đặt sân gốc không thay đổi.',
            () => { CC.deleteEntity(t, id); renderPage(); toast('Đã xoá thành công.'); });
          break;
        case 'roster-add': {
          const ev = CC.find('events', a.dataset.event);
          const candidates = CC.db.players.filter(p => p.status === 'active' && !ev.playerIds.includes(p.id));
          formDialog('Thêm người vào ' + esc(ev.name), select('Người chơi', 'playerId', candidates.map(p => option(p.id, p.name)).join(''), 'required'), 'Thêm vào sự kiện',
            d => CC.roster(ev.id, d.playerId, true));
          break;
        }
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
        case 'booking-status':
          confirm(
            'Cập nhật đơn đặt sân?',
            `Trạng thái mới: ${CC.statuses[a.dataset.status]}. Người chơi sẽ nhận thông báo.`,
            () => {
              CC.setBooking(id, a.dataset.status);
              renderPage();
              toast('Đã cập nhật đơn đặt.');
            }
          );
          break;
        case 'roster-toggle': {
          const ev = CC.find('events', a.dataset.event);
          CC.roster(ev.id, id, !ev.playerIds.includes(id));
          renderPage();
          toast('Đã cập nhật danh sách; đội hình cũ được xóa để chia lại.');
          break;
        }
        case 'complete-event':
          confirm(
            'Hoàn thành sự kiện?',
            'Danh sách và đội hình sẽ được khóa sau khi hoàn thành.',
            () => {
              const ev = CC.find('events', id);
              CC.requireRole('organizer');
              if (ev.organizerId !== CC.me().id || new Date(`${ev.date}T${ev.end || '23:59'}`) > new Date())
                throw Error('Chỉ hoàn thành sự kiện thuộc bạn sau giờ kết thúc.');
              CC.transaction(() => (ev.status = 'completed'));
              renderPage();
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
          const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
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
    eventSelector,
    ownEvents,
  };
})();
