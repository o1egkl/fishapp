/**
 * AquaGenesis Mollusk & Benthos Engine
 * Разнообразные моллюски, устрицы с жемчужинами, крабы, наутилусы и планктон.
 */

// 1. ДВУСТВОРЧАТАЯ РАКОВИНА / УСТРИЦА (CLAM / OYSTER)
class Clam {
  constructor(x, y, radius = 38) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = Math.round(radius * 1.5);
    this.isOpen = false;
    this.openProgress = 0; // 0 (закрыта) - 1 (раскрыта)
    this.cycleTimer = Math.random() * 180;
    this.pearlColor = ['#ffffff', '#ffeb3b', '#ff4081', '#00e5ff'][Math.floor(Math.random() * 4)];
    this.isDead = false;
    this.respawnTimer = 0;
  }

  update() {
    if (this.isDead) {
      this.respawnTimer++;
      if (this.respawnTimer > 600) { // Возрождение через 10 секунд
        this.isDead = false;
        this.respawnTimer = 0;
      }
      return;
    }

    this.cycleTimer++;
    // Цикл: открывается на 4-6 секунд, закрывается на 3 секунды
    const cycle = (this.cycleTimer % 360) / 360;
    if (cycle < 0.45) {
      this.isOpen = true;
      this.openProgress = Math.min(1, this.openProgress + 0.05);
    } else {
      this.isOpen = false;
      this.openProgress = Math.max(0, this.openProgress - 0.08);
    }
  }

  draw(ctx, theme) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const r = this.radius;

    // Фотореалистичная гигантская тридакна с жемчужиной
    if (window.assetManager) {
      const clamScale = 0.85 + this.openProgress * 0.25;
      const drawn = window.assetManager.drawCreature(ctx, 'clam', 0, 0, r * 3.2 * clamScale, 0);
      if (drawn) {
        // Сияющая драгоценная жемчужина внутри раскрытой раковины
        if (this.openProgress > 0.15) {
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.26 * this.openProgress, 0, Math.PI * 2);
          ctx.fillStyle = this.pearlColor;
          ctx.shadowBlur = 16;
          ctx.shadowColor = this.pearlColor;
          ctx.fill();
        }
        ctx.restore();
        return;
      }
    }

    const openAngle = this.openProgress * 0.55;

    // Свечение в неоновом режиме
    if (theme === 'neon') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.pearlColor;
    }

    // Нижняя створка раковины
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r, r * 0.65, 0, 0, Math.PI);
    ctx.fillStyle = theme === 'neon' ? '#1a233a' : '#8d6e63';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme === 'neon' ? '#00e5ff' : '#5d4037';
    ctx.stroke();

    // Мякоть моллюска внутри
    if (this.openProgress > 0.1) {
      ctx.beginPath();
      ctx.ellipse(0, r * 0.1, r * 0.75 * this.openProgress, r * 0.45 * this.openProgress, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'neon' ? '#ff007f' : '#ff8a80';
      ctx.fill();

      // Драгоценная жемчужина внутри
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.25 * this.openProgress, 0, Math.PI * 2);
      ctx.fillStyle = this.pearlColor;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.pearlColor;
      ctx.fill();
    }

    // Верхняя створка раковины (приоткрывается вверх)
    ctx.save();
    ctx.translate(0, r * 0.2);
    ctx.rotate(-openAngle);

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r, r * 0.7, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = theme === 'neon' ? '#11192d' : '#a1887f';
    ctx.fill();
    ctx.strokeStyle = theme === 'neon' ? '#00e5ff' : '#4e342e';
    ctx.stroke();

    // Рельефные бороздки на створке
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(i * (r * 0.4), -r * 1.15);
      ctx.strokeStyle = theme === 'neon' ? 'rgba(0, 229, 255, 0.4)' : 'rgba(78, 52, 46, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}

// 2. ДОННЫЙ КРАБ (CRAB)
class Crab {
  constructor(x, y, seabedY) {
    this.x = x;
    this.y = y;
    this.seabedY = seabedY;
    this.radius = 32;
    this.mass = 45;
    this.vx = (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.5);
    this.legPhase = 0;
    this.isDead = false;
    this.respawnTimer = 0;
  }

  update(worldWidth) {
    if (this.isDead) {
      this.respawnTimer++;
      if (this.respawnTimer > 500) {
        this.isDead = false;
        this.respawnTimer = 0;
      }
      return;
    }

    this.x += this.vx;
    this.legPhase += 0.2;

    // Разворот у границ
    if (this.x < 100) this.vx = Math.abs(this.vx);
    if (this.x > worldWidth - 100) this.vx = -Math.abs(this.vx);
  }

  draw(ctx, theme) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const r = this.radius;
    const dir = Math.sign(this.vx) || 1;

    // Фотореалистичный донный морской краб
    if (window.assetManager) {
      const wobble = Math.sin(this.legPhase) * 0.08;
      ctx.scale(dir, 1);
      const drawn = window.assetManager.drawCreature(ctx, 'crab', 0, 0, r * 3.0, wobble);
      if (drawn) {
        ctx.restore();
        return;
      }
    }

    if (theme === 'neon') {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff5252';
    }

