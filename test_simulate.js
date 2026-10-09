// Mock browser environment to test game.js & creature.js thoroughly
global.window = global;
global.window.addEventListener = () => {};
global.document = {
  getElementById: (id) => {
    return {
      id,
      textContent: '10',
      style: { width: '0%', display: 'block' },
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      appendChild: () => {},
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        setTransform: () => {},
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        setLineDash: () => {},
        fillText: () => {},
        quadraticCurveTo: () => {},
        bezierCurveTo: () => {},
        ellipse: () => {},
        rect: () => {},
        clip: () => {},
        fillRect: () => {}
      }),
      width: 1440,
      height: 900,
      addEventListener: () => {}
    };
  },
  createElement: () => ({
    style: {},
    className: '',
    textContent: '',
    appendChild: () => {},
    remove: () => {}
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  documentElement: { lang: 'ru', dir: 'ltr' },
  body: { classList: { add: () => {}, remove: () => {} } }
};

global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.AudioContext = class {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(100) };
  }
  createBufferSource() {
    return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
  }
  resume() { return Promise.resolve(); }
};
global.webkitAudioContext = global.AudioContext;
global.Image = class {
  constructor() {
    this.onload = null;
    this.src = '';
  }
};
global.location = { search: '' };
global.innerWidth = 1440;
global.innerHeight = 900;

