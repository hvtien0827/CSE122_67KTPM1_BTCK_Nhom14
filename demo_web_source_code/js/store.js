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
    admin: 'Quản trị viên',
  };
  function seed() {
    const users = [
      ['u1', 'Nguyễn Minh Anh', 'player'],
      ['u2', 'Trần Hoàng Nam', 'venue'],
      ['u4', 'Phạm Đức Huy', 'admin'],
      ['u5', 'Nguyễn Tuấn Dũng', 'player'],
      ['u6', 'Hoàng Hà My', 'player'],
      ['u7', 'Trần Quang Minh', 'player'],
      ['u8', 'Vũ Thu Trang', 'player'],
    ].map(([id, name, role], i) => ({
      id,
      name,
      role,
      email: ['u1', 'u2', 'u4'].includes(id)
        ? `${role}@courtconnect.demo`
        : `player${id.slice(1)}@courtconnect.demo`,
      password: 'Court123!',
      verified: true,
      status: 'active',
      phone: '09000000' + id.slice(1).padStart(2, '0'),
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
      ['c4', 'Hồ Tây Pickleball', '68 Võ Chí Công, Tây Hồ', 'pickleball', 180000, 2],
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
      risk: null,
    }));
    bookings.push({
      id: 'b4',
      slotId: slots.find((s) => s.courtId === 'c1' && s.start === '08:00' && s.date === date(2)).id,
      playerId: 'u1',
      status: 'pending',
      note: 'Nhóm 4 người, cảm ơn chủ sân.',
      createdAt: date(),
      risk: null,
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
      events: [],
      reports: [],
      notifications: [
        {
          id: 'n1',
          userId: 'u1',
          text: 'Yêu cầu đặt sân của bạn đang chờ chủ sân duyệt.',
          read: false,
          href: 'my-activities.html',
          createdAt: new Date().toISOString(),
        },
      ],
      aiHistory: [],
      messages: [],
      settings: {},
    };
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
    if (!raw) localStorage.setItem(KEY, JSON.stringify(db));
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
    if (u.role === 'venue' && u.approvalStatus && u.approvalStatus !== 'approved')
      throw Error('Chủ sân chưa được admin duyệt.');
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
    find('users', courtFor(s).ownerId)?.status === 'active' &&
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
    const actor = requireRole('player', 'venue');
    if (actor.role === 'player' && playerId && playerId !== actor.id)
      throw Error('Không đặt hộ tài khoản khác.');
    const p = playerId || actor.id,
      s = find('slots', slotId);
    if (actor.role === 'venue' && courtFor(s)?.ownerId !== actor.id)
      throw Error('Sân không thuộc quyền quản lý.');
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
        contactName: find('users', p).name,
        contactPhone: find('users', p).phone,
        note,
        status: 'pending',
        createdAt: date(),
        risk: null,
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
      if (status === 'cancelled') {
        b.cancelledBy = u.id;
        b.cancelledAt = new Date().toISOString();
      }
      if (status === 'completed')
        db.matches
          .filter((m) => m.slotId === s.id && m.status === 'open')
          .forEach((m) => {
            m.status = 'completed';
            m.playerIds.forEach((p) =>
              notify(p, 'Trận đấu đã hoàn thành. Cảm ơn bạn đã tham gia!', 'my-activities.html')
            );
          });
      if (['cancelled', 'rejected'].includes(status))
        db.matches
          .filter((m) => m.slotId === s.id && m.status === 'open')
          .forEach((m) => {
            m.status = 'cancelled';
            if (u.role === 'player') m.cancelledBy = u.id;
            m.playerIds.forEach((p) =>
              notify(p, 'Trận đã hủy vì lịch sân bị hủy.', 'my-activities.html')
            );
          });
      notify(b.playerId, `Đơn đặt sân: ${CC.statuses[status]}.`, 'my-activities.html');
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
      notify(m.hostId, `${u.name} đã rút khỏi trận.`, 'my-activities.html');
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
        notify(p, `Trận ${m.name} đã hủy; lịch đặt sân vẫn được giữ.`, 'my-activities.html')
      );
    });
  }
  function saveEntity(table, data, key) {
    const u = requireRole('venue');
    if (table !== 'slots') throw Error('Thay đổi sân phải gửi admin duyệt.');
    const c = find('courts', data.courtId),
      old = key && find('slots', key);
    if (
      !c ||
      c.ownerId !== u.id ||
      c.status !== 'active' ||
      (key && (!old || courtFor(old)?.ownerId !== u.id))
    )
      throw Error('Sân không khả dụng.');
    if (
      !Number.isFinite(data.price) ||
      data.price < 1000 ||
      !future(data) ||
      data.end <= data.start
    )
      throw Error('Khung giờ phải ở tương lai, giờ kết thúc sau giờ bắt đầu và giá từ 1.000đ.');
    if (
      db.slots.some(
        (s) => s.id !== key && s.courtId === c.id && s.status !== 'archived' && overlaps(s, data)
      )
    )
      throw Error('Khung giờ bị trùng.');
    if (old && db.bookings.some((b) => b.slotId === key && activeBooking(b)))
      throw Error('Không sửa lịch đã có đơn đặt.');
    transaction(() => {
      const value = {
        courtId: c.id,
        date: data.date,
        start: data.start,
        end: data.end,
        price: data.price,
      };
      if (old) Object.assign(old, value);
      else db.slots.push({ ...value, id: id('slot'), status: 'open' });
    });
  }
  function archive(table, key) {
    const u = requireRole('venue'),
      s = find('slots', key);
    if (table !== 'slots' || !s || courtFor(s)?.ownerId !== u.id) throw Error('Không có quyền.');
    if (db.bookings.some((b) => b.slotId === key && activeBooking(b)))
      throw Error('Không đóng lịch đã có đơn đặt.');
    transaction(() => (s.status = 'archived'));
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
    leaveMatch,
    saveMatch,
    cancelMatch,
    saveEntity,
    archive,
    playerBusy,
  };
})();
