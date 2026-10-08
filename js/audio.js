/**
 * AquaGenesis Audio Engine
 * Процедурный синтезатор звуков на Web Audio API.
 * 
 * 1. Фоновое окружение океана (Ambient):
 *    Физический стерео-шум воды (Pink + Brown Noise) со стабильным фильтром глубины.
 *    Звучит мягко, непрерывно и без затуханий/провалов громкости.
 * 
 * 2. Три ключевые категории звуковых эффектов:
 *    - ЗВУК №1: Главная рыбка-герой глотает кого-то (планктон, моллюска, краба, наутилуса, рыбу).
 *    - ЗВУК №2: Кто-то глотает / кусает нашего главного героя (укус хищника, гибель в пасти).
 *    - ЗВУК №3: Любое другое событие (ускорение-рывок ⚡, эволюция ✨, щит 🛡️, победа 👑).
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
    this.ambientGain = null;
    this.ambientSource = null;
    this.ambientFilter = null;
    this.ambientLfo = null;
    this.ambientTargetVolume = 0.12;
    this.ambientStarted = false;
    this.bubbleTimer = null;
    this.oceanBuffer = null;

    // Мелодическая лесенка для быстрого поедания планктона подряд (комбо-бульки)
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
      try {
        this.ambientGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.ambientTargetVolume,
          this.ctx.currentTime
        );
      } catch (e) {}
    }
    return this.isMuted;
  }

  setPaused(isPaused) {
    if (!this.ambientGain || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const target = isPaused ? 0.03 : this.ambientTargetVolume;
    try {
      this.ambientGain.gain.linearRampToValueAtTime(target, now + 0.15);
    } catch (e) {
      try {
        this.ambientGain.gain.setValueAtTime(target, now);
      } catch (e2) {}
    }
  }

  /**
   * Генерация стерео-буфера естественного шума океана (Pink & Brown Noise).
   * Имитирует массивную плотную толщу морской воды.
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

      // Бесшовный кроссфейд 0.5 сек для идеально гладкого непрерывного лупа
      const fadeSamples = Math.floor(Math.min(sampleRate * 0.5, len * 0.1));
      for (let i = 0; i < fadeSamples; i++) {
        const progress = i / fadeSamples;
        const endIdx = len - fadeSamples + i;
        data[i] = data[i] * progress + data[endIdx] * (1 - progress);
      }
    }
    return buffer;
  }

  /**
   * Запуск стабильного непрерывного фонового шума океана.
   * Устранены любые провалы фильтра: частота среза ВСЕГДА поддерживается
   * в стабильном слышимом комфортном диапазоне (385–455 Гц).
   */
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

      if (!this.oceanBuffer) {
        this.oceanBuffer = this.createOceanNoiseBuffer();
      }

      const now = this.ctx.currentTime;

      // Мастер-громкость океана
      this.ambientGain = this.ctx.createGain();
      const currentVol = this.isMuted ? 0 : this.ambientTargetVolume;
      this.ambientGain.gain.setValueAtTime(currentVol, now);
      this.ambientGain.connect(this.ctx.destination);

      if (this.oceanBuffer) {
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.oceanBuffer;
        noiseSource.loop = true;

        // Фильтр глубины (мягкий теплый подводный шелест)
        // Базовая частота 420 Гц, Q = 0.9 (ровная полоса без свистящего резонанса)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);
        filter.Q.setValueAtTime(0.9, now);

        // Резонансный фильтр тела воды (объем подводной акустики)
        const bodyFilter = this.ctx.createBiquadFilter();
        bodyFilter.type = 'peaking';
        bodyFilter.frequency.setValueAtTime(140, now);
        if (bodyFilter.gain && bodyFilter.gain.setValueAtTime) {
          bodyFilter.gain.setValueAtTime(3.5, now);
        }
        bodyFilter.Q.setValueAtTime(1.0, now);

        // Деликатный LFO: создает едва заметное медленное дыхание океана (~12.5 сек период),
        // с амплитудой всего ±35 Гц.
        // Частота среза строго колеблется между 385 Гц и 455 Гц:
        // ЗВУК НИКОГДА НЕ ПАДАЕТ ДО НУЛЯ И НЕ ПРОПАДАЕТ!
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, now);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(35, now);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(bodyFilter);
        bodyFilter.connect(filter);
        filter.connect(this.ambientGain);

        noiseSource.start(now);
        lfo.start(now);

        this.ambientSource = noiseSource;
        this.ambientFilter = filter;
        this.ambientLfo = lfo;
      }

      this.ambientStarted = true;
      this.startAmbientBubbles();
    } catch (e) {
      console.warn('Ambient start failed:', e);
    }
  }

  startAmbientBubbles() {
    this.stopAmbientBubbles();
    const scheduleNext = () => {
      if (!this.ambientStarted || this.isMuted) return;
      const delay = 3200 + Math.random() * 4500;
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

      const freqStart = 600 + Math.random() * 300;
      const freqEnd = freqStart * 1.3;
      const dur = 0.07 + Math.random() * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);

      gain.gain.setValueAtTime(0.015, now);
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
    if (this.ambientLfo) {
      try { this.ambientLfo.stop(); } catch (e) {}
      this.ambientLfo = null;
    }
    this.ambientGain = null;
    this.ambientStarted = false;
  }

  // Генератор шума для кратковременных акустических эффектов (хруст, гидродинамика)
  createTransientNoise(duration) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate || 44100;
    const bufferSize = Math.floor(sampleRate * duration);
    if (bufferSize <= 0) return null;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    return buffer;
  }

  playNoiseClick(startTime, duration, freq, volume = 0.25) {
    if (!this.ctx) return;
    const buffer = this.createTransientNoise(duration);
    if (!buffer) return;

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

  // =========================================================================
  // ЗВУК №1: Главная рыбка-герой глотает кого-то
  // =========================================================================
  /**
   * ЗВУК №1: Главная рыбка-герой глотает кого-то (планктон, моллюска, краба, наутилуса или другую рыбу).
   * Сочный, физически правдоподобный подводный звук заглатывания («бульк-глоп / чавк»):
   * 1. Втягивающий восходящий пузырьковый тон (suction sweep)
   * 2. Глоточный щелчок и сочный бас укуса (throat pop / chomp sub)
   * 3. Текстурный гидродинамический всплеск
   * 
   * @param {string} type - 'plankton' | 'fish' | 'clam' | 'crab' | 'small'
   * @param {number} mass - масса проглоченной добычи
   */
  playPlayerSwallow(type = 'plankton', mass = 1) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    const isSmall = type === 'plankton' || type === 'small' || mass <= 5;
    const isCrab = type === 'crab';
    const isClam = type === 'clam';

    // Комбо-лесенка тональности при быстром поедании подряд
    if (isSmall) {
      if (now - this.lastEatTime < 1.1) {
        this.bubbleIdx = (this.bubbleIdx + 1) % this.bubbleNotes.length;
      } else {
        this.bubbleIdx = 0;
      }
      this.lastEatTime = now;
    }

    if (isSmall) {
      // Маленькая добыча (планктон, споры): звонкий пузырьковый глоток
      const baseFreq = this.bubbleNotes[this.bubbleIdx] + (Math.random() * 24 - 12);
      const duration = 0.085;

      // Быстрое восходящее схлопывание пузырька в пасти
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + duration);

      gain.gain.setValueAtTime(0.36, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Мягкий водяной суб-щелчок заглатывания
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(baseFreq * 0.45, now);
      sub.frequency.exponentialRampToValueAtTime(baseFreq * 0.18, now + 0.045);

      subG.gain.setValueAtTime(0.22, now);
      subG.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      sub.connect(subG);
      subG.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.045);
    } else {
      // Крупная добыча (рыба, моллюск, краб, наутилус): плотный, сочный, сытный глоток с хрустом
      const isHuge = mass > 45;
      const duration = isHuge ? 0.22 : 0.17;
      const baseFreq = isHuge ? 210 : 290;

      // Плотный челюстной тон заглатывания (Triangle с глубоким спадом в пасть)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(isHuge ? 50 : 75, now + duration);

      gain.gain.setValueAtTime(0.48, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Хруст / текстура укуса (чешуя / панцирь)
      const noiseFreq = isCrab ? 2200 : (isClam ? 1500 : 1250);
      this.playNoiseClick(now, isHuge ? 0.12 : 0.08, noiseFreq, 0.35);

      // Глубинный сабвуферный толчок насыщения
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      subG.gain.setValueAtTime(0.38, now);
      subG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      sub.connect(subG);
      subG.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.12);

      // Если это открытая жемчужница — кристальный перелив жемчуга
      if (isClam && mass > 35) {
        [1500, 1980, 2450].forEach((f, idx) => {
          const crystalOsc = this.ctx.createOscillator();
          const crystalGain = this.ctx.createGain();
          const t = now + idx * 0.035;
          crystalOsc.type = 'sine';
          crystalOsc.frequency.setValueAtTime(f, t);
          crystalGain.gain.setValueAtTime(0.2, t);
          crystalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          crystalOsc.connect(crystalGain);
          crystalGain.connect(this.ctx.destination);
          crystalOsc.start(t);
          crystalOsc.stop(t + 0.22);
        });
      }
    }
  }

  // =========================================================================
  // ЗВУК №2: Кто-то глотает / кусает нашего главного героя
  // =========================================================================
  /**
   * ЗВУК №2А: Хищник кусает героя (нанесение урона, отброс, потеря жизни).
   * Агрессивный скрежет челюстей + тревожный интервал предупреждения.
   */
  playPlayerBitten() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    // 1. Челюсти хищника: резкий кусающий щелчок (агрессивный Sawtooth со срезом)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(270, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.26);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, now);

    gain.gain.setValueAtTime(0.48, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);

    // 2. Диссонансный тревожный интервал (тритон) — мгновенный сигнал опасности мозгу
    [330, 466].forEach((f) => {
      const ping = this.ctx.createOscillator();
      const pingG = this.ctx.createGain();
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(f, now);
      pingG.gain.setValueAtTime(0.22, now);
      pingG.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      ping.connect(pingG);
      pingG.connect(this.ctx.destination);
      ping.start(now);
      ping.stop(now + 0.2);
    });

    // 3. Плотный гидродинамический удар челюстей
    this.playNoiseClick(now, 0.1, 750, 0.38);
  }

  /**
   * ЗВУК №2Б: Хищник полностью проглатывает героя (Game Over / гибель).
   * Глубокое поглощающее затягивание в бездну чрева хищника.
   */
  playPlayerSwallowed() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    // 1. Поглощение пастью хищника (тяжелый засасывающий спад)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.85);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);

    // 2. Глубинный саб-дроп бездны (утягивание на дно)
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, now);
    sub.frequency.exponentialRampToValueAtTime(22, now + 1.1);

    subG.gain.setValueAtTime(0.42, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    sub.connect(subG);
    subG.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 1.1);

    // 3. Водяной шум водоворота пасти
    this.playNoiseClick(now, 0.3, 500, 0.4);
  }

  // =========================================================================
  // ЗВУК №3: Любое другое событие (ускорение, эволюция, щит, победа)
  // =========================================================================
  /**
   * ЗВУК №3: Когда происходит что-то ещё (любой другой случай):
   * Ускорение (Dash ⚡), эволюция (Evolution ✨), отражение атаки щитом (Shield 🛡️), победа (Victory 👑).
   * Характер: резонансная гидродинамическая волна энергии и кристальный морской перелив.
   * 
   * @param {string} type - 'dash' | 'shield' | 'evolution' | 'victory' | 'default'
   */
  playOtherEvent(type = 'default') {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'dash': {
        // Турбо-рывок: гидродинамический вихрь с резонансным свипом
        const duration = 0.28;
        const noiseBuf = this.createTransientNoise(duration);
        if (noiseBuf) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuf;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, now);
          filter.frequency.exponentialRampToValueAtTime(980, now + 0.08);
          filter.frequency.exponentialRampToValueAtTime(180, now + duration);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.34, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + duration);
        }

        // Поддерживающий тональный подъем ускорения
        const tone = this.ctx.createOscillator();
        const toneG = this.ctx.createGain();
        tone.type = 'sine';
        tone.frequency.setValueAtTime(140, now);
        tone.frequency.exponentialRampToValueAtTime(320, now + 0.15);
        toneG.gain.setValueAtTime(0.2, now);
        toneG.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        tone.connect(toneG);
        toneG.connect(this.ctx.destination);
        tone.start(now);
        tone.stop(now + 0.22);
        break;
      }

      case 'shield': {
        // Отражение удара защитным щитом: кристальный кинетический резонанс
        [880, 1320, 1760].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + idx * 0.02;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.26);
        });
        this.playNoiseClick(now, 0.08, 1800, 0.22);
        break;
      }

      case 'evolution': {
        // Эволюция: торжественный восходящий аккорд морских кристаллов
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + idx * 0.07;
          const dur = 0.6;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur);
        });
        break;
      }

      case 'victory': {
        // Победа: праздничный полифонический морской аккорд
        const chords = [
          { f: 523.25, t: 0 },
          { f: 659.25, t: 0.08 },
          { f: 783.99, t: 0.16 },
          { f: 1046.5, t: 0.24 },
          { f: 1318.5, t: 0.32 }
        ];
        chords.forEach(({ f, t }) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + t);
          gain.gain.setValueAtTime(0.24, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.7);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + 0.7);
        });
        break;
      }

      default: {
        // Любое другое событие: мягкая волна резонанса океана
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  }

  // =========================================================================
  // Совместимые методы-алиасы (вызывают соответствующие звуки 1, 2 и 3)
  // =========================================================================

  // Алиасы для Звука №1 (Герой глотает кого-то):
  playEatPlankton() { this.playPlayerSwallow('plankton', 1); }
  playEatSmall() { this.playPlayerSwallow('small', 1); }
  playEatFish(mass = 25) { this.playPlayerSwallow('fish', mass); }
  playEatCrab() { this.playPlayerSwallow('crab', 40); }
  playEatClam(isOpen = false) { this.playPlayerSwallow('clam', isOpen ? 60 : 30); }
  playEatChomp() { this.playPlayerSwallow('fish', 25); }

  // Алиасы для Звука №2 (Кто-то глотает/кусает героя):
  playHurt() { this.playPlayerBitten(); }
  playGameOver() { this.playPlayerSwallowed(); }

  // Алиасы для Звука №3 (Любые другие события):
  playDash() { this.playOtherEvent('dash'); }
  playShieldDeflect() { this.playOtherEvent('shield'); }
  playEvolution() { this.playOtherEvent('evolution'); }
  playVictory() { this.playOtherEvent('victory'); }

  // Тревожный пульс при близком приближении хищника (фоновое предупреждение)
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
}

// Экспортируем глобальный синглтон
window.soundEngine = new SoundEngine();
