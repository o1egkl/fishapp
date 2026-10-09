/**
 * AquaGenesis Creature Engine - Реалистичная ихтиология
 * Реальные виды рыб:
 * 1. Неоновая Тетра (Paracheirodon innesi) - Малёк
 * 2. Рыба-Клоун Оцеллярис (Amphiprion ocellatus)
 * 3. Голубой Хирург / Дори (Paracanthurus hepatus)
 * 4. Желтая Зебрасома (Zebrasoma flavescens)
 * 5. Крылатка-Зебра (Pterois volitans)
 * 6. Большая Барракуда (Sphyraena barracuda)
 * 7. Большая Белая Акула (Carcharodon carcharias)
 */

// Стадии эволюции игрока на основе реальных рыб (8 Уровней)
const EVOLUTION_STAGES = [
  {
    stage: 1,
    species: 'neontetra',
    name: 'Неоновая Тетра (Малёк)',
    latin: 'Paracheirodon innesi',
    icon: '🐟',
    minMass: 10,
    targetMass: 80,
    baseRadius: 24,
    speed: 0.85,
    dashSpeed: 1.75,
    lengthCm: '4 - 10 см',
    desc: 'Крошечная юркая тетра со светящейся неоновой полосой и алым хвостом. Питайтесь планктоном!'
  },
  {
    stage: 2,
    species: 'clownfish',
    name: 'Рыба-Клоун (Оцеллярис)',
    latin: 'Amphiprion ocellatus',
    icon: '🐠',
    minMass: 80,
    targetMass: 240,
    baseRadius: 36,
    speed: 0.95,
    dashSpeed: 1.95,
    lengthCm: '12 - 22 см',
    desc: 'Яркая рифовая рыба с 3 белоснежными полосами и черной каймой плавников. Охотьтесь на моллюсков!'
  },
  {
    stage: 3,
    species: 'yellowtang',
    name: 'Желтая Зебрасома',
    latin: 'Zebrasoma flavescens',
    icon: '💛',
    minMass: 240,
    targetMass: 600,
    baseRadius: 48,
    speed: 1.05,
    dashSpeed: 2.1,
    lengthCm: '20 - 30 см',
    desc: 'Маневренная лимонная рыба коралловых атоллов. Легко собирает моллюсков и планктон!'
  },
  {
    stage: 4,
    species: 'bluetang',
    name: 'Голубой Хирург (Дори)',
    latin: 'Paracanthurus hepatus',
    icon: '🐟',
    minMass: 600,
    targetMass: 1400,
    baseRadius: 62,
    speed: 1.15,
    dashSpeed: 2.25,
    lengthCm: '28 - 38 см',
    desc: 'Быстрая рифовая рыба с глубоким сапфировым окрасом и острым хвостовым шипом!'
  },
  {
    stage: 5,
    species: 'lionfish',
    name: 'Крылатка-Зебра',
    latin: 'Pterois volitans',
    icon: '🐡',
    minMass: 1400,
    targetMass: 3000,
    baseRadius: 80,
    speed: 1.25,
    dashSpeed: 2.4,
    lengthCm: '40 - 60 см',
    desc: 'Опасный хищник с ядовитыми веерными лучами плавников. Пожирает большинство рыб рифа!'
  },
  {
    stage: 6,
    species: 'barracuda',
    name: 'Большая Барракуда',
    latin: 'Sphyraena barracuda',
    icon: '🦈',
    minMass: 3000,
    targetMass: 6500,
    baseRadius: 104,
    speed: 1.35,
    dashSpeed: 2.55,
    lengthCm: '1.2 - 1.8 м',
    desc: 'Стреловидный хищник с выступающей челюстью и кинжальными зубами. Сверхбыстрая торпеда!'
  },
  {
    stage: 7,
    species: 'shark',
    name: 'Большая Белая Акула',
    latin: 'Carcharodon carcharias',
    icon: '🦈',
    minMass: 6500,
    targetMass: 14000,
    baseRadius: 136,
    speed: 1.45,
    dashSpeed: 2.7,
    lengthCm: '4 - 6 метров',
    desc: 'Вершинный сверххищник современного океана с мощными челюстями и серповидным хвостом!'
  },
  {
    stage: 8,
    species: 'megalodon',
    name: 'Древний Мегалодон',
    latin: 'Otodus megalodon',
    icon: '👑',
    minMass: 14000,
    targetMass: 30000,
    baseRadius: 185,
    speed: 1.55,
    dashSpeed: 2.85,
    lengthCm: '15 - 20 метров',
    desc: 'Легендарный Владыка Мирового Океана! Абсолютный гигант, господствующий над бездной!'
  }
];

// Пресеты реальных видов для экосистемы
const REAL_SPECIES_PRESETS = {
  neontetra: {
    species: 'neontetra',
    name: 'Неоновая Тетра',
    stage: 1,
    baseRadius: 24,
    speed: 0.82,
    dashSpeed: 1.7,
    numSegments: 7,
    color: '#00e5ff'
  },
  clownfish: {
    species: 'clownfish',
    name: 'Рыба-Клоун',
    stage: 2,
    baseRadius: 36,
    speed: 0.92,
    dashSpeed: 1.9,
    numSegments: 8,
    color: '#ff6d00'
  },
  yellowtang: {
    species: 'yellowtang',
    name: 'Желтая Зебрасома',
    stage: 3,
    baseRadius: 48,
    speed: 0.98,
    dashSpeed: 2.0,
    numSegments: 8,
    color: '#ffd600'
  },
  bluetang: {
    species: 'bluetang',
    name: 'Голубой Хирург (Дори)',
    stage: 4,
    baseRadius: 62,
    speed: 1.05,
    dashSpeed: 2.1,
    numSegments: 8,
    color: '#2979ff'
  },
  lionfish: {
    species: 'lionfish',
    name: 'Крылатка-Зебра',
    stage: 5,
    baseRadius: 80,
    speed: 1.15,
    dashSpeed: 2.25,
    numSegments: 9,
    color: '#d84315'
  },
  barracuda: {
    species: 'barracuda',
    name: 'Большая Барракуда',
    stage: 6,
    baseRadius: 104,
    speed: 1.25,
    dashSpeed: 2.4,
    numSegments: 9,
    color: '#90a4ae'
  },
  shark: {
    species: 'shark',
    name: 'Большая Белая Акула',
    stage: 7,
    baseRadius: 136,
    speed: 1.35,
    dashSpeed: 2.6,
    numSegments: 10,
    color: '#546e7a'
  },
  megalodon: {
    species: 'megalodon',
    name: 'Древний Мегалодон',
    stage: 8,
    baseRadius: 185,
    speed: 1.45,
    dashSpeed: 2.75,
    numSegments: 11,
    color: '#37474f'
  }
};

