/**
 * AquaGenesis Environment Engine
 * Отвечает за 3 режима освещения (День, Закат, Неон),
 * параллакс-фоны, колышущиеся водоросли, каустические лучи света,
 * парящие пузыри и глубоководных медуз.
 */

class OceanEnvironment {
  constructor(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.currentTheme = 'day'; // 'day', 'sunset', 'neon'
    this.time = 0;

    // Пузырьки воздуха
    this.bubbles = [];
    this.initBubbles(70);

    // Водоросли (ламинарии / келп)
    this.kelps = [];
    this.initKelps(45);

    // Кораллы на дне
    this.corals = [];
    this.initCorals(35);

    // Глубоководные медузы для неонового режима
    this.jellyfish = [];
    this.initJellyfish(10);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.body.className = `theme-${theme}`;
  }

  initBubbles(count) {
    this.bubbles = [];
    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        radius: 2 + Math.random() * 5.5,
        speed: 0.6 + Math.random() * 1.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04
      });
    }
  }

  initKelps(count) {
    this.kelps = [];
    for (let i = 0; i < count; i++) {
      const x = (i / count) * this.worldWidth + (Math.random() - 0.5) * 60;
      const height = 180 + Math.random() * 320;
      const segments = 8;
      this.kelps.push({
        x,
        baseY: this.worldHeight - 40,
        height,
        segments,
        phase: Math.random() * Math.PI * 2,
        width: 14 + Math.random() * 12,
        color: ['#2e7d32', '#1b5e20', '#388e3c', '#004d40'][Math.floor(Math.random() * 4)]
      });
    }
  }

  initCorals(count) {
    this.corals = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.worldWidth;
      const width = 50 + Math.random() * 70;
      const height = 40 + Math.random() * 80;
      this.corals.push({
        x,
        y: this.worldHeight - 45,
        width,
        height,
        branches: 3 + Math.floor(Math.random() * 4),
        colorDay: ['#e91e63', '#9c27b0', '#ff9800', '#00bcd4'][Math.floor(Math.random() * 4)],
        colorNeon: ['#ff007f', '#00e5ff', '#76ff03', '#d500f9'][Math.floor(Math.random() * 4)]
      });
    }
  }

  initJellyfish(count) {
    this.jellyfish = [];
    for (let i = 0; i < count; i++) {
      this.jellyfish.push({
        x: Math.random() * this.worldWidth,
        y: 400 + Math.random() * (this.worldHeight - 800),
        radius: 20 + Math.random() * 25,
        pulsePhase: Math.random() * Math.PI * 2,
        speedY: -0.4 - Math.random() * 0.6,
        color: ['#00e5ff', '#ff007f', '#76ff03', '#b388ff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  spawnBubble(x, y, radius = 4) {
    this.bubbles.push({
      x,
      y,
      radius,
      speed: 1.5 + Math.random() * 2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.06
    });
    if (this.bubbles.length > 150) this.bubbles.shift();
  }

  update() {
    this.time += 0.02;

    // Всплытие пузырей
    for (let b of this.bubbles) {
      b.y -= b.speed;
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.5;

      if (b.y < 50) {
        b.y = this.worldHeight - 50;
        b.x = Math.random() * this.worldWidth;
      }
    }

    // Движение медуз
    for (let j of this.jellyfish) {
      j.pulsePhase += 0.04;
      const thrust = Math.max(0, Math.sin(j.pulsePhase));
      j.y += j.speedY * (0.4 + thrust * 1.5);
      j.x += Math.cos(j.pulsePhase * 0.5) * 0.4;

      if (j.y < 200) j.y = this.worldHeight - 300;
    }
  }

  drawBackground(ctx, camera) {
    const theme = this.currentTheme;

    // Фоновый градиент толщи воды
    const grad = ctx.createLinearGradient(0, 0, 0, this.worldHeight);

    if (theme === 'day') {
      grad.addColorStop(0, '#1976d2');    // Светлая лазурь у поверхности
      grad.addColorStop(0.35, '#0d47a1'); // Глубокая синева
      grad.addColorStop(0.85, '#062846'); // Морская бездна
      grad.addColorStop(1, '#02182b');    // Темнота у дна
    } else if (theme === 'sunset') {
      grad.addColorStop(0, '#d84315');    // Пылающий закат у поверхности
      grad.addColorStop(0.25, '#880e4f'); // Бархатный багрянец
      grad.addColorStop(0.65, '#311b92'); // Фиолетовые сумерки
      grad.addColorStop(1, '#0d041a');    // Темное вечернее дно
    } else {
      // Неоновый режим (Абиссаль)
      grad.addColorStop(0, '#0a1128');
      grad.addColorStop(0.4, '#03071e');
      grad.addColorStop(1, '#010208');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // Поверхность воды (свет и волны наверху)
    this.drawWaterSurface(ctx, theme);

    // Каустические лучи света (God Rays)
    if (theme !== 'neon') {
      this.drawGodRays(ctx, theme);
    }

    // Дальний план водорослей
    this.drawKelps(ctx, theme, true);

    // Медузы (особенно ярко светятся в неоне)
    this.drawJellyfish(ctx, theme);
  }

  drawWaterSurface(ctx, theme) {
    ctx.save();
    const surfaceY = 60;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.worldWidth, 0);
    ctx.lineTo(this.worldWidth, surfaceY);

    for (let x = this.worldWidth; x >= 0; x -= 50) {
      const wave = Math.sin(x * 0.01 + this.time * 2) * 8 + Math.cos(x * 0.02 + this.time * 3) * 4;
      ctx.lineTo(x, surfaceY + wave);
    }
    ctx.closePath();

    if (theme === 'day') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    } else if (theme === 'sunset') {
      ctx.fillStyle = 'rgba(255, 171, 64, 0.45)';
    } else {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    }
    ctx.fill();
    ctx.restore();
  }

  drawGodRays(ctx, theme) {
    ctx.save();
    const numRays = 8;
    const rayWidth = this.worldWidth / numRays;

    for (let i = 0; i < numRays; i++) {
      const offset = (i * rayWidth + Math.sin(this.time * 0.5 + i) * 60);
      const grad = ctx.createLinearGradient(offset, 0, offset + 140, this.worldHeight * 0.85);

      if (theme === 'day') {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        grad.addColorStop(0.5, 'rgba(129, 212, 250, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(255, 204, 128, 0.22)');
        grad.addColorStop(0.4, 'rgba(239, 83, 80, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 80, 0);
      ctx.lineTo(offset + 280, this.worldHeight * 0.85);
      ctx.lineTo(offset + 120, this.worldHeight * 0.85);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();
  }

  drawForeground(ctx, camera) {
    const theme = this.currentTheme;

    // Ближний план водорослей
    this.drawKelps(ctx, theme, false);

    // Песчаное дно
    this.drawSeabed(ctx, theme);

    // Кораллы
    this.drawCorals(ctx, theme);

    // Пузырьки
    this.drawBubbles(ctx, theme);
  }

  drawSeabed(ctx, theme) {
    ctx.save();
    const bedY = this.worldHeight - 45;

    ctx.beginPath();
    ctx.moveTo(0, this.worldHeight);
    ctx.lineTo(0, bedY);

    for (let x = 0; x <= this.worldWidth; x += 40) {
      const bump = Math.sin(x * 0.008) * 15 + Math.cos(x * 0.03) * 6;
      ctx.lineTo(x, bedY + bump);
    }

    ctx.lineTo(this.worldWidth, this.worldHeight);
    ctx.closePath();

    if (theme === 'neon') {
      ctx.fillStyle = '#050a18';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00e5ff';
      ctx.stroke();
    } else if (theme === 'sunset') {
      ctx.fillStyle = '#3e2723';
      ctx.strokeStyle = '#ff8a65';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#c2a649'; // Золотой песок
      ctx.strokeStyle = '#e0cf87';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fill();
    ctx.restore();
  }

  drawKelps(ctx, theme, isBack) {
    ctx.save();
    for (let k of this.kelps) {
      if ((isBack && k.x % 2 !== 0) || (!isBack && k.x % 2 === 0)) continue;

      ctx.beginPath();
      ctx.moveTo(k.x, k.baseY);

      const segHeight = k.height / k.segments;
      let curX = k.x;
      let curY = k.baseY;

      for (let i = 1; i <= k.segments; i++) {
        const sway = Math.sin(this.time * 1.5 + k.phase + i * 0.4) * (i * 5.5);
        const nextX = k.x + sway;
        const nextY = k.baseY - i * segHeight;

        ctx.quadraticCurveTo(curX, curY - segHeight * 0.5, nextX, nextY);
        curX = nextX;
        curY = nextY;

        // Листья ламинарии
        if (i % 2 === 0) {
          ctx.ellipse(curX + (i % 4 === 0 ? 12 : -12), curY, k.width * 0.8, 6, Math.PI / 4, 0, Math.PI * 2);
        }
      }

      ctx.lineWidth = k.width;
      ctx.lineCap = 'round';

      if (theme === 'neon') {
        ctx.strokeStyle = isBack ? 'rgba(0, 230, 118, 0.25)' : 'rgba(0, 255, 204, 0.7)';
        ctx.shadowBlur = isBack ? 0 : 12;
        ctx.shadowColor = '#00ffcc';
      } else if (theme === 'sunset') {
        ctx.strokeStyle = isBack ? 'rgba(62, 39, 35, 0.6)' : 'rgba(121, 85, 72, 0.85)';
      } else {
        ctx.strokeStyle = isBack ? 'rgba(46, 125, 50, 0.5)' : k.color;
      }

      ctx.stroke();
    }
    ctx.restore();
  }

  drawCorals(ctx, theme) {
    ctx.save();
    for (let c of this.corals) {
      ctx.save();
      ctx.translate(c.x, c.y);

      const color = theme === 'neon' ? c.colorNeon : c.colorDay;
      if (theme === 'neon') {
        ctx.shadowBlur = 18;
        ctx.shadowColor = color;
      }

      // Куст кораллов
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      for (let b = 0; b < c.branches; b++) {
        const angle = -Math.PI / 2 + ((b - (c.branches - 1) / 2) * 0.35);
        const len = c.height * (0.7 + (b % 2) * 0.3);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          Math.cos(angle) * (len * 0.5) + (b % 2 === 0 ? 8 : -8),
          Math.sin(angle) * (len * 0.5),
          Math.cos(angle) * len,
          Math.sin(angle) * len
        );
        ctx.stroke();

        // Бутончики на концах веток
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * len, Math.sin(angle) * len, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  drawJellyfish(ctx, theme) {
    ctx.save();
    for (let j of this.jellyfish) {
      ctx.save();
      ctx.translate(j.x, j.y);

      const r = j.radius;
      const pulse = Math.sin(j.pulsePhase);
      const domeScaleY = 0.8 + pulse * 0.2;

      // Купол медузы
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * domeScaleY, 0, Math.PI, Math.PI * 2);
      ctx.closePath();

      if (theme === 'neon') {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.strokeStyle = j.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = j.color;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fill();

      // Щупальца медузы
      for (let i = -2; i <= 2; i++) {
        const tentWave = Math.sin(j.pulsePhase * 2 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(i * (r * 0.35), 0);
        ctx.quadraticCurveTo(i * (r * 0.35) + tentWave, r * 1.2, i * (r * 0.3) - tentWave, r * 2.2);
        ctx.strokeStyle = theme === 'neon' ? j.color : 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  drawBubbles(ctx, theme) {
    ctx.save();
    for (let b of this.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      if (theme === 'neon') {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.25)';
        ctx.strokeStyle = '#00ffcc';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00ffcc';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      }

      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      // Блик
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
    }
    ctx.restore();
  }
}

window.OceanEnvironment = OceanEnvironment;