try {
  // Load scripts in order
  require('./js/i18n.js');
  require('./js/audio.js');
  require('./js/assets.js');
  require('./js/creature.js');
  require('./js/mollusk.js');
  require('./js/environment.js');
  require('./js/game.js');

  console.log('Scripts loaded successfully!');

  // Validate i18n
  console.log('Testing multilingual translations (ru, en, he)...');
  const i18n = global.window.I18N;
  if (!i18n) throw new Error('I18N engine not found on window!');

  // Russian
  i18n.setLanguage('ru');
  if (i18n.t('startGame') !== 'НАЧАТЬ ПОГРУЖЕНИЕ') throw new Error('RU translation mismatch');
  if (i18n.getSpeciesName('neontetra') !== 'Неоновая Тетра') throw new Error('RU species mismatch');
  console.log('  RU verified: title =', i18n.t('gameTitle'), 'dir =', global.document.documentElement ? global.document.documentElement.dir : 'ltr');

  // English
  i18n.setLanguage('en');
  if (i18n.t('startGame') !== 'START DIVE') throw new Error('EN translation mismatch');
  if (i18n.getSpeciesName('neontetra') !== 'Neon Tetra') throw new Error('EN species mismatch');
  console.log('  EN verified: title =', i18n.t('gameTitle'), 'species =', i18n.getSpeciesName('shark'));

  // Hebrew
  i18n.setLanguage('he');
  if (i18n.t('startGame') !== 'התחלת צלילה') throw new Error('HE translation mismatch');
  if (i18n.getSpeciesName('neontetra') !== 'טטרה ניאון') throw new Error('HE species mismatch');
  if (!i18n.isRTL()) throw new Error('HE should be RTL');
  console.log('  HE verified: title =', i18n.t('gameTitle'), 'isRTL =', i18n.isRTL());

  // Restore default for gameplay test
  i18n.setLanguage('ru');

  const game = window.game || new GameManager();
  console.log('Game initialized!');

  game.startNewGame();
  console.log('Game started, player species:', game.player.species, 'mass:', game.player.mass, 'radius:', game.player.radius);

  console.log('Spawning fishes count:', game.fishes.length);

  // Test 1: Player bumps into peaceful fish (clownfish)
  const peacefulFish = game.fishes.find(f => f.species === 'clownfish') || game.fishes[0];
  console.log('Testing bump into peaceful fish:', peacefulFish.species, 'radius:', peacefulFish.radius);
  game.player.x = peacefulFish.x;
  game.player.y = peacefulFish.y;
  game.player.shieldTimer = 0;
  game.checkCollisions();
  console.log('After peaceful collision: isGameOver =', game.isGameOver, 'lives =', game.player.lives);

  // Test 1b: Player bitten by apex predator (shark)
  console.log('Testing attack by apex predator (shark)...');
  const shark = new Fish(game.player.x + 10, game.player.y, {
    species: 'shark',
    stage: 4,
    radius: 130,
    mass: 2500,
    angle: Math.PI // facing left towards player
  });
  game.fishes.push(shark);

  // Bite 1
  game.player.shieldTimer = 0;
  game.checkCollisions();
  console.log('After bite 1: lives =', game.player.lives, 'isGameOver =', game.isGameOver, 'shieldTimer =', game.player.shieldTimer);

  // Bite 2
  game.player.shieldTimer = 0;
  game.player.x = shark.x - shark.radius * 0.8;
  game.player.y = shark.y;
  game.checkCollisions();
  console.log('After bite 2: lives =', game.player.lives, 'isGameOver =', game.isGameOver);

  // Bite 3 (Fatal)
  game.player.shieldTimer = 0;
  game.player.x = shark.x - shark.radius * 0.8;
  game.player.y = shark.y;
  game.checkCollisions();
  console.log('After bite 3 (fatal): lives =', game.player.lives, 'isGameOver =', game.isGameOver);

  // Reset and Test 2: Player eats smaller fish
  game.isGameOver = false;
  game.player.radius = 120;
  game.player.mass = 500;
  const smallFish = new Fish(game.player.x + 10, game.player.y, {
    species: 'neontetra',
    stage: 1,
    radius: 20,
    mass: 15
  });
  game.fishes.push(smallFish);
  console.log('Testing eating smaller fish...');
  game.checkCollisions();
  console.log('After eating fish: preyEaten =', game.preyEaten, 'score =', game.score, 'player mass =', game.player.mass);

  // Test 3: Player evolves
  console.log('Testing player evolution...');
  game.evolvePlayer(2);
  console.log('After evolution: player stage =', game.player.stage, 'species =', game.player.species);

  // Test 4: Run update and render
  console.log('Testing game update & render...');
  game.update(16);
  game.render();

  // Test 5: Steering & Orientation Verification (No backward swimming)
  console.log('Testing player steering and mouse tracking across all quadrants...');
  game.startNewGame();
  const p = game.player;

  // 5a. Mouse RIGHT (+X)
  game.input.mouseX = window.innerWidth / 2 + 250;
  game.input.mouseY = window.innerHeight / 2;
  for (let i = 0; i < 15; i++) game.update(16);
  console.log('Quadrant 1 (Right): targetAngle =', p.targetAngle.toFixed(2), 'angle =', p.angle.toFixed(2), 'vx =', p.vx.toFixed(2), 'facing =', p.facing);
  if (p.vx <= 0) throw new Error('Player should move right when mouse is on the right');

  // 5b. Mouse UP-LEFT (-X, -Y)
  game.input.mouseX = window.innerWidth / 2 - 300;
  game.input.mouseY = window.innerHeight / 2 - 300;
  for (let i = 0; i < 20; i++) game.update(16);
  console.log('Quadrant 2 (Up-Left): targetAngle =', p.targetAngle.toFixed(2), 'angle =', p.angle.toFixed(2), 'vx =', p.vx.toFixed(2), 'vy =', p.vy.toFixed(2), 'facing =', p.facing);
  if (p.vx >= 0 || p.vy >= 0) throw new Error('Player should move up-left when mouse is up-left');

  // 5c. Mouse DOWN-LEFT (-X, +Y)
  game.input.mouseX = window.innerWidth / 2 - 300;
  game.input.mouseY = window.innerHeight / 2 + 300;
  for (let i = 0; i < 20; i++) game.update(16);
  console.log('Quadrant 3 (Down-Left): targetAngle =', p.targetAngle.toFixed(2), 'angle =', p.angle.toFixed(2), 'vx =', p.vx.toFixed(2), 'vy =', p.vy.toFixed(2), 'facing =', p.facing);
  if (p.vx >= 0 || p.vy <= 0) throw new Error('Player should move down-left when mouse is down-left');

  // 5d. Rendering check with drawFish
  game.render();
  console.log('Render executed cleanly with all transformations verified!');

  // Test 6: Physical Separation Between Overlapping Fish
  console.log('Testing physical separation between overlapping fish...');
  const fishA = new Fish(500, 500, { species: 'shark', radius: 100, mass: 2000 });
  const fishB = new Fish(510, 500, { species: 'shark', radius: 100, mass: 2000 });
  game.fishes = [fishA, fishB];
  const initialDist = Math.hypot(fishB.x - fishA.x, fishB.y - fishA.y);
  game.resolveFishSeparation();
  const separatedDist = Math.hypot(fishB.x - fishA.x, fishB.y - fishA.y);
  console.log('  Fish separation: initial dist =', initialDist, '-> separated dist =', separatedDist.toFixed(2));
  if (separatedDist <= initialDist) throw new Error('Fish should physically separate when overlapping!');
  if (fishA.vx >= 0 || fishB.vx <= 0) throw new Error('Fish should receive repulsive velocity impulses!');

  // Test 7: NPC-on-NPC Predation
  console.log('Testing NPC-on-NPC predation...');
  const predShark = new Fish(600, 600, { species: 'shark', radius: 130, mass: 3000, feedCooldown: 0, angle: 0 });
  const preyFish = new Fish(670, 600, { species: 'clownfish', radius: 36, mass: 120 });
  game.fishes = [predShark, preyFish];
  const prePredCount = game.fishes.length;
  game.resolveNPCPredation();
  console.log('  NPC predation: fishes count before =', prePredCount, 'after =', game.fishes.length, 'pred chompTimer =', predShark.chompTimer);
  if (game.fishes.length !== 1) throw new Error('Predator should have eaten prey fish!');
  if (predShark.feedCooldown <= 0) throw new Error('Predator should enter feed cooldown after meal!');
  if (predShark.chompTimer <= 0) throw new Error('Predator should trigger chomp animation on meal!');

  // Test 8: AI Threat Awareness (Prey flees from nearby Apex Predator)
  console.log('Testing NPC AI threat awareness...');
  const apexMega = new Fish(800, 800, { species: 'megalodon', radius: 185, mass: 15000 });
  const timidFish = new Fish(880, 800, { species: 'neontetra', radius: 24, mass: 15 });
  timidFish.updateAI(game.player, [apexMega, timidFish], []);
  console.log('  Prey AI state near Megalodon:', timidFish.aiState);
  if (timidFish.aiState !== 'FLEE') throw new Error('Small fish should flee from nearby Megalodon!');

  // Test 9: Apex Predator Population Caps & Spawn Spacing
  console.log('Testing apex predator population caps in spawnRandomNPCFish...');
  game.fishes = [];
  for (let i = 0; i < 60; i++) {
    game.spawnRandomNPCFish();
  }
  const megaCount = game.fishes.filter(f => f.species === 'megalodon').length;
  const sharkCount = game.fishes.filter(f => f.species === 'shark').length;
  console.log('  Spawned population of 60 fish: megalodon =', megaCount, '(max 1), shark =', sharkCount, '(max 2)');
  if (megaCount > 1) throw new Error(`Megalodon count ${megaCount} exceeds cap of 1!`);
  if (sharkCount > 2) throw new Error(`Shark count ${sharkCount} exceeds cap of 2!`);

  console.log('All tests passed without throwing any errors!');

} catch (err) {
  console.error('ERROR DETECTED:', err);
  process.exit(1);
}
process.exit(0);
