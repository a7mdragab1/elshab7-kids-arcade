export const SoundFX = (() => {
  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (muted) return null;
    if (!ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, duration = 0.09, type = 'sine', gainVal = 0.08, delay = 0) {
    const ac = ensureCtx();
    if (!ac) return;
    const now = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  return {
    get muted() { return muted; },
    setMuted(next) {
      muted = Boolean(next);
      if (muted && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
      return muted;
    },
    pop() { tone(520, 0.06, 'triangle', 0.07); },
    chime(step = 0) { tone(440 + step * 35, 0.14, 'sine', 0.08); },
    match(combo = 1) {
      const base = 420 + Math.min(combo, 6) * 60;
      tone(base, 0.1, 'triangle', 0.08, 0);
      tone(base * 1.25, 0.12, 'triangle', 0.08, 0.06);
    },
    brickHit(combo = 1) { tone(320 + (combo % 8) * 45, 0.055, 'square', 0.04); },
    laser() { tone(760, 0.05, 'sawtooth', 0.03); },
    explosion() {
      tone(140, 0.16, 'triangle', 0.09, 0);
      tone(95, 0.2, 'sine', 0.08, 0.04);
    },
    celebrate() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        tone(f, 0.18, 'triangle', 0.08, idx * 0.08);
      });
    },
    speak(text, lang = 'en-US') {
      if (muted || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.92;
        u.pitch = 1.08;
        window.speechSynthesis.speak(u);
      } catch (_) {}
    }
  };
})();