class Fish {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.cruiseDir = (options.angle !== undefined && Math.cos(options.angle) < 0) ? -1 : (Math.random() < 0.5 ? 1 : -1);
    this.wanderPitch = (Math.random() - 0.5) * 0.25;
    if (options.angle !== undefined) {
      this.angle = options.angle;
    } else {
      this.angle = this.cruiseDir > 0 ? this.wanderPitch : (Math.PI - this.wanderPitch);
    }
    this.targetAngle = this.angle;

    this.isPlayer = options.isPlayer || false;
    this.stage = options.stage || 1;
    this.species = options.species || (this.isPlayer ? EVOLUTION_STAGES[this.stage - 1].species : 'neontetra');

    const defaultColor = (REAL_SPECIES_PRESETS[this.species] && REAL_SPECIES_PRESETS[this.species].color) || '#00e5ff';
    this.colors = options.colors || { body: defaultColor };

    const defaultMasses = [15, 120, 350, 800, 1800, 4000, 8000, 18000];
    const defaultRadii = [24, 36, 48, 62, 80, 104, 136, 185];
    this.mass = options.mass || (defaultMasses[this.stage - 1] || 15);
    this.radius = options.radius || (defaultRadii[this.stage - 1] || 24);
    this.maxSpeed = options.maxSpeed || 0.85;
    this.dashSpeed = options.dashSpeed || 1.75;
    this.turnSpeed = options.turnSpeed || (this.isPlayer ? 0.24 : 0.065);
    this.targetDist = options.targetDist !== undefined ? options.targetDist : 100;

    // Процедурный скелет (сегменты позвоночника)
    this.numSegments = options.numSegments || (this.species === 'megalodon' ? 11 : this.species === 'shark' ? 10 : this.species === 'barracuda' ? 9 : 8);
    this.segments = [];
    for (let i = 0; i < this.numSegments; i++) {
      this.segments.push({
        x: this.x - Math.cos(this.angle) * i * (this.radius * 0.45),
        y: this.y - Math.sin(this.angle) * i * (this.radius * 0.45),
        angle: this.angle
      });
    }

    // Анимация плавников и хвоста
    this.tailPhase = Math.random() * Math.PI * 2;
    this.finCycle = 0;
    this.mouthOpen = 0;
    this.chompTimer = 0;

    // Рывок / Ускорение
    this.isDashing = false;
    this.dashEnergy = 100;
    this.maxDashEnergy = 100;

    // ИИ параметры для NPC
    this.aiState = 'WANDER';
    this.aiChangeTimer = Math.random() * 90 + 60;
    this.wanderAngle = this.angle;
    this.feedCooldown = options.feedCooldown !== undefined ? options.feedCooldown : Math.floor(Math.random() * 120);

    // Эффекты и щит неуязвимости
    this.hurtTimer = 0;
    this.evolutionGlow = 0;
    this.shieldTimer = options.shieldTimer || 0;
    this.pulseAnim = 0;
    this.lives = options.lives !== undefined ? options.lives : (this.isPlayer ? 3 : 1);
    this.maxLives = 3;

