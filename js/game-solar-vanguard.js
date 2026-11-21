import { SoundFX } from './sound.js';

export function mountSolarVanguard(container) {
  const W = 440;
  const H = 430;
  let shipX = W / 2;
  let shipY = H - 56;
  let targetX = W / 2;
  let score = 0;
  let combo = 0;
  let nova = 40;
  let weaponLevel = 1;
  let wave = 1;
  let frame = 0;
  let rafId = null;
  let bullets = [];
  let enemies = [];
  let enemyShots = [];
  let pods = [];
  let sparks = [];
  let novaWave = 0;
  const stars = Array.from({ length: 42 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 1 + Math.random() * 2 }));
  const keys = { left: false, right: false };

  container.innerHTML = `
    <div>
      <div class="hud-bar">
        <div class="hud-metrics">
          <span id="sv-score" class="hud-pill">Score: 0</span>
          <span id="sv-combo" class="hud-pill">Combo x1</span>
          <span id="sv-wave" class="hud-pill">Sector 1</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-gold" id="sv-nova">Solar Nova (40%)</button>
          <button type="button" class="btn btn-outline" id="sv-restart">Restart</button>
        </div>
      </div>
      <div class="game-canvas-wrap">
        <canvas id="sv-canvas" class="play-canvas" width="${W}" height="${H}" aria-label="Solar Vanguard Cyber Armada vertical space shooter"></canvas>
      </div>
      <p style="margin:10px 0 0;font-weight:800;color:var(--ink-muted);text-align:center;">Drag, move pointer, or use Arrow keys to fly! Auto-fire engages Cyber-Talon drones; press Space or tap Solar Nova when 100%!</p>
    </div>
  `;

  const canvas = container.querySelector('#sv-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#sv-score');
  const comboEl = container.querySelector('#sv-combo');
  const waveEl = container.querySelector('#sv-wave');
  const novaBtn = container.querySelector('#sv-nova');

  function syncHud() {
    scoreEl.textContent = `Score: ${score}`;
    comboEl.textContent = combo >= 6 ? `FEVER x2 (${combo})` : `Combo ${combo}`;
    waveEl.textContent = `Sector ${wave}`;
    novaBtn.textContent = nova >= 100 ? 'UNLEASH NOVA!' : `Solar Nova (${Math.min(100, nova)}%)`;
    novaBtn.className = nova >= 100 ? 'btn btn-primary' : 'btn btn-gold';
  }

  function spawnWave() {
    enemies = [];
    const count = 4 + Math.min(wave, 4);
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: 52 + ((W - 104) * i) / Math.max(1, count - 1),
        y: 52 + (i % 2) * 38,
        hp: 2 + Math.floor(wave / 2),
        maxHp: 2 + Math.floor(wave / 2),
        phase: i * 0.9,
        boss: false,
      });
    }
    if (wave % 2 === 0) {
      enemies.push({ x: W / 2, y: 46, hp: 14 + wave * 2, maxHp: 14 + wave * 2, phase: 0, boss: true });
    }
    syncHud();
  }

  function triggerNova() {
    if (nova < 100) return;
    nova = 0;
    novaWave = 1;
    enemyShots = [];
    SoundFX.celebrate();
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].hp -= 6;
      if (enemies[i].hp <= 0) {
        score += enemies[i].boss ? 300 : 80;
        enemies.splice(i, 1);
      }
    }
    syncHud();
  }

  function step() {
    frame++;
    if (keys.left) targetX -= 6.5;
    if (keys.right) targetX += 6.5;
    targetX = Math.max(24, Math.min(W - 24, targetX));
    shipX += (targetX - shipX) * 0.25;

    if (frame % 9 === 0) {
      bullets.push({ x: shipX, y: shipY - 18, vx: 0, vy: -9 });
      if (weaponLevel >= 2) {
        bullets.push({ x: shipX - 12, y: shipY - 12, vx: -1.3, vy: -8.6 });
        bullets.push({ x: shipX + 12, y: shipY - 12, vx: 1.3, vy: -8.6 });
      }
      if (weaponLevel >= 3) {
        bullets.push({ x: shipX - 18, y: shipY - 8, vx: -2.6, vy: -8.2 });
        bullets.push({ x: shipX + 18, y: shipY - 8, vx: 2.6, vy: -8.2 });
      }
      if (frame % 18 === 0) SoundFX.laser();
    }

    bullets = bullets.filter((b) => {
      b.x += b.vx; b.y += b.vy;
      return b.y > -20;
    });

    enemies.forEach((e) => {
      e.x += Math.sin(frame * 0.04 + e.phase) * (e.boss ? 1.5 : 1.1);
      if (frame % (e.boss ? 42 : 95) === 0 && Math.random() < 0.55) {
        enemyShots.push({ x: e.x, y: e.y + 16, vy: 3.1 + Math.min(wave * 0.15, 1.5) });
      }
    });

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        const hitR = e.boss ? 30 : 18;
        if (Math.hypot(b.x - e.x, b.y - e.y) <= hitR) {
          bullets.splice(bi, 1);
          e.hp--;
          sparks.push({ x: b.x, y: b.y, life: 1, color: '#38BDF8' });
          if (e.hp <= 0) {
            enemies.splice(ei, 1);
            combo++;
            nova = Math.min(100, nova + 12);
            score += (e.boss ? 250 : 60) * (combo >= 6 ? 2 : 1);
            SoundFX.explosion();
            if (Math.random() < 0.28) pods.push({ x: e.x, y: e.y });
            for (let k = 0; k < 8; k++) {
              sparks.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1, color: '#FDE047' });
            }
            syncHud();
          }
          break;
        }
      }
    }

    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.y += s.vy;
      if (Math.hypot(s.x - shipX, s.y - shipY) < 16) {
        enemyShots.splice(i, 1);
        combo = 0;
        weaponLevel = Math.max(1, weaponLevel - 1);
        SoundFX.explosion();
        syncHud();
      } else if (s.y > H + 12) {
        enemyShots.splice(i, 1);
      }
    }

    for (let i = pods.length - 1; i >= 0; i--) {
      const p = pods[i];
      p.y += 2.3;
      if (Math.hypot(p.x - shipX, p.y - shipY) < 24) {
        pods.splice(i, 1);
        weaponLevel = Math.min(3, weaponLevel + 1);
        nova = Math.min(100, nova + 20);
        SoundFX.match(4);
        syncHud();
      } else if (p.y > H + 14) {
        pods.splice(i, 1);
      }
    }

    if (enemies.length === 0) {
      wave++;
      spawnWave();
    }

    ctx.fillStyle = '#090D1E';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#E0E7FF';
    stars.forEach((st) => {
      st.y += st.s;
      if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
      ctx.fillRect(st.x, st.y, st.s, st.s);
    });

    if (novaWave > 0) {
      ctx.strokeStyle = `rgba(253, 224, 71, ${1 - novaWave / 24})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(shipX, shipY, novaWave * 22, 0, Math.PI * 2);
      ctx.stroke();
      novaWave++;
      if (novaWave > 24) novaWave = 0;
    }

    ctx.fillStyle = '#38BDF8';
    bullets.forEach((b) => { ctx.fillRect(b.x - 2.5, b.y - 8, 5, 14); });

    ctx.fillStyle = '#FB7185';
    enemyShots.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill(); });

    pods.forEach((p) => {
      ctx.fillStyle = '#10B981';
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = '900 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P+', p.x, p.y + 4);
    });

    enemies.forEach((e) => {
      ctx.fillStyle = e.boss ? '#BE123C' : '#7C3AED';
      ctx.beginPath();
      if (e.boss) {
        ctx.roundRect(e.x - 32, e.y - 18, 64, 34, 10);
      } else {
        ctx.moveTo(e.x, e.y + 16);
        ctx.lineTo(e.x - 16, e.y - 12);
        ctx.lineTo(e.x + 16, e.y - 12);
        ctx.closePath();
      }
      ctx.fill();
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(e.x - 14, e.y - 24, 28 * (e.hp / e.maxHp), 4);
    });

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(shipX, shipY - 22);
    ctx.lineTo(shipX - 18, shipY + 14);
    ctx.lineTo(shipX, shipY + 6);
    ctx.lineTo(shipX + 18, shipY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(shipX, shipY - 2, 5, 0, Math.PI * 2); ctx.fill();

    sparks = sparks.filter((s) => s.life > 0);
    sparks.forEach((s) => {
      s.x += s.vx || 0; s.y += s.vy || 0; s.life -= 0.08;
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function pointerMove(e) {
    const r = canvas.getBoundingClientRect();
    targetX = Math.max(24, Math.min(W - 24, (e.clientX - r.left) * (W / r.width)));
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ') { e.preventDefault(); triggerNova(); }
  };
  const onKeyUp = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  };

  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerdown', pointerMove);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  novaBtn.addEventListener('click', triggerNova);
  container.querySelector('#sv-restart').addEventListener('click', () => {
    score = 0; combo = 0; nova = 40; weaponLevel = 1; wave = 1; enemyShots = []; bullets = []; pods = [];
    SoundFX.pop();
    spawnWave();
  });

  spawnWave();
  step();

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
