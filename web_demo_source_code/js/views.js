/* Bố cục nằm trong HTML. File này chỉ cập nhật vùng dữ liệu có data-bind-*.
   Không thực thi biểu thức từ HTML; giá trị luôn do controller JS truyền vào. */
(() => {
  'use strict';
  const originalViews = new Map();
  const rangeValues = new WeakMap();
  const branchStates = new WeakMap();
  const flagNames = new WeakMap();
  const main = document.querySelector('[data-page-view]');
  if (main) originalViews.set(main.dataset.pageView, main.cloneNode(true));

  function value(bindings, key) {
    if (!(key in bindings)) throw new Error(`Thiếu dữ liệu giao diện: ${key}`);
    return bindings[key]();
  }
  function decode(text) {
    const node = document.createElement('textarea');
    node.innerHTML = text;
    return node.value;
  }
  function interpolate(text, bindings) {
    return text.replace(/__CC_([A-Za-z0-9-]+)__/g, (_, key) => value(bindings, key) ?? '');
  }
  function bind(root, bindings) {
    // Conditional content is authored as HTML <template>, and mounted only as needed.
    const visited = new Set();
    let yes;
    while (
      (yes = [...root.querySelectorAll('template[data-if]')].find((node) => !visited.has(node)))
    ) {
      visited.add(yes);
      const no = yes.nextElementSibling;
      const active = !!value(bindings, yes.dataset.if);
      let state = branchStates.get(yes);
      if (!state) {
        const end = document.createComment('end-condition');
        no.after(end);
        state = { end, active: null };
        branchStates.set(yes, state);
      }
      if (state.active !== active) {
        while (no.nextSibling !== state.end) no.nextSibling.remove();
        state.end.before((active ? yes : no).content.cloneNode(true));
        state.active = active;
      }
    }
    applyBindings(root, bindings);
  }
  function applyBindings(root, bindings) {
    const elements = [...root.querySelectorAll('[data-bind-attrs], [data-bind-flags]')];
    if (root.matches?.('[data-bind-attrs], [data-bind-flags]')) elements.unshift(root);
    elements.forEach((node) => {
      if (node.dataset.bindAttrs) {
        for (const [name, pattern] of Object.entries(JSON.parse(node.dataset.bindAttrs))) {
          const next = decode(interpolate(pattern, bindings));
          node.setAttribute(name, next);
          if (name === 'value') node.value = next;
        }
      }
      if (node.dataset.bindFlags) {
        (flagNames.get(node) || []).forEach((name) => node.removeAttribute(name));
        const sample = document.createElement('template');
        sample.innerHTML = `<input ${node.dataset.bindFlags
          .split(' ')
          .map((key) => value(bindings, key) || '')
          .join(' ')}>`;
        const attrs = [...sample.content.firstElementChild.attributes];
        attrs.forEach((attr) => node.setAttribute(attr.name, attr.value));
        flagNames.set(
          node,
          attrs.map((attr) => attr.name)
        );
        for (const name of ['checked', 'selected', 'disabled']) {
          if (name in node) node[name] = node.hasAttribute(name);
        }
      }
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    const starts = [];
    while (walker.nextNode())
      if (walker.currentNode.data.startsWith('bind:')) starts.push(walker.currentNode);
    starts.forEach((start) => {
      const key = start.data.slice(5);
      const html = String(value(bindings, key) ?? '');
      if (rangeValues.get(start) === html) return;
      let end = start.nextSibling;
      while (end && !(end.nodeType === Node.COMMENT_NODE && end.data === '/bind:' + key))
        end = end.nextSibling;
      if (!end) throw new Error(`Thiếu điểm kết thúc vùng dữ liệu: ${key}`);
      const range = document.createRange();
      range.setStartAfter(start);
      range.setEndBefore(end);
      range.deleteContents();
      // createContextualFragment preserves table rows and select options correctly.
      range.insertNode(range.createContextualFragment(html));
      rangeValues.set(start, html);
    });
  }
  function update(name, bindings = {}) {
    let target = document.querySelector('[data-page-view]');
    if (target?.dataset.pageView !== name) {
      const source =
        originalViews.get(name) ||
        document.querySelector(`template[data-page="${name}"]`)?.content.firstElementChild;
      if (!source) throw new Error(`Không tìm thấy bố cục HTML: ${name}`);
      const replacement = source.cloneNode(true);
      target.replaceWith(replacement);
      target = replacement;
    }
    UI.updateChrome();
    bind(target, bindings);
    UI.responsiveTables(target);
    window.DatePicker?.enhance(target);
  }
  function fragment(name, bindings = {}) {
    const template = document.querySelector(`template[data-fragment="${name}"]`);
    if (!template) throw new Error(`Không tìm thấy mẫu HTML: ${name}`);
    const content = template.content.cloneNode(true);
    bind(content, bindings);
    return content;
  }
  window.Views = { update, fragment };
})();
