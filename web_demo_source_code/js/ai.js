/* AI mô phỏng: các quy tắc có thể đọc, kiểm thử và giải thích. Không gọi LLM. */
(() => {
  'use strict';

  const {
    $,
    $$,
    esc,
    btn,
    link,
    day,
    sport,
    level,
    option,
    sports,
    levels,
    empty,
    toast,
    confirm,
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
  function balanceTeams(event, variant = 0) {
    const players = event.playerIds.map((id) => CC.find('players', id));
    if (players.length < 2)
      throw Error(
        'Cần ít nhất 2 người chơi để chia thành hai đội. Hãy bổ sung danh sách hoặc dùng thủ công.'
      );
    if (
      players.some((p) => !p || p.status !== 'active' || !Number.isFinite(p.levels[event.sportId]))
    )
      throw Error('Không đủ dữ liệu trình độ theo môn. Cập nhật hồ sơ hoặc chia thủ công.');
    const ranked = players
      .map((p, i) => ({
        p,
        index: (i + variant) % players.length,
      }))
      .sort((a, b) => b.p.levels[event.sportId] - a.p.levels[event.sportId] || a.index - b.index)
      .map((x) => x.p);
    const teams = {
        a: [],
        b: [],
      },
      sums = {
        a: 0,
        b: 0,
      },
      cap = Math.ceil(ranked.length / 2);
    ranked.forEach((p) => {
      let team = sums.a === sums.b ? (variant % 2 ? 'b' : 'a') : sums.a < sums.b ? 'a' : 'b';
      if (teams[team].length >= cap) team = team === 'a' ? 'b' : 'a';
      teams[team].push(p.id);
      sums[team] += p.levels[event.sportId];
    });
    return teams;
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
  const loading = () =>
    '<div class="loading" role="status"><span class="spinner"></span>Đang phân tích dữ liệu…</div>';
  function skill() {
    const player = CC.find('players', CC.me().id);
    let results = [],
      input = null,
      selected = null;
    Views.update('ai-skill', {
      sportOptions: () => sports('badminton'),
      levelOptions: () => levels(player?.levels.badminton || 2),
      selectedDate: () => esc(CC.date(1)),
      dateAttributes: () => `required min="${CC.date()}"`,
    });
    const saved = () => {
      $('#saved-skills').innerHTML =
        CC.db.aiHistory
          .filter((h) => h.userId === CC.me().id && h.type === 'skill' && h.status === 'saved')
          .slice(0, 8)
          .map(
            (h) =>
              `<p class="small"><a href="match-detail.html?id=${esc(h.result.id)}">${esc(CC.find('matches', h.result.id)?.name || 'Trận đã đóng')}</a></p>`
          )
          .join('') || '<p class="small muted">Chưa lưu gợi ý nào.</p>';
    };
    saved();
    const paint = () => {
      $('#ai-result').innerHTML = results.length
        ? `<section class="panel"><div class="panel-title"><h2>${results.length} trận phù hợp</h2><span class="tag">Có giải thích</span></div>${results
            .map((r) => {
              const m = CC.find('matches', r.id);
              return `<article class="panel"><div class="row"><h3>${esc(m.name)}</h3><span class="spacer"></span><span class="tag">${r.score}/100</span></div><p class="small muted">${esc(r.reason)}</p>${Community.opponentCards(m)}<div class="actions">${btn(selected === r.id ? 'Đã chọn' : 'Chấp nhận gợi ý', 'skill-accept', selected === r.id ? 'secondary small' : 'small', `data-id="${r.id}"`)}${link('Xem chi tiết', `match-detail.html?id=${r.id}`, 'ghost small')}</div></article>`;
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
        $('#skill-form').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
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
  function teams() {
    const es = Organizer.ownEvents().filter((e) => e.status === 'open'),
      eventId = new URLSearchParams(location.search).get('event');
    const event = es.find((e) => e.id === eventId) || es[0];
    let draft = event?.teams ? structuredClone(event.teams) : null,
      variant = 0,
      accepted = false;
    Views.update('ai-teams', {
      eventOptions: () =>
        Organizer.ownEvents()
          .filter((e) => e.status === 'open')
          .map((e) => option(e.id, e.name, event?.id))
          .join('') || option('', 'Chưa có sự kiện'),
      eventSummary: () =>
        event
          ? `${event.playerIds.length} người · ${sport(event.sportId)} · ${day(event.date)}`
          : 'Chưa có sự kiện đang mở.',
      hasEvent: () => event,
      rosterUrl: () => esc(`organizer-player-roster.html?event=${event.id}`),
      notEnoughPlayers: () => event && event.playerIds.length < 2,
      suggestDisabled: () => (event?.playerIds.length >= 2 ? '' : 'disabled'),
      manualDisabled: () => (event?.playerIds.length >= 2 ? '' : 'disabled'),
    });
    const sum = (ids) =>
      ids.reduce((n, id) => n + (CC.find('players', id)?.levels[event?.sportId] || 0), 0);
    const paint = () => {
      if (!draft) {
        $('#team-result').innerHTML = empty(
          'Đội hình đang chờ bạn',
          'Chọn sự kiện rồi để AI đề xuất, hoặc tự chia đội.'
        );
        return;
      }
      const diff = Math.abs(sum(draft.a) - sum(draft.b));
      $('#team-result').innerHTML =
        `<section class="panel"><div class="panel-title"><h2>Đội hình ${accepted ? 'đã chấp nhận' : 'đề xuất'}</h2><span class="tag ${diff > 2 ? 'pending' : ''}">Chênh ${diff} điểm trình độ</span></div><p class="muted small">Sắp xếp trình độ từ cao xuống thấp, ưu tiên đội có tổng điểm thấp hơn và còn chỗ. Kết quả là gợi ý gần đúng; chưa xét phong độ hoặc kinh nghiệm đánh đôi.</p>${diff > 2 ? '<div class="notice warning">Độ chênh còn cao. Hãy điều chỉnh thành viên hoặc trao đổi với người chơi trước khi chốt.</div>' : ''}<div class="team-grid">${[
          'a',
          'b',
        ]
          .map(
            (t) =>
              `<div class="team ${t}"><div class="row"><h3>Đội ${t.toUpperCase()}</h3><span class="spacer"></span><span class="tag">${draft[t].length} người · ${sum(draft[t])} điểm</span></div>${
                draft[t]
                  .map((id) => {
                    const p = CC.find('players', id);
                    return `<div class="player-row"><span class="avatar">${esc(p?.name.slice(0, 1))}</span><div><strong>${esc(p?.name)}</strong><div class="small muted">${level(p?.levels[event.sportId])}</div></div>${btn('Chuyển ⇄', 'move-team', 'secondary small', `data-id="${id}" data-team="${t}" aria-label="Chuyển ${esc(p?.name)} sang đội ${t === 'a' ? 'B' : 'A'}"`)}</div>`;
                  })
                  .join('') || '<p class="muted">Chưa có người.</p>'
              }</div>`
          )
          .join(
            ''
          )}</div><div class="actions mt">${btn(accepted ? 'Đã chấp nhận' : 'Chấp nhận', 'accept-teams', 'secondary')}${btn('Lưu đội hình', 'save-teams')}${btn('Tạo lại', 'again-teams', 'secondary')}${btn('Từ chối', 'reject-teams', 'ghost')}${event.teams ? btn('Xóa đội hình đã lưu', 'clear-teams', 'danger') : ''}</div><p class="small muted mt">Dùng nút Chuyển ⇄ để sửa đội. Dữ liệu chỉ thay đổi khi bấm Lưu đội hình.</p></section>`;
      $$('[data-action=move-team]').forEach(
        (b) =>
          (b.onclick = () => {
            const t = b.dataset.team,
              id = b.dataset.id;
            draft[t] = draft[t].filter((x) => x !== id);
            draft[t === 'a' ? 'b' : 'a'].push(id);
            accepted = false;
            paint();
          })
      );
      $('[data-action=accept-teams]').onclick = () => {
        accepted = true;
        paint();
        toast('Đã chấp nhận. Bấm Lưu đội hình để áp dụng.');
      };
      $('[data-action=save-teams]').onclick = () => {
        try {
          CC.saveTeams(event.id, structuredClone(draft));
          history(
            'teams',
            {
              eventId: event.id,
            },
            draft,
            'saved'
          );
          accepted = true;
          paint();
          toast('Đã lưu đội hình cho sự kiện.');
        } catch (err) {
          toast(err.message, true);
        }
      };
      $('[data-action=again-teams]').onclick = () => $('#team-form').requestSubmit();
      $('[data-action=reject-teams]').onclick = () => {
        history(
          'teams',
          {
            eventId: event.id,
          },
          draft,
          'rejected'
        );
        draft = null;
        accepted = false;
        paint();
      };
      $('[data-action=clear-teams]')?.addEventListener('click', () =>
        confirm(
          'Xóa đội hình đã lưu?',
          'Danh sách người chơi trong sự kiện được giữ nguyên.',
          () => {
            CC.requireRole('organizer');
            CC.transaction(() => (event.teams = null));
            draft = null;
            paint();
            toast('Đã xóa đội hình.');
          }
        )
      );
    };
    paint();
    $('[name=event]').onchange = (e) =>
      (location.href = 'organizer-team-lineup.html?event=' + e.target.value);
    $('[data-action=manual-teams]').onclick = () => {
      if (event.playerIds.length < 2) {
        toast('Cần ít nhất 2 người chơi.', true);
        return;
      }
      draft = {
        a: event.playerIds.filter((_, i) => i % 2 === 0),
        b: event.playerIds.filter((_, i) => i % 2 === 1),
      };
      accepted = false;
      paint();
    };
    $('#team-form').onsubmit = async (e) => {
      e.preventDefault();
      $('#team-submit').disabled = true;
      $('#team-result').innerHTML = loading();
      await wait();
      try {
        draft = balanceTeams(event, variant++);
        accepted = false;
        paint();
      } catch (err) {
        $('#team-result').innerHTML =
          `<div class="notice error" role="alert">${esc(err.message)}</div><p class="muted">Bạn có thể chỉnh danh sách và thử lại, hoặc dùng nút Chia thủ công phía trên.</p>`;
      } finally {
        $('#team-submit').disabled = false;
      }
    };
  }
  window.AI = {
    skill,
    teams,
    skillSuggestions,
    balanceTeams,
  };
})();
