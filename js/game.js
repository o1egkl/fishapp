/**
 * AquaGenesis Master Game Loop & Controller
 * Объединяет физику, камеру, управление (ПК + Мобайл), радар, коллизии,
 * систему эволюции и интерфейс.
 */

class GameManager {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas.getContext('2d');

    // Размеры игрового мира (просторный океан)
    this.worldWidth = 3800;
    this.worldHeight = 2400;

    // Камера
    this.camera = {
      x: (this.worldWidth - window.innerWidth) / 2,
      y: (this.worldHeight - window.innerHeight) / 2,
      scale: 1,
      targetScale: 1
    };

    // Окружение и звук
    this.env = new OceanEnvironment(this.worldWidth, this.worldHeight);
    this.sound = window.soundEngine;

    // Сущности
    this.player = null;
    this.fishes = [];
    this.planktons = [];
    this.clams = [];
    this.crabs = [];
    this.nautiluses = [];
    this.particles = [];

    // Игровое состояние
    this.score = 0;
    this.preyEaten = 0;
    this.maxBiomassAchieved = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isPlaying = false;
    this.freeplayMode = false;

    // Ввод пользователя (ПК)
    this.input = {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      isMouseDown: false,
      keys: {}
    };

    // Ввод пользователя (Мобильный тач / Джойстик)
    this.touch = {
      active: false,
      startX: 0,
      startY: 0,
      angle: 0,
      distance: 0
    };

    this.dangerCooldown = 0;
    this.lastTime = performance.now();

    // Скорость игры (по умолчанию спокойный режим 0.5x)
    this.gameSpeed = 0.5;
    this.speedModes = [0.5, 1.0, 1.5];
    this.currentSpeedIdx = 0;

    this.initDOM();
    this.bindEvents();
    this.resizeCanvas();

    // Загружаем фотографические текстуры реальных морских обитателей
    if (window.assetManager) {
      window.assetManager.loadAll();
    }

    // Создаем начальную экосистему для живого фона
    this.spawnEcosystem();

    // Запускаем фоновый цикл рендеринга сразу
    requestAnimationFrame((t) => this.loop(t));

