import { SoundFX } from './sound.js';

export function mountVelocePrism(container) {
  const W = 440;
  const H = 430;
  const COLS = 7;
  const CELL = 52;
  const PAD = (W - COLS * CELL) / 2;
  let launcherX = W / 2;
  const launcherY = H - 24;
  let aimAngle = -Math.PI / 2 - 0.18;
  let aiming = false;
  let wave = 1;
  let sphereCount = 8;
  let score = 0;
  let activeBalls = [];
  let queueCount = 0;
  let fireCooldown = 0;
  let blocks = [];
  let pickups = [];
  let nextStartX = launcherX;
  let firstLanded = false;
  let rafId = null;

  container.innerHTML = `
    <div>
      <div class="hud-bar">
        <div class="hud-metrics">
          <span id="vp-score" class="hud-pill">Score: 0</span>
          <span id="vp-wave" class="hud-pill">Wave 1</span>
          <span id="vp-balls" class="hud-pill">Spheres: 8</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" id="vp-recall">Recall Balls</button>
          <button type="button" class="btn btn-gold" id="vp-restart">Restart</button>
        </div>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="vp-canvas" class="play-canvas" width="${W}" height="${H}" aria-label="Veloce Prism Crystal Rush aim and bounce crystal breaker"></canvas>
      </div>
      <p style="margin:10px 0 0;font-weight:800;color:var(--ink-muted);text-align:center;">Aim with pointer or Left/Right keys and release (or press Space) to fire a crystal cascade!</p>
    </div>
  `;

  const canvas = container.querySelector('#vp-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#vp-score');
  const waveEl = container.querySelector('#vp-wave');
  const ballsEl = container.querySelector('#vp-balls');

  function syncHud() {
    scoreEl.textContent = `Score: ${score}`;
    waveEl.textContent = `Wave ${wave}`;
    ballsEl.textContent = `Spheres: ${sphereCount}`;
  }

  function addWaveRow() {
    blocks.forEach((b) => { b.row++; b.y = 44 + b.row * CELL; });
    pickups.forEach((p) => { p.row++; p.y = 44 + p.row * CELL + CELL / 2; });
    blocks = blocks.filter((b) => b.y + CELL < H - 44);
    pickups = pickups.filter((p) => p.y < H - 44);

    let placedPickup = false;
    for (let c = 0; c < COLS; c++) {
      if (!placedPickup && Math.random() < 0.25) {
        pickups.push({ row: 0, x: PAD + c * CELL + CELL / 2, y: 44 + CELL / 2 });
        placedPickup = true;
      } else if (Math.random() < 0.62) {
        const isLaser = Math.random() < 0.14;
        const hp = wave * 2 + Math.floor(Math.random() * 4);
        blocks.push({
          row: 0,
          x: PAD + c * CELL + 3,
          y: 44 + 3,
          size: CELL - 6,
          hp,
          laser: isLaser,
        });
      }
    }
    if (blocks.filter((b) => b.row === 0).length === 0) {
      blocks.push({ row: 0, x: PAD + 3 * CELL + 3, y: 44 + 3, size: CELL - 6, hp: wave * 2, laser: false });
    }
  }

  function initGame() {
    wave = 1;
    sphereCount = 8;
    score = 0;
    launcherX = W / 2;
    activeBalls = [];
    queueCount = 0;
    blocks = [];
    pickups = [];
    addWaveRow();
    addWaveRow();
    syncHud();
  }

  function fireVolley() {
    if (activeBalls.length > 0 || queueCount > 0) return;
    queueCount = sphereCount;
    fireCooldown = 0;
    firstLanded = false;
    nextStartX = launcherX;
    SoundFX.pop();
  }

  function prismColor(hp) {
    if (hp >= 14) return '#EA580C';
    if (hp >= 7) return '#84CC16';
    return '#10B981';
  }

  function step() {
    if (queueCount > 0) {
      if (fireCooldown <= 0) {
        const speed = 7.4;
        activeBalls.push({ x: launcherX, y: launcherY, vx: Math.cos(aimAngle) * speed, vy: Math.sin(aimAngle) * speed, r: 6 });
        queueCount--;
        fireCooldown = 3;
      } else {
        fireCooldown--;
      }
    }

    for (let bi = activeBalls.length - 1; bi >= 0; bi--) {
      const ball = activeBalls[bi];
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); SoundFX.pop(); }
      if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); SoundFX.pop(); }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); SoundFX.pop(); }

      for (let pi = pickups.length - 1; pi >= 0; pi--) {
        const p = pickups[pi];
        if (Math.hypot(ball.x - p.x, ball.y - p.y) < 16) {
          pickups.splice(pi, 1);
          sphereCount++;
          SoundFX.chime(4);
          syncHud();
        }
      }

      for (let ki = blocks.length - 1; ki >= 0; ki--) {
        const b = blocks[ki];
        const cx = Math.max(b.x, Math.min(ball.x, b.x + b.size));
        const cy = Math.max(b.y, Math.min(ball.y, b.y + b.size));
        const dx = ball.x - cx;
        const dy = ball.y - cy;
        if (dx * dx + dy * dy <= ball.r * ball.r) {
          if (Math.abs(dx) > Math.abs(dy)) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;
          b.hp--;
          score += 10;
          SoundFX.brickHit(score / 10);
          if (b.hp <= 0) {
            const wasLaser = b.laser;
            const by = b.y;
            blocks.splice(ki, 1);
            score += 40;
            if (wasLaser) {
              SoundFX.laser();
              for (let j = blocks.length - 1; j >= 0; j--) {
                if (Math.abs(blocks[j].y - by) < 10) {
                  blocks[j].hp -= 3;
                  if (blocks[j].hp <= 0) blocks.splice(j, 1);
                }
              }
            }
          }
          syncHud();
          break;
        }
      }

      if (ball.y >= launcherY && ball.vy > 0) {
        if (!firstLanded) {
          firstLanded = true;
          nextStartX = Math.max(24, Math.min(W - 24, ball.x));
        }
        activeBalls.splice(bi, 1);
        if (activeBalls.length === 0 && queueCount === 0) {
          launcherX = nextStartX;
          wave++;
          addWaveRow();
          syncHud();
        }
      }
    }

    ctx.fillStyle = '#052E16';
    ctx.fillRect(0, 0, W, H);

    blocks.forEach((b) => {
      ctx.fillStyle = b.laser ? '#06B6D4' : prismColor(b.hp);
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.size, b.size, 8);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.laser ? `*${b.hp}` : `${b.hp}`, b.x + b.size / 2, b.y + b.size / 2 + 6);
    });

    pickups.forEach((p) => {
      ctx.strokeStyle = '#A7F3D0';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ECFDF5';
      ctx.font = '900 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+1', p.x, p.y + 4);
    });

    if (activeBalls.length === 0 && queueCount === 0) {
      let rx = launcherX;
      let ry = launcherY;
      let vx = Math.cos(aimAngle);
      let vy = Math.sin(aimAngle);
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      for (let seg = 0; seg < 2; seg++) {
        let tWall = Infinity;
        if (vx < 0) tWall = Math.min(tWall, (6 - rx) / vx);
        else if (vx > 0) tWall = Math.min(tWall, (W - 6 - rx) / vx);
        const tTop = (20 - ry) / vy;
        const stepT = Math.min(tWall, tTop, 260);
        rx += vx * stepT;
        ry += vy * stepT;
        ctx.lineTo(rx, ry);
        if (tWall <= tTop) vx = -vx;
        else break;
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#34D399';
    ctx.beginPath(); ctx.arc(launcherX, launcherY, 10, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ECFDF5';
    activeBalls.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
    rafId = requestAnimationFrame(step);
  }

  function updateAim(e) {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    const py = (e.clientY - r.top) * (H / r.height);
    const dx = px - launcherX;
    const dy = Math.min(-24, py - launcherY);
    aimAngle = Math.atan2(dy, dx);
    aimAngle = Math.max(-Math.PI + 0.18, Math.min(-0.18, aimAngle));
  }

  canvas.addEventListener('pointerdown', (e) => { aiming = true; updateAim(e); });
  canvas.addEventListener('pointermove', (e) => { if (aiming || activeBalls.length === 0) updateAim(e); });
  canvas.addEventListener('pointerup', () => { if (aiming) { aiming = false; fireVolley(); } });

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') aimAngle = Math.max(-Math.PI + 0.18, aimAngle - 0.08);
    if (e.key === 'ArrowRight') aimAngle = Math.min(-0.18, aimAngle + 0.08);
    if (e.key === ' ') { e.preventDefault(); fireVolley(); }
  };
  window.addEventListener('keydown', onKeyDown);

  container.querySelector('#vp-recall').addEventListener('click', () => {
    activeBalls = [];
    queueCount = 0;
    wave++;
    addWaveRow();
    syncHud();
    SoundFX.pop();
  });
  container.querySelector('#vp-restart').addEventListener('click', () => { SoundFX.pop(); initGame(); });

  initGame();
  step();

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
    }
  };
}
