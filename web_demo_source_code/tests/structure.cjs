// Kiểm tra ranh giới file theo role, không cần mở trình duyệt.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const roles = ['venue', 'organizer', 'admin'];
const formOwners = {
  'manage-edit-dialog-1': 'venue',
  'manage-edit-dialog-2': 'venue',
  'manage-edit-dialog-3': 'organizer',
  'manage-edit-dialog-4': 'organizer',
  'manage-edit-dialog-5': 'admin',
  'manage-edit-dialog-6': 'admin',
  'manage-edit-dialog-7': 'admin',
  'manage-actions-dialog-8': 'organizer'
};
let pages = 0;
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = read(file);
  assert.ok(!html.includes('js/manage.js'), `${file}: không nạp controller cũ`);
  // All local stylesheets/scripts must exist in the delivered project.
  for (const match of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), `${file}: ${match[1]}`);
  }
  const role = roles.find(role => file.startsWith(role + '-'));
  if (role) {
    assert.ok(html.includes(`src="js/${role}.js"`), `${file}: controller đúng role`);
    assert.ok(html.includes(`href="css/${role}.css"`), `${file}: stylesheet đúng role`);
    for (const other of [...roles, 'player'].filter(other => other !== role)) {
      assert.ok(!html.includes(`src="js/${other}.js"`), `${file}: không nạp ${other}.js`);
    }
    for (const match of html.matchAll(/data-fragment="([^"]+)"/g)) {
      if (formOwners[match[1]]) assert.equal(formOwners[match[1]], role, `${file}: dialog đúng role`);
    }
  }
  pages++;
}
assert.ok(!fs.existsSync(path.join(root, 'js/manage.js')));
for (const role of roles) {
  const source = read(`js/${role}.js`);
  for (const other of roles.filter(other => other !== role)) {
    assert.ok(!source.includes(`window.${other[0].toUpperCase() + other.slice(1)}`));
  }
  assert.ok(source.includes('function openEditDialog('));
  assert.ok(source.includes('function bindFilters('));
}
console.log(`PASS: ${pages} trang, đường dẫn tài nguyên, controller/CSS/dialog đúng role.`);
