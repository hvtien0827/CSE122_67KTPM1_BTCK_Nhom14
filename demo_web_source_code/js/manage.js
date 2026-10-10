/* Chủ sân và quản trị: các màn hình trong phạm vi mới. */
(() => {
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
    stats,
    badge,
    money,
    day,
    pageHead,
    shell,
    empty,
    formDialog,
    toast,
  } = UI;
  const q = () => new URLSearchParams(location.search);
  const courtFields = (c) =>
    field('Tên sân', 'name', 'text', c?.name || '', 'required minlength="2" maxlength="100"') +
    field('Địa chỉ', 'location', 'text', c?.location || '', 'required maxlength="200"') +
    select('Môn thể thao', 'sportId', UI.sports(c?.sportId)) +
    field('Giá / giờ (đ)', 'price', 'number', c?.price || 100000, 'required min="1000"') +
    textarea('Mô tả', 'description', c?.description || '');
  function pendingOwner() {
    const u = CC.me(),
      r = CC.db.ownerApplications.filter((r) => r.userId === u.id).at(-1);
    shell(
      pageHead('Hồ sơ chủ sân', 'Thông tin đăng ký và trạng thái xét duyệt.') +
        `<section class="panel">${badge(u.approvalStatus || 'pending')}<p>${esc(r?.reason || 'Admin sẽ xem thông tin sân và phản hồi cho bạn.')}</p>${r ? `<h3>${esc(r.court.name)}</h3><p>${esc(r.court.location)}</p>` : ''}${u.approvalStatus === 'rejected' ? btn('Cập nhật và gửi lại', 'resubmit-owner') : ''}${link('Thông báo', 'notifications.html', 'secondary')}</section>`
    );
  }
  function courts() {
    const u = CC.me();
    if (u.approvalStatus !== 'approved') return pendingOwner();
    const rows = CC.db.courts.filter((c) => c.ownerId === u.id),
      requests = CC.db.courtChanges.filter((r) => r.ownerId === u.id);
    shell(
      pageHead(
        'Quản lý sân',
        'Thay đổi chỉ công khai sau khi admin duyệt.',
        btn('+ Đề xuất sân mới', 'new-court')
      ) +
        table(
          ['Sân', 'Giá / giờ', 'Trạng thái', 'Thao tác'],
          rows.map((c) => [
            esc(c.name) + `<p class="muted">${esc(c.location)}</p>`,
            money(c.price),
            badge(c.status),
            c.status === 'active'
              ? btn('Sửa', 'edit-court', 'secondary', `data-id="${c.id}"`) +
                btn('Yêu cầu xóa', 'delete-court', 'ghost', `data-id="${c.id}"`)
              : 'Đã ngừng công khai',
          ])
        ) +
        `<h2 class="mt">Yêu cầu thay đổi</h2>` +
        table(
          ['Loại', 'Sân', 'Trạng thái', 'Phản hồi'],
          requests
            .slice()
            .reverse()
            .map((r) => [
              { create: 'Thêm', update: 'Sửa', delete: 'Xóa' }[r.type],
              esc(r.data.name || CC.find('courts', r.courtId)?.name),
              badge(r.status),
              esc(r.reason || '—'),
            ])
        )
    );
    UI.responsiveTables($('#main'));
  }
  let bookingFilter = '',
    calendarCourt = '',
    calendarDate = CC.date();
  function bookings() {
    const u = CC.me();
    if (u.approvalStatus !== 'approved') return pendingOwner();
    const courts = CC.db.courts.filter((c) => c.ownerId === u.id),
      rows = CC.db.bookings.filter((b) =>
        courts.some((c) => c.id === CC.find('slots', b.slotId)?.courtId)
      );
    if (!courts.some((c) => c.id === calendarCourt)) calendarCourt = courts[0]?.id || '';
    shell(
      pageHead(
        'Quản lý đặt sân',
        'Yêu cầu mới ở đầu danh sách; lịch bên dưới giúp bạn theo dõi chỗ trống.'
      ) +
        stats([
          ['Chờ duyệt', rows.filter((b) => b.status === 'pending').length],
          ['Đã duyệt', rows.filter((b) => b.status === 'approved').length],
          ['Hoàn thành', rows.filter((b) => b.status === 'completed').length],
        ]) +
        select(
          'Lọc yêu cầu',
          'booking-filter',
          option('', 'Tất cả', bookingFilter) +
            ['pending', 'approved', 'completed', 'cancelled', 'rejected']
              .map((v) => option(v, CC.statuses[v], bookingFilter))
              .join('')
        ) +
        table(
          ['Người đặt / sân', 'Lịch / liên hệ', 'Giá', 'Trạng thái', 'Xử lý'],
          rows
            .filter((b) => !bookingFilter || b.status === bookingFilter)
            .sort((a, b) => (b.status === 'pending') - (a.status === 'pending'))
            .map((b) => {
              const s = CC.find('slots', b.slotId),
                c = CC.courtFor(s),
                u = CC.find('users', b.playerId),
                risk = Domain.counts(b.playerId).recentCancelled;
              return [
                Community.person(b.playerId, true) +
                  `<p>${esc(c.name)}</p><p>${esc(b.note)}</p>${risk >= 2 ? `<div class="notice warning">Cảnh báo AI mô phỏng: tự hủy ${risk} lượt trong 30 ngày.</div>` : ''}`,
                `${day(s.date)} · ${s.start}–${s.end}<p>${esc(b.contactName || u?.name)} · ${esc(b.contactPhone || u?.phone || 'Chưa có số')}</p>`,
                money(s.price),
                badge(b.status),
                `<div class="actions">${(b.status === 'pending' ? ['approved', 'rejected', 'cancelled'] : b.status === 'approved' ? ['completed', 'cancelled'] : []).map((st) => btn({ approved: 'Duyệt', rejected: 'Từ chối', completed: 'Hoàn thành', cancelled: 'Hủy' }[st], 'booking-status', st === 'cancelled' ? 'ghost' : 'secondary', `data-id="${b.id}" data-status="${st}"`)).join('')}</div>`,
              ];
            })
        ) +
        `<h2 class="mt">Lịch sân</h2>${select('Chọn sân', 'calendar-court', courts.map((c) => option(c.id, c.name, calendarCourt)).join(''))}`
    );
    $('#main').classList.add('compact-management');
    UI.responsiveTables($('#main'));
    $('[name=booking-filter]').onchange = (e) => {
      bookingFilter = e.target.value;
      bookings();
    };
    $('[name=calendar-court]').onchange = (e) => {
      calendarCourt = e.target.value;
      bookings();
    };
    if (calendarCourt) Community.calendar(calendarCourt, calendarDate, true);
    else
      $('#main').insertAdjacentHTML(
        'beforeend',
        empty('Chưa có sân', 'Thêm sân và chờ admin duyệt.')
      );
  }
  let adminTab = q().get('tab') === 'courts' ? 'courts' : 'users',
    roleFilter = '',
    search = '';
  function dashboard() {
    CC.requireRole('admin');
    const users = CC.db.users.filter((u) => CC.roles[u.role]);
    shell(
      pageHead('Quản lý tổng', 'Tổng quan và xét duyệt hệ thống.') +
        stats([
          ['Người chơi', users.filter((u) => u.role === 'player').length],
          ['Chủ sân', users.filter((u) => u.role === 'venue').length],
          ['Sân', CC.db.courts.length],
          ['Trận đấu', CC.db.matches.length],
        ]) +
        `<div class="activity-filters">${btn('Quản lý người dùng', 'admin-tab', adminTab === 'users' ? '' : 'secondary', 'data-tab="users"')}${btn('Quản lý sân', 'admin-tab', adminTab === 'courts' ? '' : 'secondary', 'data-tab="courts"')}</div>` +
        (adminTab === 'users'
          ? `<div class="filter-bar">${select(
              'Nhóm tài khoản',
              'user-role',
              option('', 'Tất cả', roleFilter) +
                Object.entries(CC.roles)
                  .map(([k, v]) => option(k, v, roleFilter))
                  .join('')
            )}${field('Tìm tên / email', 'user-search', 'search', search)}</div>` +
            table(
              ['Tài khoản', 'Vai trò', 'Trạng thái', 'Thao tác'],
              users
                .filter(
                  (u) =>
                    (!roleFilter || u.role === roleFilter) &&
                    (!search ||
                      (u.name + ' ' + u.email).toLowerCase().includes(search.toLowerCase()))
                )
                .map((u) => [
                  esc(u.name) + `<p>${esc(u.email)}</p>`,
                  CC.roles[u.role],
                  badge(u.status),
                  u.role === 'admin'
                    ? '—'
                    : btn(
                        u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa',
                        'toggle-user',
                        'secondary',
                        `data-id="${u.id}"`
                      ),
                ])
            )
          : `<h2>Đề xuất thay đổi sân</h2>` +
            table(
              ['Chủ sân / thao tác', 'Nội dung đề xuất', 'Trạng thái', 'Quyết định'],
              CC.db.courtChanges
                .slice()
                .reverse()
                .map((r) => [
                  `${esc(CC.find('users', r.ownerId)?.name)} · ${{ create: 'Thêm', update: 'Sửa', delete: 'Xóa' }[r.type]}`,
                  `<strong>${esc(r.data.name || CC.find('courts', r.courtId)?.name)}</strong><p>${esc(r.data.location || '')}</p><p>${esc(r.data.description || '')}</p>${r.data.price ? money(r.data.price) : ''}`,
                  badge(r.status) + `<p>${esc(r.reason || '')}</p>`,
                  r.status === 'pending'
                    ? btn(
                        'Duyệt',
                        'decide-court',
                        '',
                        `data-id="${r.id}" data-decision="approved"`
                      ) +
                      btn(
                        'Từ chối',
                        'decide-court',
                        'secondary',
                        `data-id="${r.id}" data-decision="rejected"`
                      )
                    : 'Đã xử lý',
                ])
            ) +
            `<h2 class="mt">Danh sách sân</h2>` +
            table(
              ['Sân', 'Chủ sân', 'Địa chỉ', 'Trạng thái'],
              CC.db.courts.map((c) => [
                esc(c.name),
                esc(CC.find('users', c.ownerId)?.name),
                esc(c.location),
                badge(c.status),
              ])
            ))
    );
    UI.responsiveTables($('#main'));
    if (adminTab === 'users') {
      $('[name=user-role]').onchange = (e) => {
        roleFilter = e.target.value;
        dashboard();
      };
      $('[name=user-search]').onchange = (e) => {
        search = e.target.value;
        dashboard();
      };
    }
  }
  function ownerApproval() {
    CC.requireRole('admin');
    shell(
      pageHead('Duyệt chủ sân', 'Xem thông tin chủ sân và sân trước khi quyết định.') +
        table(
          ['Người đăng ký', 'Sân đăng ký', 'Trạng thái', 'Quyết định'],
          CC.db.ownerApplications
            .slice()
            .reverse()
            .map((r) => {
              const u = CC.find('users', r.userId);
              return [
                esc(u?.name) +
                  `<p>${esc(u?.email)} · ${esc(u?.phone)}</p><p>${u?.verified ? 'Đã xác thực số điện thoại' : 'Chưa xác thực'}</p>`,
                `<strong>${esc(r.court.name)}</strong><p>${esc(r.court.location)}</p><p>${esc(r.court.description)}</p>${money(r.court.price)} / giờ`,
                badge(r.status) + `<p>${esc(r.reason || '')}</p>`,
                r.status === 'pending' && u?.verified
                  ? btn('Duyệt', 'decide-owner', '', `data-id="${r.id}" data-decision="approved"`) +
                    btn(
                      'Từ chối',
                      'decide-owner',
                      'secondary',
                      `data-id="${r.id}" data-decision="rejected"`
                    )
                  : '—',
              ];
            })
        )
    );
    UI.responsiveTables($('#main'));
  }
  function reports() {
    CC.requireRole('admin');
    shell(
      pageHead(
        'Quản lý báo cáo',
        'Đọc bằng chứng và quyết định cảnh báo, khóa hoặc không xử phạt.'
      ) +
        table(
          ['Người gửi / đối tượng', 'Nội dung / bằng chứng', 'Trạng thái', 'Xử lý'],
          CC.db.abuseReports
            .slice()
            .reverse()
            .map((r) => [
              `${esc(CC.find('users', r.authorId)?.name)} → ${esc(CC.find(r.targetType === 'court' ? 'courts' : 'users', r.targetId)?.name)}<p>${r.targetType === 'court' ? 'Báo cáo sân/chủ sân' : 'Báo cáo người dùng'}</p>`,
              `<strong>${esc(r.reason)}</strong><p class="review-comment">${esc(r.comment)}</p><p class="review-comment">Bằng chứng: ${esc(r.evidence || 'Báo cáo lịch sử chưa có bằng chứng')}</p>`,
              esc(
                {
                  pending: 'Chờ xử lý',
                  warned: 'Đã cảnh báo',
                  banned: 'Đã khóa',
                  dismissed: 'Không xử phạt',
                }[r.status] || r.status
              ) + `<p>${esc(r.decisionNote || '')}</p>`,
              r.status === 'pending'
                ? btn('Xem xét', 'resolve-report', 'secondary', `data-id="${r.id}"`)
                : 'Đã xử lý',
            ])
        ) +
        `<h2 class="mt">Lịch sử cảnh báo / vi phạm</h2>` +
        table(
          ['Tài khoản', 'Quyết định', 'Lý do'],
          CC.db.violations.map((v) => [
            esc(CC.find('users', v.userId)?.name),
            v.decision === 'banned' ? 'Khóa' : 'Cảnh báo',
            esc(v.note),
          ])
        )
    );
    UI.responsiveTables($('#main'));
  }
  function systemNotifications() {
    CC.requireRole('admin');
    shell(
      pageHead('Gửi thông báo', 'Thông báo nội bộ trên trình duyệt demo.') +
        `<form id="broadcast-form" class="panel"><div class="notice error" id="broadcast-error" hidden></div>${select('Người nhận', 'audience', option('all', 'Tất cả người chơi và chủ sân') + option('player', 'Người chơi') + option('venue', 'Chủ sân'))}${textarea('Nội dung', 'text')}<button class="btn">Gửi thông báo</button></form>` +
        table(
          ['Nội dung', 'Đối tượng', 'Trạng thái', 'Thao tác'],
          CC.db.broadcasts
            .slice()
            .reverse()
            .map((r) => [
              esc(r.text),
              `${r.audience === 'all' ? 'Tất cả' : CC.roles[r.audience]} · ${r.recipients.length} người`,
              r.status === 'recalled' ? 'Đã thu hồi' : 'Đã gửi',
              r.status === 'sent'
                ? btn('Thu hồi', 'recall-broadcast', 'secondary', `data-id="${r.id}"`)
                : '—',
            ])
        )
    );
    $('#broadcast-form').onsubmit = (e) => {
      e.preventDefault();
      try {
        Domain.broadcast(Object.fromEntries(new FormData(e.currentTarget)));
        systemNotifications();
        toast('Đã gửi thông báo thành công.');
      } catch (err) {
        $('#broadcast-error').textContent = err.message;
        $('#broadcast-error').hidden = false;
      }
    };
    UI.responsiveTables($('#main'));
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const { action, id, decision } = a.dataset;
    try {
      if (action === 'new-court' || action === 'edit-court') {
        const c = CC.find('courts', id);
        formDialog(
          'Gửi đề xuất sân',
          courtFields(c),
          'Gửi admin duyệt',
          (d) => Domain.courtRequest(c ? 'update' : 'create', id, d),
          'Đã gửi đề xuất, chờ admin duyệt.'
        );
      }
      if (action === 'delete-court')
        UI.confirm(
          'Yêu cầu xóa sân?',
          'Sân hiện tại được giữ nguyên cho tới khi admin duyệt. Lịch sử không bị xóa.',
          () => {
            Domain.courtRequest('delete', id);
            renderPage();
            toast('Đã gửi yêu cầu xóa sân.');
          }
        );
      if (action === 'resubmit-owner') {
        const u = CC.me(),
          r = CC.db.ownerApplications.filter((r) => r.userId === u.id).at(-1);
        if (u.role !== 'venue' || u.approvalStatus !== 'rejected')
          throw Error('Không thể gửi lại.');
        formDialog('Cập nhật đăng ký chủ sân', courtFields(r?.court), 'Gửi lại', (d) => {
          const court = Domain.courtData(d);
          CC.transaction(() => {
            u.approvalStatus = 'pending';
            CC.db.ownerApplications.push({
              id: CC.id('application'),
              userId: u.id,
              court,
              status: 'pending',
              reason: '',
              createdAt: Domain.now(),
            });
            Domain.notifyAdmins('Chủ sân đã gửi lại hồ sơ.', 'Court-Owner-Approval.html');
          });
        });
      }
      if (action === 'booking-status')
        UI.confirm(
          'Cập nhật đơn đặt?',
          `Chuyển đơn sang: ${CC.statuses[a.dataset.status]}.`,
          () => {
            CC.setBooking(id, a.dataset.status);
            renderPage();
            toast('Đã cập nhật đơn đặt.');
          }
        );
      if (action === 'admin-tab') {
        adminTab = a.dataset.tab;
        dashboard();
      }
      if (action === 'toggle-user') {
        CC.requireRole('admin');
        const u = CC.find('users', id);
        if (!u || u.role === 'admin') throw Error('Không thể thay đổi tài khoản này.');
        formDialog(
          u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
          textarea('Lý do', 'reason'),
          'Xác nhận',
          (d) => {
            if (!d.reason.trim()) throw Error('Nhập lý do.');
            CC.transaction(() => {
              u.status = u.status === 'active' ? 'disabled' : 'active';
              const p = CC.find('players', id);
              if (p) p.status = u.status;
              CC.notify(
                id,
                `Trạng thái tài khoản: ${CC.statuses[u.status]}. ${d.reason}`,
                'notifications.html'
              );
            });
          }
        );
      }
      if (action === 'decide-court' || action === 'decide-owner')
        formDialog(
          decision === 'approved' ? 'Xác nhận duyệt' : 'Từ chối yêu cầu',
          textarea('Ghi chú / lý do (bắt buộc nếu từ chối)', 'reason'),
          'Xác nhận',
          (d) =>
            (action === 'decide-court' ? Domain.decideCourt : Domain.decideOwner)(
              id,
              decision,
              d.reason
            )
        );
      if (action === 'resolve-report')
        formDialog(
          'Xử lý báo cáo',
          select(
            'Quyết định',
            'decision',
            option('dismissed', 'Không xử phạt') +
              option('warned', 'Gửi cảnh báo') +
              option('banned', 'Khóa tài khoản')
          ) + textarea('Lý do quyết định', 'note'),
          'Lưu quyết định',
          (d) => Domain.resolveReport(id, d.decision, d.note)
        );
      if (action === 'recall-broadcast') {
        CC.requireRole('admin');
        UI.confirm(
          'Thu hồi thông báo?',
          'Thông báo sẽ được gỡ khỏi hộp thông báo người nhận.',
          () => {
            CC.transaction(() => {
              const r = CC.find('broadcasts', id);
              if (!r) throw Error('Không tìm thấy thông báo.');
              r.status = 'recalled';
              CC.db.notifications = CC.db.notifications.filter((n) => n.broadcastId !== id);
            });
            renderPage();
            toast('Đã thu hồi.');
          }
        );
      }
    } catch (err) {
      toast(err.message, true);
    }
  });
  window.Manage = {
    courts,
    bookings,
    dashboard,
    ownerApproval,
    reports,
    systemNotifications,
    pendingOwner,
  };
})();
