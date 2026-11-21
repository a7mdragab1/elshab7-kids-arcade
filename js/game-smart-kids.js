import { SoundFX } from './sound.js';

const AR_LETTERS = [
  { char: 'أ', name: 'أَلِف', word: 'أسد', hint: 'Lion', fatha: 'أَ', damma: 'أُ', kasra: 'إِ', icon: '🦁' },
  { char: 'ب', name: 'بَاء', word: 'بطة', hint: 'Duck', fatha: 'بَ', damma: 'بُ', kasra: 'بِ', icon: '🦆' },
  { char: 'ت', name: 'تَاء', word: 'تفاحة', hint: 'Apple', fatha: 'تَ', damma: 'تُ', kasra: 'تِ', icon: '🍎' },
  { char: 'ث', name: 'ثَاء', word: 'ثعلب', hint: 'Fox', fatha: 'ثَ', damma: 'ثُ', kasra: 'ثِ', icon: '🦊' },
  { char: 'ج', name: 'جِيم', word: 'جمل', hint: 'Camel', fatha: 'جَ', damma: 'جُ', kasra: 'جِ', icon: '🐪' },
  { char: 'ح', name: 'حَاء', word: 'حصان', hint: 'Horse', fatha: 'حَ', damma: 'حُ', kasra: 'حِ', icon: '🐴' },
  { char: 'د', name: 'دَال', word: 'دب', hint: 'Bear', fatha: 'دَ', damma: 'دُ', kasra: 'دِ', icon: '🐻' },
  { char: 'ر', name: 'رَاء', word: 'رمان', hint: 'Pomegranate', fatha: 'رَ', damma: 'رُ', kasra: 'رِ', icon: '🌺' },
  { char: 'س', name: 'سِين', word: 'سمكة', hint: 'Fish', fatha: 'سَ', damma: 'سُ', kasra: 'سِ', icon: '🐟' },
  { char: 'ش', name: 'شِين', word: 'شمس', hint: 'Sun', fatha: 'شَ', damma: 'شُ', kasra: 'شِ', icon: '☀️' },
  { char: 'ع', name: 'عَيْن', word: 'عصفور', hint: 'Bird', fatha: 'عَ', damma: 'عُ', kasra: 'عِ', icon: '🐦' },
  { char: 'م', name: 'مِيم', word: 'موز', hint: 'Banana', fatha: 'مَ', damma: 'مُ', kasra: 'مِ', icon: '🍌' },
];

const EN_LETTERS = [
  { char: 'A', name: 'Ay', word: 'Apple', icon: '🍎', sound: '/æ/ as in Apple' },
  { char: 'B', name: 'Bee', word: 'Bear', icon: '🐻', sound: '/b/ as in Bear' },
  { char: 'C', name: 'See', word: 'Cat', icon: '🐱', sound: '/k/ as in Cat' },
  { char: 'D', name: 'Dee', word: 'Duck', icon: '🦆', sound: '/d/ as in Duck' },
  { char: 'E', name: 'Ee', word: 'Elephant', icon: '🐘', sound: '/ɛ/ as in Elephant' },
  { char: 'F', name: 'Eff', word: 'Fish', icon: '🐟', sound: '/f/ as in Fish' },
  { char: 'G', name: 'Jee', word: 'Grapes', icon: '🍇', sound: '/g/ as in Grapes' },
  { char: 'L', name: 'Ell', word: 'Lion', icon: '🦁', sound: '/l/ as in Lion' },
  { char: 'M', name: 'Em', word: 'Moon', icon: '🌙', sound: '/m/ as in Moon' },
  { char: 'R', name: 'Are', word: 'Rocket', icon: '🚀', sound: '/r/ as in Rocket' },
  { char: 'S', name: 'Ess', word: 'Sun', icon: '☀️', sound: '/s/ as in Sun' },
  { char: 'T', name: 'Tee', word: 'Tiger', icon: '🐯', sound: '/t/ as in Tiger' },
];

