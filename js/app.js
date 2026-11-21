import { SoundFX } from './sound.js';
import { mountSmartKids } from './game-smart-kids.js';
import { mountFruvelia } from './game-fruvelia.js';
import { mountAmberForge } from './game-amberforge.js';
import { mountSolarVanguard } from './game-solar-vanguard.js';
import { mountVelocePrism } from './game-veloce-prism.js';

const GAMES = {
  smart_kids: {
    id: 'smart_kids',
    title: 'Smart Kids: Learning Games',
    url: 'https://play.google.com/store/apps/details?id=com.elshab7.smart_kids_game',
    mount: (el) => mountSmartKids(el, { initialTab: 'drawing' }),
  },
  fruvelia: {
    id: 'fruvelia',
    title: 'Fruvelia: Glaze Crown',
    url: 'https://play.google.com/store/apps/details?id=com.elshab7.fruvelia',
    mount: mountFruvelia,
  },
  amberforge: {
    id: 'amberforge',
    title: 'Amber Forge: Shard Swarm',
    url: 'https://play.google.com/store/apps/details?id=com.elshab7.amberforge',
    mount: mountAmberForge,
  },
  solar_vanguard: {
    id: 'solar_vanguard',
    title: 'Solar Vanguard: Cyber Armada',
    url: 'https://play.google.com/store/apps/details?id=com.elshab7.solar_vanguard',
    mount: mountSolarVanguard,
  },
  veloce_prism: {
    id: 'veloce_prism',
    title: 'Veloce Prism: Crystal Rush',
    url: 'https://play.google.com/store/apps/details?id=com.elshab7.veloce_prism',
    mount: mountVelocePrism,
  },
};

const dialog = document.getElementById('arcade-dialog');
const modalTitle = document.getElementById('arcade-modal-title');
const modalStoreLink = document.getElementById('arcade-store-link');
const modalStage = document.getElementById('arcade-stage');
const modalCloseBtn = document.getElementById('arcade-close-btn');
const modalSwitcherBtns = [...document.querySelectorAll('[data-switch-game]')];
const pageAnnouncer = document.getElementById('sr-announcer');
const modalAnnouncer = document.getElementById('modal-announcer');

let activeGameInstance = null;
let lastTriggerEl = null;
let motionPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;

function announce(msg, insideModal = false) {
  const target = insideModal ? modalAnnouncer : pageAnnouncer;
  if (!target) return;
  target.textContent = '';
  requestAnimationFrame(() => { target.textContent = msg; });
}

// Feature-detect discrete display transitions so Firefox/Safari fall back cleanly for top-layer exits
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
}

async function closeTopLayer(el) {
  if (!el.open) return;
  if (!supportsTopLayerExit()) {
    el.setAttribute('data-closing', '');
    const anims = el.getAnimations({ subtree: true });
    if (anims.length > 0) {
      await Promise.race([
        Promise.allSettled(anims.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    }
    if (!el.hasAttribute('data-closing')) return;
    el.removeAttribute('data-closing');
  }
  el.close();
}

// Fallback light-dismiss when native <dialog closedby="any"> is unsupported (e.g. Safari)
if (!('closedBy' in HTMLDialogElement.prototype)) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside = rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
    if (!inside) closeTopLayer(dialog);
  });
}

dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeTopLayer(dialog);
});

dialog.addEventListener('close', () => {
  if (activeGameInstance) {
    activeGameInstance.destroy();
    activeGameInstance = null;
  }
  modalStage.innerHTML = '';
  if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
    lastTriggerEl.focus();
  }
});

modalCloseBtn.addEventListener('click', () => {
  SoundFX.pop();
  closeTopLayer(dialog);
});

let modalSwitchSeq = 0;

function mountGameInModal(gameId) {
  const cfg = GAMES[gameId] || GAMES.smart_kids;
  const swap = () => {
    if (activeGameInstance) activeGameInstance.destroy();
    modalTitle.textContent = cfg.title;
    modalStoreLink.href = cfg.url;
    modalStoreLink.setAttribute('aria-label', `Get ${cfg.title} on Google Play`);
    modalSwitcherBtns.forEach((b) => {
      const active = b.dataset.switchGame === cfg.id;
      b.className = active ? 'btn btn-primary' : 'btn btn-outline';
    });
    activeGameInstance = cfg.mount(modalStage);
  };

  const seq = ++modalSwitchSeq;
  if (dialog.open && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vt = document.startViewTransition(swap);
    vt.ready.catch(() => {});
    vt.finished.catch(() => {}).then(() => {
      if (seq !== modalSwitchSeq || !dialog.open) return;
      modalTitle.focus();
      announce(`Loaded ${cfg.title}`, true);
    });
  } else {
    swap();
    if (dialog.open) modalTitle.focus();
    announce(`Loaded ${cfg.title}`, true);
  }
}

