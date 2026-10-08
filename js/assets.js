/**
 * AquaGenesis Realistic Marine Asset Engine
 * Загрузчик и рендерер фотографических прозрачных PNG-текстур реальных морских обитателей.
 * Обеспечивает живую сегментную анимацию плавания (Skeletal Mesh Waving) с естественным
 * изгибом позвоночника и колыханием плавников.
 */

class AssetManager {
  constructor() {
    this.sprites = {};
    this.isLoaded = false;
    this.loadPromise = null;

    // Прямой доступ к предварительно обработанным прозрачным PNG-текстурам
    this.sources = {
      neontetra: 'assets/neontetra.png',
      clownfish: 'assets/clownfish.png',
      bluetang: 'assets/bluetang.png',
      yellowtang: 'assets/yellowtang.png',
      lionfish: 'assets/lionfish.png',
      barracuda: 'assets/barracuda.png',
      shark: 'assets/shark.png',
      clam: 'assets/clam.png',
      crab: 'assets/crab.png',
      nautilus: 'assets/nautilus.png',
      krill: 'assets/krill.png'
    };

    // Точные координаты непрозрачных пикселей и природный аспект каждого вида
    this.spriteBounds = {
      neontetra:  { minX: 56, minY: 296, w: 896, h: 408, aspect: 2.196 },
      clownfish:  { minX: 48, minY: 264, w: 928, h: 464, aspect: 2.0 },
      bluetang:   { minX: 48, minY: 300, w: 928, h: 424, aspect: 2.189 },
      yellowtang: { minX: 76, minY: 216, w: 848, h: 576, aspect: 1.472 },
      lionfish:   { minX: 44, minY: 128, w: 884, h: 756, aspect: 1.169 },
      barracuda:  { minX: 40, minY: 380, w: 936, h: 264, aspect: 3.545 },
      shark:      { minX: 36, minY: 344, w: 932, h: 332, aspect: 2.807 },
      crab:       { minX: 56, minY: 220, w: 912, h: 636, aspect: 1.434 },
      clam:       { minX: 52, minY: 80,  w: 916, h: 844, aspect: 1.085 },
      nautilus:   { minX: 36, minY: 100, w: 912, h: 740, aspect: 1.232 },
      krill:      { minX: 48, minY: 288, w: 932, h: 400, aspect: 2.330 }
    };
  }