const TRACE_GLYPHS = [
  { id: 'A', label: 'A', strokes: [[[0.2, 0.84], [0.5, 0.16], [0.8, 0.84]], [[0.32, 0.58], [0.68, 0.58]]] },
  { id: 'B', label: 'B', strokes: [[[0.28, 0.16], [0.28, 0.84]], [[0.28, 0.16], [0.64, 0.2], [0.7, 0.34], [0.58, 0.48], [0.28, 0.48]], [[0.28, 0.48], [0.68, 0.52], [0.74, 0.68], [0.62, 0.84], [0.28, 0.84]]] },
  { id: 'S', label: 'S', strokes: [[[0.72, 0.22], [0.46, 0.16], [0.28, 0.28], [0.32, 0.44], [0.68, 0.56], [0.72, 0.72], [0.52, 0.84], [0.26, 0.78]]] },
  { id: 'أ', label: 'أ', strokes: [[[0.5, 0.32], [0.5, 0.84]], [[0.62, 0.15], [0.46, 0.18], [0.58, 0.25], [0.38, 0.26]]] },
  { id: 'ب', label: 'ب', strokes: [[[0.78, 0.44], [0.76, 0.64], [0.5, 0.68], [0.24, 0.64], [0.22, 0.44]], [[0.49, 0.81], [0.51, 0.81]]] },
  { id: '1', label: '1', strokes: [[[0.38, 0.28], [0.52, 0.16], [0.52, 0.84]], [[0.34, 0.84], [0.7, 0.84]]] },
  { id: '2', label: '2', strokes: [[[0.28, 0.3], [0.42, 0.16], [0.66, 0.2], [0.72, 0.38], [0.28, 0.84], [0.74, 0.84]]] },
  { id: '3', label: '3', strokes: [[[0.28, 0.24], [0.54, 0.16], [0.7, 0.3], [0.48, 0.48], [0.72, 0.64], [0.64, 0.82], [0.3, 0.8]]] },
  { id: '١', label: '١', strokes: [[[0.52, 0.16], [0.52, 0.84]]] },
  { id: '٢', label: '٢', strokes: [[[0.68, 0.22], [0.42, 0.22], [0.42, 0.84]]] },
  { id: '٣', label: '٣', strokes: [[[0.24, 0.22], [0.34, 0.34], [0.46, 0.22], [0.58, 0.34], [0.7, 0.22], [0.7, 0.84]]] },
];

const QUIZ_QUESTIONS = [
  { kind: 'count', prompt: 'Count the apples in the orchard!', visual: '🍎 🍎 🍎 🍎 🍎', options: ['3', '5', '6', '4'], answer: '5', hint: 'Count slowly from 1 to 5!' },
  { kind: 'math', prompt: 'Solve the sweet addition puzzle:', visual: '🍪🍪 + 🍪🍪🍪 = ?', options: ['4', '5', '6', '7'], answer: '5', hint: '2 cookies + 3 cookies makes 5!' },
  { kind: 'clock', prompt: 'Clock Academy: What time is shown?', hour: 3, options: ['12:00', '3:00', '6:00', '9:00'], answer: '3:00', hint: 'Short red hand points to 3!' },
  { kind: 'math', prompt: 'Orchard Math Challenge:', visual: '🌟 4 + 4 = ?', options: ['6', '7', '8', '9'], answer: '8', hint: 'Double 4 equals 8!' },
  { kind: 'clock', prompt: 'Clock Academy: What time is shown?', hour: 9, options: ['3:00', '6:00', '9:00', '12:00'], answer: '9:00', hint: 'Short red hand points left to 9!' },
  { kind: 'count', prompt: 'How many golden stars?', visual: '⭐ ⭐ ⭐ ⭐ ⭐ ⭐', options: ['5', '6', '7', '4'], answer: '6', hint: 'Two rows of 3 stars = 6!' },
];

