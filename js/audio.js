/**
 * AquaGenesis Audio Engine
 * Процедурный синтезатор звуков на Web Audio API.
 * Сочные, органические звуки заглатывания планктона, хруста рыбок, моллюсков и подводного окружения.
 * Не требует внешних аудио-файлов, работает автономно, мгновенно и без задержек.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
    this.ambientGain = null;

    // Индекс для переливчатых комбо-бульков при поедании планктона подряд
    this.bubbleNotes = [480, 540, 620, 720, 840, 960, 1100, 1280];
    this.bubbleIdx = 0;
    this.lastEatTime = 0;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.initialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.startAmbient();
    } catch (e) {
      console.warn('Web Audio API initialization:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx && !this.isMuted);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.07,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  startAmbient() {
    if (!this.ctx || this.isMuted) return;

    // Глубокий атмосферный подводный гул океана
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.ambientGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(52, this.ctx.currentTime); // Басовый суб-тон

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(78, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(130, this.ctx.currentTime);

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.07, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
  }

  /**
   * Звук заглатывания планктона и светящихся спор:
   * Звонкий, сочный пузырьковый «бульк-глоп» с поднимающейся мелодической лесенкой при комбо-поедании!
   */
  playEatSmall() {
    this.playEatPlankton();
  }

  playEatPlankton() {
    if (!this.ensureContext()) return;

    const now = this.ctx.currentTime;

    // Комбо-повышение тона, если едим частицы подряд (в пределах 1.1 сек)
    if (now - this.lastEatTime < 1.1) {
      this.bubbleIdx = (this.bubbleIdx + 1) % this.bubbleNotes.length;
    } else {
      this.bubbleIdx = 0;
    }
    this.lastEatTime = now;

    const baseFreq = this.bubbleNotes[this.bubbleIdx] + (Math.random() * 30 - 15);
    const duration = 0.09;

    // 1. Быстрый пузырьковый тон (свип частоты вверх, физика схлопывания пузырька)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.15, now + duration);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // 2. Мягкий водяной «чпок» (sub-click) для тактильности
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(baseFreq * 0.45, now);
    subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, now + 0.05);

    subGain.gain.setValueAtTime(0.24, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.05);
  }

  /**
   * Звук поедания другой рыбы (хищный, сочный укус «ХРУМ / КУСЬ»):
   * Двухфазный звук: резкий щелчок зубов + сочный плотный тон челюстей + брызги воды.
   * Тональность адаптируется под массу рыбы.
   */
  playEatFish(mass = 25) {
    if (!this.ensureContext()) return;

    const now = this.ctx.currentTime;
    const isLarge = mass > 45;
    const duration = isLarge ? 0.22 : 0.16;

    // 1. Низкий челюстной тон укуса (Triangle с резким падением)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = isLarge ? 220 : 310;
    const endFreq = isLarge ? 55 : 85;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.52, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // 2. Хруст чешуи и гидродинамический всплеск (фильтрованный шум)
    this.playNoiseClick(now, isLarge ? 0.14 : 0.09, isLarge ? 1100 : 1600, 0.32);

    // 3. Басовый суб-толчок для хищного удара в грудь
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    subG.gain.setValueAtTime(0.42, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    sub.connect(subG);
    subG.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.12);
  }

  /**
   * Звук поедания краба (хруст панциря)
   */
  playEatCrab() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    this.playNoiseClick(now, 0.06, 2200, 0.35);
    this.playNoiseClick(now + 0.04, 0.12, 1200, 0.4);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Звук поедания раковины / тридакны (хруст створок + звон жемчужины)
   */
  playEatClam(isOpen = false) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    // Хруст створок
    this.playNoiseClick(now, 0.15, 1400, 0.38);

    // Звонкий кристальный перелив жемчужины
    if (isOpen) {
      [1480, 1960, 2400].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.04;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    }
  }

  playEatChomp() {
    this.playEatFish(30);
  }

  // Вспомогательный генератор текстурного шума для хруста и всплесков
  playNoiseClick(startTime, duration, freq, volume = 0.25) {
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    if (bufferSize <= 0) return;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(2.2, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  // Звук турбо-рывка (шум рассекаемой толщи воды)
  playDash() {
    if (!this.ensureContext()) return;

    const now = this.ctx.currentTime;
    const duration = 0.32;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(950, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(160, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Звук эволюции (торжественный перелив и аккорд победы)
  playEvolution() {
    if (!this.ensureContext()) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = now + idx * 0.08;
      const duration = 0.65;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.24, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Тревожный пульс при приближении хищника (сердцебиение)
  playHeartbeat() {
    if (!this.ensureContext()) return;

    const now = this.ctx.currentTime;
    [0, 0.16].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(68, now + offset);
      osc.frequency.exponentialRampToValueAtTime(32, now + offset + 0.12);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  }

  // Звук получения урона / укуса хищника
  playHurt() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.28);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    this.playNoiseClick(now, 0.09, 850, 0.35);
  }

  // Звук поражения
  playGameOver() {
    if (!this.ensureContext()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.85);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }
}

// Экспортируем глобальный синглтон
window.soundEngine = new SoundEngine();

// Автоматическая разблокировка аудиоконтекста браузера при первом клике или нажатии
const autoUnlockAudio = () => {
  if (window.soundEngine) {
    window.soundEngine.init();
  }
};
window.addEventListener('click', autoUnlockAudio, { once: true, passive: true });
window.addEventListener('keydown', autoUnlockAudio, { once: true, passive: true });
window.addEventListener('touchstart', autoUnlockAudio, { once: true, passive: true });
window.addEventListener('mousedown', autoUnlockAudio, { once: true, passive: true });