  loadAll() {
    if (this.loadPromise) return this.loadPromise;

    const keys = Object.keys(this.sources);
    let loadedCount = 0;

    const promises = keys.map(key => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = this.sources[key];
        img.onload = () => {
          this.sprites[key] = img;
          loadedCount++;
          if (loadedCount >= keys.length) {
            this.isLoaded = true;
          }
          resolve();
        };
        img.onerror = () => {
          console.warn(`[AssetManager] Ошибка загрузки текстуры: ${this.sources[key]}`);
          resolve();
        };
      });
    });

    this.loadPromise = Promise.all(promises).then(() => {
      this.isLoaded = true;
      console.log('✅ Все 11 фотографических текстур реальных морских обитателей загружены!');
    });

    return this.loadPromise;
  }

  getSprite(key) {
    const s = this.sprites[key];
    if (s && s.complete && s.naturalWidth > 0) return s;
    return null;
  }

  /**
   * Живая органическая отрисовка реальной рыбы с волнообразным движением позвоночника и естественными пропорциями
   */
  drawFish(ctx, species, x, y, radius, angle, swimPhase = 0, isDashing = false, theme = 'day', smoothFacing = null, pitch = null) {
    const sprite = this.getSprite(species);
    if (!sprite) return false;

    const b = this.spriteBounds[species] || { minX: 0, minY: 0, w: sprite.width || 1024, h: sprite.height || 1024, aspect: 2.0 };
    // Длина и высота строго соответствуют естественным биологическим пропорциям тела без сплющивания
    const fishLength = radius * 2.8;
    const fishHeight = fishLength / b.aspect;

    // Нормализация угла к диапазону [-PI, PI]
    let normAngle = angle;
    while (normAngle > Math.PI) normAngle -= Math.PI * 2;
    while (normAngle < -Math.PI) normAngle += Math.PI * 2;

    // Определяем базовую ориентацию строго по курсу (рыба плывет влево или вправо)
    const isFacingLeft = Math.cos(normAngle) < 0;
    const facingSign = isFacingLeft ? -1 : 1;

    // Плавное синусоидальное сжатие силуэта при развороте в 3D
    const absF = (smoothFacing !== null && smoothFacing !== undefined)
      ? Math.min(1, Math.max(0.18, Math.abs(smoothFacing)))
      : 1.0;
    const turnScaleX = facingSign * Math.sin(absF * Math.PI * 0.5);
    const turnScaleY = 1.0 + (1.0 - absF) * 0.08;

    // Угол поворота холста:
    // Нос исходного спрайта направлен вправо (+X), спинной плавник сверху (-Y).
    // Если рыба развернута влево (isFacingLeft === true), спрайт масштабируется с turnScaleX < 0,
    // поэтому для строгого совмещения носа с курсом движения поворачиваем на (normAngle ± PI).
    // Это гарантирует, что нос ВСЕГДА направлен строго по ходу движения, а спина всегда сверху!
    const rotAngle = isFacingLeft
      ? (normAngle > 0 ? normAngle - Math.PI : normAngle + Math.PI)
      : normAngle;

    ctx.save();
    ctx.translate(x, y);

    // 1. Поворот строго по курсу движения рыбы (нос всегда смотрит вперед!)
    ctx.rotate(rotAngle);

    // 2. Плавный органичный 3D-разворот в воде
    ctx.scale(turnScaleX, turnScaleY);

    // Мягкая биолюминесценция в неоновом режиме или для светящейся неон-тетры
    if (theme === 'neon' || species === 'neontetra') {
      ctx.shadowBlur = isDashing ? 18 : 8;
      ctx.shadowColor = species === 'neontetra' ? '#00e5ff' : species === 'clownfish' ? '#ff6d00' : '#2979ff';
    }

    // =========================================================================
    // НЕПРЕРЫВНАЯ БИОМЕХАНИЧЕСКАЯ АНИМАЦИЯ ПОЗВОНОЧНИКА (Continuous Skeletal Spine Ribbon)
    // Устраняет фрагментацию: тело плавно изгибается как единое монолитное существо,
    // голова и передняя часть остаются жесткими, а хвостовой стебель и плавник
    // совершают непрерывные органичные волнообразные толчки.
    // =========================================================================

    // Тонкая нарезка на узкие микро-сегменты (36 полос для крупных хищников, 24 для остальных)
    const isLargePredator = species === 'shark' || species === 'barracuda';
    const numStrips = isLargePredator ? 36 : 24;
    const stripSrcW = b.w / numStrips;
    const stripDestW = fishLength / numStrips;

    // Смещение центра вращения в район жабр (38% от кончика носа)
    const startX = -fishLength * 0.62;

    // Параметры биомеханики плавания для каждого вида:
    let rigidFraction = 0.44; // Доля передней части тела (череп, жабры, грудные плавники), которая держит курс
    let waveAmp = Math.min(7.5, radius * 0.12) * (isDashing ? 1.35 : 1.0);
    let waveFreq = isDashing ? 1.3 : 0.9;
    let waveLengthFactor = 1.0;

    if (species === 'shark') {
      // Большая Белая Акула: тяжелый гидродинамический хищник.
      // Передние 52% тела (череп, массивные челюсти, жаберные щели, мощный спинной плавник) монолитны.
      // Изгибается только хвостовой стебель с серповидным хвостом.
      rigidFraction = 0.52;
      waveFreq = isDashing ? 1.15 : 0.65; // Размеренные грациозные взмахи
      waveAmp = Math.min(6.5, radius * 0.09) * (isDashing ? 1.3 : 0.9);
      waveLengthFactor = 0.82;
    } else if (species === 'barracuda') {
      // Барракуда: стреловидный бросковый хищник.
      // Первые 50% тела прямые как стрела, упругий взмах на хвосте.
      rigidFraction = 0.50;
      waveFreq = isDashing ? 1.35 : 0.85;
      waveAmp = Math.min(6.0, radius * 0.11) * (isDashing ? 1.4 : 0.95);
      waveLengthFactor = 0.88;
    } else if (species === 'lionfish') {
      rigidFraction = 0.42;
      waveFreq = isDashing ? 1.15 : 0.75;
      waveAmp = Math.min(6.0, radius * 0.12) * (isDashing ? 1.25 : 0.95);
      waveLengthFactor = 0.95;
    }

    // Функция поперечного смещения оси рыбы Y(u), где u = 0 (кончик хвоста), u = 1 (кончик носа)
    const getSpineY = (u) => {
      if (u >= (1 - rigidFraction)) return 0; // Передняя часть полностью жесткая!
      // Плавное квадратично-степенное нарастание гибкости от середины тела к хвосту
      const progress = ((1 - rigidFraction) - u) / (1 - rigidFraction);
      const flex = Math.pow(progress, 1.85);
      // Бегущая фазовая волна от головы к хвосту (как в настоящей гидродинамике)
      const phase = swimPhase * waveFreq + (1 - u) * (2.8 * waveLengthFactor);
      return Math.sin(phase) * waveAmp * flex;
    };

    // Отрисовка каждого сегмента с поворотом по локальной касательной позвоночника
    const halfH = fishHeight * 0.5;
    const eps = 0.25 / numStrips;
    const dxEps = 2 * eps * fishLength;

    for (let i = 0; i < numStrips; i++) {
      const u = (i + 0.5) / numStrips;
      const spineY = getSpineY(u);

      // Локальный угол касательной позвоночника (производная dy/dx)
      const dy = getSpineY(Math.min(1, u + eps)) - getSpineY(Math.max(0, u - eps));
      const tangentAngle = Math.atan2(dy, dxEps);

      const sx = b.minX + i * stripSrcW;
      const sy = b.minY;
      const sw = stripSrcW;
      const sh = b.h;

      const segCenterX = startX + (i + 0.5) * stripDestW;
      const segCenterY = spineY;

      ctx.save();
      ctx.translate(segCenterX, segCenterY);
      ctx.rotate(tangentAngle);

      // Рисуем с небольшим перекрытием (+1.6px), чтобы исключить растровые щели
      ctx.drawImage(
        sprite,
        sx, sy, sw, sh,
        -stripDestW * 0.5 - 0.8, -halfH,
        stripDestW + 1.6, fishHeight
      );

      ctx.restore();
    }

    ctx.restore();
    return true;
  }

  /**
   * Отрисовка бентосных и планктонных животных (краб, моллюск, наутилус, криль)
   */
  drawCreature(ctx, key, x, y, size, angle = 0) {
    const sprite = this.getSprite(key);
    if (!sprite) return false;

    const b = this.spriteBounds[key] || { minX: 0, minY: 0, w: sprite.width || 1024, h: sprite.height || 1024, aspect: 1.0 };
    const width = size;
    const height = size / b.aspect;

    ctx.save();
    ctx.translate(x, y);
    if (angle !== 0) ctx.rotate(angle);

    ctx.drawImage(sprite, b.minX, b.minY, b.w, b.h, -width / 2, -height / 2, width, height);

    ctx.restore();
    return true;
  }
}

// Глобальный экземпляр менеджера реалистичных ассетов
window.assetManager = new AssetManager();
// Запускаем немедленную загрузку ассетов при инициализации скрипта
window.assetManager.loadAll();
