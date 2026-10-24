// Kiểm tra ranh giới file theo role, không cần mở trình duyệt.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const roles = ['venue', 'organizer', 'admin'];
const formOwners = {
  'manage-edit-dialog-1': 'venue',
  'manage-edit-dialog-3': 'organizer',
  'manage-edit-dialog-4': 'organizer',
  'manage-edit-dialog-5': 'admin',
  'manage-edit-dialog-6': 'admin',
  'manage-edit-dialog-7': 'admin',
  'manage-actions-dialog-8': 'organizer',
};
const dependencies = JSON.parse(read('docs/page-dependencies.json'));
let pages = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = read(file);
  assert.ok(!html.includes('js/manage.js'), `${file}: không nạp controller cũ`);
  // All local stylesheets/scripts must exist in the delivered project.
  for (const match of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), `${file}: ${match[1]}`);
  }
  const expected = dependencies[file];
  assert.ok(expected, `${file}: có khai báo phụ thuộc`);
  assert.deepEqual(
    [...html.matchAll(/<script[^>]* src="([^"]+)"/g)].map((m) => m[1]),
    expected.scripts,
    `${file}: script`
  );
  assert.deepEqual(
    [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map((m) => m[1]),
    expected.styles,
    `${file}: CSS`
  );
  assert.equal(
    html.includes('id="date-control-template"'),
    expected.datePicker,
    `${file}: template lịch`
  );
  assert.equal(
    html.includes('id="shared-calendar-template"'),
    expected.datePicker,
    `${file}: popup lịch`
  );
  assert.equal(
    html.includes('type="date"'),
    expected.datePicker,
    `${file}: lịch chỉ nạp khi có input ngày, kể cả trong popup`
  );
  assert.equal(
    html.includes('src="js/auth.js"'),
    /^(login|register|forgot-password|verification-sent|verify-email|registration-success|recovery-sent|verify-reset|reset-password|reset-success)\.html$/.test(
      file
    ),
    `${file}: auth chỉ trên trang xác thực`
  );
  assert.equal(
    html.includes('src="js/ai.js"'),
    ['player-skill-match.html', 'organizer-team-lineup.html'].includes(
      file
    ),
    `${file}: AI chỉ trên 2 trang gợi ý`
  );
  assert.deepEqual(
    [...html.matchAll(/data-fragment="([^"]+)"/g)].map(m => m[1]),
    expected.fragments,
    `${file}: chỉ giữ popup đã khai báo cho trang`
  );
  const role = !html.includes('data-redirect=') && roles.find((role) => file.startsWith(role + '-'));
  if (role) {
    assert.equal(
      html.includes(`src="js/${role}.js"`),
      dependencies[file].scripts.includes(`js/${role}.js`),
      `${file}: controller đúng nhu cầu trang`
    );
    assert.equal(html.includes(`href="css/${role}.css"`), expected.styles.includes(`css/${role}.css`), `${file}: CSS theo nhu cầu trang`);
    for (const other of [...roles, 'player'].filter((other) => other !== role)) {
      assert.ok(!html.includes(`src="js/${other}.js"`), `${file}: không nạp ${other}.js`);
    }
    for (const match of html.matchAll(/data-fragment="([^"]+)"/g)) {
      if (formOwners[match[1]])
        assert.equal(formOwners[match[1]], role, `${file}: dialog đúng role`);
    }
  }
  pages++;
}
assert.ok(!fs.existsSync(path.join(root, 'js/manage.js')));
for (const role of roles) {
  const source = read(`js/${role}.js`);
  for (const other of roles.filter((other) => other !== role)) {
    assert.ok(!source.includes(`window.${other[0].toUpperCase() + other.slice(1)}`));
  }
  assert.ok(source.includes('function openEditDialog('));
  assert.ok(source.includes('function bindFilters('));
}
assert.equal(Object.keys(dependencies).length, pages);
console.log(`PASS: ${pages} trang, đường dẫn tài nguyên, controller/CSS/dialog đúng role.`);
