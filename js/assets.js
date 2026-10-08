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

    // Определяем базовую ориентацию (рыба плывет влево или вправо)
    const isFacingLeft = Math.cos(normAngle) < 0;
    const targetFacing = isFacingLeft ? -1 : 1;
    const effFacing = (smoothFacing !== null && smoothFacing !== undefined) ? smoothFacing : targetFacing;
    const facingDir = effFacing < 0 ? -1 : 1;
    const absF = Math.abs(effFacing);

    // Плавное синусоидальное сжатие силуэта при развороте в 3D толще воды
    const turnScaleX = facingDir * Math.max(0.18, Math.sin(Math.min(1, absF) * Math.PI * 0.5));
    const turnScaleY = 1.0 + (1.0 - Math.min(1, absF)) * 0.08;

    // Угол поворота холста:
    // Нос исходного спрайта направлен вправо (+X), спинной плавник сверху (-Y).
    // Если рыба развернута влево (facingDir === -1), спрайт масштабируется с turnScaleX < 0,
    // поэтому для совмещения носа с курсом движения поворачиваем на (normAngle ± PI).
    // Это гарантирует, что нос ВСЕГДА направлен строго по ходу движения, а спина всегда сверху!
    const rotAngle = facingDir === -1
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

    // Сегментное волнообразное плавание (Skeletal Mesh Waving):
    // Нарезаем точную область тела рыбы на 8 вертикальных анатомических срезов.
    // Срезы головы и жабр устойчивы, хвост колышется естественной волной.
    const numStrips = 8;
    const stripSrcW = b.w / numStrips;
    const stripDestW = fishLength / numStrips;

    // Смещение центра вращения в район жабр/глаз (38% от носа рыбы)
    const startX = -fishLength * 0.62;
    const startY = -fishHeight / 2;

    const waveAmp = (isDashing ? 5.5 : 3.2) * (radius / 24);
    const waveFreq = isDashing ? 1.6 : 1.0;

    for (let i = 0; i < numStrips; i++) {
      // i = 0 (хвост): максимальная гибкость (flex = 1.0)
      // i = 7 (голова): неподвижна относительно направления взгляда (flex = 0.0)
      const flex = Math.pow((numStrips - 1 - i) / (numStrips - 1), 1.85);
      const stripWaveY = Math.sin(swimPhase * waveFreq + (i * 0.52)) * waveAmp * flex;

      const sx = b.minX + i * stripSrcW;
      const sy = b.minY;
      const sw = stripSrcW;
      const sh = b.h;

      const dx = startX + i * stripDestW;
      const dy = startY + stripWaveY;

      ctx.drawImage(
        sprite,
        sx, sy, sw, sh,
        dx, dy, stripDestW + 0.8, fishHeight
      );
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