function clockSvgMarkup(hour) {
  const angle = (hour % 12) * 30;
  let marks = '';
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const x = 80 + Math.cos(a) * 58;
    const y = 80 + Math.sin(a) * 58;
    marks += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="900" fill="#1E1B4B">${i}</text>`;
  }
  return `<svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Analog clock showing ${hour} o'clock">
    <circle cx="80" cy="80" r="74" fill="#FFFDF7" stroke="#0369A1" stroke-width="6"/>
    ${marks}
    <line x1="80" y1="80" x2="80" y2="30" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(${angle} 80 80)">
      <line x1="80" y1="80" x2="80" y2="44" stroke="#BE123C" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="80" cy="80" r="6" fill="#B45309"/>
  </svg>`;
}

export function mountSmartKids(container, opts = {}) {
  let disposed = false;
  let activeTab = opts.initialTab || 'phonics';
  let lang = 'ar';
  let letterIdx = 0;
  let glyphIdx = 0;
  let brushColor = '#38BDF8';
  let quizIdx = 0;
  let stars = 0;
  let demoTimer = null;

  container.innerHTML = `
    <div class="sk-root">
      <div class="hud-bar">
        <div class="hud-metrics">
          <span>Smart Kids Playground</span>
          <span class="hud-pill" id="sk-stars">Stars: 0</span>
        </div>
        <span class="hud-pill">AR / EN Learning</span>
      </div>
      <div class="sk-tabs" role="tablist" aria-label="Smart Kids Learning Modes">
        <button type="button" class="tab-btn" role="tab" data-tab="phonics" aria-selected="true">Letters &amp; Phonics</button>
        <button type="button" class="tab-btn" role="tab" data-tab="drawing" aria-selected="false">Letters &amp; Numbers Drawing</button>
        <button type="button" class="tab-btn" role="tab" data-tab="quiz" aria-selected="false">Counting, Math &amp; Clock</button>
      </div>
      <div id="sk-panel-host" tabindex="-1"></div>
    </div>
  `;

  const starsEl = container.querySelector('#sk-stars');
  const hostEl = container.querySelector('#sk-panel-host');
  const tabBtns = [...container.querySelectorAll('[role="tab"]')];

  function addStar(amount = 1) {
    stars += amount;
    starsEl.textContent = `Stars: ${stars}`;
  }

  function clearDemo() {
    if (demoTimer) {
      cancelAnimationFrame(demoTimer);
      demoTimer = null;
    }
  }

  function switchTab(nextTab, moveFocus = false) {
    clearDemo();
    activeTab = nextTab;
    tabBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === nextTab)));
    const render = () => {
      if (activeTab === 'phonics') renderPhonics();
      else if (activeTab === 'drawing') renderDrawing();
      else renderQuiz();
    };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const vt = document.startViewTransition(render);
      if (moveFocus) vt.finished.finally(() => hostEl.focus());
    } else {
      render();
      if (moveFocus) hostEl.focus();
    }
  }

  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => { SoundFX.pop(); switchTab(btn.dataset.tab); });
    btn.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabBtns.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabBtns.length) % tabBtns.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabBtns.length - 1;
      if (next >= 0) {
        e.preventDefault();
        tabBtns[next].focus();
        switchTab(tabBtns[next].dataset.tab);
      }
    });
  });

  function renderPhonics() {
    const list = lang === 'ar' ? AR_LETTERS : EN_LETTERS;
    const item = list[letterIdx % list.length];
    const isAr = lang === 'ar';
    hostEl.innerHTML = `
      <div class="sk-split">
        <div class="sk-panel-box">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            <button type="button" class="btn ${isAr ? 'btn-primary' : 'btn-outline'}" data-lang="ar">Arabic (أ - م)</button>
            <button type="button" class="btn ${!isAr ? 'btn-primary' : 'btn-outline'}" data-lang="en">English (A - T)</button>
          </div>
          <div class="sk-tile-grid" role="group" aria-label="Select a letter">
            ${list.map((it, i) => `<button type="button" class="sk-tile-btn ${i === letterIdx ? 'active' : ''}" data-idx="${i}">${it.char}</button>`).join('')}
          </div>
        </div>
        <div class="sk-hero-glyph" dir="${isAr ? 'rtl' : 'ltr'}">
          <div class="sk-big-char" id="sk-big-letter">${item.char}</div>
          <div class="sk-word-line">${item.icon} ${item.word} <span style="opacity:.75;font-size:.92rem;">(${item.name})</span></div>
          <div style="margin-top:4px;font-size:.9rem;color:var(--ink-muted);">${isAr ? `Example: ${item.hint}` : item.sound}</div>
          <div class="sk-chip-row">
            ${isAr ? `
              <button type="button" class="btn btn-emerald" data-say="${item.fatha}">Fatha: ${item.fatha}</button>
              <button type="button" class="btn btn-primary" data-say="${item.damma}">Damma: ${item.damma}</button>
              <button type="button" class="btn btn-gold" data-say="${item.kasra}">Kasra: ${item.kasra}</button>
            ` : `
              <button type="button" class="btn btn-emerald" data-say="${item.char}">Hear Letter</button>
              <button type="button" class="btn btn-gold" data-say="${item.word}">Hear ${item.word}</button>
            `}
            <button type="button" class="btn btn-outline" data-say="${item.word}">Word: ${item.word}</button>
          </div>
        </div>
      </div>
    `;
    hostEl.querySelectorAll('[data-lang]').forEach((b) => {
      b.addEventListener('click', () => {
        lang = b.dataset.lang;
        letterIdx = 0;
        SoundFX.pop();
        renderPhonics();
      });
    });
    hostEl.querySelectorAll('[data-idx]').forEach((b) => {
      b.addEventListener('click', () => {
        letterIdx = Number(b.dataset.idx);
        const chosen = (lang === 'ar' ? AR_LETTERS : EN_LETTERS)[letterIdx];
        SoundFX.chime(letterIdx % 6);
        SoundFX.speak(`${chosen.char} ${chosen.word}`, lang === 'ar' ? 'ar-SA' : 'en-US');
        addStar(1);
        renderPhonics();
      });
    });
    hostEl.querySelectorAll('[data-say]').forEach((b) => {
      b.addEventListener('click', () => {
        SoundFX.chime(2);
        SoundFX.speak(b.dataset.say, lang === 'ar' ? 'ar-SA' : 'en-US');
      });
    });
  }

  function renderDrawing() {
    const g = TRACE_GLYPHS[glyphIdx % TRACE_GLYPHS.length];
    hostEl.innerHTML = `
      <div class="sk-split">
        <div class="sk-panel-box">
          <div style="font-weight:800;margin-bottom:8px;">Pick a Letter or Number to Trace:</div>
          <div class="sk-tile-grid" style="margin-bottom:14px;">
            ${TRACE_GLYPHS.map((it, i) => `<button type="button" class="sk-tile-btn ${i === glyphIdx ? 'active' : ''}" data-gidx="${i}">${it.label}</button>`).join('')}
          </div>
          <div style="font-weight:800;margin-bottom:6px;">Glowing Ink Color:</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
            <button type="button" class="btn btn-outline" data-ink="#38BDF8" aria-label="Cyan Neon Ink">Cyan</button>
            <button type="button" class="btn btn-outline" data-ink="#FDE047" aria-label="Gold Neon Ink">Gold</button>
            <button type="button" class="btn btn-outline" data-ink="#F472B6" aria-label="Pink Neon Ink">Pink</button>
            <button type="button" class="btn btn-outline" data-ink="#34D399" aria-label="Emerald Neon Ink">Emerald</button>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:800;font-size:.9rem;margin-bottom:6px;">
            <span>Tracing Accuracy</span>
            <span id="sk-trace-pct">0%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" id="sk-trace-bar"></div></div>
          <p id="sk-trace-msg" style="margin:10px 0 0;font-weight:800;color:var(--ink-muted);font-size:.92rem;">Start at the green glowing circle and trace "${g.label}"!</p>
        </div>
        <div>
          <div class="game-canvas-wrap">
            <canvas id="sk-trace-canvas" class="play-canvas" width="380" height="320" aria-label="Interactive tracing canvas for ${g.label}"></canvas>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <button type="button" class="btn btn-outline" id="sk-trace-clear">Clear</button>
            <button type="button" class="btn btn-primary" id="sk-trace-demo">Guide Demo</button>
            <button type="button" class="btn btn-emerald" id="sk-trace-next">Next Character</button>
          </div>
        </div>
      </div>
    `;

    const canvas = hostEl.querySelector('#sk-trace-canvas');
    const ctx = canvas.getContext('2d');
    const pctEl = hostEl.querySelector('#sk-trace-pct');
    const barEl = hostEl.querySelector('#sk-trace-bar');
    const msgEl = hostEl.querySelector('#sk-trace-msg');

    const W = canvas.width;
    const H = canvas.height;
    const userStrokes = [];
    let drawing = false;
    let won = false;

    const samples = [];
    g.strokes.forEach((st) => {
      for (let i = 0; i < st.length - 1; i++) {
        const [x1, y1] = st[i], [x2, y2] = st[i + 1];
        for (let t = 0; t <= 1; t += 0.1) {
          samples.push({ x: (x1 + (x2 - x1) * t) * W, y: (y1 + (y2 - y1) * t) * H, hit: false });
        }
      }
      if (st.length === 1) {
        samples.push({ x: st[0][0] * W, y: st[0][1] * H, hit: false });
      }
    });

    function redraw(demoPoint = null) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let y = 40; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      g.strokes.forEach((st) => {
        ctx.beginPath();
        st.forEach(([nx, ny], idx) => {
          if (idx === 0) ctx.moveTo(nx * W, ny * H);
          else ctx.lineTo(nx * W, ny * H);
        });
        if (st.length === 1) ctx.lineTo(st[0][0] * W + 0.5, st[0][1] * H + 0.5);
        ctx.stroke();
      });

      ctx.save();
      ctx.setLineDash([7, 8]);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3;
      g.strokes.forEach((st) => {
        if (st.length < 2) return;
        ctx.beginPath();
        st.forEach(([nx, ny], idx) => idx === 0 ? ctx.moveTo(nx * W, ny * H) : ctx.lineTo(nx * W, ny * H));
        ctx.stroke();
      });
      ctx.restore();

      const startPt = g.strokes[0][0];
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(startPt[0] * W, startPt[1] * H, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ECFDF5';
      ctx.lineWidth = 3;
      ctx.stroke();

      userStrokes.forEach((path) => {
        if (path.points.length < 1) return;
        ctx.save();
        ctx.strokeStyle = path.color;
        ctx.shadowColor = path.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        path.points.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
        ctx.restore();
      });

      if (demoPoint) {
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(demoPoint.x, demoPoint.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function updateProgress(px, py) {
      let hits = 0;
      for (const s of samples) {
        if (!s.hit && Math.hypot(s.x - px, s.y - py) <= 28) s.hit = true;
        if (s.hit) hits++;
      }
      const pct = Math.min(100, Math.round((hits / Math.max(1, samples.length)) * 100));
      pctEl.textContent = `${pct}%`;
      barEl.style.width = `${pct}%`;
      if (pct >= 75 && !won) {
        won = true;
        addStar(1);
        SoundFX.celebrate();
        msgEl.textContent = `Awesome tracing! You earned a Gold Star for "${g.label}"!`;
      }
    }

    function ptFromEvent(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    }

    canvas.addEventListener('pointerdown', (e) => {
      clearDemo();
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      const pt = ptFromEvent(e);
      userStrokes.push({ color: brushColor, points: [pt] });
      updateProgress(pt.x, pt.y);
      redraw();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pt = ptFromEvent(e);
      userStrokes[userStrokes.length - 1].points.push(pt);
      updateProgress(pt.x, pt.y);
      redraw();
    });

    const stopDraw = () => { drawing = false; };
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);

    hostEl.querySelector('#sk-trace-clear').addEventListener('click', () => {
      clearDemo();
      userStrokes.length = 0;
      samples.forEach((s) => { s.hit = false; });
      won = false;
      pctEl.textContent = '0%';
      barEl.style.width = '0%';
      msgEl.textContent = `Start at the green glowing circle and trace "${g.label}"!`;
      SoundFX.pop();
      redraw();
    });

    hostEl.querySelector('#sk-trace-next').addEventListener('click', () => {
      glyphIdx = (glyphIdx + 1) % TRACE_GLYPHS.length;
      SoundFX.pop();
      renderDrawing();
    });

    hostEl.querySelector('#sk-trace-demo').addEventListener('click', () => {
      clearDemo();
      SoundFX.chime(3);
      let idx = 0;
      const step = () => {
        if (disposed || activeTab !== 'drawing') return;
        if (idx >= samples.length) {
          redraw();
          return;
        }
        redraw(samples[idx]);
        idx++;
        demoTimer = requestAnimationFrame(step);
      };
      step();
    });

    hostEl.querySelectorAll('[data-gidx]').forEach((b) => {
      b.addEventListener('click', () => {
        glyphIdx = Number(b.dataset.gidx);
        SoundFX.pop();
        renderDrawing();
      });
    });

    hostEl.querySelectorAll('[data-ink]').forEach((b) => {
      b.addEventListener('click', () => {
        brushColor = b.dataset.ink;
        SoundFX.pop();
      });
    });

    redraw();
  }

  function renderQuiz() {
    const q = QUIZ_QUESTIONS[quizIdx % QUIZ_QUESTIONS.length];
    hostEl.innerHTML = `
      <div class="sk-panel-box" style="max-width:640px;margin-inline:auto;text-align:center;">
        <div style="font-weight:900;font-size:1.15rem;margin-bottom:10px;">${q.prompt}</div>
        <div style="display:grid;place-items:center;min-height:130px;">
          ${q.kind === 'clock' ? clockSvgMarkup(q.hour) : `<div style="font-size:2.3rem;font-weight:900;letter-spacing:2px;">${q.visual}</div>`}
        </div>
        <div class="quiz-options">
          ${q.options.map((opt) => `<button type="button" class="btn btn-outline" data-ans="${opt}">${opt}</button>`).join('')}
        </div>
        <p id="sk-quiz-fb" style="margin:14px 0 10px;font-weight:800;min-height:1.5em;color:var(--ink-muted);">Tap an answer above!</p>
        <button type="button" class="btn btn-primary" id="sk-quiz-next">Next Question</button>
      </div>
    `;
    const fb = hostEl.querySelector('#sk-quiz-fb');
    let answered = false;
    hostEl.querySelectorAll('[data-ans]').forEach((b) => {
      b.addEventListener('click', () => {
        if (answered) return;
        if (b.dataset.ans === q.answer) {
          answered = true;
          b.className = 'btn btn-emerald';
          fb.textContent = 'Brilliant! +1 Gold Star!';
          fb.style.color = 'var(--emerald)';
          addStar(1);
          SoundFX.celebrate();
        } else {
          b.className = 'btn btn-gold';
          fb.textContent = `Nice try! Hint: ${q.hint}`;
          SoundFX.pop();
        }
      });
    });
    hostEl.querySelector('#sk-quiz-next').addEventListener('click', () => {
      quizIdx = (quizIdx + 1) % QUIZ_QUESTIONS.length;
      SoundFX.pop();
      renderQuiz();
    });
  }

  switchTab(activeTab, false);

  return {
    setTab(tab) { switchTab(tab, false); },
    destroy() {
      disposed = true;
      clearDemo();
    }
  };
}
