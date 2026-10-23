/* CourtConnect: dữ liệu mẫu và quy tắc nghiệp vụ dùng chung. Không có backend. */
(() => {
  'use strict';
  const KEY = 'courtconnect.v1';
  const date = (days = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const roles = {
    player: 'Người chơi',
    venue: 'Chủ sân',
    organizer: 'Điều phối CLB',
    admin: 'Quản trị viên',
  };
  function seed() {
    const users = [
      ['u1', 'Nguyễn Minh Anh', 'player'],
      ['u2', 'Trần Hoàng Nam', 'venue'],
      ['u3', 'Lê Phương Linh', 'organizer'],
      ['u4', 'Phạm Đức Huy', 'admin'],
      ['u5', 'Nguyễn Tuấn Dũng', 'player'],
      ['u6', 'Hoàng Hà My', 'player'],
      ['u7', 'Trần Quang Minh', 'player'],
      ['u8', 'Vũ Thu Trang', 'player'],
    ].map(([id, name, role], i) => ({
      id,
      name,
      role,
      email: i < 4 ? `${role}@courtconnect.demo` : `player${i}@courtconnect.demo`,
      password: 'Court123!',
      verified: true,
      status: 'active',
      phone: '',
      level: 2 + (i % 3),
    }));
    const courts = [
      [
        'c1',
        'Sân Cầu Lông Ban Cơ Yếu Chính Phủ',
        '107 Nguyễn Chí Thanh, Láng Thượng',
        'badminton',
        120000,
        4,
      ],
      ['c2', 'Sân Cầu Lông Học Viện Ngân Hàng', '12 Chùa Bộc, Quang Trung', 'badminton', 100000, 1],
      ['c3', 'Kỳ Hòa Badminton Club', 'Sân vận động Ba Đình', 'badminton', 150000, 2],
    ].map(([id, name, location, sportId, price, image]) => ({
      id,
      name,
      location,
      sportId,
      price,
      image,
      ownerId: 'u2',
      status: 'active',
      description:
        'Không gian thoáng mát, mặt sân chất lượng, ánh sáng tiêu chuẩn. Có khu nghỉ, phòng thay đồ và chỗ gửi xe.',
      amenities: 'Gửi xe, Phòng thay đồ, Nước uống',
    }));
    const slots = courts.flatMap((c) =>
      [1, 2, 3, 4, 5, 6, 7].flatMap((n) =>
        ['08:00', '16:00', '18:00', '20:00'].map((t) => ({
          id: `s-${c.id}-${n}-${t.slice(0, 2)}`,
          courtId: c.id,
          date: date(n),
          start: t,
          end: `${String(+t.slice(0, 2) + 2).padStart(2, '0')}:00`,
          price: c.price * 2,
          status: 'open',
        }))
      )
    );
    const players = users
      .filter((u) => u.role === 'player')
      .map((u, i) => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        levels: { badminton: u.level, pickleball: Math.max(1, u.level - 1) },
        played: 8 + i * 2,
        noShows: i === 1 ? 3 : 0,
        status: 'active',
      }));
    const matches = [
      [
        'm1',
        'Giao lưu cầu lông tối nay',
        slots.find((s) => s.courtId === 'c1' && s.start === '18:00').id,
        3,
        ['u5', 'u6', 'u7'],
      ],
      [
        'm2',
        'Cầu lông cuối tuần',
        slots.find((s) => s.courtId === 'c2' && s.start === '16:00').id,
        4,
        ['u5'],
      ],
      [
        'm3',
        'Làm quen cùng cầu lông',
        slots.find((s) => s.courtId === 'c3' && s.start === '20:00').id,
        2,
        ['u6', 'u7'],
      ],
    ].map(([id, name, slotId, level, playerIds]) => ({
      id,
      name,
      slotId,
      level,
      playerIds,
      hostId: playerIds[0],
      capacity: 4,
      status: 'open',
      note: 'Giao lưu vui vẻ, mang theo vợt và đến trước 10 phút.',
    }));
    const bookings = matches.map((m, i) => ({
      id: `b${i + 1}`,
      slotId: m.slotId,
      playerId: m.hostId,
      status: 'approved',
      note: 'Đặt sân cho trận giao lưu',
      createdAt: date(),
    }));
    bookings.push({
      id: 'b4',
      slotId: slots.find((s) => s.courtId === 'c1' && s.start === '08:00' && s.date === date(2)).id,
      playerId: 'u1',
      status: 'pending',
      note: 'Nhóm 4 người, cảm ơn chủ sân.',
      createdAt: date(),
    });
    return {
      version: 1,
      users,
      courts,
      slots,
      bookings,
      matches,
      players,
      sports: [
        { id: 'badminton', name: 'Cầu lông', status: 'active' },
        { id: 'pickleball', name: 'Pickleball', status: 'active' },
      ],
      events: [
        {
          id: 'e1',
          name: 'Sunday Rally · Giao lưu CLB',
          date: date(4),
          sportId: 'badminton',
          organizerId: 'u3',
          location: 'Nhà thi đấu Đại học Thủy Lợi',
          capacity: 16,
          playerIds: players.map((p) => p.id),
          status: 'open',
          teams: null,
          note: 'Giao lưu, kết nối và cùng tiến bộ.',
        },
      ],
      reports: [],
      courtReviews: [],
      opponentReviews: [],
      playerReports: [],
      notifications: [
        {
          id: 'n1',
          userId: 'u1',
          text: 'Yêu cầu đặt sân của bạn đang chờ chủ sân duyệt.',
          read: false,
          href: 'player-my-sports.html',
          createdAt: new Date().toISOString(),
        },
      ],
      aiHistory: [],
      messages: [],
      settings: {},
    };
  }
  // Gỡ vĩnh viễn sân mẫu đã loại khỏi ứng dụng, kể cả dữ liệu từ phiên bản cũ.
  // Chỉ giữ ID cũ để nhận diện dữ liệu cần dọn; không tạo lại bản ghi này.
  function removeRetiredCourtData(data) {
    const retiredCourtIds = new Set(['c4']);
    const containers = [data, data.legacy].filter(Boolean);
    const rows = (table) =>
      containers.flatMap((group) => (Array.isArray(group[table]) ? group[table] : []));
    const retiredNames = rows('courts')
      .filter((court) => retiredCourtIds.has(court.id))
      .flatMap((court) => [court.name, court.location])
      .filter(Boolean);
    const removedIds = new Set(retiredCourtIds);
    function remove(table, predicate) {
      for (const group of containers) {
        if (!Array.isArray(group[table])) continue;
        group[table] = group[table].filter((record) => {
          if (!predicate(record)) return true;
          if (record.id) removedIds.add(record.id);
          return false;
        });
      }
    }
    remove('courts', (court) => retiredCourtIds.has(court.id));
    remove('slots', (slot) => retiredCourtIds.has(slot.courtId));
    const removedBookings = rows('bookings').some((booking) => removedIds.has(booking.slotId));
    remove('bookings', (booking) => removedIds.has(booking.slotId));
    remove('matches', (match) => removedIds.has(match.slotId));
    function referencesRemoved(value) {
      if (Array.isArray(value)) return value.some(referencesRemoved);
      if (value && typeof value === 'object') return Object.values(value).some(referencesRemoved);
      if (typeof value !== 'string') return false;
      if (removedIds.has(value) || retiredNames.some((name) => value.includes(name))) return true;
      // Nhận diện liên kết cũ trỏ đến sân, lịch, đơn đặt hoặc trận vừa bị gỡ.
      const query = value.split('?')[1]?.split('#')[0];
      if (!query) return false;
      return query.split('&').some((part) => {
        try {
          return removedIds.has(decodeURIComponent(part.split('=').slice(1).join('=')));
        } catch {
          return false;
        }
      });
    }
    remove('events', referencesRemoved);
    remove('courtReviews', referencesRemoved);
    remove('opponentReviews', referencesRemoved);
    remove('playerReports', referencesRemoved);
    for (const table of ['notifications', 'messages', 'aiHistory', 'otherAI', 'reports'])
      remove(table, referencesRemoved);
    if (removedBookings) {
      // Snapshot tổng hợp không được tiếp tục cộng doanh thu/đơn của sân đã gỡ.
      for (const group of containers) {
        for (const report of group.reports || []) {
          if (!report.snapshot) continue;
          const bookings = data.bookings.filter((booking) => {
            const slot = data.slots.find((slot) => slot.id === booking.slotId);
            return slot && slot.date >= report.from && slot.date <= report.to;
          });
          report.snapshot.bookings = bookings.length;
          report.snapshot.revenue = bookings
            .filter((booking) => booking.status === 'completed')
            .reduce(
              (sum, booking) => sum + data.slots.find((slot) => slot.id === booking.slotId).price,
              0
            );
        }
      }
    }
  }
  // Bản 28 trang dùng cùng KEY và đã lưu trữ dữ liệu CLB, khóa role organizer.
  // Chỉ hoàn tác việc ngừng hỗ trợ role; giữ nguyên tài khoản admin khóa thủ công.
  function restoreFourRoles(data) {
    if (!data.scope28 || data.fourRoleRestoreVersion === 1) return false;
    const legacy = data.legacy || {};
    const retiredReason = 'Vai trò CLB ngừng hỗ trợ trong phạm vi 28 trang.';
    data.users.forEach((user) => {
      if (user.role !== 'organizer' || user.retiredReason !== retiredReason) return;
      const previous = (legacy.organizers || []).find((item) => item.id === user.id);
      if (user.status === 'disabled') user.status = previous?.status || 'active';
      delete user.retiredReason;
    });
    const merge = (table, archived) => {
      if (!Array.isArray(archived)) return;
      data[table] ||= [];
      const ids = new Set(data[table].map((item) => item.id));
      archived.forEach((item) => {
        if (ids.has(item.id)) return;
        data[table].push(item);
        ids.add(item.id);
      });
    };
    merge('events', legacy.events);
    merge('reports', legacy.reports);
    merge('aiHistory', legacy.otherAI);
    merge('opponentReviews', legacy.opponentReviews);
    (legacy.socialProfiles || []).forEach((profile) => {
      const user = data.users.find((item) => item.id === profile.id);
      if (!user) return;
      user.socialLinks = { ...profile.socialLinks, ...user.socialLinks };
      user.phonePublic ??= profile.phonePublic ?? false;
    });
    data.fourRoleRestoreVersion = 1;
    return true;
  }
  // Additive demo data only: never reset or rewrite records already in the browser.
  function supplementDemoData(data) {
    const today = date(),
      now = new Date(),
      stamp = now.toISOString();
    const get = (table, id) => data[table].find((row) => row.id === id);
    const users = data.users.filter(
      (u) =>
        u.role === 'player' &&
        u.status === 'active' &&
        u.verified &&
        get('players', u.id)?.status === 'active'
    );
    const organizer = data.users.find((u) => u.role === 'organizer' && u.status === 'active');
    const admin = data.users.find((u) => u.role === 'admin' && u.status === 'active');
    const courts = data.courts.filter(
      (c) =>
        c.status === 'active' &&
        get('sports', c.sportId)?.status === 'active' &&
        get('users', c.ownerId)?.status === 'active'
    );
    if (!users.length || !courts.length) return;
    const player = users.find((u) => u.id === 'u1') || users[0];
    const peers = users.filter((u) => u.id !== player.id);
    const put = (table, row) => {
      if (!get(table, row.id)) data[table].push({ ...row, demoSample: true });
      return get(table, row.id);
    };
    const overlaps = (a, b) => a.date === b.date && a.start < b.end && a.end > b.start;
    const occupied = (slot) =>
      data.bookings.some(
        (b) => b.slotId === slot.id && ['pending', 'approved', 'completed'].includes(b.status)
      );
    const busy = (id, slot) =>
      data.bookings.some(
        (b) =>
          b.playerId === id &&
          ['pending', 'approved'].includes(b.status) &&
          get('slots', b.slotId) &&
          overlaps(get('slots', b.slotId), slot)
      ) ||
      data.matches.some(
        (m) =>
          m.status === 'open' &&
          m.playerIds.includes(id) &&
          get('slots', m.slotId) &&
          overlaps(get('slots', m.slotId), slot)
      );
    function reserve(court, offset, members, label, status = 'approved') {
      for (let day = offset; day < offset + 14; day++)
        for (const hour of [16, 18, 20, 8, 12, 14]) {
          const candidate = {
            courtId: court.id,
            date: date(day),
            start: `${String(hour).padStart(2, '0')}:00`,
            end: `${String(hour + 2).padStart(2, '0')}:00`,
            price: court.price * 2,
            status: 'open',
          };
          if (members.some((id) => busy(id, candidate))) continue;
          const intersect = data.slots.filter(
            (s) => s.courtId === court.id && overlaps(s, candidate)
          );
          let slot = intersect.find(
            (s) =>
              s.start === candidate.start &&
              s.end === candidate.end &&
              s.status === 'open' &&
              !occupied(s)
          );
          if (!slot && intersect.length) continue;
          slot ||= put('slots', { ...candidate, id: `demo-slot-${today}-${label}` });
          const booking = put('bookings', {
            id: `demo-booking-${today}-${label}`,
            slotId: slot.id,
            playerId: members[0],
            status,
            note: 'Dữ liệu mẫu: lịch chơi để trải nghiệm website.',
            createdAt: stamp,
          });
          return { slot, booking };
        }
      return null;
    }
    const upcomingOpen = () =>
      data.matches.filter(
        (m) =>
          m.status === 'open' &&
          m.playerIds.length < m.capacity &&
          get('slots', m.slotId) &&
          new Date(`${get('slots', m.slotId).date}T${get('slots', m.slotId).start}`) > now &&
          courts.some((c) => c.id === get('slots', m.slotId).courtId)
      );
    const first = data.demoContentVersion !== 1;
    // Expired schedules get a new batch, never a changed date on an old match.
    if ((first || !upcomingOpen().length) && data.demoMatchBatchDate !== today && peers.length) {
      courts.slice(0, 4).forEach((court, i) => {
        const host = peers[i % peers.length];
        const member = peers.find((u) => u.id !== host.id);
        const ids = member && i % 2 ? [host.id, member.id] : [host.id];
        const reserved = reserve(court, 1, ids, `open-${i}`);
        if (!reserved) return;
        put('matches', {
          id: `demo-match-${today}-${i}`,
          name: `${get('sports', court.sportId).name} ${i % 2 ? 'giao lưu cùng bạn mới' : 'tìm thêm bạn cùng chơi'}`,
          slotId: reserved.slot.id,
          level: 2 + (i % 3),
          playerIds: ids,
          hostId: host.id,
          capacity: 4,
          status: 'open',
          note: 'Trận mẫu đang tuyển người. Mang theo vợt và đến trước giờ chơi 10 phút.',
        });
      });
      data.demoMatchBatchDate = today;
    }
    if (!first) return;
    // A future approved booking lets the sample player try the create-match flow.
    if (
      !data.bookings.some(
        (b) =>
          b.playerId === player.id &&
          b.status === 'approved' &&
          get('slots', b.slotId)?.date > today
      )
    ) {
      const reservation = reserve(courts[0], 3, [player.id], 'my-upcoming');
      if (reservation)
        put('matches', {
          id: `demo-my-match-${today}`,
          name: 'Buổi chơi của nhóm mình',
          slotId: reservation.slot.id,
          level: 2,
          playerIds: [player.id],
          hostId: player.id,
          capacity: 4,
          status: 'open',
          note: 'Trận mẫu trong Hoạt động của tôi.',
        });
    }
    if (!data.bookings.some((b) => b.status === 'pending' && get('slots', b.slotId)?.date > today))
      reserve(courts[0], 4, [player.id], 'pending', 'pending');
    if (!data.bookings.some((b) => b.playerId === player.id && b.status === 'cancelled')) {
      const cancelled = reserve(courts[0], 7, [player.id], 'cancelled', 'cancelled');
      if (cancelled)
        put('matches', {
          id: 'demo-cancelled-match',
          name: 'Lịch giao lưu đã hủy',
          slotId: cancelled.slot.id,
          level: 2,
          playerIds: [player.id],
          hostId: player.id,
          capacity: 4,
          status: 'cancelled',
          note: 'Dữ liệu mẫu: nhóm đổi kế hoạch nên hủy lịch.',
        });
    }
    if (!data.bookings.some((b) => b.status === 'rejected'))
      reserve(courts[0], 8, [player.id], 'rejected', 'rejected');
    let history = null;
    courts.forEach((court, i) => {
      if (
        data.courtReviews.some((r) => r.courtId === court.id) &&
        data.bookings.some(
          (b) => b.status === 'completed' && get('slots', b.slotId)?.courtId === court.id
        )
      )
        return;
      // Separate past dates keep sample participants from playing overlapping matches.
      let slot = null;
      for (let n = 0; n < 30; n++) {
        const candidate = {
          id: `demo-history-slot-${court.id}`,
          courtId: court.id,
          date: date(-n - i - 1),
          start: '06:00',
          end: '08:00',
          price: court.price * 2,
          status: 'open',
        };
        if (
          new Date(`${candidate.date}T${candidate.end}`) >= now ||
          data.slots.some((s) => s.courtId === court.id && overlaps(s, candidate)) ||
          data.bookings.some(
            (b) =>
              b.playerId === player.id &&
              ['pending', 'approved', 'completed'].includes(b.status) &&
              get('slots', b.slotId) &&
              overlaps(get('slots', b.slotId), candidate)
          )
        )
          continue;
        slot = put('slots', candidate);
        break;
      }
      if (!slot) return;
      const booking = put('bookings', {
        id: `demo-history-booking-${court.id}`,
        slotId: slot.id,
        playerId: player.id,
        status: 'completed',
        note: 'Dữ liệu mẫu: buổi chơi đã hoàn thành.',
        createdAt: stamp,
      });
      const ids = [player.id, ...peers.slice(0, 3).map((u) => u.id)];
      const match = put('matches', {
        id: `demo-history-match-${court.id}`,
        name: `Buổi giao lưu đã hoàn thành tại ${court.name}`,
        slotId: slot.id,
        hostId: player.id,
        playerIds: ids,
        capacity: 4,
        level: 2,
        status: 'completed',
        matchedAtCapacity: ids.length === 4,
        note: 'Lịch sử mẫu để trải nghiệm đánh giá sau trận.',
      });
      if (!data.courtReviews.some((r) => r.courtId === court.id))
        put('courtReviews', {
          id: `demo-court-review-${court.id}`,
          bookingId: booking.id,
          courtId: court.id,
          authorId: player.id,
          stars: i % 2 ? 4 : 5,
          tags: ['Sân đẹp', 'Ánh sáng tốt'],
          comment: 'Đánh giá mẫu: sân sạch, ánh sáng tốt và có chỗ nghỉ giữa các lượt chơi.',
          createdAt: stamp,
        });
      history ||= match;
    });
    history ||= data.matches.find(
      (m) =>
        m.status === 'completed' &&
        m.playerIds.includes(player.id) &&
        m.playerIds.some((id) => id !== player.id)
    );
    const target = history?.playerIds.find((id) => id !== player.id && get('users', id));
    if (target && !data.opponentReviews.length)
      put('opponentReviews', {
        id: 'demo-opponent-review',
        matchId: history.id,
        targetId: target,
        authorId: player.id,
        stars: 5,
        tags: ['Chơi nhiệt tình', 'Đúng giờ'],
        comment: 'Đánh giá mẫu: phối hợp tốt, chơi nhiệt tình và tôn trọng bạn chơi.',
        createdAt: stamp,
      });
    if (target && !data.playerReports.length)
      put('playerReports', {
        id: 'demo-player-report',
        matchId: history.id,
        targetId: target,
        authorId: player.id,
        reason: 'Khác',
        comment: 'Báo cáo mẫu để thử thao tác xem xét; không phải phản ánh thực tế về người chơi.',
        status: 'pending',
        createdAt: stamp,
      });
    if (
      organizer &&
      !data.events.some(
        (e) => e.organizerId === organizer.id && e.status === 'open' && e.date > today && e.teams
      )
    ) {
      const ids = users.slice(0, 4).map((u) => u.id);
      const event = put('events', {
        id: 'demo-club-lineup',
        name: 'Giao lưu CLB cuối tuần',
        date: date(5),
        start: '14:00',
        end: '16:00',
        sportId: courts[0].sportId,
        organizerId: organizer.id,
        location: courts[0].name,
        capacity: 12,
        playerIds: ids,
        status: 'open',
        teams:
          ids.length > 1
            ? { a: ids.filter((_, i) => i % 2 === 0), b: ids.filter((_, i) => i % 2 === 1) }
            : null,
        note: 'Sự kiện mẫu có danh sách thành viên và đội hình đã lưu.',
      });
      if (event.teams && !data.aiHistory.some((h) => h.type === 'teams'))
        put('aiHistory', {
          id: 'demo-ai-teams',
          userId: organizer.id,
          type: 'teams',
          input: { eventId: event.id },
          result: event.teams,
          status: 'saved',
          createdAt: stamp,
        });
    }
    const suggested = upcomingOpen().find((m) => !m.playerIds.includes(player.id));
    if (
      suggested &&
      !data.aiHistory.some(
        (h) => h.userId === player.id && h.type === 'skill' && h.status === 'saved'
      )
    )
      put('aiHistory', {
        id: 'demo-ai-skill',
        userId: player.id,
        type: 'skill',
        input: { date: get('slots', suggested.slotId).date },
        result: {
          id: suggested.id,
          score: 85,
          reason: 'Gợi ý mẫu để trải nghiệm danh sách đã lưu.',
        },
        status: 'saved',
        createdAt: stamp,
      });
    if (admin && !data.reports.length) {
      const rows = data.bookings.filter(
        (b) => get('slots', b.slotId)?.date >= date(-30) && get('slots', b.slotId)?.date <= today
      );
      put('reports', {
        id: 'demo-activity-report',
        name: 'Báo cáo hoạt động mẫu',
        from: date(-30),
        to: today,
        status: 'active',
        note: 'Báo cáo mẫu từ lịch sử đặt sân tại thời điểm bổ sung dữ liệu.',
        snapshot: {
          bookings: rows.length,
          revenue: rows
            .filter((b) => b.status === 'completed')
            .reduce((sum, b) => sum + get('slots', b.slotId).price, 0),
          createdAt: stamp,
        },
      });
    }
    const destinations = {
      player: 'player-my-sports.html',
      venue: 'venue-booking-management.html',
      organizer: 'organizer-event-management.html',
      admin: 'admin-player-reports.html',
    };
    for (const user of data.users.filter((u) => u.status === 'active' && destinations[u.role]))
      if (!data.notifications.some((n) => n.userId === user.id))
        put('notifications', {
          id: `demo-notification-${user.id}`,
          userId: user.id,
          text: 'Thông báo mẫu: dữ liệu hoạt động đã sẵn sàng để bạn trải nghiệm.',
          read: false,
          href: destinations[user.role],
          createdAt: stamp,
        });
    data.demoContentVersion = 1;
  }
  // Dọn metadata của tính năng đã gỡ, giữ nguyên đơn đặt và lịch sử CLB.
  function removeRetiredVenueAnalysis(data) {
    for (const group of [data, data.legacy].filter(Boolean)) {
      for (const booking of Array.isArray(group.bookings) ? group.bookings : [])
        delete booking.risk;
      for (const table of ['aiHistory', 'otherAI']) {
        if (Array.isArray(group[table]))
          group[table] = group[table].filter((entry) => entry.type !== 'risk');
      }
      if (Array.isArray(group.notifications))
        group.notifications = group.notifications.filter(
          (entry) =>
            !String(entry.href || '').includes('venue-no-show-risk.html') &&
            entry.text !== 'Chủ sân đề nghị bạn xác nhận lại lịch. Vui lòng kiểm tra đơn đặt.'
        );
    }
  }
  let db,
    loadError = '';
  try {
    const raw = localStorage.getItem(KEY);
    db = raw ? JSON.parse(raw) : seed();
    if (
      db.version !== 1 ||
      ![
        'users',
        'courts',
        'slots',
        'bookings',
        'matches',
        'players',
        'sports',
        'events',
        'reports',
        'notifications',
        'aiHistory',
        'messages',
      ].every((k) => Array.isArray(db[k])) ||
      !db.settings
    )
      throw Error('Dữ liệu không đúng định dạng');
    removeRetiredCourtData(db);
    restoreFourRoles(db);
    removeRetiredVenueAnalysis(db);
    // Migrations must be safe to repeat: older demos may have a version marker
    // while individual tables were removed by a different project scope.
    for (const table of ['courtReviews', 'opponentReviews', 'playerReports']) {
      if (!Array.isArray(db[table]))
        db[table] = Array.isArray(db.legacy?.[table]) ? db.legacy[table] : [];
    }
    db.events.forEach((e) => {
      e.playerIds = Array.isArray(e.playerIds) ? e.playerIds : [];
      e.start ||= '08:00';
      e.end ||= '10:00';
    });
    db.courts.forEach((c) => {
      if (c.autoSchedule === undefined) c.autoSchedule = ['c1', 'c2', 'c3'].includes(c.id);
    });
    supplementDemoData(db);
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    db = seed();
    loadError =
      'Không thể đọc dữ liệu cục bộ. Bạn có thể khôi phục dữ liệu mẫu trong Cài đặt. ' + e.message;
  }
  const id = (p) =>
    p + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const find = (table, key) => db[table].find((x) => x.id === key);
  const session = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem('cc.session') || localStorage.getItem('cc.session') || 'null'
      );
    } catch {
      return null;
    }
  };
  const me = () => {
    const s = session();
    const u = s && find('users', s.id);
    return u && u.status === 'active' && u.verified ? u : null;
  };
  function requireRole(...r) {
    const u = me();
    if (!u || !r.includes(u.role)) throw Error('Bạn không có quyền thực hiện thao tác này.');
    return u;
  }
  function transaction(fn) {
    if (loadError)
      throw Error(
        'Dữ liệu cục bộ đang lỗi. Hãy khôi phục dữ liệu mẫu trong Cài đặt trước khi tiếp tục.'
      );
    const prev = JSON.stringify(db);
    try {
      fn();
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      db = JSON.parse(prev);
      throw e;
    }
    return db;
  }
  function notify(userId, text, href) {
    db.notifications.unshift({
      id: id('n'),
      userId,
      text,
      href,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
  const courtFor = (s) => find('courts', s?.courtId);
  const sportActive = (id) => find('sports', id)?.status === 'active';
  const future = (s) => s && new Date(`${s.date}T${s.start}`) > new Date();
  const activeBooking = (b) => ['pending', 'approved', 'completed'].includes(b.status);
  const available = (s) =>
    !!s &&
    s.status === 'open' &&
    future(s) &&
    courtFor(s)?.status === 'active' &&
    sportActive(courtFor(s).sportId) &&
    !db.bookings.some((b) => b.slotId === s.id && activeBooking(b));
  const overlaps = (a, b) => a.date === b.date && a.start < b.end && b.start < a.end;
  function playerBusy(playerId, slot, exceptMatch) {
    return (
      db.matches.some(
        (m) =>
          m.id !== exceptMatch &&
          m.status === 'open' &&
          m.playerIds.includes(playerId) &&
          overlaps(find('slots', m.slotId), slot)
      ) ||
      db.bookings.some(
        (b) =>
          b.playerId === playerId &&
          b.slotId !== slot.id &&
          ['pending', 'approved'].includes(b.status) &&
          overlaps(find('slots', b.slotId), slot)
      )
    );
  }
  function booking(slotId, note = '', playerId) {
    const actor = requireRole('player');
    const p = playerId || actor.id,
      s = find('slots', slotId);
    if (p !== actor.id) throw Error('Bạn chỉ được đặt sân cho chính mình.');
    if (!find('players', p) || find('users', p)?.status !== 'active')
      throw Error('Người chơi không hợp lệ.');
    if (!available(s)) throw Error('Khung giờ không còn trống. Vui lòng chọn khung giờ khác.');
    if (playerBusy(p, s)) throw Error('Người chơi đã có lịch trùng giờ.');
    let result;
    transaction(() => {
      result = {
        id: id('b'),
        slotId,
        playerId: p,
        note,
        status: 'pending',
        createdAt: date(),
      };
      db.bookings.push(result);
      notify(courtFor(s).ownerId, 'Có yêu cầu đặt sân mới.', 'venue-booking-management.html');
    });
    return result;
  }
  function setBooking(key, status) {
    const u = requireRole('player', 'venue');
    const b = find('bookings', key),
      s = find('slots', b?.slotId);
    if (!b) throw Error('Không tìm thấy đơn đặt.');
    if (u.role === 'player' && (b.playerId !== u.id || status !== 'cancelled'))
      throw Error('Bạn chỉ có thể hủy đơn của mình.');
    if (u.role === 'venue' && courtFor(s)?.ownerId !== u.id)
      throw Error('Bạn không quản lý sân này.');
    const transitions = {
      pending: ['approved', 'rejected', 'cancelled'],
      approved: ['cancelled', 'completed'],
    };
    if (!transitions[b.status]?.includes(status))
      throw Error('Không thể chuyển trạng thái đơn này.');
    if (status === 'completed' && new Date(`${s.date}T${s.end}`) > new Date())
      throw Error('Chỉ hoàn thành sau khi kết thúc khung giờ.');
    transaction(() => {
      b.status = status;
      if (status === 'completed')
        db.matches
          .filter((m) => m.slotId === s.id && m.status === 'open')
          .forEach((m) => {
            m.status = 'completed';
            m.playerIds.forEach((p) =>
              notify(p, 'Trận đấu đã hoàn thành. Cảm ơn bạn đã tham gia!', 'player-my-sports.html')
            );
          });
      if (['cancelled', 'rejected'].includes(status))
        db.matches
          .filter((m) => m.slotId === s.id && m.status === 'open')
          .forEach((m) => {
            m.status = 'cancelled';
            if (u.role === 'player') m.cancelledBy = u.id;
            m.playerIds.forEach((p) =>
              notify(p, 'Trận đã hủy vì lịch sân bị hủy.', 'player-my-sports.html')
            );
          });
      notify(b.playerId, `Đơn đặt sân: ${CC.statuses[status]}.`, 'player-my-sports.html');
    });
  }
  function joinMatch(key) {
    const u = requireRole('player'),
      m = find('matches', key),
      s = find('slots', m?.slotId);
    if (!m || m.status !== 'open' || !future(s) || !sportActive(courtFor(s)?.sportId))
      throw Error('Trận không còn nhận người chơi.');
    if (m.playerIds.includes(u.id)) throw Error('Bạn đã tham gia trận này.');
    if (m.playerIds.length >= m.capacity) throw Error('Trận đã đủ người.');
    if (playerBusy(u.id, s)) throw Error('Trùng lịch với một hoạt động khác.');
    transaction(() => {
      m.playerIds.push(u.id);
      m.withdrawnIds = (m.withdrawnIds || []).filter((id) => id !== u.id);
      if (m.playerIds.length >= m.capacity) m.matchedAtCapacity = true;
      notify(m.hostId, `${u.name} vừa tham gia ${m.name}.`, 'player-my-sports.html');
    });
  }
  function leaveMatch(key) {
    const u = requireRole('player'),
      m = find('matches', key);
    if (!m || !m.playerIds.includes(u.id)) throw Error('Bạn chưa tham gia trận.');
    if (m.hostId === u.id) throw Error('Chủ trận cần dùng thao tác hủy trận.');
    if (m.status !== 'open') throw Error('Trận đã đóng.');
    transaction(() => {
      m.withdrawnIds = [...new Set([...(m.withdrawnIds || []), u.id])];
      m.playerIds = m.playerIds.filter((x) => x !== u.id);
      notify(m.hostId, `${u.name} đã rút khỏi trận.`, 'player-my-sports.html');
    });
  }
  function saveMatch(data, key) {
    const u = requireRole('player');
    const s = find('slots', data.slotId),
      c = courtFor(s),
      b = db.bookings.find(
        (b) => b.slotId === data.slotId && b.playerId === u.id && b.status === 'approved'
      );
    if (!b || !future(s) || !sportActive(c?.sportId))
      throw Error('Chọn lịch đặt sân đã được duyệt và chưa bắt đầu.');
    if (db.matches.some((m) => m.id !== key && m.slotId === s.id && m.status === 'open'))
      throw Error('Khung giờ đã có trận.');
    const m = key && find('matches', key);
    if (m && (m.hostId !== u.id || m.status !== 'open')) throw Error('Không được sửa trận này.');
    if ((m?.playerIds || [u.id]).some((p) => playerBusy(p, s, key)))
      throw Error('Lịch mới trùng với hoạt động khác của một thành viên.');
    if (data.capacity < (m?.playerIds.length || 1))
      throw Error('Số chỗ không được nhỏ hơn số người đã tham gia.');
    transaction(() => {
      if (m) Object.assign(m, data);
      else
        db.matches.push({ ...data, id: id('m'), hostId: u.id, playerIds: [u.id], status: 'open' });
    });
  }
  function cancelMatch(key) {
    const u = requireRole('player'),
      m = find('matches', key);
    if (m?.hostId !== u.id || m.status !== 'open') throw Error('Không thể hủy trận này.');
    transaction(() => {
      m.status = 'cancelled';
      m.cancelledBy = u.id;
      m.playerIds.forEach((p) =>
        notify(p, `Trận ${m.name} đã hủy; lịch đặt sân vẫn được giữ.`, 'player-my-sports.html')
      );
    });
  }
  function saveEntity(table, data, key) {
    const rule = {
      courts: 'venue',
      slots: 'venue',
      events: 'organizer',
      players: 'organizer',
      sports: 'admin',
      users: 'admin',
      reports: 'admin',
    };
    const u = requireRole(rule[table]);
    const old = key && find(table, key);
    if ('name' in data) {
      data.name = data.name.trim();
      if (data.name.length < 2) throw Error('Tên phải có ít nhất 2 ký tự có nghĩa.');
    }
    if ('location' in data && !data.location.trim()) throw Error('Vui lòng nhập địa điểm.');
    for (const k of ['price', 'capacity', 'played', 'noShows'])
      if (k in data && (!Number.isFinite(data[k]) || data[k] < 0))
        throw Error('Giá trị số không hợp lệ.');
    if ('capacity' in data && (!Number.isInteger(data.capacity) || data.capacity < 2))
      throw Error('Sức chứa phải là số nguyên từ 2 trở lên.');
    if (key && !old) throw Error('Bản ghi không tồn tại.');
    if (
      (table === 'courts' && old && old.ownerId !== u.id) ||
      (table === 'events' && old && old.organizerId !== u.id)
    )
      throw Error('Bạn không sở hữu dữ liệu này.');
    if (table === 'courts') {
      if (
        old &&
        old.sportId !== data.sportId &&
        db.bookings.some(
          (b) =>
            courtFor(find('slots', b.slotId))?.id === key &&
            ['pending', 'approved'].includes(b.status)
        )
      )
        throw Error('Không đổi môn của sân khi đang có đơn đặt.');
      if (!sportActive(data.sportId)) throw Error('Môn thể thao đã ngừng hoạt động.');
      data.ownerId = u.id;
    }
    if (table === 'slots') {
      const c = find('courts', data.courtId);
      if (c?.ownerId !== u.id || c.status !== 'active') throw Error('Sân không khả dụng.');
      if (old && courtFor(old)?.ownerId !== u.id) throw Error('Không có quyền sửa slot.');
      if (!future(data) || data.end <= data.start)
        throw Error('Khung giờ phải ở tương lai và giờ kết thúc sau giờ bắt đầu.');
      if (
        db.slots.some(
          (s) =>
            s.id !== key &&
            s.courtId === data.courtId &&
            s.status !== 'archived' &&
            overlaps(s, data)
        )
      )
        throw Error('Khung giờ bị trùng với lịch hiện có.');
      if (old && db.bookings.some((b) => b.slotId === key && activeBooking(b)))
        throw Error('Không được sửa slot đã có đơn đặt.');
    }
    if (table === 'events') {
      data.organizerId = u.id;
      if (data.date < date()) throw Error('Ngày sự kiện không được ở quá khứ.');
      data.start ||= old?.start || '08:00';
      data.end ||= old?.end || '10:00';
      if (
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.start) ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.end) ||
        data.end <= data.start
      )
        throw Error('Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.');
      if (!future({ date: data.date, start: data.start }))
        throw Error('Thời gian tổ chức phải ở tương lai.');
      if (!sportActive(data.sportId)) throw Error('Môn thể thao không hoạt động.');
      if (old && data.capacity < old.playerIds.length)
        throw Error('Sức chứa nhỏ hơn danh sách hiện tại.');
      if (old?.playerIds.length && old.sportId !== data.sportId)
        throw Error('Không đổi môn khi sự kiện đã có danh sách.');
    }
    if (table === 'users') {
      data.email = data.email.trim().toLowerCase();
      if (db.users.some((x) => x.id !== key && x.email === data.email))
        throw Error('Email đã được sử dụng.');
      if (
        old?.id === u.id &&
        (data.role !== 'admin' || (data.status !== undefined && data.status !== 'active'))
      )
        throw Error('Không thể tự gỡ quyền hoặc khóa tài khoản hiện tại.');
      if (old && old.role !== data.role)
        throw Error('Tài khoản đã tạo không đổi vai trò để bảo toàn liên kết nghiệp vụ.');
    }
    if (
      table === 'sports' &&
      db.sports.some((x) => x.id !== key && x.name.toLowerCase() === data.name.toLowerCase())
    )
      throw Error('Tên môn thể thao đã tồn tại.');
    transaction(() => {
      if (old) Object.assign(old, data);
      else {
        const row = { ...data, id: id(table[0]), status: data.status || 'active' };
        if (table === 'slots') row.status = 'open';
        if (table === 'events') Object.assign(row, { status: 'open', playerIds: [], teams: null });
        if (table === 'players') Object.assign(row, { userId: null });
        if (table === 'users') {
          Object.assign(row, { verified: true, password: 'Court123!' });
          if (row.role === 'player')
            db.players.push({
              id: row.id,
              userId: row.id,
              name: row.name,
              levels: { badminton: 2, pickleball: 2 },
              played: 0,
              noShows: 0,
              status: 'active',
            });
        }
        db[table].push(row);
      }
      if (table === 'players' && old?.userId) {
        const user = find('users', old.userId);
        if (user) user.name = old.name;
      }
      if (table === 'users' && old) {
        const p = find('players', old.id);
        if (p) {
          p.name = old.name;
          p.status = old.status;
        }
      }
    });
  }
  function archive(table, key) {
    const role = {
      courts: 'venue',
      slots: 'venue',
      events: 'organizer',
      players: 'organizer',
      sports: 'admin',
      users: 'admin',
      reports: 'admin',
    };
    const u = requireRole(role[table]),
      x = find(table, key);
    if (!x) throw Error('Không tìm thấy dữ liệu.');
    if (
      (table === 'courts' && x.ownerId !== u.id) ||
      (table === 'slots' && courtFor(x)?.ownerId !== u.id) ||
      (table === 'events' && x.organizerId !== u.id)
    )
      throw Error('Không có quyền thao tác.');
    if (table === 'users' && key === u.id) throw Error('Không thể tự khóa tài khoản.');
    if (
      table === 'courts' &&
      db.bookings.some(
        (b) =>
          courtFor(find('slots', b.slotId))?.id === key &&
          ['pending', 'approved'].includes(b.status)
      )
    )
      throw Error('Cần xử lý các đơn đặt trước khi lưu trữ sân.');
    if (table === 'slots' && db.bookings.some((b) => b.slotId === key && activeBooking(b)))
      throw Error('Slot đã có đơn đặt, hãy xử lý đơn trước.');
    if (
      table === 'sports' &&
      (db.courts.some((c) => c.sportId === key && c.status === 'active') ||
        db.events.some((e) => e.sportId === key && e.status === 'open'))
    )
      throw Error('Môn đang được dùng bởi sân hoặc sự kiện.');
    if (
      table === 'players' &&
      db.events.some((e) => e.status === 'open' && e.playerIds.includes(key))
    )
      throw Error('Hãy bỏ người chơi khỏi các sự kiện đang mở trước.');
    transaction(() => {
      x.status = ['users', 'players'].includes(table) ? 'disabled' : 'archived';
      if (table === 'users') {
        const p = find('players', key);
        if (p) p.status = 'disabled';
      }
      if (table === 'events') x.teams = null;
    });
  }
  function roster(eventId, playerId, add) {
    const u = requireRole('organizer'),
      e = find('events', eventId),
      p = find('players', playerId);
    if (e?.organizerId !== u.id || e.status !== 'open')
      throw Error('Sự kiện không cho phép sửa danh sách.');
    if (!p || p.status !== 'active') throw Error('Người chơi không khả dụng.');
    if (add && (e.playerIds.includes(playerId) || e.playerIds.length >= e.capacity))
      throw Error('Đã có người chơi hoặc sự kiện đã đầy.');
    transaction(() => {
      e.playerIds = add ? [...e.playerIds, playerId] : e.playerIds.filter((x) => x !== playerId);
      e.teams = null;
    });
  }
  // Extend the published schedule, never overwrite bookings, manually closed
  // slots, or overlapping custom time ranges. Keep historical slot IDs intact.
  function ensureSchedules() {
    if (loadError) return;
    const additions = [];
    for (const c of db.courts.filter((c) => c.status === 'active' && c.autoSchedule)) {
      for (let offset = 0; offset < 30; offset++) {
        const day = date(offset);
        for (let hour = 8; hour < 22; hour += 2) {
          const slot = {
            id: `daily-${c.id}-${day}-${hour}`,
            courtId: c.id,
            date: day,
            start: `${String(hour).padStart(2, '0')}:00`,
            end: `${String(hour + 2).padStart(2, '0')}:00`,
            price: c.price * 2,
            status: 'open',
          };
          if (!future(slot) || db.slots.some((s) => s.courtId === c.id && overlaps(s, slot)))
            continue;
          additions.push(slot);
        }
      }
    }
    if (additions.length) transaction(() => db.slots.push(...additions));
  }
  function deleteEntity(table, key) {
    const u = requireRole({ courts: 'venue', events: 'organizer', reports: 'admin' }[table]);
    const row = find(table, key);
    if (!row || row.status === 'deleted') throw Error('Bản ghi không còn tồn tại.');
    if (
      (table === 'courts' && row.ownerId !== u.id) ||
      (table === 'events' && row.organizerId !== u.id)
    )
      throw Error('Bạn không sở hữu dữ liệu này.');
    if (
      table === 'courts' &&
      db.bookings.some(
        (b) =>
          courtFor(find('slots', b.slotId))?.id === key &&
          ['pending', 'approved'].includes(b.status)
      )
    )
      throw Error(
        'Sân còn đơn chờ duyệt/đã duyệt. Hãy xử lý hoặc hủy các đơn đó trước khi xoá sân.'
      );
    transaction(() => {
      if (table === 'reports') db.reports = db.reports.filter((r) => r.id !== key);
      else {
        // Soft deletion preserves the linked booking/review history.
        row.status = 'deleted';
        if (table === 'courts') {
          row.autoSchedule = false;
          db.slots
            .filter((s) => s.courtId === key && future(s))
            .forEach((s) => (s.status = 'archived'));
        }
        if (table === 'events') row.teams = null;
      }
    });
  }
  function saveTeams(eventId, teams) {
    const u = requireRole('organizer'),
      e = find('events', eventId);
    if (e?.organizerId !== u.id || e.status !== 'open')
      throw Error('Sự kiện không cho phép lưu đội.');
    const all = [...teams.a, ...teams.b];
    if (
      !teams.a.length ||
      !teams.b.length ||
      Math.abs(teams.a.length - teams.b.length) > 1 ||
      new Set(all).size !== all.length ||
      all.length !== e.playerIds.length ||
      all.some((p) => !e.playerIds.includes(p) || find('players', p)?.status !== 'active')
    )
      throw Error('Hai đội cần đủ danh sách, không trùng người và chênh lệch số người tối đa 1.');
    transaction(() => {
      e.teams = teams;
    });
  }
  function login(user, remember = false) {
    sessionStorage.removeItem('cc.session');
    localStorage.removeItem('cc.session');
    (remember ? localStorage : sessionStorage).setItem(
      'cc.session',
      JSON.stringify({ id: user.id })
    );
  }
  function logout() {
    sessionStorage.removeItem('cc.session');
    localStorage.removeItem('cc.session');
  }
  const statuses = {
    active: 'Đang hoạt động',
    open: 'Đang mở',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
    archived: 'Đã lưu trữ',
    disabled: 'Vô hiệu hóa',
    deleted: 'Đã xoá',
  };
  window.CC = {
    get db() {
      return db;
    },
    KEY,
    loadError,
    roles,
    statuses,
    date,
    id,
    find,
    me,
    requireRole,
    transaction,
    notify,
    seed,
    login,
    logout,
    available,
    future,
    courtFor,
    sportActive,
    booking,
    setBooking,
    joinMatch,
    leaveMatch,
    saveMatch,
    cancelMatch,
    saveEntity,
    deleteEntity,
    ensureSchedules,
    archive,
    roster,
    saveTeams,
    playerBusy,
  };
  const CC = window.CC;
  // Nâng cấp dữ liệu cộng đồng một lần, trước khi bất kỳ trang nào được render.
  if (!CC.loadError && !CC.db.communityVersion)
    CC.transaction(() => {
      const db = CC.db;
      db.courtReviews ||= [];
      db.opponentReviews ||= [];
      db.playerReports ||= [];
      db.users.forEach((u) => {
        u.phonePublic ??= false;
        u.socialLinks ||= {};
      });
      if (['u1', 'u5', 'u6', 'u7'].every((id) => CC.find('users', id)) && CC.find('courts', 'c1')) {
        [-14, -7, -2, 2, 4].forEach((offset, i) => {
          const id = `community-${i}`,
            date = CC.date(offset),
            completed = offset < 0;
          const slot = {
            id,
            courtId: 'c1',
            date,
            start: '10:00',
            end: '12:00',
            price: 240000,
            status: 'open',
          };
          if (
            db.slots.some(
              (s) =>
                s.courtId === 'c1' && s.date === date && s.start < slot.end && s.end > slot.start
            )
          )
            return;
          db.slots.push(slot);
          db.bookings.push({
            id,
            slotId: id,
            playerId: 'u1',
            status: completed ? 'completed' : 'approved',
            note: 'Lịch mẫu để trải nghiệm',
            createdAt: new Date().toISOString(),
          });
          db.matches.push({
            id,
            slotId: id,
            name: completed ? `Giao lưu đã đấu ${i + 1}` : `Hẹn ra sân ${i - 2}`,
            level: 3,
            capacity: 4,
            hostId: 'u1',
            playerIds: ['u1', 'u5', 'u6', 'u7'],
            status: completed ? 'completed' : 'open',
            matchedAtCapacity: true,
            note: 'Trận mẫu của CourtConnect',
          });
        });
        const b = db.bookings.find((b) => b.id === 'community-0');
        if (b)
          db.courtReviews.push({
            id: 'review-demo',
            bookingId: b.id,
            courtId: 'c1',
            authorId: 'u1',
            stars: 5,
            tags: ['Sân đẹp', 'Sạch sẽ'],
            comment: 'Sân thoáng, ánh sáng tốt. Nhóm mình chơi rất thoải mái.',
            createdAt: new Date().toISOString(),
          });
      }
      db.matches.forEach((m) => {
        if (m.playerIds.length >= m.capacity) m.matchedAtCapacity = true;
      });
      db.communityVersion = 1;
    });
})();
