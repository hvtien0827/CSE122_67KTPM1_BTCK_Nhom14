/* Lịch dùng chung. Bố cục nằm trong template HTML; chỉ ô ngày và năm được tạo từ dữ liệu. */
(() => {
  'use strict';
  const controls = new WeakMap();
  let popup;
  let active = null;
  let month;
  let focusDate;
  let sequence = 0;
  const key = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parse = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Date(value + 'T12:00:00') : null;
  const today = () => key(new Date());
  const allowed = (input, value) =>
    (!input.min || value >= input.min) && (!input.max || value <= input.max);
  const clamp = (input, value) =>
    input.min && value < input.min ? input.min : input.max && value > input.max ? input.max : value;
  const format = (value) =>
    parse(value)?.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) || 'Chọn ngày';

  function sync(control) {
    const { input, button } = control;
    button.querySelector('[data-date-display]').textContent = format(input.value);
    button.classList.toggle('is-empty', !input.value);
    button.disabled = input.disabled || input.readOnly;
    button.setAttribute('aria-label', `${control.label}: ${format(input.value)}`);
    button.setAttribute('aria-required', String(input.required));
    if (input.validity.valid) button.removeAttribute('aria-invalid');
  }
  function close(restoreFocus = false) {
    if (!active) return;
    const { button } = active;
    active = null;
    button.setAttribute('aria-expanded', 'false');
    if (popup.hidePopover && popup.matches(':popover-open')) popup.hidePopover();
    popup.hidden = true;
    if (restoreFocus && button.isConnected) button.focus({ preventScroll: true });
  }
  function position() {
    if (!active) return;
    if (!active.input.isConnected) {
      close();
      return;
    }
    const bounds = active.button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const topEdge = (viewport?.offsetTop || 0) + 12;
    const bottomEdge = (viewport?.offsetTop || 0) + (viewport?.height || innerHeight) - 12;
    const width = Math.min(336, innerWidth - 24);
    popup.style.width = width + 'px';
    popup.style.maxHeight = Math.max(120, bottomEdge - topEdge) + 'px';
    const height = popup.getBoundingClientRect().height;
    const below = bounds.bottom + 8;
    const above = bounds.top - height - 8;
    popup.style.left = Math.max(12, Math.min(bounds.left, innerWidth - width - 12)) + 'px';
    popup.style.top =
      Math.max(
        topEdge,
        Math.min(below + height <= bottomEdge ? below : above, bottomEdge - height)
      ) + 'px';
  }
  function render(focus = false) {
    const { input } = active;
    const year = month.getFullYear();
    const low = Math.min(parse(input.min)?.getFullYear() || new Date().getFullYear() - 100, year);
    const high = Math.max(parse(input.max)?.getFullYear() || new Date().getFullYear() + 50, year);
    popup.querySelector('[data-date-years]').replaceChildren(
      ...Array.from({ length: high - low + 1 }, (_, index) => {
        const option = document.createElement('option');
        option.value = String(low + index);
        option.textContent = String(low + index);
        return option;
      })
    );
    popup.querySelector('[data-date-years]').value = String(year);
    popup.querySelector('[data-date-months]').value = String(month.getMonth());
    popup.querySelector('[data-date-heading]').textContent =
      `Tháng ${month.getMonth() + 1} năm ${year}`;
    const first = new Date(year, month.getMonth(), 1, 12);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    const grid = popup.querySelector('[data-date-grid]');
    grid.replaceChildren(
      ...Array.from({ length: 42 }, (_, index) => {
        const date = new Date(first);
        date.setDate(first.getDate() + index);
        const value = key(date);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cc-calendar-day';
        button.dataset.calendarDate = value;
        button.textContent = String(date.getDate());
        button.disabled = !allowed(input, value);
        button.tabIndex = value === focusDate ? 0 : -1;
        button.classList.toggle('is-outside', date.getMonth() !== month.getMonth());
        button.setAttribute(
          'aria-label',
          date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        );
        button.setAttribute('aria-pressed', String(value === input.value));
        if (value === today()) button.setAttribute('aria-current', 'date');
        return button;
      })
    );
    const previousEnd = key(new Date(year, month.getMonth(), 0, 12));
    const nextStart = key(new Date(year, month.getMonth() + 1, 1, 12));
    popup.querySelector('[data-calendar-step="-1"]').disabled =
      !!input.min && previousEnd < input.min;
    popup.querySelector('[data-calendar-step="1"]').disabled = !!input.max && nextStart > input.max;
    popup.querySelector('[data-calendar-today]').disabled = !allowed(input, today());
    popup.querySelector('[data-calendar-clear]').hidden = input.required;
    position();
    if (focus)
      grid.querySelector(`[data-calendar-date="${focusDate}"]`)?.focus({ preventScroll: true });
  }
  function choose(value) {
    if (!active || (value && !allowed(active.input, value))) return;
    const control = active;
    control.input.value = value;
    sync(control);
    close(true);
    control.input.dispatchEvent(new Event('input', { bubbles: true }));
    control.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function createPopup() {
    popup = document
      .querySelector('#shared-calendar-template')
      .content.firstElementChild.cloneNode(true);
    popup.id = 'shared-calendar';
    document.body.append(popup);
    if (typeof popup.showPopover === 'function') popup.setAttribute('popover', 'manual');
    popup.addEventListener('click', (event) => {
      const day = event.target.closest('[data-calendar-date]');
      if (day) {
        choose(day.dataset.calendarDate);
        return;
      }
      if (event.target.closest('[data-calendar-today]')) {
        choose(today());
        return;
      }
      if (event.target.closest('[data-calendar-clear]')) {
        choose('');
        return;
      }
      const step = event.target.closest('[data-calendar-step]');
      if (step) {
        month.setMonth(month.getMonth() + Number(step.dataset.calendarStep));
        focusDate = clamp(active.input, key(month));
        render();
      }
    });
    popup.addEventListener('change', (event) => {
      if (!event.target.matches('[data-date-months], [data-date-years]')) return;
      month = new Date(
        Number(popup.querySelector('[data-date-years]').value),
        Number(popup.querySelector('[data-date-months]').value),
        1,
        12
      );
      focusDate = clamp(active.input, key(month));
      render();
    });
    popup.addEventListener('keydown', (event) => {
      const day = event.target.closest('[data-calendar-date]');
      if (!day) return;
      const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(event.key in moves) && !['Home', 'End', 'PageUp', 'PageDown'].includes(event.key))
        return;
      event.preventDefault();
      const next = parse(day.dataset.calendarDate);
      if (event.key in moves) next.setDate(next.getDate() + moves[event.key]);
      if (event.key === 'Home') next.setDate(next.getDate() - ((next.getDay() + 6) % 7));
      if (event.key === 'End') next.setDate(next.getDate() + 6 - ((next.getDay() + 6) % 7));
      if (event.key === 'PageUp' || event.key === 'PageDown') {
        const wanted = next.getDate();
        next.setDate(1);
        next.setMonth(
          next.getMonth() + (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)
        );
        next.setDate(
          Math.min(wanted, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate())
        );
      }
      focusDate = clamp(active.input, key(next));
      month = new Date(parse(focusDate).getFullYear(), parse(focusDate).getMonth(), 1, 12);
      render(true);
    });
  }
  function open(control) {
    if (control.button.disabled) return;
    if (active === control) {
      close(true);
      return;
    }
    close();
    if (!popup) createPopup();
    // Keep the calendar within its owner's modal for focus/inert rules.
    (control.input.closest('dialog[open]') || document.body).append(popup);
    active = control;
    focusDate = clamp(control.input, control.input.value || today());
    const selected = parse(focusDate);
    month = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
    control.button.setAttribute('aria-expanded', 'true');
    popup.hidden = false;
    popup.setAttribute('aria-label', 'Chọn ngày — ' + control.label);
    if (popup.showPopover) popup.showPopover();
    render(true);
  }
  function enhance(root = document) {
    if (active && !active.input.isConnected) close();
    root.querySelectorAll('input[type="date"]').forEach((input) => {
      let control = controls.get(input);
      if (!control) {
        const template = document.querySelector('#date-control-template');
        if (!template) return;
        const label =
          input.closest('.field')?.firstChild.textContent.trim() || input.name || 'Ngày';
        const wrapper = template.content.firstElementChild.cloneNode(true);
        const button = wrapper.querySelector('button');
        input.before(wrapper);
        wrapper.prepend(input);
        input.classList.add('cc-date-value');
        input.tabIndex = -1;
        input.setAttribute('aria-hidden', 'true');
        button.id = 'date-control-' + ++sequence;
        button.setAttribute('aria-controls', 'shared-calendar');
        control = { input, button, label };
        controls.set(input, control);
        button.addEventListener('click', () => open(control));
        input.addEventListener('click', (event) => {
          event.preventDefault();
          if (active !== control) open(control);
        });
        button.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (active !== control) open(control);
          }
        });
        input.addEventListener('input', () => sync(control));
        input.addEventListener('change', () => sync(control));
        input.addEventListener('invalid', (event) => {
          event.preventDefault();
          button.setAttribute('aria-invalid', 'true');
          if (active !== control) open(control);
        });
        input.form?.addEventListener('reset', () => setTimeout(() => sync(control), 0));
      }
      sync(control);
    });
  }
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (active && !popup.contains(event.target) && !active.button.contains(event.target)) close();
    },
    true
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && active) {
        event.preventDefault();
        event.stopImmediatePropagation();
        close(true);
      }
    },
    true
  );
  document.addEventListener('focusin', (event) => {
    if (
      active &&
      !popup.contains(event.target) &&
      event.target !== active.button &&
      event.target !== active.input
    )
      close();
  });
  document.addEventListener(
    'close',
    (event) => {
      if (active && event.target.contains(active.input)) close();
    },
    true
  );
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  window.visualViewport?.addEventListener('resize', position);
  window.DatePicker = { enhance, close };
})();
