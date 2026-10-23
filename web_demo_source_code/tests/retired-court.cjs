// Regression: removing a retired demo court must clean old storage without resetting other data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}
function load(localStorage = storage(), sessionStorage = storage()) {
  const context = { window: {}, localStorage, sessionStorage };
  vm.runInNewContext(source, context);
  return { cc: context.window.CC, localStorage, sessionStorage };
}
let checks = 0;
const check = (condition, label) => {
  assert.ok(condition, label);
  checks++;
};
const fresh = load();
check(!fresh.cc.db.courts.some((c) => c.id === 'c4'), 'Fresh data excludes retired court');
check(!fresh.cc.db.slots.some((s) => s.courtId === 'c4'), 'Fresh data has no retired slots');
check(
  fresh.cc.db.sports.some((s) => s.id === 'pickleball'),
  'Sport catalog preserved'
);
const data = JSON.parse(JSON.stringify(fresh.cc.db));
const keptUsers = JSON.stringify(data.users);
const keptCourts = JSON.stringify(data.courts);
const retiredName = 'Sân mẫu bị gỡ';
data.courts.push({ ...data.courts[0], id: 'c4', name: retiredName, location: 'Địa chỉ sân bị gỡ' });
for (const [suffix, status] of [
  ['pending', 'pending'],
  ['approved', 'approved'],
  ['completed', 'completed'],
]) {
  data.slots.push({
    id: 'retired-slot-' + suffix,
    courtId: 'c4',
    date: fresh.cc.date(5),
    start: '08:00',
    end: '10:00',
    price: 999999,
    status: 'open',
  });
  data.bookings.push({
    id: 'retired-booking-' + suffix,
    slotId: 'retired-slot-' + suffix,
    playerId: 'u1',
    status,
  });
}
data.matches.push({
  id: 'retired-match',
  slotId: 'retired-slot-completed',
  name: 'Trận bị gỡ',
  playerIds: ['u1', 'u5'],
  hostId: 'u1',
  status: 'completed',
  capacity: 4,
});
data.courtReviews.push({
  id: 'retired-review',
  courtId: 'c4',
  bookingId: 'retired-booking-completed',
  authorId: 'u1',
  stars: 5,
});
data.opponentReviews.push({
  id: 'retired-opponent-review',
  matchId: 'retired-match',
  authorId: 'u1',
  targetId: 'u5',
});
data.playerReports.push({ id: 'retired-player-report', matchId: 'retired-match', targetId: 'u5' });
data.events.push({
  id: 'retired-event',
  name: 'Sự kiện tại ' + retiredName,
  location: retiredName,
  playerIds: ['u1'],
  status: 'open',
});
data.notifications.push({
  id: 'retired-notification-name',
  text: 'Đặt tại ' + retiredName,
  href: 'player-my-sports.html',
});
data.notifications.push({
  id: 'retired-notification-link',
  text: 'Xem trận',
  href: 'match-detail.html?id=retired-match',
});
data.aiHistory.push({
  id: 'retired-risk',
  type: 'risk',
  input: { bookingId: 'retired-booking-approved' },
  result: { level: 'Cao' },
});
data.aiHistory.push({
  id: 'retired-skill',
  type: 'skill',
  input: {},
  result: { id: 'retired-match' },
});
data.aiHistory.push({ id: 'retired-team', type: 'teams', input: { eventId: 'retired-event' } });
data.messages.push({ id: 'retired-message', matchId: 'retired-match', text: 'Tin nhắn cũ' });
data.reports.push({
  id: 'keep-aggregate',
  name: 'Báo cáo cần giữ',
  from: fresh.cc.date(-90),
  to: fresh.cc.date(90),
  snapshot: { bookings: 999, revenue: 999, createdAt: 'giữ thời điểm chụp' },
});
data.reports.push({ id: 'retired-named-report', name: retiredName, snapshot: {} });
data.legacy = {
  courts: [data.courts.at(-1)],
  slots: [data.slots.at(-1)],
  bookings: [data.bookings.at(-1)],
  matches: [data.matches.at(-1)],
  events: [data.events.at(-1)],
  opponentReviews: [data.opponentReviews.at(-1)],
  otherAI: [data.aiHistory.at(-1)],
};
const local = storage();
local.setItem(fresh.cc.KEY, JSON.stringify(data));
const migrated = load(local);
check(migrated.cc.loadError === '', 'Old storage loads successfully');
check(JSON.stringify(migrated.cc.db.users) === keptUsers, 'Accounts and passwords preserved');
check(JSON.stringify(migrated.cc.db.courts) === keptCourts, 'Other courts preserved exactly');
const serialized = JSON.stringify(migrated.cc.db);
check(
  !serialized.includes('retired-') &&
    !serialized.includes(retiredName) &&
    !serialized.includes('"c4"'),
  'All retired records and legacy copies removed'
);
for (const booking of migrated.cc.db.bookings)
  check(migrated.cc.find('slots', booking.slotId), 'No dangling booking');
for (const match of migrated.cc.db.matches)
  check(migrated.cc.find('slots', match.slotId), 'No dangling match');
for (const slot of migrated.cc.db.slots)
  check(migrated.cc.find('courts', slot.courtId), 'No dangling slot');
const report = migrated.cc.find('reports', 'keep-aggregate');
const eligible = migrated.cc.db.bookings.filter((b) => {
  const s = migrated.cc.find('slots', b.slotId);
  return s.date >= report.from && s.date <= report.to;
});
check(report.snapshot.bookings === eligible.length, 'Aggregate booking count recalculated');
check(
  report.snapshot.revenue ===
    eligible
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + migrated.cc.find('slots', b.slotId).price, 0),
  'Aggregate revenue recalculated'
);
check(report.snapshot.createdAt === 'giữ thời điểm chụp', 'Report timestamp preserved');
check(JSON.stringify(load(local).cc.db) === serialized, 'Repeated migration is idempotent');
local.setItem(fresh.cc.KEY, '{broken-json');
check(!!load(local).cc.loadError, 'Corrupt storage still reports an error');
check(local.getItem(fresh.cc.KEY) === '{broken-json', 'Corrupt storage not silently overwritten');
console.log(
  `PASS: ${checks} retired court checks; fresh/legacy data, dependent records, aggregates, idempotence and corruption.`
);
