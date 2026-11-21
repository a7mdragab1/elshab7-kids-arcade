import { SoundFX } from './sound.js';

export function mountAmberForge(container) {
  const W = 520;
  const H = 420;
  let score = 0;
  let lives = 3;
  let breachActive = false;
  let paused = false;
  let rafId = null;
  let paddleX = W / 2;
  let paddleW = 94;
  let orbs = [];
  let bricks = [];
  let pods = [];
  let shards = [];
  const keys = { left: false, right: false };

  container.innerHTML = `
    <div>
      <div class="hud-bar">
        <div class="hud-metrics">
          <span id="af-score" class="hud-pill">Score: 0</span>
          <span id="af-orbs" class="hud-pill">Orbs: 1</span>
          <span id="af-lives" class="hud-pill">Shields: 3</span>
          <span id="af-breach" class="hud-pill">Standard Forge</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-outline" id="af-pause">Pause</button>
          <button type="button" class="btn btn-gold" id="af-restart">Restart</button>
        </div>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="af-canvas" class="play-canvas" width="${W}" height="${H}" aria-label="Amber Forge Shard Swarm brick breaker canvas"></canvas>
      </div>
      <p style="margin:10px 0 0;font-weight:800;color:var(--ink-muted);text-align:center;">Move mouse, drag, or use Left/Right keys to steer the Hover-Anvil! Punch through side tunnels for BREACH x2!</p>
    </div>
  `;

  const canvas = container.querySelector('#af-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#af-score');
  const orbsEl = container.querySelector('#af-orbs');
  const livesEl = container.querySelector('#af-lives');
  const breachEl = container.querySelector('#af-breach');
  const pauseBtn = container.querySelector('#af-pause');

  function resetOrb() {
    orbs = [{ x: paddleX, y: H - 46, vx: 3.1, vy: -3.7, r: 7 }];
  }

  function buildStage() {
    bricks = [];
    pods = [];
    shards = [];
    breachActive = false;
    paddleW = 94;
    const cols = 8;
    const bw = 54;
    const bh = 20;
    const startX = (W - cols * (bw + 4)) / 2;
    const palette = ['#F59E0B', '#EC4899', '#10B981', '#06B6D4', '#8B5CF6'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < cols; c++) {
        // Leave outer side tunnels open on row 2 for upper-cavity breaches
        if (r === 2 && (c === 0 || c === cols - 1)) continue;
        const isWall = r === 2 && c >= 2 && c <= 5;
        const isDetonator = r === 1 && (c === 2 || c === 5);
        const isPod = (r === 3 && (c === 1 || c === 6)) || (r === 0 && c === 3);
        bricks.push({
          x: startX + c * (bw + 4),
          y: 44 + r * (bh + 6),
          w: bw,
          h: bh,
          hp: isWall ? 3 : 1,
          wall: isWall,
          detonator: isDetonator,
          pod: isPod,
          color: isWall ? '#475569' : isDetonator ? '#EF4444' : palette[(r + c) % palette.length],
        });
      }
    }
    resetOrb();
    syncHud();
  }

  function syncHud() {
    scoreEl.textContent = `Score: ${score}`;
    orbsEl.textContent = `Orbs: ${orbs.length}`;
    livesEl.textContent = `Shields: ${lives}`;
    breachEl.textContent = breachActive ? 'BREACH x2!' : 'Standard Forge';
  }

  function spawnShards(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      shards.push({ x, y, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6, life: 1, color });
    }
  }

  function step() {
    if (!paused) {
      if (keys.left) paddleX -= 7;
      if (keys.right) paddleX += 7;
      paddleX = Math.max(paddleW / 2 + 6, Math.min(W - paddleW / 2 - 6, paddleX));

      orbs.forEach((o) => {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x - o.r < 0) { o.x = o.r; o.vx = Math.abs(o.vx); SoundFX.pop(); }
        if (o.x + o.r > W) { o.x = W - o.r; o.vx = -Math.abs(o.vx); SoundFX.pop(); }
        if (o.y - o.r < 0) {
          o.y = o.r;
          o.vy = Math.abs(o.vy);
          if (!breachActive) { breachActive = true; SoundFX.celebrate(); syncHud(); }
        }
        if (o.y + o.r >= H - 30 && o.y - o.r <= H - 16 && o.vy > 0 && Math.abs(o.x - paddleX) <= paddleW / 2 + o.r) {
          const hitNorm = (o.x - paddleX) / (paddleW / 2);
          o.vx = hitNorm * 4.4;
          o.vy = -Math.max(3.2, Math.abs(o.vy));
          o.y = H - 31 - o.r;
          SoundFX.pop();
        }
        for (let i = bricks.length - 1; i >= 0; i--) {
          const b = bricks[i];
          if (o.x + o.r > b.x && o.x - o.r < b.x + b.w && o.y + o.r > b.y && o.y - o.r < b.y + b.h) {
            o.vy = -o.vy;
            b.hp--;
            if (b.hp <= 0) {
              bricks.splice(i, 1);
              score += breachActive ? 80 : 40;
              spawnShards(b.x + b.w / 2, b.y + b.h / 2, b.color);
              SoundFX.brickHit(score / 40);
              if (b.pod) pods.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, kind: Math.random() < 0.6 ? 'tri' : 'wide' });
              if (b.detonator) {
                SoundFX.explosion();
                for (let j = bricks.length - 1; j >= 0; j--) {
                  const nb = bricks[j];
                  if (Math.hypot(nb.x - b.x, nb.y - b.y) < 88) {
                    spawnShards(nb.x + nb.w / 2, nb.y + nb.h / 2, nb.color);
                    bricks.splice(j, 1);
                    score += 50;
                  }
                }
              }
            } else {
              SoundFX.pop();
            }
            syncHud();
            break;
          }
        }
      });

      orbs = orbs.filter((o) => o.y < H + 12);
      if (orbs.length === 0) {
        lives--;
        if (lives <= 0) {
          lives = 3;
          score = 0;
          buildStage();
        } else {
          resetOrb();
          syncHud();
        }
      }

      if (bricks.length === 0) {
        SoundFX.celebrate();
        score += 300;
        buildStage();
      }

      for (let i = pods.length - 1; i >= 0; i--) {
        const p = pods[i];
        p.y += 2.2;
        if (Math.abs(p.x - paddleX) <= paddleW / 2 + 12 && p.y >= H - 36 && p.y <= H - 10) {
          SoundFX.match(3);
          if (p.kind === 'tri' && orbs.length < 6) {
            const base = orbs[0] || { x: paddleX, y: H - 50, vx: 2.5, vy: -3.5, r: 7 };
            orbs.push({ x: base.x, y: base.y, vx: -3.4, vy: -3.5, r: 7 });
            orbs.push({ x: base.x, y: base.y, vx: 3.4, vy: -3.5, r: 7 });
          } else {
            paddleW = Math.min(148, paddleW + 26);
          }
          pods.splice(i, 1);
          syncHud();
        } else if (p.y > H + 14) {
          pods.splice(i, 1);
        }
      }
    }

    ctx.fillStyle = '#140F0A';
    ctx.fillRect(0, 0, W, H);

    bricks.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fill();
      if (b.detonator) {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, 5, 0, Math.PI * 2); ctx.fill();
      } else if (b.pod) {
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    pods.forEach((p) => {
      ctx.fillStyle = p.kind === 'tri' ? '#F59E0B' : '#06B6D4';
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = '900 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.kind === 'tri' ? 'x3' : 'W', p.x, p.y + 4);
    });

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(paddleX - paddleW / 2, H - 28, paddleW, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(paddleX - paddleW / 3, H - 25, (paddleW * 2) / 3, 4);

    orbs.forEach((o) => {
      ctx.fillStyle = breachActive ? '#38BDF8' : '#FDE047';
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
    });

    shards = shards.filter((s) => s.life > 0);
    shards.forEach((s) => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.05;
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
    });
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function movePointer(e) {
    const r = canvas.getBoundingClientRect();
    paddleX = Math.max(paddleW / 2 + 6, Math.min(W - paddleW / 2 - 6, (e.clientX - r.left) * (W / r.width)));
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  };
  const onKeyUp = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  };

  canvas.addEventListener('pointermove', movePointer);
  canvas.addEventListener('pointerdown', movePointer);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    SoundFX.pop();
  });
  container.querySelector('#af-restart').addEventListener('click', () => {
    score = 0; lives = 3; paused = false; pauseBtn.textContent = 'Pause';
    SoundFX.pop();
    buildStage();
  });

  buildStage();
  step();

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