    // Поддержка автостарта для демо и скриншотов (?autostart=1)
    if (window.location.search.includes('autostart=1')) {
      setTimeout(() => {
        if (this.dom.startModal) this.dom.startModal.classList.add('hidden');
        this.startNewGame();
      }, 400);
    }
  }

  initDOM() {
    this.dom = {
      stageNum: document.getElementById('stage-num'),
      stageName: document.getElementById('stage-name'),
      stageIcon: document.getElementById('stage-icon'),
      currentMass: document.getElementById('current-mass'),
      targetMass: document.getElementById('target-mass'),
      growthBar: document.getElementById('growth-progress-bar'),
      fishLength: document.getElementById('fish-length'),
      hudLives: document.getElementById('hud-lives'),
      hudScore: document.getElementById('hud-score'),
      depthMeter: document.getElementById('depth-meter'),
      boostFill: document.getElementById('boost-fill'),
      boostPct: document.getElementById('boost-pct'),
      dangerAlert: document.getElementById('danger-alert'),
      floatingNotes: document.getElementById('floating-notifications'),
      // Модалки
      startModal: document.getElementById('start-modal'),
      evoModal: document.getElementById('evolution-modal'),
      pauseModal: document.getElementById('pause-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      victoryModal: document.getElementById('victory-modal'),
      // Эво превью
      evoCanvas: document.getElementById('evo-preview-canvas'),
      evoNewName: document.getElementById('evo-new-name'),
      evoDesc: document.getElementById('evo-desc')
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Мышь
    window.addEventListener('mousemove', (e) => {
      this.input.mouseX = e.clientX;
      this.input.mouseY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#hud-top') || e.target.closest('.modal-overlay')) return;
      this.input.isMouseDown = true;
      if (this.player && this.isPlaying && !this.isPaused) {
        this.triggerDash();
      }
    });

    window.addEventListener('mouseup', () => {
      this.input.isMouseDown = false;
    });

    // Клавиатура (WASD, Стрелки, Пробел, Пауза)
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerDash();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    // Сенсорное управление (Touch)
    this.setupTouchControls();

    // Кнопки тем в HUD
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Кнопки тем в Стартовом окне
    document.querySelectorAll('.choice-theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Звук
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      document.getElementById('sound-icon').textContent = isMuted ? '🔇' : '🔊';
    });

    // Переключатель скорости игры
    const speedBtn = document.getElementById('speed-toggle-btn');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        this.currentSpeedIdx = (this.currentSpeedIdx + 1) % this.speedModes.length;
        this.gameSpeed = this.speedModes[this.currentSpeedIdx];
        const icon = this.gameSpeed === 0.5 ? '🐢' : this.gameSpeed === 1.0 ? '⚖️' : '⚡';
        document.getElementById('speed-icon').textContent = icon;
        document.getElementById('speed-val-text').textContent = `${this.gameSpeed}x`;
      });
    }

    // Пауза
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('restart-from-pause-btn').addEventListener('click', () => {
      this.dom.pauseModal.classList.add('hidden');
      this.startNewGame();
    });

    // Старт игры
    document.getElementById('start-game-btn').addEventListener('click', () => {
      this.sound.init();
      this.dom.startModal.classList.add('hidden');
      this.startNewGame();
    });

    // Продолжить после эволюции
    document.getElementById('continue-evo-btn').addEventListener('click', () => {
      this.dom.evoModal.classList.add('hidden');
      this.isPaused = false;
    });

    // Перезапуск после проигрыша
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.dom.gameoverModal.classList.add('hidden');
      this.startNewGame();
    });

    // Победа
    document.getElementById('freeplay-btn').addEventListener('click', () => {
      this.dom.victoryModal.classList.add('hidden');
      this.freeplayMode = true;
      this.isPaused = false;
    });
    document.getElementById('restart-victory-btn').addEventListener('click', () => {
      this.dom.victoryModal.classList.add('hidden');
      this.startNewGame();
    });
  }

  setupTouchControls() {
    const joyArea = document.getElementById('touch-joystick-area');
    const stick = document.getElementById('joystick-stick');
    const dashBtn = document.getElementById('mobile-dash-btn');

    let touchId = null;

    if (joyArea && stick) {
      joyArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        touchId = t.identifier;
        const rect = joyArea.getBoundingClientRect();
        this.touch.active = true;
        this.touch.startX = rect.left + rect.width / 2;
        this.touch.startY = rect.top + rect.height / 2;
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.touch.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            const dx = t.clientX - this.touch.startX;
            const dy = t.clientY - this.touch.startY;
            const dist = Math.hypot(dx, dy);
            const maxDist = 45;
            const angle = Math.atan2(dy, dx);

            const clampedDist = Math.min(dist, maxDist);
            stick.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;

            this.touch.angle = angle;
            this.touch.distance = clampedDist / maxDist;
            break;
          }
        }
      }, { passive: false });

      const endTouch = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            this.touch.active = false;
            touchId = null;
            stick.style.transform = 'translate(0px, 0px)';
            this.touch.distance = 0;
            break;
          }
        }
      };

      window.addEventListener('touchend', endTouch);
      window.addEventListener('touchcancel', endTouch);
    }

    // Мобильная кнопка рывка
    if (dashBtn) {
      dashBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerDash();
      }, { passive: false });
    }

    // Прямое касание экрана для поворота
    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('#hud-top') || e.target.closest('.modal-overlay') || e.target.closest('#mobile-controls')) return;
      const t = e.touches[0];
      if (t) {
        this.input.mouseX = t.clientX;
        this.input.mouseY = t.clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.touch.active) return;
      if (e.target.closest('#hud-top') || e.target.closest('.modal-overlay') || e.target.closest('#mobile-controls')) return;
      const t = e.touches[0];
      if (t) {
        this.input.mouseX = t.clientX;
        this.input.mouseY = t.clientY;
      }
    }, { passive: true });
  }

  setTheme(theme) {
    this.env.setTheme(theme);

    // Синхронизируем кнопки HUD
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });

    // Синхронизируем карточки в стартовом окне
    document.querySelectorAll('.choice-theme-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-theme') === theme);
    });
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  startNewGame() {
    this.score = 0;
    this.preyEaten = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.isPlaying = true;
    this.freeplayMode = false;

    // Создаем игрока в центре океана с 6 секундами защитного щита
    const stage1 = EVOLUTION_STAGES[0];
    this.player = new Fish(this.worldWidth / 2, this.worldHeight / 2, {
      isPlayer: true,
      species: stage1.species,
      stage: 1,
      mass: stage1.minMass,
      radius: stage1.baseRadius,
      maxSpeed: stage1.speed,
      dashSpeed: stage1.dashSpeed,
      colors: stage1.colors,
      shieldTimer: 300, // 5 секунд защитного щита на старте
      lives: 3
    });
    this.player.maxLives = 3;
    this.player.lives = 3;

    this.maxBiomassAchieved = this.player.mass;

    // Крупный приближенный план (1.65x), чтобы игрок отчетливо видел свою рыбку и мир
    this.camera.scale = 1.65;
    this.camera.targetScale = 1.65;
    this.camera.x = this.player.x - (window.innerWidth / 2) / this.camera.scale;
    this.camera.y = this.player.y - (window.innerHeight / 2) / this.camera.scale;

    // Генерируем сбалансированную и безопасную экосистему
    this.spawnEcosystem();
    this.updateHUD();
  }

  spawnEcosystem() {
    this.planktons = [];
    this.clams = [];
    this.crabs = [];
    this.nautiluses = [];
    this.fishes = [];
    this.particles = [];

    const pX = this.worldWidth / 2;
    const pY = this.worldHeight / 2;

    // 1. Планктон и криль: часть спавним прямо вблизи игрока, чтобы сразу была еда
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 420;
      this.planktons.push(new Plankton(
        pX + Math.cos(angle) * dist,
        Math.max(150, Math.min(this.worldHeight - 200, pY + Math.sin(angle) * dist))
      ));
    }
    // Остальной планктон по всему миру
    for (let i = 0; i < 45; i++) {
      this.planktons.push(new Plankton(
        Math.random() * this.worldWidth,
        150 + Math.random() * (this.worldHeight - 300)
      ));
    }

    // 2. Раковины / Устрицы на морском дне (16 штук)
    const seabedY = this.worldHeight - 50;
    for (let i = 0; i < 16; i++) {
      const x = (i / 16) * this.worldWidth + 50 + Math.random() * 80;
      this.clams.push(new Clam(x, seabedY - 15, 20 + Math.random() * 10));
    }

    // 3. Донные крабы (10 штук)
    for (let i = 0; i < 10; i++) {
      this.crabs.push(new Crab(
        Math.random() * this.worldWidth,
        seabedY - 12,
        seabedY
      ));
    }

    // 4. Наутилусы (8 штук в толще воды)
    for (let i = 0; i < 8; i++) {
      this.nautiluses.push(new Nautilus(
        Math.random() * this.worldWidth,
        400 + Math.random() * (this.worldHeight - 800)
      ));
    }

    // 5. Рыбы: сначала спавним 4 безопасных неоновых тетры в зоне видимости игрока
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const dist = 280 + Math.random() * 200;
      const baby = new Fish(pX + Math.cos(angle) * dist, pY + Math.sin(angle) * dist, {
        isPlayer: false,
        species: 'neontetra',
        stage: 1,
        mass: 16,
        radius: 26,
        maxSpeed: 0.78
      });
      this.fishes.push(baby);
    }

    // Затем спавним остальных рыб реальных видов
    for (let i = 0; i < 26; i++) {
      this.spawnRandomNPCFish();
    }
  }

  spawnRandomNPCFish(forceSpecies = null) {
    let chosenSpecies = forceSpecies;
    if (!chosenSpecies) {
      const roll = Math.random();
      if (roll < 0.38) chosenSpecies = 'neontetra';
      else if (roll < 0.58) chosenSpecies = 'clownfish';
      else if (roll < 0.74) chosenSpecies = Math.random() < 0.5 ? 'bluetang' : 'yellowtang';
      else if (roll < 0.86) chosenSpecies = 'lionfish';
      else if (roll < 0.95) chosenSpecies = 'barracuda';
      else chosenSpecies = 'shark';
    }

    const preset = REAL_SPECIES_PRESETS[chosenSpecies] || REAL_SPECIES_PRESETS.neontetra;
    const pX = this.player ? this.player.x : this.worldWidth / 2;
    const pY = this.player ? this.player.y : this.worldHeight / 2;

    let x = Math.random() * this.worldWidth;
    let y = 150 + Math.random() * (this.worldHeight - 300);

    // Если хищник или крупная рыба — спавним вдали от игрока
    if (preset.stage >= 2) {
      let tries = 0;
      while (Math.hypot(x - pX, y - pY) < 1100 && tries < 15) {
        x = Math.random() * this.worldWidth;
        y = 150 + Math.random() * (this.worldHeight - 300);
        tries++;
      }
    }

    const stageData = EVOLUTION_STAGES[preset.stage - 1];
    const massVariance = stageData.minMass * (0.85 + Math.random() * 0.7);
    const npc = new Fish(x, y, {
      isPlayer: false,
      species: chosenSpecies,
      stage: preset.stage,
      mass: massVariance,
      radius: preset.baseRadius * (0.85 + Math.random() * 0.25),
      maxSpeed: preset.speed * (0.85 + Math.random() * 0.2),
      dashSpeed: preset.dashSpeed
    });

    this.fishes.push(npc);
  }

  triggerDash() {
    if (this.player && this.player.dashEnergy >= 25 && !this.player.isDashing) {
      this.player.isDashing = true;
      this.sound.playDash();

      // Выбрасываем пузырьки из-под хвоста
      for (let i = 0; i < 8; i++) {
        const seg = this.player.segments[this.player.segments.length - 1];
        this.env.spawnBubble(seg.x + (Math.random() - 0.5) * 15, seg.y + (Math.random() - 0.5) * 15, 3 + Math.random() * 4);
      }
    }
  }

  togglePause() {
    if (this.isGameOver || !this.isPlaying) return;
    this.isPaused = !this.isPaused;
    this.dom.pauseModal.classList.toggle('hidden', !this.isPaused);
  }

  loop(currentTime) {
    const dt = Math.min(32, currentTime - this.lastTime);
    this.lastTime = currentTime;

    if (!this.isPaused && this.isPlaying && !this.isGameOver) {
      this.update(dt);
    } else {
      // Даже на старте или паузе окружение и фоновые рыбы мягко плавают
      this.env.update();
      for (let f of this.fishes) {
        f.update(this.worldWidth, this.worldHeight, this.player || { x: 0, y: 0, radius: 0 }, this.fishes, this.planktons, this.gameSpeed);
      }
    }

    this.render();
    if (this.isPlaying) {
      this.renderRadar();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (!this.player) return;

    // 1. Управление направлением движения игрока
    if (this.touch.active && this.touch.distance > 0.1) {
      // Сенсорный виртуальный джойстик
      this.player.targetAngle = this.touch.angle;
    } else if (this.input.keys['KeyW'] || this.input.keys['KeyA'] || this.input.keys['KeyS'] || this.input.keys['KeyD'] ||
               this.input.keys['ArrowUp'] || this.input.keys['ArrowLeft'] || this.input.keys['ArrowDown'] || this.input.keys['ArrowRight']) {
      // Клавиатура WASD / Стрелки
      let dx = 0;
      let dy = 0;
      if (this.input.keys['KeyW'] || this.input.keys['ArrowUp']) dy -= 1;
      if (this.input.keys['KeyS'] || this.input.keys['ArrowDown']) dy += 1;
      if (this.input.keys['KeyA'] || this.input.keys['ArrowLeft']) dx -= 1;
      if (this.input.keys['KeyD'] || this.input.keys['ArrowRight']) dx += 1;
      if (dx !== 0 || dy !== 0) {
        this.player.targetAngle = Math.atan2(dy, dx);
      }
    } else {
      // Мышь / прямое касание
      const worldMouseX = this.camera.x + this.input.mouseX / this.camera.scale;
      const worldMouseY = this.camera.y + this.input.mouseY / this.camera.scale;
      this.player.targetAngle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
    }

    // 2. Обновление игрока с учетом множителя скорости
    this.player.update(this.worldWidth, this.worldHeight, this.player, this.fishes, this.planktons, this.gameSpeed);

    if (this.player.mass > this.maxBiomassAchieved) {
      this.maxBiomassAchieved = this.player.mass;
    }

    // 3. Плавная следящая камера
    const targetCamX = this.player.x - (window.innerWidth / 2) / this.camera.scale;
    const targetCamY = this.player.y - (window.innerHeight / 2) / this.camera.scale;
    this.camera.x += (targetCamX - this.camera.x) * 0.08;
    this.camera.y += (targetCamY - this.camera.y) * 0.08;

    // Масштаб камеры: комфортный обзор для увеличенных реалистичных рыб
    const stageScales = [1.35, 1.15, 0.90, 0.65];
    this.camera.targetScale = stageScales[this.player.stage - 1] || 1.0;
    this.camera.scale += (this.camera.targetScale - this.camera.scale) * 0.03;

    // Ограничение камеры миром
    const maxCamX = this.worldWidth - window.innerWidth / this.camera.scale;
    const maxCamY = this.worldHeight - window.innerHeight / this.camera.scale;
    if (maxCamX > 0) this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    if (maxCamY > 0) this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));

    // 4. Обновление окружения
    this.env.update();

    // 5. Обновление фауны
    this.clams.forEach(c => c.update());
    this.crabs.forEach(c => c.update(this.worldWidth));
    this.nautiluses.forEach(n => n.update(this.worldWidth, this.worldHeight));
    this.planktons.forEach(p => p.update());

    // Обновление других рыб с учетом множителя скорости
    for (let fish of this.fishes) {
      fish.update(this.worldWidth, this.worldHeight, this.player, this.fishes, this.planktons, this.gameSpeed);
    }

    // 6. Проверка коллизий и поедания
    this.checkCollisions();

    // 7. Пополнение экосистемы при убыли
    if (this.fishes.length < 25) {
      this.spawnRandomNPCFish();
    }
    if (this.planktons.length < 60) {
      this.planktons.push(new Plankton(
        Math.random() * this.worldWidth,
        150 + Math.random() * (this.worldHeight - 300)
      ));
    }

    // 8. Обновление частиц
    this.updateParticles();

    // 9. Обновление HUD
    this.updateHUD();
  }

  checkCollisions() {
    const p = this.player;
    const mouthX = p.x + Math.cos(p.angle) * (p.radius * 0.85);
    const mouthY = p.y + Math.sin(p.angle) * (p.radius * 0.85);
    const eatRadius = p.radius * 0.95;

    let nearestThreatDist = 9999;

    // А. Поедание планктона
    for (let i = this.planktons.length - 1; i >= 0; i--) {
      const plankton = this.planktons[i];
      const d = Math.hypot(mouthX - plankton.x, mouthY - plankton.y);
      if (d < eatRadius + plankton.radius) {
        p.triggerChomp();
        this.sound.playEatPlankton();
        this.addBiomass(plankton.mass, plankton.x, plankton.y);
        this.planktons.splice(i, 1);
      }
    }

    // Б. Поедание моллюсков (раковин / устриц)
    for (let clam of this.clams) {
      if (clam.isDead) continue;
      const d = Math.hypot(mouthX - clam.x, mouthY - clam.y);
      if (d < eatRadius + clam.radius) {
        if (clam.isOpen || p.stage >= 2) {
          clam.isDead = true;
          p.triggerChomp();
          this.sound.playEatClam(clam.isOpen);
          this.addBiomass(clam.mass * (clam.isOpen ? 2 : 1), clam.x, clam.y, '🦪 Жемчужница!');
          if (clam.isOpen && p.lives < (p.maxLives || 3)) {
            p.lives = Math.min(p.maxLives || 3, p.lives + 1);
            this.createFloatingText('💖 +1 ЖИЗНЬ!', clam.x, clam.y - 30);
            this.updateHUD();
          }
          this.spawnBiteParticles(clam.x, clam.y, clam.pearlColor);
        }
      }
    }

    // В. Поедание крабов
    for (let crab of this.crabs) {
      if (crab.isDead) continue;
      const d = Math.hypot(mouthX - crab.x, mouthY - crab.y);
      if (d < eatRadius + crab.radius && p.radius >= crab.radius * 0.9) {
        crab.isDead = true;
        p.triggerChomp();
        this.sound.playEatCrab();
        this.addBiomass(crab.mass, crab.x, crab.y, '🦀 Вкусный краб!');
        this.spawnBiteParticles(crab.x, crab.y, '#e53935');
      }
    }

    // Г. Поедание наутилусов
    for (let naut of this.nautiluses) {
      if (naut.isDead) continue;
      const d = Math.hypot(mouthX - naut.x, mouthY - naut.y);
      if (d < eatRadius + naut.radius && p.radius >= naut.radius * 0.95) {
        naut.isDead = true;
        p.triggerChomp();
        this.sound.playEatFish(naut.mass);
        this.addBiomass(naut.mass, naut.x, naut.y, '🌀 Наутилус!');
        this.spawnBiteParticles(naut.x, naut.y, '#ff7043');
      }
    }

    // Д. Взаимодействие с другими рыбами
    for (let i = this.fishes.length - 1; i >= 0; i--) {
      const npc = this.fishes[i];
      if (!npc) continue;
      const dist = Math.hypot(p.x - npc.x, p.y - npc.y);

      // 1. Поедание: Игрок может съесть рыбу, если его радиус превосходит ее
      if (p.radius >= npc.radius * 1.05) {
        const mouthDist = Math.hypot(mouthX - npc.x, mouthY - npc.y);
        if (mouthDist < eatRadius + npc.radius * 0.6) {
          p.triggerChomp();
          if (this.sound && this.sound.playEatFish) this.sound.playEatFish(npc.mass);
          const speciesInfo = (typeof REAL_SPECIES_PRESETS !== 'undefined' && REAL_SPECIES_PRESETS[npc.species]) || null;
          const fishName = speciesInfo ? speciesInfo.name : 'Рыба';
          this.addBiomass(npc.mass * 0.85, npc.x, npc.y, `🐟 ${fishName} +${Math.round(npc.mass)}г`);
          const biteColor = (npc.colors && npc.colors.body) || (speciesInfo && speciesInfo.color) || '#00e5ff';
          this.spawnBiteParticles(npc.x, npc.y, biteColor);
          this.fishes.splice(i, 1);
          continue;
        }
      } 
      // 2. Угроза от опасных хищников (акула, барракуда, крылатка или рыбы существенно больше игрока)
      else {
        const isCarnivore = ['barracuda', 'shark', 'lionfish'].includes(npc.species) || npc.stage >= 3;
        const isSignificantlyBigger = npc.radius > p.radius * 1.25;

        if (isCarnivore && isSignificantlyBigger) {
          if (dist < nearestThreatDist) nearestThreatDist = dist;

          const npcMouthX = npc.x + Math.cos(npc.angle) * (npc.radius * 0.85);
          const npcMouthY = npc.y + Math.sin(npc.angle) * (npc.radius * 0.85);
          const playerBiteDist = Math.hypot(npcMouthX - p.x, npcMouthY - p.y);

          if (playerBiteDist < npc.radius * 0.8 + p.radius * 0.5) {
            // Если защитный щит активен — атака хищника полностью отражается!
            if (p.shieldTimer > 0) {
              const pushAngle = Math.atan2(npc.y - p.y, npc.x - p.x);
              npc.vx += Math.cos(pushAngle) * 5;
              npc.vy += Math.sin(pushAngle) * 5;
              p.vx -= Math.cos(pushAngle) * 2;
              p.vy -= Math.sin(pushAngle) * 2;
              if (this.sound && this.sound.playEatSmall) this.sound.playEatSmall();
              this.spawnBiteParticles(p.x, p.y, '#00e5ff');
              continue;
            }

            // Удар хищника без щита: наносим урон жизням!
            npc.triggerChomp();
            p.lives = Math.max(0, (p.lives || 3) - 1);
            this.updateHUD();

            if (p.lives > 0) {
              // Игрок ранен, но жив! Даем щит неуязвимости на 3 секунды и сильный отброс
              p.hurtTimer = 45;
              p.shieldTimer = 180; // 3 сек неуязвимости
              const knockAngle = Math.atan2(p.y - npc.y, p.x - npc.x);
              p.vx += Math.cos(knockAngle) * 8;
              p.vy += Math.sin(knockAngle) * 8;
              npc.vx -= Math.cos(knockAngle) * 4;
              npc.vy -= Math.sin(knockAngle) * 4;

              if (this.sound && this.sound.playHurt) this.sound.playHurt();
              this.spawnBiteParticles(p.x, p.y, '#ff4757');
              this.createFloatingText('💔 УКУС ХИЩНИКА! (-1 Жизнь)', p.x, p.y);
              continue;
            } else {
              // Жизни исчерпаны — гибель
              this.triggerGameOver('Вас проглотил опасный хищник глубин!');
              return;
            }
          }
        }
      }

      // 3. Мягкое реалистичное отталкивание тел (физика упругого соударения в воде)
      // Предотвращает застревание, слипание и прохождение рыбок сквозь друг друга!
      const minBodyDist = p.radius + npc.radius;
      if (dist < minBodyDist && dist > 0.001) {
        const overlap = minBodyDist - dist;
        const nx = (p.x - npc.x) / dist;
        const ny = (p.y - npc.y) / dist;

        const totalRadius = p.radius + npc.radius;
        const pRatio = npc.radius / totalRadius;
        const npcRatio = p.radius / totalRadius;

        // Мягко раздвигаем тела
        p.x += nx * overlap * pRatio * 0.45;
        p.y += ny * overlap * pRatio * 0.45;
        npc.x -= nx * overlap * npcRatio * 0.45;
        npc.y -= ny * overlap * npcRatio * 0.45;

        // Плавный гидродинамический импульс
        const dashBonus = p.isDashing ? 1.6 : 0.6;
        p.vx += nx * 0.4 * dashBonus;
        p.vy += ny * 0.4 * dashBonus;
        npc.vx -= nx * 0.5;
        npc.vy -= ny * 0.5;

        if (p.isDashing && Math.random() < 0.25) {
          this.env.spawnBubble(p.x, p.y, 3.5);
        }
      }
    }

    // Предупреждение об опасности
    if (nearestThreatDist < p.radius * 6.5) {
      this.dom.dangerAlert.classList.remove('hidden');
      this.dangerCooldown++;
      if (this.dangerCooldown % 40 === 0) {
        this.sound.playHeartbeat();
      }
    } else {
      this.dom.dangerAlert.classList.add('hidden');
      this.dangerCooldown = 0;
    }
  }

  addBiomass(amount, x, y, label = null) {
    this.player.mass += amount;
    this.score += Math.round(amount * 10);
    this.preyEaten++;

    this.createFloatingText(label || `+${Math.round(amount)}г`, x, y);

    const curStage = EVOLUTION_STAGES[this.player.stage - 1];
    if (this.player.mass >= curStage.targetMass && this.player.stage < 4) {
      this.evolvePlayer(this.player.stage + 1);
    } else if (this.player.mass >= 5000 && this.player.stage === 4 && !this.freeplayMode) {
      this.triggerVictory();
    }
  }

  evolvePlayer(nextStageNum) {
    this.player.stage = nextStageNum;
    const stageData = EVOLUTION_STAGES[nextStageNum - 1];
    if (!stageData) return;

    this.player.species = stageData.species;
    this.player.maxSpeed = stageData.speed;
    this.player.dashSpeed = stageData.dashSpeed;
    this.player.colors = stageData.colors || { body: stageData.color || '#00e5ff' };
    this.player.evolutionGlow = 1;
    this.player.lives = this.player.maxLives || 3; // Полное исцеление при эволюции!

    if (this.sound && this.sound.playEvolution) this.sound.playEvolution();

    if (this.dom.evoNewName) this.dom.evoNewName.textContent = stageData.name;
    if (this.dom.evoDesc) this.dom.evoDesc.textContent = stageData.desc;
    this.drawEvoPreview(stageData);

    if (this.dom.evoModal) this.dom.evoModal.classList.remove('hidden');
    this.isPaused = true;
  }

  drawEvoPreview(stageData) {
    const cvs = this.dom.evoCanvas;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    const tempFish = new Fish(cvs.width / 2, cvs.height / 2, {
      species: stageData.species,
      stage: stageData.stage,
      radius: Math.min(38, Math.max(22, stageData.baseRadius * 0.42)),
      colors: stageData.colors || { body: stageData.color || '#00e5ff' },
      angle: 0
    });
    tempFish.draw(ctx, this.env.currentTheme);
  }

  triggerGameOver(reason) {
    this.isGameOver = true;
    if (this.sound && this.sound.playGameOver) this.sound.playGameOver();

    const causeEl = document.getElementById('gameover-cause');
    if (causeEl) causeEl.textContent = reason;

    const lenEl = document.getElementById('final-length');
    if (lenEl) {
      lenEl.textContent = (this.dom.fishLength && this.dom.fishLength.textContent) || (this.player ? `${Math.round(this.player.radius * 0.9)} см` : '12 см');
    }

    const massEl = document.getElementById('final-mass');
    if (massEl) massEl.textContent = `${Math.round(this.player ? this.player.mass : 0)} г`;

    const eatenEl = document.getElementById('final-eaten');
    if (eatenEl) eatenEl.textContent = this.preyEaten;

    const scoreEl = document.getElementById('final-score');
    if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

    if (this.dom.dangerAlert) this.dom.dangerAlert.classList.add('hidden');
    if (this.dom.gameoverModal) this.dom.gameoverModal.classList.remove('hidden');
  }

  triggerVictory() {
    this.sound.playEvolution();
    const vicScore = document.getElementById('victory-score');
    if (vicScore) vicScore.textContent = this.score.toLocaleString();
    if (this.dom.victoryModal) this.dom.victoryModal.classList.remove('hidden');
    this.isPaused = true;
  }

  spawnBiteParticles(x, y, color) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 2 + Math.random() * 4,
        color: color || '#ffffff',
        alpha: 1,
        life: 25 + Math.random() * 15
      });
    }
  }

  createFloatingText(text, worldX, worldY) {
    const screenX = (worldX - this.camera.x) * this.camera.scale;
    const screenY = (worldY - this.camera.y) * this.camera.scale;

    if (screenX < 0 || screenX > window.innerWidth || screenY < 0 || screenY > window.innerHeight) return;

    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;

    if (this.dom.floatingNotes) {
      this.dom.floatingNotes.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      p.alpha = p.life / 40;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateHUD() {
    if (!this.player) return;

    const stageData = EVOLUTION_STAGES[this.player.stage - 1];
    if (stageData) {
      if (this.dom.stageNum) this.dom.stageNum.textContent = this.player.stage;
      if (this.dom.stageName) this.dom.stageName.textContent = stageData.name;
      if (this.dom.stageIcon) this.dom.stageIcon.textContent = stageData.icon;

      if (this.dom.currentMass) this.dom.currentMass.textContent = Math.round(this.player.mass);
      if (this.dom.targetMass) this.dom.targetMass.textContent = stageData.targetMass;

      const range = stageData.targetMass - stageData.minMass;
      const current = Math.max(0, this.player.mass - stageData.minMass);
      const pct = Math.min(100, Math.round((current / Math.max(1, range)) * 100));
      if (this.dom.growthBar) this.dom.growthBar.style.width = `${pct}%`;
    }

    // Жизни игрока (сердечки)
    if (this.dom.hudLives) {
      const curLives = Math.max(0, this.player.lives || 0);
      const maxLives = this.player.maxLives || 3;
      this.dom.hudLives.textContent = '❤️'.repeat(curLives) + '🖤'.repeat(Math.max(0, maxLives - curLives));
    }

    const estLength = Math.round(this.player.radius * 0.9);
    if (this.dom.fishLength) {
      this.dom.fishLength.textContent = estLength >= 100 ? `${(estLength / 100).toFixed(1)} м` : `${estLength} см`;
    }

    if (this.dom.hudScore) this.dom.hudScore.textContent = this.score.toLocaleString();

    const depthMeters = Math.round((this.player.y / this.worldHeight) * 200);
    if (this.dom.depthMeter) this.dom.depthMeter.textContent = depthMeters;

    const boostPct = Math.round(this.player.dashEnergy || 0);
    if (this.dom.boostFill) this.dom.boostFill.style.width = `${boostPct}%`;
    if (this.dom.boostPct) this.dom.boostPct.textContent = `${boostPct}%`;
  }

  render() {
    const ctx = this.ctx;
    const theme = this.env.currentTheme;

    // Полная очистка холста
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    ctx.save();
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Задний план (Океан, лучи, дальние водоросли, медузы)
    this.env.drawBackground(ctx, this.camera);

    // В неоновом режиме — световая аура игрока (освещает темноту вокруг себя)
    if (theme === 'neon' && this.player) {
      const aura = ctx.createRadialGradient(
        this.player.x, this.player.y, this.player.radius * 0.4,
        this.player.x, this.player.y, this.player.radius * 5.5
      );
      aura.addColorStop(0, 'rgba(0, 255, 204, 0.22)');
      aura.addColorStop(0.4, 'rgba(0, 229, 255, 0.08)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.radius * 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Раковины на дне
    for (let c of this.clams) c.draw(ctx, theme);

    // 3. Крабы
    for (let c of this.crabs) c.draw(ctx, theme);

    // 4. Планктон и криль
    for (let p of this.planktons) p.draw(ctx, theme);

    // 5. Наутилусы
    for (let n of this.nautiluses) n.draw(ctx, theme);

    // 6. Другие рыбы
    for (let f of this.fishes) f.draw(ctx, theme);

    // 7. Игрок
    if (this.player) this.player.draw(ctx, theme);

    // 8. Частицы
    this.renderParticles(ctx);

    // 9. Передний план (Ближние водоросли, дно, кораллы, пузыри)
    this.env.drawForeground(ctx, this.camera);

    ctx.restore();
  }

  renderParticles(ctx) {
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  }

  renderRadar() {
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radarRadius = w / 2 - 4;

    ctx.clearRect(0, 0, w, h);

    if (!this.player) return;

    // Сетка эхолота
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius * 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.moveTo(cx, 4); ctx.lineTo(cx, h - 4);
    ctx.moveTo(4, cy); ctx.lineTo(w - 4, cy);
    ctx.stroke();

    // Игрок в центре
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00e5ff';
    ctx.fill();

    const scanRange = 750;
    const scale = radarRadius / scanRange;

    // Рыбы на радаре
    for (let f of this.fishes) {
      const dx = f.x - this.player.x;
      const dy = f.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < scanRange) {
        const rx = cx + dx * scale;
        const ry = cy + dy * scale;

        ctx.beginPath();
        ctx.arc(rx, ry, f.radius > this.player.radius ? 3 : 2, 0, Math.PI * 2);

        if (f.radius > this.player.radius * 1.1) {
          ctx.fillStyle = '#ff4757';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ff4757';
        } else {
          ctx.fillStyle = '#2ed573';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#2ed573';
        }
        ctx.fill();
      }
    }

    // Раковины на дне (золотые точки)
    for (let c of this.clams) {
      if (c.isDead) continue;
      const dx = c.x - this.player.x;
      const dy = c.y - this.player.y;
      if (Math.hypot(dx, dy) < scanRange) {
        ctx.beginPath();
        ctx.arc(cx + dx * scale, cy + dy * scale, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd166';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#ffd166';
        ctx.fill();
      }
    }
  }
}

// Запуск игры после загрузки DOM
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameManager();
  });
} else {
  window.game = new GameManager();
}
