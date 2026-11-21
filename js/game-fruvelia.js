import { SoundFX } from './sound.js';

const FRUITS = [
  { name: 'Strawberry', fill: '#E11D48', hi: '#FDA4AF', leaf: '#16A34A', emoji: '🍓' },
  { name: 'Blueberry', fill: '#2563EB', hi: '#93C5FD', leaf: '#22C55E', emoji: '🫐' },
  { name: 'Mango', fill: '#F59E0B', hi: '#FDE68A', leaf: '#15803D', emoji: '🥭' },
  { name: 'Kiwi', fill: '#10B981', hi: '#A7F3D0', leaf: '#065F46', emoji: '🥝' },
  { name: 'Grape', fill: '#7C3AED', hi: '#DDD6FE', leaf: '#16A34A', emoji: '🍇' },
  { name: 'Crown', fill: '#EAB308', hi: '#FEF9C3', leaf: '#B45309', emoji: '👑' },
];

export function mountFruvelia(container) {
  const N = 7;
  const CELL = 56;
  const PAD = 14;
  const SIZE = N * CELL + PAD * 2;
  let score = 0;
  let target = 1200;
  let moves = 18;
  let hammers = 3;
  let hammerActive = false;
  let selected = null;
  let busy = false;
  let rafId = null;
  let board = [];
  let frost = [];
  let specials = [];
  let particles = [];
  let popups = [];

  container.innerHTML = `
    <div>
      <div class="hud-bar">
        <div class="hud-metrics">
          <span id="fr-score" class="hud-pill">Score: 0 / 1200</span>
          <span id="fr-moves" class="hud-pill">Moves: 18</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-gold" id="fr-hammer">Hammer (3)</button>
          <button type="button" class="btn btn-outline" id="fr-restart">New Board</button>
        </div>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="fr-canvas" class="play-canvas" width="${SIZE}" height="${SIZE}" aria-label="Fruvelia Glaze Crown 7 by 7 match-3 fruit puzzle"></canvas>
      </div>
      <p id="fr-status" style="margin:10px 0 0;font-weight:800;color:var(--ink-muted);text-align:center;">Swap two neighboring fruits to match 3 or more! Match 4 for a Rocket, 5 for a Rainbow Bomb.</p>
    </div>
  `;

  const canvas = container.querySelector('#fr-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#fr-score');
  const movesEl = container.querySelector('#fr-moves');
  const hammerBtn = container.querySelector('#fr-hammer');
  const statusEl = container.querySelector('#fr-status');

  function randType() { return Math.floor(Math.random() * FRUITS.length); }

  function initBoard() {
    score = 0;
    moves = 18;
    hammers = 3;
    hammerActive = false;
    selected = null;
    busy = false;
    board = Array.from({ length: N }, () => Array.from({ length: N }, randType));
    frost = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (__, c) => (r >= 2 && r <= 4 && c >= 2 && c <= 4) ? 1 : 0));
    specials = Array.from({ length: N }, () => Array(N).fill(null));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        while ((c >= 2 && board[r][c] === board[r][c - 1] && board[r][c] === board[r][c - 2]) ||
               (r >= 2 && board[r][c] === board[r - 1][c] && board[r][c] === board[r - 2][c])) {
          board[r][c] = randType();
        }
      }
    }
    syncHud();
    statusEl.textContent = 'Swap adjacent glazed fruits to clear frost and hit 1,200 points!';
  }

  function syncHud() {
    scoreEl.textContent = `Score: ${score} / ${target}`;
    movesEl.textContent = `Moves: ${moves}`;
    hammerBtn.textContent = hammerActive ? `Pick Tile (${hammers})` : `Hammer (${hammers})`;
    hammerBtn.className = hammerActive ? 'btn btn-primary' : 'btn btn-gold';
  }

  function findMatches() {
    const groups = [];
    for (let r = 0; r < N; r++) {
      let c = 0;
      while (c < N) {
        let len = 1;
        while (c + len < N && board[r][c + len] === board[r][c]) len++;
        if (len >= 3) groups.push({ cells: Array.from({ length: len }, (_, k) => [r, c + k]), len });
        c += len;
      }
    }
    for (let c = 0; c < N; c++) {
      let r = 0;
      while (r < N) {
        let len = 1;
        while (r + len < N && board[r + len][c] === board[r][c]) len++;
        if (len >= 3) groups.push({ cells: Array.from({ length: len }, (_, k) => [r + k, c]), len });
        r += len;
      }
    }
    return groups;
  }

  function burst(r, c, color) {
    const cx = PAD + c * CELL + CELL / 2;
    const cy = PAD + r * CELL + CELL / 2;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      const spd = 1.6 + Math.random() * 2.5;
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, color });
    }
  }

  async function resolveBoard(combo = 1) {
    busy = true;
    while (true) {
      const groups = findMatches();
      if (!groups.length) break;
      const toClear = new Set();
      let spawnedSpecial = null;
      groups.forEach((g) => {
        if (g.len >= 5) spawnedSpecial = { cell: g.cells[2], kind: 'rainbow' };
        else if (g.len === 4 && !spawnedSpecial) spawnedSpecial = { cell: g.cells[1], kind: 'rocket' };
        g.cells.forEach(([r, c]) => toClear.add(`${r},${c}`));
      });

      [...toClear].forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        if (specials[r][c] === 'rocket') {
          for (let k = 0; k < N; k++) { toClear.add(`${r},${k}`); toClear.add(`${k},${c}`); }
        } else if (specials[r][c] === 'rainbow') {
          const t = board[r][c];
          for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) if (board[rr][cc] === t) toClear.add(`${rr},${cc}`);
        }
      });

      SoundFX.match(combo);
      let gained = 0;
      toClear.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        const f = FRUITS[board[r][c]] || FRUITS[0];
        burst(r, c, f.fill);
        if (frost[r][c] > 0) { frost[r][c]--; gained += 40; }
        board[r][c] = -1;
        specials[r][c] = null;
        gained += 25 * combo;
      });
      if (spawnedSpecial) {
        const [sr, sc] = spawnedSpecial.cell;
        board[sr][sc] = randType();
        specials[sr][sc] = spawnedSpecial.kind;
      }
      score += gained;
      popups.push({ x: SIZE / 2, y: SIZE / 2 - 20, text: combo > 1 ? `ROYAL COMBO x${combo}! +${gained}` : `+${gained}`, life: 1 });
      syncHud();
      await new Promise((r) => setTimeout(r, 220));

      for (let c = 0; c < N; c++) {
        let write = N - 1;
        for (let r = N - 1; r >= 0; r--) {
          if (board[r][c] !== -1) {
            board[write][c] = board[r][c];
            specials[write][c] = specials[r][c];
            if (write !== r) { board[r][c] = -1; specials[r][c] = null; }
            write--;
          }
        }
        for (let r = write; r >= 0; r--) {
          board[r][c] = randType();
          specials[r][c] = null;
        }
      }
      await new Promise((r) => setTimeout(r, 180));
      combo++;
    }
    busy = false;
    if (score >= target) {
      SoundFX.celebrate();
      statusEl.textContent = `Royal Victory! You scored ${score} points and forged the Glaze Crown!`;
    } else if (moves <= 0) {
      statusEl.textContent = `Out of moves! Final score: ${score}. Tap New Board to play again!`;
    }
  }

  async function trySwap(r1, c1, r2, c2) {
    if (busy || moves <= 0) return;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const tmp = board[r1][c1]; board[r1][c1] = board[r2][c2]; board[r2][c2] = tmp;
    const sp = specials[r1][c1]; specials[r1][c1] = specials[r2][c2]; specials[r2][c2] = sp;
    if (!findMatches().length && !specials[r1][c1] && !specials[r2][c2]) {
      SoundFX.pop();
      await new Promise((r) => setTimeout(r, 140));
      const back = board[r1][c1]; board[r1][c1] = board[r2][c2]; board[r2][c2] = back;
      const bsp = specials[r1][c1]; specials[r1][c1] = specials[r2][c2]; specials[r2][c2] = bsp;
      return;
    }
    moves--;
    syncHud();
    await resolveBoard(1);
  }

  function cellFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (SIZE / rect.width) - PAD;
    const y = (e.clientY - rect.top) * (SIZE / rect.height) - PAD;
    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (r < 0 || r >= N || c < 0 || c >= N) return null;
    return [r, c];
  }

  canvas.addEventListener('pointerdown', async (e) => {
    const cell = cellFromPointer(e);
    if (!cell || busy) return;
    const [r, c] = cell;
    if (hammerActive && hammers > 0) {
      hammerActive = false;
      hammers--;
      const f = FRUITS[board[r][c]] || FRUITS[0];
      burst(r, c, f.fill);
      if (frost[r][c] > 0) frost[r][c]--;
      board[r][c] = randType();
      score += 120;
      SoundFX.explosion();
      syncHud();
      await resolveBoard(1);
      return;
    }
    if (!selected) {
      selected = [r, c];
      SoundFX.pop();
    } else if (selected[0] === r && selected[1] === c) {
      selected = null;
    } else if (Math.abs(selected[0] - r) + Math.abs(selected[1] - c) === 1) {
      const [sr, sc] = selected;
      selected = null;
      await trySwap(sr, sc, r, c);
    } else {
      selected = [r, c];
      SoundFX.pop();
    }
  });

  hammerBtn.addEventListener('click', () => {
    if (hammers <= 0 || busy) return;
    hammerActive = !hammerActive;
    SoundFX.pop();
    syncHud();
  });

  container.querySelector('#fr-restart').addEventListener('click', () => {
    SoundFX.pop();
    initBoard();
  });

  function draw() {
    ctx.fillStyle = '#2E1065';
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = PAD + c * CELL;
        const y = PAD + r * CELL;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#4C1D95' : '#5B21B6';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 12);
        ctx.fill();

        if (frost[r][c] > 0) {
          ctx.fillStyle = 'rgba(186, 230, 253, 0.36)';
          ctx.strokeStyle = '#E0F2FE';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(x + 4, y + 4, CELL - 8, CELL - 8, 10);
          ctx.fill();
          ctx.stroke();
        }

        if (selected && selected[0] === r && selected[1] === c) {
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.roundRect(x + 3, y + 3, CELL - 6, CELL - 6, 11);
          ctx.stroke();
        }

        const t = board[r][c];
        if (t >= 0) {
          const f = FRUITS[t];
          const cx = x + CELL / 2;
          const cy = y + CELL / 2;
          ctx.fillStyle = f.fill;
          ctx.beginPath();
          ctx.arc(cx, cy + 2, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = f.hi;
          ctx.beginPath();
          ctx.arc(cx - 5, cy - 4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = f.leaf;
          ctx.beginPath();
          ctx.ellipse(cx + 3, cy - 16, 6, 3, -0.4, 0, Math.PI * 2);
          ctx.fill();

          if (specials[r][c] === 'rocket') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy); ctx.stroke();
          } else if (specials[r][c] === 'rainbow') {
            ctx.strokeStyle = '#FDE047';
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
    }

    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.05;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    popups = popups.filter((p) => p.life > 0);
    popups.forEach((p) => {
      p.y -= 0.7; p.life -= 0.025;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = '#FDE047';
      ctx.font = '900 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  initBoard();
  draw();

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
    }
  };
}