function openGameModal(gameId, trigger) {
  lastTriggerEl = trigger || document.activeElement;
  SoundFX.pop();
  dialog.removeAttribute('data-closing');
  mountGameInModal(gameId);
  if (!dialog.open) dialog.showModal();
  modalTitle.focus();
}

document.querySelectorAll('[data-open-game]').forEach((btn) => {
  btn.addEventListener('click', () => openGameModal(btn.dataset.openGame, btn));
});

modalSwitcherBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    SoundFX.pop();
    mountGameInModal(btn.dataset.switchGame);
  });
});

// Mount inline Smart Kids playground immediately on load
const inlineHost = document.getElementById('smart-kids-inline');
const inlineSmartKids = mountSmartKids(inlineHost, { initialTab: 'phonics' });

document.querySelectorAll('[data-sk-jump]').forEach((btn) => {
  btn.addEventListener('click', () => {
    inlineSmartKids.setTab(btn.dataset.skJump);
    document.getElementById('smart-kids-lab').scrollIntoView({ behavior: motionPaused ? 'auto' : 'smooth' });
    SoundFX.pop();
  });
});

// Theme, Sound, and Motion controls
const soundBtn = document.getElementById('toggle-sound-btn');
const motionBtn = document.getElementById('toggle-motion-btn');
const themeBtn = document.getElementById('toggle-theme-btn');
const mascotEl = document.querySelector('.mascot-bob');

soundBtn.addEventListener('click', () => {
  const nextMuted = SoundFX.setMuted(!SoundFX.muted);
  soundBtn.textContent = nextMuted ? 'Unmute Sound' : 'Mute Sound';
  announce(nextMuted ? 'Audio muted' : 'Audio enabled');
});

themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  themeBtn.textContent = isDark ? 'Dark Theme' : 'Light Theme';
  SoundFX.pop();
  announce(`Switched to ${isDark ? 'light' : 'dark'} theme`);
});

// Gentle drifting backdrop animation on hero canvas with clean pause mechanism
const heroCanvas = document.getElementById('hero-canvas');
const hCtx = heroCanvas.getContext('2d');
const particles = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 73) % 1200,
  y: (i * 59) % 520,
  r: 8 + (i % 4) * 5,
  vx: ((i % 2 === 0 ? 1 : -1) * (0.25 + (i % 3) * 0.12)),
  vy: ((i % 3 === 0 ? 1 : -1) * 0.2),
  color: ['#4338CA', '#047857', '#BE123C', '#B45309', '#0369A1'][i % 5],
}));

function syncHeroSize() {
  const box = heroCanvas.parentElement.getBoundingClientRect();
  heroCanvas.width = Math.max(320, Math.floor(box.width));
  heroCanvas.height = Math.max(260, Math.floor(box.height));
}

function renderHeroFrame() {
  const w = heroCanvas.width;
  const h = heroCanvas.height;
  hCtx.clearRect(0, 0, w, h);
  particles.forEach((p) => {
    if (!motionPaused) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }
    hCtx.globalAlpha = 0.14;
    hCtx.fillStyle = p.color;
    hCtx.beginPath();
    hCtx.arc(p.x % w, p.y % h, p.r, 0, Math.PI * 2);
    hCtx.fill();
  });
  hCtx.globalAlpha = 1;
  if (!motionPaused) requestAnimationFrame(renderHeroFrame);
}

function updateMotionState(paused) {
  motionPaused = paused;
  motionBtn.textContent = paused ? 'Play Motion' : 'Pause Motion';
  if (mascotEl) mascotEl.classList.toggle('motion-paused', paused);
  renderHeroFrame();
}

motionBtn.addEventListener('click', () => {
  updateMotionState(!motionPaused);
  announce(motionPaused ? 'Background motion paused' : 'Background motion playing');
});

window.addEventListener('resize', () => { syncHeroSize(); renderHeroFrame(); });
syncHeroSize();
updateMotionState(motionPaused);

// Progressive-enhancement fallback for CSS scroll-driven card reveals
if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
    matchMedia('(prefers-reduced-motion: no-preference)').matches &&
    'IntersectionObserver' in window) {
  const cards = document.querySelectorAll('.reveal-card');
  cards.forEach((c) => c.classList.add('reveal-fallback-hidden'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.remove('reveal-fallback-hidden');
        en.target.classList.add('reveal-fallback-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  cards.forEach((c) => obs.observe(c));
}
