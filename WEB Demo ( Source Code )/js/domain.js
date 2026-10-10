/* Quy tắc phiên bản 28 trang. localStorage chỉ mô phỏng, không thay backend. */
(() => {
  'use strict';
  const now = () => new Date().toISOString();
  const active = (id) => {
    const u = CC.find('users', id);
    return u?.status === 'active' && u.verified && ['player', 'venue', 'admin'].includes(u.role);
  };
  const notifyAdmins = (text, href) =>
    CC.db.users
      .filter((u) => u.role === 'admin' && active(u.id))
      .forEach((u) => CC.notify(u.id, text, href));
  const end = (s) => s && new Date(`${s.date}T${s.end}`) <= new Date();
  if (!CC.loadError && !CC.db.scope28)
    CC.transaction(() => {
      const d = CC.db;
      d.legacy ||= {};
      d.legacy.organizers = d.users.filter((u) => u.role === 'organizer').map((u) => ({ ...u }));
      d.users
        .filter((u) => u.role === 'organizer')
        .forEach((u) => {
          u.status = 'disabled';
          u.retiredReason = 'Vai trò CLB ngừng hỗ trợ trong phạm vi 28 trang.';
        });
      d.legacy.events = d.events;
      d.events = [];
      d.legacy.reports = d.reports;
      d.reports = [];
      d.legacy.opponentReviews = d.opponentReviews || [];
      delete d.opponentReviews;
      d.legacy.socialProfiles = d.users
        .filter((u) => u.socialLinks && Object.keys(u.socialLinks).length)
        .map((u) => ({ id: u.id, socialLinks: u.socialLinks, phonePublic: u.phonePublic }));
      d.users.forEach((u) => {
        delete u.socialLinks;
        delete u.phonePublic;
      });
      d.legacy.otherAI = d.aiHistory.filter((h) => h.type !== 'skill');
      d.aiHistory = d.aiHistory.filter((h) => h.type === 'skill');
      d.joinRequests ||= [];
      d.courtChanges ||= [];
      d.ownerApplications ||= [];
      d.broadcasts ||= [];
      d.violations ||= [];
      d.abuseReports = (d.playerReports || []).map((r) => ({
        ...r,
        targetType: 'user',
        evidence: '',
        status: r.status === 'pending' ? 'pending' : 'dismissed',
        decisionNote: 'Báo cáo lịch sử',
      }));
      delete d.playerReports;
      d.users.forEach((u) => {
        if (u.role === 'venue') u.approvalStatus ||= 'approved';
        if (!u.phone && /^u[1-8]$/.test(u.id) && u.password === 'Court123!')
          u.phone = '09000000' + u.id.slice(1).padStart(2, '0');
      });
      d.notifications.forEach((n) => {
        const href = n.href || '';
        const map = {
          'player-my-sports.html': 'my-activities.html',
          'venue-revenue.html': 'Revenue.html',
          'admin-player-reports.html': 'Report-Management.html',
          'match-detail.html': 'player-open-matches.html',
          'court-detail.html': 'player-court-search.html',
        };
        let out = href;
        Object.entries(map).forEach(([a, b]) => (out = out.replace(a, b)));
        if (/organizer|admin-user|admin-sport|venue-no-show|venue-slot|profile-public/.test(out))
          out = 'notifications.html';
        n.href = out;
      });
      if (CC.find('users', 'u1') && CC.find('users', 'u2')) {
        d.messages.push({
          id: 'scope28-chat',
          from: 'u1',
          to: 'u2',
          text: 'Chào anh, em muốn hỏi sân có chỗ gửi xe không?',
          createdAt: now(),
        });
        const sample = (id, status) => {
          if (d.users.some((u) => u.id === id)) return;
          d.users.push({
            id,
            name: status === 'pending' ? 'Chủ sân chờ duyệt' : 'Chủ sân bị từ chối',
            role: 'venue',
            email: id + '@courtconnect.demo',
            phone: status === 'pending' ? '0900000021' : '0900000022',
            password: 'Court123!',
            verified: true,
            status: 'active',
            approvalStatus: status,
          });
          d.ownerApplications.push({
            id: 'app-' + id,
            userId: id,
            status,
            reason: status === 'rejected' ? 'Thiếu địa chỉ chi tiết.' : '',
            court: {
              name: 'Sân cộng đồng mới',
              location: '123 Nguyễn Trãi, Hà Nội',
              sportId: 'badminton',
              price: 100000,
              description: 'Sân trong nhà',
              image: 4,
            },
            createdAt: now(),
          });
        };
        sample('demo-owner-pending', 'pending');
        sample('demo-owner-rejected', 'rejected');
        // A pending request on an open sample match, without altering any existing roster.
        const sampleDay=CC.date(3);
        if(CC.find('courts','c1') && CC.find('users','u8') && !d.slots.some(s=>s.courtId==='c1'&&s.date===sampleDay&&s.start<'14:00'&&s.end>'12:00')) {
          const sid='scope28-host';
          d.slots.push({id:sid,courtId:'c1',date:sampleDay,start:'12:00',end:'14:00',price:240000,status:'open'});
          d.bookings.push({id:sid,slotId:sid,playerId:'u1',status:'approved',note:'Lịch mẫu để duyệt yêu cầu tham gia',createdAt:now()});
          d.matches.push({id:sid,slotId:sid,name:'Giao lưu chờ bạn mới',hostId:'u1',playerIds:['u1'],capacity:4,level:3,status:'open',note:'Trận mẫu cho luồng xét duyệt thành viên.'});
          d.joinRequests.push({id:'scope28-join',matchId:sid,playerId:'u8',status:'pending',createdAt:now()});
        }
        if (CC.find('courts', 'c2'))
          d.courtChanges.push({
            id: 'scope28-change',
            courtId: 'c2',
            ownerId: 'u2',
            type: 'update',
            data: {
              ...CC.find('courts', 'c2'),
              description: 'Đề xuất bổ sung khu nghỉ có nước uống.',
            },
            status: 'pending',
            createdAt: now(),
          });
        [-10, -3].forEach((n, i) => {
          const sid = 'scope28-cancel-' + i;
          if (CC.find('courts', 'c1') && CC.find('users', 'u5')) {
            d.slots.push({
              id: sid,
              courtId: 'c1',
              date: CC.date(n),
              start: '06:00',
              end: '07:00',
              price: 120000,
              status: 'archived',
            });
            d.bookings.push({
              id: sid,
              slotId: sid,
              playerId: 'u5',
              status: 'cancelled',
              cancelledBy: 'u5',
              cancelledAt: new Date(CC.date(n) + 'T12:00:00').toISOString(),
              note: 'Lịch sử mẫu người chơi tự hủy',
              createdAt: CC.date(n),
            });
          }
        });
        if (!d.abuseReports.length)
          d.abuseReports.push({
            id: 'scope28-report',
            authorId: 'u1',
            targetId: 'u5',
            targetType: 'user',
            reason: 'Ứng xử không phù hợp',
            comment: 'Phản ánh mẫu cần quản trị viên xem xét.',
            evidence: 'Mô tả bằng chứng mẫu: trao đổi khi hẹn giờ ra sân.',
            status: 'pending',
            createdAt: now(),
          });
      }
      d.scope28 = 1;
    });
  const approvedOwner = () => CC.requireRole('venue');
  function requestJoin(id) {
    const u = CC.requireRole('player'),
      m = CC.find('matches', id),
      s = CC.find('slots', m?.slotId);
    if (
      !m ||
      m.status !== 'open' ||
      !CC.future(s) ||
      !CC.sportActive(CC.courtFor(s)?.sportId) ||
      CC.courtFor(s)?.status !== 'active'
    )
      throw Error('Trận không còn mở.');
    if (m.playerIds.includes(u.id)) throw Error('Bạn đã trong trận.');
    if (m.playerIds.length >= m.capacity) throw Error('Trận đã đủ người.');
    if (CC.playerBusy(u.id, s)) throw Error('Bạn có lịch trùng giờ.');
    if (
      CC.db.joinRequests.some(
        (r) => r.matchId === id && r.playerId === u.id && r.status === 'pending'
      )
    )
      throw Error('Bạn đã gửi yêu cầu, hãy chờ chủ trận.');
    CC.transaction(() => {
      CC.db.joinRequests.push({
        id: CC.id('join'),
        matchId: id,
        playerId: u.id,
        status: 'pending',
        createdAt: now(),
      });
      CC.notify(m.hostId, `${u.name} muốn tham gia ${m.name}.`, 'Join-Requests.html');
    });
  }
  function decideJoin(id, decision) {
    const u = CC.requireRole('player'),
      r = CC.find('joinRequests', id),
      m = CC.find('matches', r?.matchId),
      s = CC.find('slots', m?.slotId);
    if (
      !r ||
      m?.hostId !== u.id ||
      r.status !== 'pending' ||
      !['approved', 'rejected'].includes(decision)
    )
      throw Error('Không thể xử lý yêu cầu.');
    if (
      decision === 'approved' &&
      (!active(r.playerId) ||
        m.status !== 'open' ||
        !CC.future(s) ||
        CC.courtFor(s)?.status !== 'active' ||
        !CC.sportActive(CC.courtFor(s)?.sportId) ||
        m.playerIds.includes(r.playerId) ||
        m.playerIds.length >= m.capacity ||
        CC.playerBusy(r.playerId, s))
    )
      throw Error('Không thể duyệt: trận đã đóng/đầy hoặc người chơi có lịch trùng.');
    CC.transaction(() => {
      r.status = decision;
      r.reviewedAt = now();
      if (decision === 'approved') {
        m.playerIds.push(r.playerId);
        m.withdrawnIds = (m.withdrawnIds || []).filter((id) => id !== r.playerId);
        if (m.playerIds.length >= m.capacity) m.matchedAtCapacity = true;
      }
      CC.notify(
        r.playerId,
        `Yêu cầu vào ${m.name}: ${CC.statuses[decision]}.`,
        'my-activities.html'
      );
    });
  }
  function courtData(d) {
    const value = {
      name: String(d.name || '').trim(),
      location: String(d.location || '').trim(),
      sportId: d.sportId,
      price: Number(d.price),
      description: String(d.description || '').trim(),
      image: Number(d.image ?? 4),
    };
    if (
      value.name.length < 2 ||
      !value.location ||
      !CC.sportActive(value.sportId) ||
      !Number.isFinite(value.price) ||
      value.price < 1000 ||
      value.description.length > 1000 ||
      !Number.isInteger(value.image) ||
      value.image < 0 ||
      value.image > 9
    )
      throw Error('Kiểm tra tên, địa chỉ, môn và giá sân (từ 1.000đ).');
    return value;
  }
  function courtRequest(type, id, data = {}) {
    const u = approvedOwner(),
      c = CC.find('courts', id);
    if (
      !['create', 'update', 'delete'].includes(type) ||
      (type !== 'create' && (!c || c.ownerId !== u.id))
    )
      throw Error('Không có quyền thay đổi sân.');
    if (id && CC.db.courtChanges.some((r) => r.courtId === id && r.status === 'pending'))
      throw Error('Sân đang có thay đổi chờ duyệt.');
    const clean = type === 'delete' ? {} : courtData(data);
    CC.transaction(() => {
      CC.db.courtChanges.push({
        id: CC.id('change'),
        courtId: id || null,
        ownerId: u.id,
        type,
        data: clean,
        status: 'pending',
        createdAt: now(),
      });
      notifyAdmins('Có yêu cầu thay đổi thông tin sân.', 'Admin-Dashboard.html?tab=courts');
    });
  }
  function decideCourt(id, decision, reason = '') {
    CC.requireRole('admin');
    const r = CC.find('courtChanges', id);
    if (!r || r.status !== 'pending' || !['approved', 'rejected'].includes(decision))
      throw Error('Yêu cầu đã được xử lý.');
    if (decision === 'rejected' && !reason.trim()) throw Error('Nhập lý do từ chối.');
    const c = CC.find('courts', r.courtId);
    if (decision === 'approved') {
      if (!active(r.ownerId) || CC.find('users', r.ownerId).approvalStatus !== 'approved')
        throw Error('Chủ sân không còn đủ điều kiện.');
      if (r.type !== 'create' && !c) throw Error('Không tìm thấy sân.');
      if (
        r.type === 'delete' &&
        CC.db.bookings.some(
          (b) =>
            CC.find('slots', b.slotId)?.courtId === c.id &&
            ['pending', 'approved'].includes(b.status)
        )
      )
        throw Error('Cần xử lý hết đơn đang chờ/đã duyệt trước khi xóa sân.');
      if (
        r.type === 'update' &&
        c.sportId !== r.data.sportId &&
        CC.db.bookings.some(
          (b) =>
            CC.find('slots', b.slotId)?.courtId === c.id &&
            ['pending', 'approved'].includes(b.status)
        )
      )
        throw Error('Không đổi môn khi còn lịch đặt.');
    }
    CC.transaction(() => {
      if (decision === 'approved') {
        if (r.type === 'create') {
          const data = courtData(r.data);
          r.courtId = CC.id('c');
          CC.db.courts.push({ ...data, id: r.courtId, ownerId: r.ownerId, status: 'active' });
        } else if (r.type === 'delete') c.status = 'archived';
        else Object.assign(c, courtData(r.data));
      }
      r.status = decision;
      r.reason = reason.trim();
      r.reviewedAt = now();
      CC.notify(
        r.ownerId,
        `Thay đổi sân: ${CC.statuses[decision]}. ${r.reason}`,
        'venue-court-management.html'
      );
    });
  }
  function decideOwner(id, decision, reason = '') {
    CC.requireRole('admin');
    const r = CC.find('ownerApplications', id),
      u = CC.find('users', r?.userId);
    if (
      !r ||
      r.status !== 'pending' ||
      !u ||
      !u.verified ||
      !['approved', 'rejected'].includes(decision)
    )
      throw Error('Yêu cầu không hợp lệ hoặc chưa xác thực điện thoại.');
    if (decision === 'rejected' && !reason.trim()) throw Error('Nhập lý do từ chối.');
    CC.transaction(() => {
      r.status = decision;
      r.reason = reason.trim();
      r.reviewedAt = now();
      u.approvalStatus = decision;
      if (decision === 'approved')
        CC.db.courts.push({
          ...courtData(r.court),
          id: CC.id('c'),
          ownerId: u.id,
          status: 'active',
        });
      CC.notify(
        u.id,
        `Đăng ký chủ sân: ${CC.statuses[decision]}. ${r.reason}`,
        'venue-court-management.html'
      );
    });
  }
  function counts(id) {
    const ms = CC.db.matches.filter(
        (m) => m.playerIds.includes(id) || m.withdrawnIds?.includes(id)
      ),
      bs = CC.db.bookings.filter((b) => b.playerId === id);
    const cutoff = Date.now() - 30 * 86400000;
    return {
      matched: ms.filter((m) => m.matchedAtCapacity || m.playerIds.length >= m.capacity).length,
      completed: ms.filter((m) => m.status === 'completed').length,
      cancelled: ms.filter((m) => m.cancelledBy === id || m.withdrawnIds?.includes(id)).length,
      booked: bs.length,
      bookingCompleted: bs.filter((b) => b.status === 'completed').length,
      bookingCancelled: bs.filter((b) => b.cancelledBy === id).length,
      recentCancelled: bs.filter(
        (b) =>
          b.status === 'cancelled' &&
          b.cancelledBy === id &&
          new Date(b.cancelledAt).getTime() >= cutoff &&
          new Date(b.cancelledAt).getTime() <= Date.now()
      ).length,
      reports: CC.db.abuseReports.filter(
        (r) =>
          (r.targetType === 'user' && r.targetId === id) ||
          (r.targetType === 'court' && CC.find('courts', r.targetId)?.ownerId === id)
      ).length,
    };
  }
  function sendReport(d) {
    const u = CC.requireRole('player', 'venue', 'admin');
    const target =
      d.targetType === 'court' ? CC.find('courts', d.targetId) : CC.find('users', d.targetId);
    if (
      !target ||
      !['court', 'user'].includes(d.targetType) ||
      d.targetId === u.id ||
      target.role === 'organizer'
    )
      throw Error('Đối tượng báo cáo không hợp lệ.');
    if (
      !d.reason?.trim() ||
      !d.comment?.trim() ||
      d.comment.length > 1000 ||
      !d.evidence?.trim() ||
      d.evidence.length > 2000
    )
      throw Error('Nhập lý do, mô tả và bằng chứng (mô tả hoặc liên kết).');
    if (
      CC.db.abuseReports.some(
        (r) =>
          r.authorId === u.id &&
          r.targetType === d.targetType &&
          r.targetId === d.targetId &&
          r.status === 'pending'
      )
    )
      throw Error('Bạn đã có báo cáo đang chờ xử lý với đối tượng này.');
    CC.transaction(() => {
      CC.db.abuseReports.push({
        id: CC.id('abuse'),
        authorId: u.id,
        targetType: d.targetType,
        targetId: d.targetId,
        reason: d.reason.trim(),
        comment: d.comment.trim(),
        evidence: d.evidence.trim(),
        status: 'pending',
        createdAt: now(),
      });
      notifyAdmins('Có báo cáo vi phạm mới.', 'Report-Management.html');
    });
  }
  function resolveReport(id, decision, note) {
    const admin = CC.requireRole('admin'),
      r = CC.find('abuseReports', id);
    if (
      !r ||
      r.status !== 'pending' ||
      !['warned', 'banned', 'dismissed'].includes(decision) ||
      !note?.trim()
    )
      throw Error('Chọn hướng xử lý và ghi rõ lý do.');
    const targetId = r.targetType === 'court' ? CC.find('courts', r.targetId)?.ownerId : r.targetId,
      u = CC.find('users', targetId);
    if (!u) throw Error('Đối tượng không còn tồn tại.');
    if (decision === 'banned' && (u.id === admin.id || u.role === 'admin'))
      throw Error('Không khóa quản trị viên bằng báo cáo.');
    CC.transaction(() => {
      r.status = decision;
      r.decisionNote = note.trim();
      r.reviewedBy = admin.id;
      r.reviewedAt = now();
      if (decision !== 'dismissed') {
        CC.db.violations.push({
          id: CC.id('violation'),
          userId: u.id,
          reportId: id,
          decision,
          note: note.trim(),
          createdAt: now(),
        });
        if (decision === 'banned') {
          u.status = 'disabled';
          const p = CC.find('players', u.id);
          if (p) p.status = 'disabled';
        }
      }
      CC.notify(r.authorId, 'Báo cáo của bạn đã được xử lý.', 'Report.html');
      CC.notify(
        u.id,
        `Kết quả xem xét: ${decision === 'warned' ? 'Cảnh báo' : decision === 'banned' ? 'Khóa tài khoản' : 'Không xử phạt'}. ${note}`,
        'notifications.html'
      );
    });
  }
  function broadcast(d) {
    const u = CC.requireRole('admin');
    if (!['all', 'player', 'venue'].includes(d.audience) || !d.text?.trim() || d.text.length > 1000)
      throw Error('Chọn người nhận và nội dung tối đa 1000 ký tự.');
    CC.transaction(() => {
      const id = CC.id('broadcast');
      const users = CC.db.users.filter(
        (x) =>
          x.status === 'active' &&
          ['player', 'venue'].includes(x.role) &&
          (d.audience === 'all' || x.role === d.audience)
      );
      if (!users.length) throw Error('Không có người nhận phù hợp.');
      CC.db.broadcasts.push({
        id,
        authorId: u.id,
        text: d.text.trim(),
        audience: d.audience,
        createdAt: now(),
        status: 'sent',
        recipients: users.map((x) => x.id),
      });
      users.forEach((x) => {
        CC.notify(x.id, d.text.trim(), 'notifications.html');
        CC.db.notifications[0].broadcastId = id;
      });
    });
  }
  const baseBooking = CC.booking;
  CC.booking = (slotId, note = '', playerId) => {
    const u = CC.requireRole('player', 'venue'),
      target = CC.find('users', playerId || u.id);
    if (!/^0\d{9}$/.test(target?.phone || ''))
      throw Error('Cập nhật số điện thoại 10 chữ số trước khi đặt sân.');
    return baseBooking(slotId, note, playerId);
  };
  CC.joinMatch = requestJoin;
  window.Domain = {
    active,
    end,
    counts,
    requestJoin,
    decideJoin,
    courtData,
    courtRequest,
    decideCourt,
    decideOwner,
    sendReport,
    resolveReport,
    broadcast,
    notifyAdmins,
    now,
  };
})();
