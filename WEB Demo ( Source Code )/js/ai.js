/* AI mô phỏng: các quy tắc có thể đọc, kiểm thử và giải thích. Không gọi LLM. */
(() => {
  'use strict';
  const {
    $,
    $$,
    esc,
    btn,
    link,
    badge,
    day,
    sport,
    level,
    option,
    sports,
    levels,
    field,
    select,
    textarea,
    empty,
    pageHead,
    stats,
    toast,
    confirm,
    shell,
  } = UI;
  const wait = () => new Promise((resolve) => setTimeout(resolve, 650));
  function skillSuggestions(input) {
    if (!input.sport || !input.date || !input.start || !input.end || input.start >= input.end)
      throw Error('Chọn môn, ngày và khoảng giờ hợp lệ.');
    return CC.db.matches
      .filter((m) => {
        const s = CC.find('slots', m.slotId),
          c = CC.courtFor(s);
        return (
          m.status === 'open' &&
          m.playerIds.length < m.capacity &&
          !m.playerIds.includes(CC.me()?.id) &&
          CC.future(s) &&
          CC.sportActive(c?.sportId) &&
          c?.sportId === input.sport &&
          s.date === input.date &&
          s.start >= input.start &&
          s.end <= input.end &&
          !CC.playerBusy(CC.me()?.id, s) &&
          Math.abs(m.level - Number(input.level)) <= Number(input.tolerance)
        );
      })
      .map((m) => {
        const difference = Math.abs(m.level - Number(input.level));
        return {
          id: m.id,
          score: Math.max(40, 100 - difference * 20),
          reason: `Cùng môn ${sport(input.sport)}, khớp khoảng giờ ${input.start}–${input.end}; chênh ${difference} bậc trình độ; còn ${m.capacity - m.playerIds.length} chỗ.`,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
  function history(type, input, result, status) {
    CC.transaction(() =>
      CC.db.aiHistory.unshift({
        id: CC.id('ai'),
        userId: CC.me().id,
        type,
        input,
        result,
        status,
        createdAt: new Date().toISOString(),
      })
    );
  }
  const banner = (title, description) =>
    `<div class="ai-banner"><div class="ai-icon">✧</div><div><span class="eyebrow">AI hỗ trợ · mô phỏng bằng quy tắc</span><h2>${title}</h2><p>${description}</p></div></div>`;
  const loading = () =>
    '<div class="loading" role="status"><span class="spinner"></span>Đang phân tích dữ liệu…</div>';
  const simulation =
    '<details class="demo-details"><summary>Kiểm tra tình huống AI</summary><label class="check mt"><input type="checkbox" name="simulateError">Mô phỏng lỗi xử lý trong lần chạy này</label></details>';
  function skill() {
    const player = CC.find('players', CC.me().id);
    let results = [],
      input = null,
      selected = null;
    shell(
      pageHead('Ghép trận thông minh', 'Tìm người chơi cùng nhịp, cùng thời gian.') +
        banner(
          'Một gợi ý tốt bắt đầu từ bạn',
          'Cho biết lịch rảnh và trình độ để nhận danh sách trận phù hợp, kèm lý do rõ ràng.'
        ) +
        `<div class="two-col"><section><form class="panel" id="skill-form"><h2>Bạn muốn chơi khi nào?</h2><div class="form-grid">${select('Môn thể thao', 'sport', sports('badminton'))}${select('Trình độ của bạn', 'level', levels(player?.levels.badminton || 2))}${field('Ngày chơi', 'date', 'date', CC.date(1), `required min="${CC.date()}"`)}${select('Chênh lệch chấp nhận', 'tolerance', [0, 1, 2, 4].map((n) => option(n, n === 0 ? 'Cùng trình độ' : `Tối đa ${n} bậc`, 1)).join(''))}${field('Từ giờ', 'start', 'time', '08:00', 'required')}${field('Đến giờ', 'end', 'time', '22:00', 'required')}</div>${simulation}<button class="btn mt" id="skill-submit">✧ Tìm trận phù hợp</button></form><section id="ai-result" aria-live="polite">${empty('Sẵn sàng tìm đồng đội?', 'Điền thông tin và bắt đầu ghép trận.')}</section></section><aside><section class="panel"><h3>Gợi ý được tính thế nào?</h3><p class="muted small">Lọc theo môn, ngày, khoảng giờ, chỗ trống và lịch hiện tại của bạn. Sau đó xếp theo độ gần trình độ.</p><div class="divider"></div><p class="small muted">Điểm phù hợp là điểm quy tắc, không phải xác suất AI. Có thể không tìm thấy trận nào.</p></section><section class="panel"><h3>Gợi ý đã lưu</h3><div id="saved-skills"></div></section></aside></div>`
    );
    const saved = () => {
      $('#saved-skills').innerHTML =
        CC.db.aiHistory
          .filter((h) => h.userId === CC.me().id && h.type === 'skill' && h.status === 'saved')
          .slice(0, 8)
          .map(
            (h) =>
              `<p class="small"><a href="player-open-matches.html?id=${esc(h.result.id)}">${esc(CC.find('matches', h.result.id)?.name || 'Trận đã đóng')}</a></p>`
          )
          .join('') || '<p class="small muted">Chưa lưu gợi ý nào.</p>';
    };
    saved();
    const paint = () => {
      $('#ai-result').innerHTML = results.length
        ? `<section class="panel"><div class="panel-title"><h2>${results.length} trận phù hợp</h2><span class="tag">Có giải thích</span></div>${results
            .map((r) => {
              const m = CC.find('matches', r.id);
              return `<article class="panel"><div class="row"><h3>${esc(m.name)}</h3><span class="spacer"></span><span class="tag">${r.score}/100</span></div><p class="small muted">${esc(r.reason)}</p>${Community.opponentCards(m)}<div class="actions">${btn(selected === r.id ? 'Đã chọn' : 'Chấp nhận gợi ý', 'skill-accept', selected === r.id ? 'secondary small' : 'small', `data-id="${r.id}"`)}${link('Xem chi tiết', `player-open-matches.html?id=${r.id}`, 'ghost small')}</div></article>`;
            })
            .join(
              ''
            )}<div class="actions">${btn('Lưu gợi ý đã chọn', 'skill-save', '', selected ? '' : 'disabled')}${btn('Sửa tiêu chí', 'skill-edit', 'secondary')}${btn('Tạo lại', 'skill-again', 'secondary')}${btn('Từ chối', 'skill-reject', 'ghost')}</div></section>`
        : empty(
            'Chưa tìm thấy trận phù hợp',
            'Thử mở rộng khung giờ, đổi ngày hoặc điều chỉnh trình độ.',
            btn('Sửa tiêu chí', 'skill-edit', 'secondary') +
              ' ' +
              link('Tìm trận thủ công', 'player-open-matches.html', 'ghost')
          );
      bindResult();
    };
    function bindResult() {
      const result = $('#ai-result');
      $$('[data-action=skill-accept]', result).forEach(
        (b) =>
          (b.onclick = () => {
            selected = b.dataset.id;
            paint();
          })
      );
      $('[data-action=skill-save]', result)?.addEventListener('click', () => {
        try {
          const r = results.find((r) => r.id === selected);
          if (!r) throw Error('Chọn một gợi ý trước khi lưu.');
          history('skill', input, r, 'saved');
          saved();
          toast('Đã lưu gợi ý. Mở chi tiết trận để xác nhận tham gia.');
        } catch (e) {
          toast(e.message, true);
        }
      });
      $('[data-action=skill-edit]', result)?.addEventListener('click', () => {
        $('[name=sport]').focus();
        $('#skill-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      $('[data-action=skill-again]', result)?.addEventListener('click', () =>
        $('#skill-form').requestSubmit()
      );
      $('[data-action=skill-reject]', result)?.addEventListener('click', () => {
        history('skill', input, results, 'rejected');
        $('#ai-result').innerHTML = empty(
          'Đã bỏ qua gợi ý',
          'Bạn có thể đổi tiêu chí hoặc tìm trận thủ công.',
          link('Tìm trận', 'player-open-matches.html', 'secondary')
        );
      });
    }
    $('[name=sport]').onchange = (e) => {
      $('[name=level]').value = player?.levels[e.target.value] || 1;
    };
    $('#skill-form').onsubmit = async (e) => {
      e.preventDefault();
      input = Object.fromEntries(new FormData(e.currentTarget));
      $('#skill-submit').disabled = true;
      $('#ai-result').innerHTML = loading();
      await wait();
      try {
        if (input.simulateError)
          throw Error(
            'Không thể xử lý yêu cầu lúc này. Tắt mô phỏng lỗi và thử lại, hoặc tìm trận thủ công.'
          );
        results = skillSuggestions(input);
        selected = null;
        paint();
      } catch (err) {
        $('#ai-result').innerHTML =
          `<div class="notice error" role="alert">${esc(err.message)}</div>${btn('Thử lại', 'skill-again', 'secondary')} ${link('Dùng thủ công', 'player-open-matches.html', 'ghost')}`;
        bindResult();
      } finally {
        $('#skill-submit').disabled = false;
      }
    };
  }
  window.AI = { skill, skillSuggestions };
})();