    // Лапки краба (анимированные)
    ctx.strokeStyle = theme === 'neon' ? '#ff1744' : '#c62828';
    ctx.lineWidth = 2.5;
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const legWave = Math.sin(this.legPhase + i * 1.2) * 4;
      const legX = i * (r * 0.4);

      // Левая и правая лапки
      ctx.beginPath();
      ctx.moveTo(legX, 0);
      ctx.lineTo(legX + (i > 0 ? 12 : -12), 10 + legWave);
      ctx.lineTo(legX + (i > 0 ? 18 : -18), 16);
      ctx.stroke();
    }

    // Панцирь краба
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'neon' ? '#b71c1c' : '#e53935';
    ctx.fill();
    ctx.strokeStyle = theme === 'neon' ? '#ff8a80' : '#b71c1c';
    ctx.stroke();

    // Клешни
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(side * (r * 1.2), -r * 0.4, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'neon' ? '#ff1744' : '#d32f2f';
      ctx.fill();
    });

    // Стебельки глаз
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(side * (r * 0.4), -r * 0.8, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(side * (r * 0.4) + dir, -r * 0.8, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
    });

    ctx.restore();
  }
}

// 3. НАУТИЛУС (NAUTILUS)
class Nautilus {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 42;
    this.mass = 65;
    this.vx = -0.8;
    this.vy = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.isDead = false;
    this.respawnTimer = 0;
  }

  update(worldWidth, worldHeight) {
    if (this.isDead) {
      this.respawnTimer++;
      if (this.respawnTimer > 700) {
        this.isDead = false;
        this.respawnTimer = 0;
      }
      return;
    }

    this.pulsePhase += 0.05;
    // Импульсное движение (водяной реактивный толчок)
    const thrust = Math.max(0, Math.sin(this.pulsePhase));
    this.vx = -0.5 - thrust * 1.2;
    this.vy = Math.sin(this.pulsePhase * 0.5) * 0.4;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 50) this.x = worldWidth - 50;
    if (this.y < 200) this.y = 200;
    if (this.y > worldHeight - 200) this.y = worldHeight - 200;
  }

  draw(ctx, theme) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const r = this.radius;

    // Фотореалистичный живой наутилус с тигриными полосами
    if (window.assetManager) {
      const bob = Math.sin(this.pulsePhase) * 0.12;
      const drawn = window.assetManager.drawCreature(ctx, 'nautilus', 0, 0, r * 3.1, bob);
      if (drawn) {
        ctx.restore();
        return;
      }
    }

    if (theme === 'neon') {
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#00e676';
    }

    // Спиральная раковина наутилуса
    ctx.beginPath();
    ctx.arc(r * 0.2, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'neon' ? '#00332a' : '#fff3e0';
    ctx.fill();
    ctx.strokeStyle = theme === 'neon' ? '#00e676' : '#d84315';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Характерные полосы на раковине
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const a = (i / 6) * Math.PI * 1.4 - 0.7;
      ctx.moveTo(r * 0.2, 0);
      ctx.lineTo(r * 0.2 + Math.cos(a) * r, Math.sin(a) * r);
      ctx.strokeStyle = theme === 'neon' ? 'rgba(0, 230, 118, 0.7)' : '#bf360c';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Щупальца, высовывающиеся из раковины
    const tentacleWave = Math.sin(this.pulsePhase * 2) * 4;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, i * 3);
      ctx.quadraticCurveTo(-r * 1.1, i * 4 + tentacleWave, -r * 1.4, i * 5);
      ctx.strokeStyle = theme === 'neon' ? '#69f0ae' : '#ff7043';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Большой темный глаз наутилуса
    ctx.beginPath();
    ctx.arc(-r * 0.45, -r * 0.2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();
  }
}

// 4. СВЕТЯЩИЙСЯ ПЛАНКТОН И КРИЛЬ
class Plankton {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.radius = 9 + Math.random() * 5;
    this.mass = 4.5;
    this.phase = Math.random() * Math.PI * 2;
    this.type = Math.random() > 0.4 ? 'krill' : 'spore';
    this.color = ['#69f0ae', '#40c4ff', '#ffd740', '#ff4081'][Math.floor(Math.random() * 4)];
    this.isDead = false;
  }

  update() {
    this.phase += 0.04;
    this.x += Math.cos(this.phase) * 0.4;
    this.y = this.baseY + Math.sin(this.phase) * 6;
  }

  draw(ctx, theme) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const isNeon = theme === 'neon';
    ctx.shadowBlur = isNeon ? 14 : 6;
    ctx.shadowColor = this.color;

    // Фотореалистичный полупрозрачный морской криль
    if (this.type === 'krill' && window.assetManager) {
      const drawn = window.assetManager.drawCreature(ctx, 'krill', 0, 0, this.radius * 4.2, Math.sin(this.phase) * 0.15);
      if (drawn) {
        ctx.restore();
        return;
      }
    }

    if (this.type === 'krill') {
      // Крошечный рачок криль
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.4, this.radius * 0.6, Math.sin(this.phase) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = isNeon ? this.color : 'rgba(255, 138, 101, 0.9)';
      ctx.fill();

      // Усики
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(this.radius * 1.8, -this.radius * 0.6);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Светящаяся спора / динофлагеллят
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    ctx.restore();
  }
}

window.Clam = Clam;
window.Crab = Crab;
window.Nautilus = Nautilus;
window.Plankton = Plankton;