    // Плавный 3D-разворот влево/вправо без переворачивания кверху брюхом
    this.facing = Math.cos(this.angle) >= 0 ? 1 : -1;
    this.smoothFacing = this.facing;
    this.pitch = this.angle;
  }

  update(worldWidth, worldHeight, player, otherFish, foods, speedMult = 1) {
    if (this.isPlayer) {
      this.updatePlayer();
    } else {
      this.updateAI(player, otherFish, foods);
    }

    // Плавный рост радиуса игрока в зависимости от биомассы
    if (this.isPlayer) {
      const targetRadius = Math.max(22, Math.pow(this.mass, 0.215) * 13.5);
      this.radius += (targetRadius - this.radius) * 0.05;
    }

    // Физика движения с учетом множителя скорости
    const speed = Math.hypot(this.vx, this.vy);
    this.x += this.vx * speedMult;
    this.y += this.vy * speedMult;

    // Плавное гидродинамическое сопротивление воды
    const friction = this.isDashing ? 0.94 : 0.91;
    this.vx *= friction;
    this.vy *= friction;

    // Ограничение по границам мира с мягким отталкиванием
    const pad = this.radius * 2;
    if (this.x < pad) { this.x = pad; this.vx = Math.abs(this.vx) * 0.4; }
    if (this.x > worldWidth - pad) { this.x = worldWidth - pad; this.vx = -Math.abs(this.vx) * 0.4; }
    if (this.y < pad) { this.y = pad; this.vy = Math.abs(this.vy) * 0.4; }
    if (this.y > worldHeight - pad) { this.y = worldHeight - pad; this.vy = -Math.abs(this.vy) * 0.4; }

    // Плавный поворот к цели: игрок поворачивается динамично и мгновенно слушается мышь
    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const turnRate = this.isPlayer
      ? (this.isDashing ? 0.32 : 0.25)
      : this.turnSpeed;
    this.angle += diff * turnRate;

    // Отслеживание направления (влево / вправо)
    this.facing = Math.cos(this.angle) < 0 ? -1 : 1;

    // Плавный поворот тела в 3D
    const turnLerp = this.isPlayer ? 0.38 : 0.18;
    this.smoothFacing += (this.facing - this.smoothFacing) * turnLerp;
    this.pitch = this.angle;

    // Гидродинамическая частота взмахов хвоста:
    // Крупные рыбы (акула, барракуда) совершают размеренные, мощные толчки хвостом,
    // а мелкие рыбы двигаются с более высокой частотой.
    let baseFreq = 0.038;
    if (this.species === 'megalodon') {
      baseFreq = 0.016;
    } else if (this.species === 'shark') {
      baseFreq = 0.020;
    } else if (this.species === 'barracuda') {
      baseFreq = 0.026;
    } else if (this.species === 'lionfish') {
      baseFreq = 0.030;
    } else if (this.species === 'neontetra') {
      baseFreq = 0.046;
    }
    const swimFreq = (baseFreq + speed * 0.024) * speedMult;
    this.tailPhase += swimFreq;
    this.finCycle += swimFreq * 1.1;
    this.pulseAnim += 0.05 * speedMult;

    // Голова рыбы ведет за собой позвоночник
    this.segments[0].x = this.x;
    this.segments[0].y = this.y;
    this.segments[0].angle = this.angle;

    const segmentDist = this.radius * 0.42;
    for (let i = 1; i < this.numSegments; i++) {
      const prev = this.segments[i - 1];
      const cur = this.segments[i];

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const curAngle = Math.atan2(dy, dx);

      // Плавное синусоидальное колебание хвоста
      const wave = Math.sin(this.tailPhase - i * 0.55) * (i * 0.065) * (speed + 0.6);
      const targetSegAngle = curAngle + wave * 0.12;

      cur.x = prev.x + Math.cos(targetSegAngle) * segmentDist;
      cur.y = prev.y + Math.sin(targetSegAngle) * segmentDist;
      cur.angle = targetSegAngle;
    }

    if (this.chompTimer > 0) {
      this.chompTimer--;
      this.mouthOpen = Math.sin((this.chompTimer / 12) * Math.PI);
    } else {
      this.mouthOpen = 0;
    }

    if (this.hurtTimer > 0) this.hurtTimer--;
    if (this.evolutionGlow > 0) this.evolutionGlow -= 0.02;
    if (this.shieldTimer > 0) this.shieldTimer--;
    if (this.feedCooldown > 0) this.feedCooldown--;

    // Регенерация энергии рывка для игрока
    if (this.isPlayer) {
      if (this.isDashing) {
        this.dashEnergy = Math.max(0, this.dashEnergy - 0.9);
        if (this.dashEnergy <= 0) {
          this.isDashing = false;
        }
      } else {
        this.dashEnergy = Math.min(this.maxDashEnergy, this.dashEnergy + 0.35);
      }
    }
  }

  updatePlayer() {
    const curSpeed = this.isDashing ? this.dashSpeed : this.maxSpeed;

    // Расчет разницы между текущим направлением рыбы и целевым углом
    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    // Движение вперед строго по направлению носа рыбы (this.angle)!
    // Когда рыба еще разворачивается, тяга плавно модулируется, исключая неестественное движение задом наперед.
    const forwardAlignment = Math.max(0.18, Math.cos(diff));
    const distFactor = (this.targetDist !== undefined)
      ? Math.min(1.0, Math.max(0.08, this.targetDist / 35))
      : 1.0;

    const accel = (curSpeed * 0.12) * forwardAlignment * distFactor;
    this.vx += Math.cos(this.angle) * accel;
    this.vy += Math.sin(this.angle) * accel;
  }

  updateAI(player, otherFish, foods) {
    this.aiChangeTimer--;

    const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
    const sightRange = this.radius * 5.0;

    let wantsToFlee = false;
    let fleeX = 0;
    let fleeY = 0;
    let closestThreatDist = 99999;

    // 1. Оценка опасности от игрока
    if (distToPlayer < sightRange && player.radius > this.radius * 1.15) {
      wantsToFlee = true;
      closestThreatDist = distToPlayer;
      fleeX = this.x - player.x;
      fleeY = this.y - player.y;
    }

    // 2. Оценка опасности от других хищников среди NPC (акулы, барракуды, мегалодоны, крылатки или рыбы крупнее)
    if (Array.isArray(otherFish)) {
      for (let other of otherFish) {
        if (!other || other === this) continue;
        const isPred = ['megalodon', 'shark', 'barracuda', 'lionfish'].includes(other.species) || other.stage >= 5;
        const isSignificantlyBigger = other.radius > this.radius * 1.2;
        if (isPred && isSignificantlyBigger) {
          const d = Math.hypot(this.x - other.x, this.y - other.y);
          if (d < sightRange && d < closestThreatDist) {
            wantsToFlee = true;
            closestThreatDist = d;
            fleeX = this.x - other.x;
            fleeY = this.y - other.y;
          }
        }
      }
    }

    // Реакция бегства от опасности (FLEE)
    if (wantsToFlee) {
      this.aiState = 'FLEE';
      // Убегаем в горизонтальном направлении с умеренным вертикальным уклонением
      const fleeDirX = Math.sign(fleeX) || (this.cruiseDir || 1);
      this.cruiseDir = fleeDirX;
      const fleePitch = Math.max(-0.45, Math.min(0.45, fleeY / (Math.abs(fleeX) + 120)));
      this.targetAngle = fleeDirX > 0 ? fleePitch : (fleePitch >= 0 ? Math.PI - fleePitch : -Math.PI - fleePitch);
      const fleeSpeed = this.maxSpeed * 0.90;
      this.vx += Math.cos(this.targetAngle) * (fleeSpeed * 0.045);
      this.vy += Math.sin(this.targetAngle) * (fleeSpeed * 0.045);
      return;
    }

    // Охота хищников: ТОЛЬКО настоящие хищные виды (барракуда, акула, мегалодон, крылатка) или хищники 5-8 стадий
    // Мирные рифовые рыбки (тетра, клоун, хирург, зебрасома) не нападают на рыб
    const isPredatoryCarnivore = ['barracuda', 'shark', 'lionfish', 'megalodon'].includes(this.species) || this.stage >= 5;

    // А. Охота на игрока (если игрок меньше и не защищен щитом)
    const canHuntPlayer = isPredatoryCarnivore && distToPlayer < sightRange * 0.85 && 
                          this.radius > player.radius * 1.25 && 
                          (!player.shieldTimer || player.shieldTimer <= 0);

    if (canHuntPlayer) {
      this.aiState = 'CHASE';
      const chaseX = player.x - this.x;
      const chaseY = player.y - this.y;
      const chaseDirX = Math.sign(chaseX) || (this.cruiseDir || 1);
      this.cruiseDir = chaseDirX;
      const chasePitch = Math.max(-0.42, Math.min(0.42, chaseY / (Math.abs(chaseX) + 100)));
      this.targetAngle = chaseDirX > 0 ? chasePitch : (chasePitch >= 0 ? Math.PI - chasePitch : -Math.PI - chasePitch);
      const huntSpeed = this.maxSpeed * 0.75;
      this.vx += Math.cos(this.targetAngle) * (huntSpeed * 0.035);
      this.vy += Math.sin(this.targetAngle) * (huntSpeed * 0.035);
      return;
    }

    // Б. Охота на других NPC рыб (когда хищник голоден)
    if (isPredatoryCarnivore && (!this.feedCooldown || this.feedCooldown <= 0) && Array.isArray(otherFish)) {
      let closestPrey = null;
      let minPreyDist = sightRange * 0.85;

      for (let other of otherFish) {
        if (!other || other === this) continue;
        if (this.radius >= other.radius * 1.25) {
          const d = Math.hypot(this.x - other.x, this.y - other.y);
          if (d < minPreyDist) {
            minPreyDist = d;
            closestPrey = other;
          }
        }
      }

      if (closestPrey) {
        this.aiState = 'CHASE';
        const chaseX = closestPrey.x - this.x;
        const chaseY = closestPrey.y - this.y;
        const chaseDirX = Math.sign(chaseX) || (this.cruiseDir || 1);
        this.cruiseDir = chaseDirX;
        const chasePitch = Math.max(-0.40, Math.min(0.40, chaseY / (Math.abs(chaseX) + 100)));
        this.targetAngle = chaseDirX > 0 ? chasePitch : (chasePitch >= 0 ? Math.PI - chasePitch : -Math.PI - chasePitch);
        const huntSpeed = this.maxSpeed * 0.70;
        this.vx += Math.cos(this.targetAngle) * (huntSpeed * 0.032);
        this.vy += Math.sin(this.targetAngle) * (huntSpeed * 0.032);
        return;
      }
    }

    // Спокойное ихтиологическое крейсирование: рыбы плавают преимущественно горизонтально (влево или вправо),
    // плавно покачиваясь по глубине (вверх/вниз не более ±18 градусов)
    if (this.aiChangeTimer <= 0) {
      this.aiChangeTimer = 100 + Math.random() * 150;
      // В 25% случаев рыба плавно разворачивается в противоположную сторону
      if (Math.random() < 0.25) {
        this.cruiseDir = -(this.cruiseDir || 1);
      }
      this.wanderPitch = (Math.random() - 0.5) * 0.30;
    }

    // Пространственное уклонение от других рыб при свободном плавании
    // (предотвращает синхронное нагромождение и параллельный заплыв на одной глубине)
    if (Array.isArray(otherFish)) {
      for (let other of otherFish) {
        if (!other || other === this) continue;
        const combinedR = this.radius + other.radius;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const d = Math.hypot(dx, dy);

        if (d < combinedR * 1.8) {
          if (Math.abs(dy) < combinedR * 1.2) {
            const steerY = (this.y >= other.y ? 0.06 : -0.06);
            this.wanderPitch = (this.wanderPitch || 0) + steerY;
          }
        }
      }
    }

    // Отталкивание от верхней кромки (поверхности) и морского дна
    if (this.y < 250) {
      this.wanderPitch = Math.abs(this.wanderPitch || 0) + 0.15; // плавно уходим глубже
    } else if (this.y > 2100) {
      this.wanderPitch = -Math.abs(this.wanderPitch || 0) - 0.15; // плавно всплываем
    }

    const currentPitch = Math.max(-0.35, Math.min(0.35, this.wanderPitch || 0));
    this.targetAngle = this.cruiseDir > 0 
      ? currentPitch 
      : (currentPitch >= 0 ? Math.PI - currentPitch : -Math.PI - currentPitch);

    const wanderSpeed = this.maxSpeed * 0.45;
    this.vx += Math.cos(this.targetAngle) * (wanderSpeed * 0.025);
    this.vy += Math.sin(this.targetAngle) * (wanderSpeed * 0.025);
  }

  triggerChomp() {
    this.chompTimer = 14;
  }

  // ГЛАВНЫЙ МЕТОД ОТРИСОВКИ РЕАЛИСТИЧНОЙ РЫБЫ
  draw(ctx, theme = 'day') {
    ctx.save();

    // Маркер игрока и защитный щит
    if (this.isPlayer) {
      this.drawPlayerIndicators(ctx, theme);
    }

    // Если загружен реальный фотографический спрайт — используем фотореалистичный рендерер с живым изгибом тела!
    let drawn = false;
    if (window.assetManager) {
      drawn = window.assetManager.drawFish(
        ctx,
        this.species,
        this.x,
        this.y,
        this.radius,
        this.angle,
        this.tailPhase,
        this.isDashing,
        theme,
        this.smoothFacing,
        this.pitch
      );
    }

    // Резервная отрисовка процедурной модели, пока текстуры загружаются
    if (!drawn) {
      switch (this.species) {
        case 'clownfish':
          this.drawClownfish(ctx, theme);
          break;
        case 'bluetang':
          this.drawBlueTang(ctx, theme);
          break;
        case 'yellowtang':
          this.drawYellowTang(ctx, theme);
          break;
        case 'barracuda':
          this.drawBarracuda(ctx, theme);
          break;
        case 'shark':
          this.drawShark(ctx, theme);
          break;
        case 'lionfish':
          this.drawLionfish(ctx, theme);
          break;
        case 'neontetra':
        default:
          this.drawNeonTetra(ctx, theme);
          break;
      }
    }

    ctx.restore();
  }

  drawPlayerIndicators(ctx, theme) {
    const r = this.radius;
    const pulse = Math.sin(this.pulseAnim) * 4;

    ctx.save();
    // Ореол под игроком
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 1.5 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = theme === 'neon' ? 'rgba(0, 255, 204, 0.6)' : 'rgba(0, 210, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();

    // Вспышка урона при укусе
    if (this.hurtTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.5 + Math.sin(this.hurtTimer * 0.8) * 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 30, 60, ${Math.min(0.55, this.hurtTimer / 30)})`;
      ctx.fill();
      ctx.strokeStyle = '#ff1744';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Щит неуязвимости
    if (this.shieldTimer > 0) {
      const shieldSec = Math.ceil(this.shieldTimer / 60);
      const shieldRadius = r * 1.8 + pulse * 1.5;

      ctx.beginPath();
      ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00e5ff';
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#000000';
      const shieldTxt = (typeof window !== 'undefined' && window.I18N)
        ? window.I18N.t('shieldIndicator', { sec: shieldSec })
        : `🛡️ ЩИТ (${shieldSec}с)`;
      ctx.fillText(shieldTxt, this.x, this.y - shieldRadius - 8);
    } else {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = theme === 'neon' ? '#00ffcc' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#000000';
      const youTxt = (typeof window !== 'undefined' && window.I18N)
        ? window.I18N.t('playerIndicator')
        : 'ВЫ 🐟';
      ctx.fillText(youTxt, this.x, this.y - r * 1.5 - 6);
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. НЕОНОВАЯ ТЕТРА (Paracheirodon innesi) - Стадия 1
  // Стеклянное тельце, неоновая бирюзовая полоса и алый хвост
  // =========================================================================
  drawNeonTetra(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Хвостовой плавник (раздвоенный, полупрозрачный)
    const tailSeg = segs[n - 1];
    ctx.save();
    ctx.translate(tailSeg.x, tailSeg.y);
    ctx.rotate(tailSeg.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.9, -r * 0.65);
    ctx.lineTo(-r * 0.6, 0);
    ctx.lineTo(-r * 0.9, r * 0.65);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();
    ctx.restore();

    // Тело тетры
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      return Math.sin(t * Math.PI) * (r * 0.75);
    });

    ctx.beginPath();
    ctx.moveTo(segs[0].x + Math.cos(segs[0].angle) * (r * 0.8), segs[0].y + Math.sin(segs[0].angle) * (r * 0.8));
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(tailSeg.x, tailSeg.y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    // Серебристо-оливковая основа тела
    const grad = ctx.createLinearGradient(left[1].x, left[1].y, right[1].x, right[1].y);
    grad.addColorStop(0, '#102a43');
    grad.addColorStop(0.5, '#243b53');
    grad.addColorStop(1, '#829ab1');
    ctx.fillStyle = grad;
    ctx.fill();

    // Алое пятно на задней половине тела
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(segs[Math.floor(n * 0.4)].x, segs[Math.floor(n * 0.4)].y);
    for (let i = Math.floor(n * 0.4); i < right.length; i++) ctx.lineTo(right[i].x, right[i].y);
    ctx.lineTo(tailSeg.x, tailSeg.y);
    ctx.closePath();
    ctx.fillStyle = '#ff1744';
    ctx.fill();
    ctx.restore();

    // Знаменитая светящаяся неоново-бирюзовая полоса
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(segs[0].x, segs[0].y);
    for (let i = 1; i < n - 2; i++) {
      const seg = segs[i];
      const norm = seg.angle + Math.PI / 2;
      ctx.lineTo(seg.x + Math.cos(norm) * (r * 0.25), seg.y + Math.sin(norm) * (r * 0.25));
    }
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = Math.max(2.5, r * 0.18);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00e5ff';
    ctx.stroke();
    ctx.restore();

    // Глаз тетры с бирюзовым ободком
    this.drawRealisticEye(ctx, segs[0], r * 0.24, '#00e5ff');
  }

  // =========================================================================
  // 2. РЫБА-КЛОУН (Amphiprion ocellatus) - Стадия 2
  // Сочный оранжевый цвет, 3 белые полосы с черной каймой, круглые плавники
  // =========================================================================
  drawClownfish(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Округлый веерообразный хвост с черной каймой
    const tailSeg = segs[n - 1];
    ctx.save();
    ctx.translate(tailSeg.x, tailSeg.y);
    ctx.rotate(tailSeg.angle);
    ctx.beginPath();
    ctx.arc(-r * 0.4, 0, r * 0.65, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = '#ff6d00';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.stroke();
    // Белая окантовка края
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Спинной закругленный плавник
    this.drawCurvedFin(ctx, segs[2], -1, r * 0.9, r * 0.5, '#ff6d00');

    // Профиль тела клоуна (пузатенькое овальное)
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      if (i === 0) return r * 0.65;
      if (i <= 2) return r * 0.98; // пузико
      return Math.sin(t * Math.PI) * (r * 0.95);
    });

    ctx.beginPath();
    ctx.moveTo(segs[0].x + Math.cos(segs[0].angle) * (r * 0.85), segs[0].y + Math.sin(segs[0].angle) * (r * 0.85));
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(tailSeg.x, tailSeg.y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    // Насыщенный мандариновый цвет тела
    const grad = ctx.createLinearGradient(left[1].x, left[1].y, right[1].x, right[1].y);
    grad.addColorStop(0, '#e65100');
    grad.addColorStop(0.5, '#ff6d00');
    grad.addColorStop(1, '#ff9e40');
    ctx.fillStyle = grad;
    ctx.fill();

    // 3 НАСТОЯЩИХ БЕЛЫХ ПОЛОСЫ С ЧЕРНОЙ КАЙМОЙ:
    // Полоса 1: за глазом (голова)
    this.drawClownStripe(ctx, segs[1], r * 0.95, false);
    // Полоса 2: в центре тела с треугольным выступом
    this.drawClownStripe(ctx, segs[3], r * 0.9, true);
    // Полоса 3: на хвостовом стебле
    this.drawClownStripe(ctx, segs[n - 2], r * 0.45, false);

    // Грудные круглые плавники с черной каймой
    this.drawPectoralFinsBordered(ctx, segs[1], r * 0.65, '#ff6d00');

    // Глаз клоуна (оранжевый с бликом)
    this.drawRealisticEye(ctx, segs[0], r * 0.22, '#ff9800');
  }

  drawClownStripe(ctx, seg, width, hasBulge) {
    ctx.save();
    ctx.translate(seg.x, seg.y);
    ctx.rotate(seg.angle);

    ctx.beginPath();
    if (hasBulge) {
      // Центральная полоса с выступом вперед
      ctx.moveTo(-width * 0.2, -width);
      ctx.lineTo(width * 0.35, 0); // выступ
      ctx.lineTo(-width * 0.2, width);
      ctx.lineTo(width * 0.2, width);
      ctx.lineTo(width * 0.55, 0);
      ctx.lineTo(width * 0.2, -width);
    } else {
      ctx.rect(-width * 0.2, -width, width * 0.4, width * 2);
    }
    ctx.closePath();

    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 3. ГОЛУБОЙ ХИРУРГ / ДОРИ (Paracanthurus hepatus)
  // Королевский синий, черная палитра на боку, желтый треугольный хвост
  // =========================================================================
  drawBlueTang(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Желтый треугольный хвост с черными краями
    const tailSeg = segs[n - 1];
    ctx.save();
    ctx.translate(tailSeg.x, tailSeg.y);
    ctx.rotate(tailSeg.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.95, -r * 0.75);
    ctx.lineTo(-r * 0.65, 0);
    ctx.lineTo(-r * 0.95, r * 0.75);
    ctx.closePath();
    ctx.fillStyle = '#ffd600'; // Ярко-желтый хвост
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Профиль плоского тела хирурга
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      return Math.sin(t * Math.PI) * (r * 0.95);
    });

    ctx.beginPath();
    ctx.moveTo(segs[0].x + Math.cos(segs[0].angle) * (r * 0.8), segs[0].y + Math.sin(segs[0].angle) * (r * 0.8));
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(tailSeg.x, tailSeg.y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    // Глубокий королевский кобальтово-синий цвет
    const grad = ctx.createLinearGradient(left[1].x, left[1].y, right[1].x, right[1].y);
    grad.addColorStop(0, '#0d47a1');
    grad.addColorStop(0.5, '#1565c0');
    grad.addColorStop(1, '#1976d2');
    ctx.fillStyle = grad;
    ctx.fill();

    // Знаменитая черная «палитра художника» на боку Дори
    ctx.save();
    ctx.beginPath();
    const mid = segs[2];
    ctx.translate(mid.x, mid.y);
    ctx.rotate(mid.angle);
    ctx.ellipse(0, -r * 0.25, r * 0.75, r * 0.45, 0, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(3, r * 0.18);
    ctx.strokeStyle = '#050c18';
    ctx.stroke();

    // Желтый шип (скальпель) у хвоста
    ctx.beginPath();
    ctx.arc(-r * 0.8, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd600';
    ctx.fill();
    ctx.restore();

    // Глаз Дори
    this.drawRealisticEye(ctx, segs[0], r * 0.22, '#2196f3');
  }

  // =========================================================================
  // 4. ЖЕЛТАЯ ЗЕБРАСОМА (Zebrasoma flavescens)
  // Ярко-желтое высокое тело, вытянутый хоботок, парусный плавник
  // =========================================================================
  drawYellowTang(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Парусные плавники сверху и снизу
    this.drawCurvedFin(ctx, segs[2], -1, r * 1.15, r * 0.7, '#ffd600');
    this.drawCurvedFin(ctx, segs[2], 1, r * 1.15, r * 0.7, '#ffd600');

    // Высокое дисковидное тело
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      return Math.sin(t * Math.PI) * (r * 1.1);
    });

    ctx.beginPath();
    // Вытянутое трубчатое рыльце
    const snoutX = segs[0].x + Math.cos(segs[0].angle) * (r * 1.05);
    const snoutY = segs[0].y + Math.sin(segs[0].angle) * (r * 1.05);
    ctx.moveTo(snoutX, snoutY);
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(segs[n - 1].x, segs[n - 1].y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    ctx.fillStyle = '#ffd600'; // Солнечно-желтый
    ctx.fill();
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Белый шип-скальпель на хвосте
    const tail = segs[n - 2];
    ctx.beginPath();
    ctx.arc(tail.x, tail.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    this.drawRealisticEye(ctx, segs[0], r * 0.2, '#fbc02d');
  }

  // =========================================================================
  // 5. БОЛЬШАЯ БАРРАКУДА (Sphyraena barracuda) - Стадия 3
  // Стреловидное торпедное тело, выступающая челюсть с кинжальными зубами,
  // темные тигриные полосы на боках
  // =========================================================================
  drawBarracuda(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Вилообразный хвост с черными кончиками
    const tailSeg = segs[n - 1];
    ctx.save();
    ctx.translate(tailSeg.x, tailSeg.y);
    ctx.rotate(tailSeg.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 1.2, -r * 0.9);
    ctx.lineTo(-r * 0.7, 0);
    ctx.lineTo(-r * 1.2, r * 0.9);
    ctx.closePath();
    ctx.fillStyle = '#37474f';
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Два раздельных спинных плавника
    this.drawTriangleFin(ctx, segs[2], -1, r * 0.65, r * 0.5, '#455a64');
    this.drawTriangleFin(ctx, segs[5], -1, r * 0.55, r * 0.45, '#455a64');

    // Торпедообразное прогонистое тело
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      if (i === 0) return r * 0.5; // острая голова
      if (i <= 3) return r * 0.75;
      return Math.sin(t * Math.PI) * (r * 0.75);
    });

    ctx.beginPath();
    // Выступающая вперед нижняя челюсть!
    const head = segs[0];
    const snoutX = head.x + Math.cos(head.angle) * (r * 1.15);
    const snoutY = head.y + Math.sin(head.angle) * (r * 1.15);
    ctx.moveTo(snoutX, snoutY);
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(tailSeg.x, tailSeg.y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    // Серебристо-стальной металлический градиент со свинцовой спинкой
    const grad = ctx.createLinearGradient(left[1].x, left[1].y, right[1].x, right[1].y);
    grad.addColorStop(0, '#263238'); // Темная спинка
    grad.addColorStop(0.35, '#78909c'); // Серебристый бок
    grad.addColorStop(1, '#cfd8dc'); // Белое брюшко
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ТИГРИНЫЕ ПОПЕРЕЧНЫЕ ПОЛОСЫ БАРРАКУДЫ
    ctx.save();
    ctx.strokeStyle = 'rgba(38, 50, 56, 0.75)';
    ctx.lineWidth = Math.max(2, r * 0.07);
    for (let i = 2; i < n - 2; i++) {
      const seg = segs[i];
      const norm = seg.angle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(seg.x, seg.y);
      ctx.lineTo(seg.x + Math.cos(norm) * (r * 0.55), seg.y + Math.sin(norm) * (r * 0.55));
      ctx.stroke();
    }
    ctx.restore();

    // ОСТРЫЕ КИНЖАЛЬНЫЕ ЗУБЫ В ПАСТИ
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);
    ctx.fillStyle = '#ffffff';
    for (let t = -2; t <= 2; t++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.8 + Math.abs(t) * 2, t * 4);
      ctx.lineTo(r * 1.05 + Math.abs(t) * 2, t * 3);
      ctx.lineTo(r * 0.8 + Math.abs(t) * 2, t * 2);
      ctx.fill();
    }
    ctx.restore();

    // Жаберная крышка
    ctx.save();
    ctx.beginPath();
    const operc = segs[1];
    ctx.arc(operc.x, operc.y, r * 0.5, segs[0].angle - 1, segs[0].angle + 1);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    this.drawRealisticEye(ctx, segs[0], r * 0.18, '#ffd600');
  }

  // =========================================================================
  // 6. БОЛЬШАЯ БЕЛАЯ АКУЛА (Carcharodon carcharias) - Стадия 4
  // 5 Жаберных щелей, классический треугольный спинной плавник,
  // контрастное разделение (серая спина / белое брюхо), серповидный хвост
  // =========================================================================
  drawShark(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Мощный серповидный гетероцеркальный хвост акулы
    const tailSeg = segs[n - 1];
    ctx.save();
    ctx.translate(tailSeg.x, tailSeg.y);
    ctx.rotate(tailSeg.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Верхняя длинная лопасть
    ctx.quadraticCurveTo(-r * 0.8, -r * 1.3, -r * 1.4, -r * 1.2);
    ctx.lineTo(-r * 0.85, 0);
    // Нижняя лопасть
    ctx.quadraticCurveTo(-r * 0.7, r * 0.9, -r * 1.1, r * 0.9);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = '#263238';
    ctx.fill();
    ctx.strokeStyle = '#102027';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // ЗНАМЕНИТЫЙ ТРЕУГОЛЬНЫЙ СПИННОЙ ПЛАВНИК АКУЛЫ
    ctx.save();
    const dSeg = segs[2];
    ctx.translate(dSeg.x, dSeg.y);
    ctx.rotate(dSeg.angle);
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.8);
    ctx.lineTo(-r * 0.6, -r * 1.8); // Вершина плавника
    ctx.quadraticCurveTo(-r * 1.1, -r * 1.1, -r * 0.95, -r * 0.75); // Выемка на задней кромке
    ctx.closePath();
    ctx.fillStyle = '#263238';
    ctx.fill();
    ctx.strokeStyle = '#102027';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Серповидные грудные плавники акулы
    this.drawSharkPectorals(ctx, segs[1], r * 1.3);

    // Мощное веретенообразное тело
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      if (i === 0) return r * 0.65; // коническое рыло
      if (i === 1) return r * 1.05; // мощная холка
      if (i <= 3) return r * 1.0;
      return Math.sin(t * Math.PI) * (r * 0.95);
    });

    ctx.beginPath();
    const head = segs[0];
    const snoutX = head.x + Math.cos(head.angle) * (r * 1.0);
    const snoutY = head.y + Math.sin(head.angle) * (r * 1.0);
    ctx.moveTo(snoutX, snoutY);
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(tailSeg.x, tailSeg.y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    // Контрастное разделение: темно-свинцовая спина и белое брюхо
    const grad = ctx.createLinearGradient(left[1].x, left[1].y, right[1].x, right[1].y);
    grad.addColorStop(0, '#1c2833'); // Стально-черная спина
    grad.addColorStop(0.48, '#37474f'); // Серый бок
    grad.addColorStop(0.52, '#eceff1'); // Линия раздела
    grad.addColorStop(1, '#ffffff'); // Белоснежное брюхо
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5 РЕАЛЬНЫХ ЖАБЕРНЫХ ЩЕЛЕЙ АКУЛЫ
    ctx.save();
    const gSeg = segs[1];
    ctx.translate(gSeg.x, gSeg.y);
    ctx.rotate(gSeg.angle);
    ctx.strokeStyle = '#102027';
    ctx.lineWidth = 1.8;
    for (let g = 0; g < 5; g++) {
      const gx = -r * 0.15 + g * (r * 0.08);
      ctx.beginPath();
      ctx.moveTo(gx, -r * 0.55);
      ctx.lineTo(gx - 2, -r * 0.15);
      ctx.stroke();
    }
    ctx.restore();

    // ПОЛУЛУННЫЙ РОТ С ТРЕУГОЛЬНЫМИ БЕЛЫМИ ЗУБАМИ
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);
    ctx.beginPath();
    ctx.arc(r * 0.4, r * 0.1, r * 0.4, 0, Math.PI * 0.6);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Белые зубья
    ctx.fillStyle = '#ffffff';
    for (let z = 0; z < 4; z++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.35 + z * 4, r * 0.15);
      ctx.lineTo(r * 0.38 + z * 4, r * 0.3);
      ctx.lineTo(r * 0.41 + z * 4, r * 0.15);
      ctx.fill();
    }
    ctx.restore();

    // Глубокий темный глаз хищника
    this.drawRealisticEye(ctx, head, r * 0.16, '#000000');
  }

  // =========================================================================
  // 7. КРЫЛАТКА-ЗЕБРА (Pterois volitans)
  // Веерообразные роскошные плавники, ядовитые иглы, полосатый зебра-узор
  // =========================================================================
  drawLionfish(ctx, theme) {
    const segs = this.segments;
    const r = this.radius;
    const n = segs.length;

    // Роскошные веерообразные плавники-крылья
    this.drawLionfishWings(ctx, segs[1], r * 1.4);

    // Длинные ядовитые иглы спинного плавника
    ctx.save();
    for (let i = 1; i <= 4; i++) {
      const s = segs[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -r * 1.5);
      ctx.strokeStyle = i % 2 === 0 ? '#b71c1c' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Тело крылатки
    const { left, right } = this.getProfilePoints((i, n) => {
      const t = i / (n - 1);
      return Math.sin(t * Math.PI) * (r * 0.85);
    });

    ctx.beginPath();
    ctx.moveTo(segs[0].x + Math.cos(segs[0].angle) * (r * 0.8), segs[0].y + Math.sin(segs[0].angle) * (r * 0.8));
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(segs[n - 1].x, segs[n - 1].y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    ctx.fillStyle = '#b71c1c';
    ctx.fill();

    // Чередующиеся белые полоски зебры
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    for (let i = 1; i < n - 1; i += 2) {
      const s = segs[i];
      const norm = s.angle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(s.x + Math.cos(norm) * (r * 0.8), s.y + Math.sin(norm) * (r * 0.8));
      ctx.lineTo(s.x - Math.cos(norm) * (r * 0.8), s.y - Math.sin(norm) * (r * 0.8));
      ctx.stroke();
    }
    ctx.restore();

    this.drawRealisticEye(ctx, segs[0], r * 0.22, '#d32f2f');
  }

  // =========================================================================
  // ВСПОМОГАТЕЛЬНЫЕ АНАТОМИЧЕСКИЕ МЕТОДЫ
  // =========================================================================

  // Вычисление гладких профильных точек левого и правого бока
  getProfilePoints(thicknessFn) {
    const segs = this.segments;
    const n = segs.length;
    const left = [];
    const right = [];

    for (let i = 0; i < n; i++) {
      const seg = segs[i];
      const th = thicknessFn(i, n);
      const norm = seg.angle + Math.PI / 2;
      left.push({
        x: seg.x + Math.cos(norm) * th,
        y: seg.y + Math.sin(norm) * th
      });
      right.push({
        x: seg.x - Math.cos(norm) * th,
        y: seg.y - Math.sin(norm) * th
      });
    }
    return { left, right };
  }

  // Реалистичный живой глаз с радужкой, зрачком и световым бликом
  drawRealisticEye(ctx, headSeg, eyeRadius, irisColor) {
    const eyeDist = this.radius * 0.42;
    const forward = this.radius * 0.35;

    [-1, 1].forEach((side) => {
      const norm = headSeg.angle + (side * Math.PI / 2);
      const eyeX = headSeg.x + Math.cos(headSeg.angle) * forward + Math.cos(norm) * eyeDist;
      const eyeY = headSeg.y + Math.sin(headSeg.angle) * forward + Math.sin(norm) * eyeDist;

      // Склера (глазное яблоко)
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Радужная оболочка
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = irisColor;
      ctx.fill();

      // Глубокий черный зрачок
      ctx.beginPath();
      ctx.arc(eyeX + Math.cos(headSeg.angle) * (eyeRadius * 0.2), eyeY + Math.sin(headSeg.angle) * (eyeRadius * 0.2), eyeRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fill();

      // Спекулярный белый блик света
      ctx.beginPath();
      ctx.arc(eyeX - eyeRadius * 0.2, eyeY - eyeRadius * 0.2, eyeRadius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }

  drawCurvedFin(ctx, seg, side, len, spread, color) {
    ctx.save();
    ctx.translate(seg.x, seg.y);
    ctx.rotate(seg.angle);
    ctx.beginPath();
    ctx.moveTo(0, side * (this.radius * 0.7));
    ctx.quadraticCurveTo(-len * 0.5, side * (this.radius * 0.7 + spread), -len, side * (this.radius * 0.6));
    ctx.lineTo(-len * 0.7, side * (this.radius * 0.6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  drawTriangleFin(ctx, seg, side, len, spread, color) {
    ctx.save();
    ctx.translate(seg.x, seg.y);
    ctx.rotate(seg.angle);
    ctx.beginPath();
    ctx.moveTo(0, side * (this.radius * 0.6));
    ctx.lineTo(-len * 0.4, side * (this.radius * 0.6 + spread));
    ctx.lineTo(-len, side * (this.radius * 0.5));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  drawPectoralFinsBordered(ctx, seg, length, color) {
    const flap = Math.sin(this.finCycle * 1.3) * 0.25;
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle + (side * Math.PI * 0.4) + flap * side);

      ctx.beginPath();
      ctx.ellipse(length * 0.5, side * (length * 0.3), length * 0.5, length * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });
  }

  drawSharkPectorals(ctx, seg, length) {
    const flap = Math.sin(this.finCycle) * 0.12;
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle + (side * Math.PI * 0.45) + flap * side);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(length * 0.5, side * (length * 0.4), length, side * (length * 0.2));
      ctx.lineTo(length * 0.6, 0);
      ctx.closePath();
      ctx.fillStyle = '#263238';
      ctx.fill();
      ctx.strokeStyle = '#102027';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });
  }

  drawLionfishWings(ctx, seg, length) {
    const flap = Math.sin(this.finCycle) * 0.2;
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle + (side * Math.PI * 0.5) + flap * side);

      for (let r = 0; r < 5; r++) {
        const rayAngle = (r / 5) * 0.6 - 0.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rayAngle) * length, Math.sin(rayAngle) * length * side);
        ctx.strokeStyle = r % 2 === 0 ? '#b71c1c' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
  }
}

window.Fish = Fish;
window.EVOLUTION_STAGES = EVOLUTION_STAGES;
window.REAL_SPECIES_PRESETS = REAL_SPECIES_PRESETS;
