// Hồi quy dữ liệu khi quay từ bản 28 trang về bản 4 vai trò; không cần trình duyệt.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
const key = 'courtconnect.v1';
function storage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
}
function load(localStorage = storage(), sessionStorage = storage()) {
  const context = { localStorage, sessionStorage, window: {} };
  vm.runInNewContext(source, context);
  return { cc: context.window.CC, localStorage, sessionStorage };
}
const retiredReason = 'Vai trò CLB ngừng hỗ trợ trong phạm vi 28 trang.';
function oldData(previousStatus = 'active') {
  const data = JSON.parse(JSON.stringify(load().cc.db));
  const user = data.users.find((u) => u.role === 'organizer');
  user.status = previousStatus;
  data.scope28 = 1;
  data.legacy = { organizers: [{ ...user }], events: data.events, reports: [{ id: 'old-report', note: 'giữ nguyên' }], otherAI: [{ id: 'old-teams', type: 'teams' }], opponentReviews: [{ id: 'old-review' }] };
  data.events = [];
  user.status = 'disabled';
  user.retiredReason = retiredReason;
  return data;
}
function open(data) {
  const local = storage();
  local.setItem(key, JSON.stringify(data));
  return load(local);
}
const fresh = load();
assert.equal(fresh.cc.db.users.find((u) => u.role === 'organizer').status, 'active');
const original = oldData();
const bookings = JSON.stringify(original.bookings);
const { cc, localStorage, sessionStorage } = open(original);
assert.equal(cc.loadError, '');
const organizer = cc.db.users.find((u) => u.role === 'organizer');
assert.equal(organizer.status, 'active');
assert.equal(organizer.retiredReason, undefined);
assert.equal(organizer.password, 'Court123!');
cc.login(organizer);
assert.equal(cc.me().role, 'organizer');
assert.equal(cc.requireRole('organizer').id, organizer.id);
assert.equal(cc.db.events.length, original.legacy.events.length);
assert.ok(cc.db.reports.some((r) => r.id === 'old-report'));
assert.ok(cc.db.aiHistory.some((r) => r.id === 'old-teams'));
assert.equal(JSON.stringify(cc.db.bookings), bookings);
assert.equal(JSON.parse(localStorage.getItem(key)).fourRoleRestoreVersion, 1);
const restored = JSON.stringify(cc.db);
assert.equal(JSON.stringify(load(localStorage, sessionStorage).cc.db), restored);
const previouslyDisabled = open(oldData('disabled')).cc;
assert.equal(previouslyDisabled.db.users.find((u) => u.role === 'organizer').status, 'disabled');
const manual = oldData();
delete manual.users.find((u) => u.role === 'organizer').retiredReason;
assert.equal(open(manual).cc.db.users.find((u) => u.role === 'organizer').status, 'disabled');
const current = oldData();
current.events = [{ ...current.legacy.events[0], name: 'Sự kiện đang chỉnh sửa' }];
const merged = open(current).cc;
const expectedEventIds = [...new Set([...current.events, ...current.legacy.events].map(event => event.id))].sort();
assert.deepEqual(Array.from(merged.db.events, event => event.id).sort(), expectedEventIds);
assert.equal(merged.db.events.find(event => event.id === current.events[0].id).name, 'Sự kiện đang chỉnh sửa');
cc.transaction(() => { cc.db.users.find((u) => u.id === organizer.id).status = 'disabled'; });
assert.equal(load(localStorage).cc.db.users.find((u) => u.role === 'organizer').status, 'disabled');
assert.equal(load(localStorage, sessionStorage).cc.me(), null);
console.log('PASS: tài khoản mẫu mới; khôi phục CLB; đăng nhập/phân quyền; giữ dữ liệu; không nhân đôi; giữ khóa thủ công.');
