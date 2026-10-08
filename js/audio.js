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
    this.ambientSource = null;
    this.ambientFilter = null;
    this.ambientLfo1 = null;
    this.ambientLfo2 = null;
    this.ambientStarted = false;
    this.bubbleTimer = null;
    this.oceanBuffer = null;

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
        this.isMuted ? 0 : 0.14,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  /**
   * Генерация стерео-буфера шума воды (Pink & Brown Noise).
   * В отличие от монотонных синтетических тонов, это физический,
   * естественный акустический шум морского прибоя и подводных течений.
   */
  createOceanNoiseBuffer() {
    const sampleRate = (this.ctx && this.ctx.sampleRate) || 44100;
    const duration = 8; // 8-секундный стерео цикл
    const bufferSize = sampleRate * duration;
    let buffer = null;
    try {
      buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
    } catch (e) {
      return null;
    }
    if (!buffer) return null;
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    if (!left || !right) return null;

    const len = Math.min(bufferSize, left.length);
    for (let ch = 0; ch < 2; ch++) {
      const data = ch === 0 ? left : right;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastBrown = 0;

      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;

        // Фильтр розового шума (Paul Kellet 1/f)
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;

        // Коричневый шум (броуновское блуждание - масса толщи воды)
        lastBrown = (lastBrown + (0.02 * white)) / 1.02;
        const brown = lastBrown * 3.5;

        // Композиция: глубинная толща воды + прибойная пена
        data[i] = pink * 0.52 + brown * 0.48;
      }

      // Бесшовный кроссфейд 0.5 сек для незаметного циклического воспроизведения
      const fadeSamples = Math.floor(Math.min(sampleRate * 0.5, len * 0.1));
      for (let i = 0; i < fadeSamples; i++) {
        const progress = i / fadeSamples;
        const endIdx = len - fadeSamples + i;
        data[i] = data[i] * progress + data[endIdx] * (1 - progress);
      }
    }
    return buffer;
  }

  startAmbient() {
    if (this.ambientStarted || this.isMuted) return;
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // 1. Создаем или повторно используем буфер шума океана
      if (!this.oceanBuffer) {
        this.oceanBuffer = this.createOceanNoiseBuffer();
      }

      const now = this.ctx.currentTime;

      // 2. Мастер-громкость океана
      this.ambientGain = this.ctx.createGain();
      const targetVolume = this.isMuted ? 0 : 0.14;
      this.ambientGain.gain.setValueAtTime(targetVolume, now);
      this.ambientGain.connect(this.ctx.destination);

      if (this.oceanBuffer) {
        // Источник натурального шума воды
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.oceanBuffer;
        noiseSource.loop = true;

        // Фильтр глубины (отсекает резкий сухой верх, формируя подводный звук)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.Q.setValueAtTime(1.8, now);

        // Резонансный фильтр тела воды (объем подводной акустики)
        const bodyFilter = this.ctx.createBiquadFilter();
        bodyFilter.type = 'peaking';
        bodyFilter.frequency.setValueAtTime(160, now);
        if (bodyFilter.gain && bodyFilter.gain.setValueAtTime) {
          bodyFilter.gain.setValueAtTime(4, now);
        }
        bodyFilter.Q.setValueAtTime(1.2, now);

        // LFO 1: Накат и откат волн океана (~8.5 сек период волны)
        const lfo1 = this.ctx.createOscillator();
        lfo1.type = 'sine';
        lfo1.frequency.setValueAtTime(0.118, now);

        const lfo1Gain = this.ctx.createGain();
        lfo1Gain.gain.setValueAtTime(220, now); // Модулирует частоту фильтра (от 100Гц до 540Гц)
        lfo1.connect(lfo1Gain);
        lfo1Gain.connect(filter.frequency);

        // LFO 2: Медленное дыхание глубинных течений (~14.2 сек)
        const lfo2 = this.ctx.createOscillator();
        lfo2.type = 'sine';
        lfo2.frequency.setValueAtTime(0.07, now);

        const lfo2Gain = this.ctx.createGain();
        lfo2Gain.gain.setValueAtTime(110, now);
        lfo2.connect(lfo2Gain);
        lfo2Gain.connect(filter.frequency);

        // Цепочка: Шум воды -> Резонанс массы -> Волновой фильтр -> Мастер-выход
        noiseSource.connect(bodyFilter);
        bodyFilter.connect(filter);
        filter.connect(this.ambientGain);

        noiseSource.start(now);
        lfo1.start(now);
        lfo2.start(now);

        this.ambientSource = noiseSource;
        this.ambientFilter = filter;
        this.ambientLfo1 = lfo1;
        this.ambientLfo2 = lfo2;
      }

      this.ambientStarted = true;

      // 3. Запускаем мягкие фоновые микро-пузырьки рифа
      this.startAmbientBubbles();
    } catch (e) {
      console.warn('Ambient start failed:', e);
    }
  }

  startAmbientBubbles() {
    this.stopAmbientBubbles();
    const scheduleNext = () => {
      if (!this.ambientStarted || this.isMuted) return;
      const delay = 2600 + Math.random() * 3800;
      this.bubbleTimer = setTimeout(() => {
        if (this.ambientStarted && !this.isMuted) {
          this.playSubtleAmbientBubble();
          scheduleNext();
        }
      }, delay);
    };
    scheduleNext();
  }

  stopAmbientBubbles() {
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }

  playSubtleAmbientBubble() {
    if (!this.ctx || this.isMuted || !this.ambientStarted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqStart = 650 + Math.random() * 450;
      const freqEnd = freqStart * 1.35;
      const dur = 0.08 + Math.random() * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);

      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(this.ambientGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {}
  }

  stopAmbient() {
    this.stopAmbientBubbles();

    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientLfo1) {
      try { this.ambientLfo1.stop(); } catch (e) {}
      this.ambientLfo1 = null;
    }
    if (this.ambientLfo2) {
      try { this.ambientLfo2.stop(); } catch (e) {}
      this.ambientLfo2 = null;
    }
    this.ambientGain = null;
    this.ambientStarted = false;
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
