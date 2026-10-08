/**
 * AquaGenesis Internationalization (i18n) Engine
 * Supported Languages:
 *   - 'ru': Russian (Русский)
 *   - 'en': English
 *   - 'he': Hebrew (עברית) - RTL
 */

const TRANSLATIONS = {
  ru: {
    // Мета & Заголовки
    gameTitle: 'AquaGenesis: Эволюция Океана',
    gameTagline: 'Эволюция в Глубинах Океана',

    // HUD Верхний
    stage: 'СТАДИЯ',
    biomassGrowth: 'БИОМАССА & РОСТ',
    unitG: 'г',
    unitCm: 'см',
    unitM: 'м',
    unitS: 'с',
    lives: 'Жизни',
    livesTooltip: 'Запас жизней вашей рыбы (выдерживает укусы крупных хищников)',
    size: 'Размер',
    score: 'Счёт',
    day: 'День',
    sunset: 'Закат',
    neon: 'Неон',
    dayTitle: 'Дневной риф (Солнечные лучи)',
    sunsetTitle: 'Золотой закат (Теплый свет)',
    neonTitle: 'Абиссальный неон (Биолюминесценция)',
    soundTitle: 'Включить / Выключить звук',
    soundAria: 'Звук',
    pauseTitle: 'Пауза',
    pauseAria: 'Пауза',

    // Радар и Энергия
    depthSonar: 'ЭХОЛОТ ГЛУБИН',
    prey: 'Добыча',
    threat: 'Угроза',
    mollusks: 'Моллюски',
    dashHud: 'РЫВОК [ПРОБЕЛ / КЛИК]',
    dashMobile: 'РЫВОК',

    // Уведомления и предупреждения
    dangerPredator: 'ПРИБЛИЖАЕТСЯ КРУПНЫЙ ХИЩНИК!',
    shieldIndicator: '🛡️ ЩИТ ({sec}с)',
    playerIndicator: 'ВЫ 🐟',

    // Всплывающие сообщения поедания
    eatPearlClam: '🦪 Жемчужница!',
    eatPlusLife: '💖 +1 ЖИЗНЬ!',
    eatCrab: '🦀 Вкусный краб!',
    eatNautilus: '🌀 Наутилус!',
    eatFish: '🐟 {name} +{mass}г',
    predatorBite: '💔 УКУС ХИЩНИКА! (-1 Жизнь)',
    predatorSwallowed: 'Вас проглотил опасный хищник глубин!',
    genericFish: 'Рыба',

    // Стартовое модальное окно
    ruleFeedTitle: 'Питайтесь',
    ruleFeedDesc: 'Поедайте планктон, моллюсков на дне и рыбок меньшего размера, чтобы накапливать биомассу.',
    ruleSurviveTitle: 'Выживайте',
    ruleSurviveDesc: 'Остерегайтесь рыб больше вас! Следите за красными сигналами эхолота и прячьтесь в водорослях.',
    ruleEvolveTitle: 'Эволюционируйте',
    ruleEvolveDesc: 'Преодолейте 4 эволюционные ступени: от беззащитного малька до мифического Левиафана Океана!',
    controlsPcTitle: '💻 На Компьютере:',
    controlsPcDesc: 'Мышь — плыть за курсором<br>Пробел / Левый клик — турбо-рывок<br>WASD / Стрелки — ручное плавание',
    controlsMobileTitle: '📱 На Телефоне / Планшете:',
    controlsMobileDesc: 'Виртуальный джойстик слева (или касание в любом месте)<br>Кнопка ⚡ справа — рывок',
    chooseLighting: 'Выберите начальное освещение:',
    chooseLanguage: 'Язык игры / Language / שפה:',
    startGame: 'НАЧАТЬ ПОГРУЖЕНИЕ',

    // Модальное окно эволюции
    evoModalTitle: 'НОВАЯ ЭВОЛЮЦИОННАЯ ФОРМА!',
    perkSpeed: '⚡ Скорость +25%',
    perkShells: '🦪 Раскрытие крупных раковин',
    perkSonar: '👁️ Дальность эхолота +30%',
    continueHunt: 'ПРОДОЛЖИТЬ ОХОТУ',

    // Модальное окно паузы
    gamePaused: 'ИГРА НА ПАУЗЕ',
    oceanFrozen: 'Океан замер во времени',
    langLabel: 'Язык / Language:',
    themeLabel: 'Освещение рифа:',
    resumeBtn: 'ПРОДОЛЖИТЬ',
    restartBtn: 'НАЧАТЬ ЗАНОВО',

    // Модальное окно поражения
    swallowedTitle: 'ВАС ПРОГЛОТИЛИ!',
    swallowedDefault: 'Более крупный хищник оказался быстрее и беспощаднее.',
    finalLength: 'Достигнутый размер:',
    finalMass: 'Максимальная биомасса:',
    finalEaten: 'Съедено добычи:',
    finalScore: 'Итоговый Счёт:',
    respawnBtn: 'ВОЗРОДИТЬСЯ В ОКЕАНЕ',

    // Модальное окно победы (Левиафан)
    victoryTitle: 'ВЕРШИНА ПИЩЕВОЙ ЦЕПИ!',
    victoryDesc: 'Вы эволюционировали в Легендарного Левиафана Океана! Ни одно создание бездны больше не способно бросить вам вызов!',
    freeplayBtn: 'ПРОДОЛЖИТЬ БЕЗЛИМИТНОЕ ПЛАВАНИЕ',

    // Названия стадий эволюции
    stageNames: {
      1: 'Крошечный Малёк',
      2: 'Рифовый Охотник',
      3: 'Грозный Хищник',
      4: 'Легендарный Левиафан'
    },
    stageDescs: {
      1: 'Крошечная юркая тетра со светящейся неоновой полосой и алым хвостом. Питайтесь планктоном!',
      2: 'Ваши челюсти окрепли, а спинной плавник позволяет совершать стремительные атаки!',
      3: 'Неуловимая скорость и кинжальные зубы открывают охоту на крупных рыб!',
      4: 'Вы достигли абсолютного величия — повелитель глубин и владыка всех вод!'
    },

    // Названия видов рыб
    species: {
      neontetra: {
        name: 'Неоновая Тетра',
        fullName: 'Неоновая Тетра (Малёк)',
        lengthCm: '4 - 12 см',
        desc: 'Крошечная юркая тетра со светящейся неоновой полосой и алым хвостом. Питайтесь планктоном!'
      },
      clownfish: {
        name: 'Рыба-Клоун',
        fullName: 'Рыба-Клоун (Оцеллярис)',
        lengthCm: '15 - 35 см',
        desc: 'Яркая рифовая рыба с 3 белоснежными полосами и черной каймой плавников. Охотьтесь на моллюсков!'
      },
      bluetang: {
        name: 'Голубой Хирург (Дори)',
        fullName: 'Голубой Хирург (Дори)',
        lengthCm: '20 - 30 см',
        desc: 'Быстрая рифовая рыба с глубоким ультрамариновым окрасом и желтым хвостом.'
      },
      yellowtang: {
        name: 'Желтая Зебрасома',
        fullName: 'Желтая Зебрасома',
        lengthCm: '15 - 20 см',
        desc: 'Ярко-лимонный обитатель коралловых атоллов.'
      },
      lionfish: {
        name: 'Крылатка-Зебра',
        fullName: 'Крылатка-Зебра',
        lengthCm: '30 - 40 см',
        desc: 'Хищник с ядовитыми веерными лучами плавников и полосатым телом.'
      },
      barracuda: {
        name: 'Большая Барракуда',
        fullName: 'Большая Барракуда',
        lengthCm: '70 - 150 см',
        desc: 'Стреловидный хищник с выступающей нижней челюстью, кинжальными зубами и тигриными полосами!'
      },
      shark: {
        name: 'Большая Белая Акула',
        fullName: 'Большая Белая Акула',
        lengthCm: '3 - 6 метров',
        desc: 'Вершинный сверххищник мирового океана: 5 жаберных щелей, серповидный хвост и ряды смертоносных зубов!'
      }
    }
  },

  en: {
    // Meta & Headings
    gameTitle: 'AquaGenesis: Ocean Evolution',
    gameTagline: 'Evolution in the Ocean Depths',

    // HUD Top
    stage: 'STAGE',
    biomassGrowth: 'BIOMASS & GROWTH',
    unitG: 'g',
    unitCm: 'cm',
    unitM: 'm',
    unitS: 's',
    lives: 'Lives',
    livesTooltip: 'Your fish’s lives (absorbs bites from large predators)',
    size: 'Size',
    score: 'Score',
    day: 'Day',
    sunset: 'Sunset',
    neon: 'Neon',
    dayTitle: 'Daylight Reef (Sunbeams)',
    sunsetTitle: 'Golden Sunset (Warm Light)',
    neonTitle: 'Abyssal Neon (Bioluminescence)',
    soundTitle: 'Toggle sound',
    soundAria: 'Sound',
    pauseTitle: 'Pause',
    pauseAria: 'Pause',

    // Radar & Energy
    depthSonar: 'DEPTH SONAR',
    prey: 'Prey',
    threat: 'Threat',
    mollusks: 'Mollusks',
    dashHud: 'DASH [SPACE / CLICK]',
    dashMobile: 'DASH',

    // Alerts & Warnings
    dangerPredator: 'LARGE PREDATOR APPROACHING!',
    shieldIndicator: '🛡️ SHIELD ({sec}s)',
    playerIndicator: 'YOU 🐟',

    // Floating bite messages
    eatPearlClam: '🦪 Pearl Oyster!',
    eatPlusLife: '💖 +1 LIFE!',
    eatCrab: '🦀 Tasty Crab!',
    eatNautilus: '🌀 Nautilus!',
    eatFish: '🐟 {name} +{mass}g',
    predatorBite: '💔 PREDATOR BITE! (-1 Life)',
    predatorSwallowed: 'You were swallowed by a deep-sea predator!',
    genericFish: 'Fish',

    // Start Modal
    ruleFeedTitle: 'Feed',
    ruleFeedDesc: 'Devour plankton, seabed mollusks, and smaller fish to accumulate biomass.',
    ruleSurviveTitle: 'Survive',
    ruleSurviveDesc: 'Beware of larger fish! Keep an eye on red sonar blips and seek shelter in kelp forests.',
    ruleEvolveTitle: 'Evolve',
    ruleEvolveDesc: 'Conquer 4 evolutionary milestones: from a defenseless fry to the mythical Ocean Leviathan!',
    controlsPcTitle: '💻 On PC:',
    controlsPcDesc: 'Mouse — swim towards cursor<br>Space / Left Click — turbo dash<br>WASD / Arrow keys — swim manually',
    controlsMobileTitle: '📱 On Mobile / Tablet:',
    controlsMobileDesc: 'Virtual joystick on the left (or tap anywhere)<br>⚡ button on the right — dash',
    chooseLighting: 'Choose initial lighting:',
    chooseLanguage: 'Game Language / Язык / שפה:',
    startGame: 'START DIVE',

    // Evolution Modal
    evoModalTitle: 'NEW EVOLUTIONARY FORM!',
    perkSpeed: '⚡ Speed +25%',
    perkShells: '🦪 Crack open large shells',
    perkSonar: '👁️ Sonar range +30%',
    continueHunt: 'CONTINUE HUNT',

    // Pause Modal
    gamePaused: 'GAME PAUSED',
    oceanFrozen: 'The ocean is frozen in time',
    langLabel: 'Language / Язык:',
    themeLabel: 'Reef Lighting:',
    resumeBtn: 'RESUME',
    restartBtn: 'RESTART',

    // Game Over Modal
    swallowedTitle: 'YOU WERE SWALLOWED!',
    swallowedDefault: 'A larger predator proved swifter and more ruthless.',
    finalLength: 'Final Size:',
    finalMass: 'Max Biomass:',
    finalEaten: 'Prey Eaten:',
    finalScore: 'Final Score:',
    respawnBtn: 'RESPAWN IN OCEAN',

    // Victory Modal
    victoryTitle: 'APEX OF THE FOOD CHAIN!',
    victoryDesc: 'You have evolved into the Legendary Ocean Leviathan! No denizen of the abyss can challenge you now!',
    freeplayBtn: 'CONTINUE FREE SWIM',

    // Evolution stage names
    stageNames: {
      1: 'Tiny Fry',
      2: 'Reef Hunter',
      3: 'Fierce Predator',
      4: 'Legendary Leviathan'
    },
    stageDescs: {
      1: 'A tiny, agile tetra with an iridescent neon stripe and crimson tail. Feed on plankton!',
      2: 'Your jaws have grown stronger and your dorsal fin enables swift ambush strikes!',
      3: 'Stealthy speed and dagger-like teeth unlock hunting of large prey fish!',
      4: 'You have attained supreme majesty — ruler of the abyss and monarch of all seas!'
    },

    // Fish species names
    species: {
      neontetra: {
        name: 'Neon Tetra',
        fullName: 'Neon Tetra (Fry)',
        lengthCm: '4 - 12 cm',
        desc: 'A tiny, agile tetra with an iridescent neon stripe and crimson tail. Feed on plankton!'
      },
      clownfish: {
        name: 'Clownfish',
        fullName: 'Clownfish (Ocellaris)',
        lengthCm: '15 - 35 cm',
        desc: 'A vibrant reef fish with 3 snowy stripes and black fin margins. Hunt for mollusks!'
      },
      bluetang: {
        name: 'Blue Tang (Dory)',
        fullName: 'Blue Tang (Dory)',
        lengthCm: '20 - 30 cm',
        desc: 'A swift reef fish with deep ultramarine coloring and a vibrant yellow tail.'
      },
      yellowtang: {
        name: 'Yellow Tang',
        fullName: 'Yellow Tang',
        lengthCm: '15 - 20 cm',
        desc: 'A bright lemon-yellow dweller of coral atolls.'
      },
      lionfish: {
        name: 'Lionfish',
        fullName: 'Lionfish',
        lengthCm: '30 - 40 cm',
        desc: 'A predatory hunter with venomous fan-like fin spines and striped body.'
      },
      barracuda: {
        name: 'Great Barracuda',
        fullName: 'Great Barracuda',
        lengthCm: '70 - 150 cm',
        desc: 'A torpedo-shaped predator with a protruding lower jaw, dagger teeth, and tiger stripes!'
      },
      shark: {
        name: 'Great White Shark',
        fullName: 'Great White Shark',
        lengthCm: '3 - 6 meters',
        desc: 'The apex ocean super-predator: 5 gill slits, crescent tail, and rows of razor-sharp teeth!'
      }
    }
  },

  he: {
    // Meta & Headings
    gameTitle: 'AquaGenesis: אבולוציית האוקיינוס',
    gameTagline: 'אבולוציה במעמקי האוקיינוס',

    // HUD Top
    stage: 'שלב',
    biomassGrowth: 'ביומסה וגדילה',
    unitG: 'גר\'',
    unitCm: 'ס"מ',
    unitM: 'מ\'',
    unitS: 'שנ\'',
    lives: 'חיים',
    livesTooltip: 'מאגר החיים של הדג שלך (סופג נשיכות מטורפים גדולים)',
    size: 'גודל',
    score: 'ניקוד',
    day: 'יום',
    sunset: 'שקיעה',
    neon: 'ניאון',
    dayTitle: 'שונית יום (קרני שמש חמות)',
    sunsetTitle: 'שקיעה מוזהבת (אור רך)',
    neonTitle: 'ניאון מצולות (זהירה ביולוגית)',
    soundTitle: 'הפעל / השבת צליל',
    soundAria: 'צליל',
    pauseTitle: 'השהיה',
    pauseAria: 'השהיה',

    // Radar & Energy
    depthSonar: 'סונאר מעמקים',
    prey: 'טרף',
    threat: 'איום',
    mollusks: 'רכיכות',
    dashHud: 'זינוק [רווח / לחיצה]',
    dashMobile: 'זינוק',

    // Alerts & Warnings
    dangerPredator: 'טורף ענק מתקרב!',
    shieldIndicator: '🛡️ מגן ({sec}ש\')',
    playerIndicator: 'אתה 🐟',

    // Floating bite messages
    eatPearlClam: '🦪 צדפת פנינה!',
    eatPlusLife: '💖 +1 חיים!',
    eatCrab: '🦀 סרטן טעים!',
    eatNautilus: '🌀 נאוטילוס!',
    eatFish: '🐟 {name} +{mass}גר\'',
    predatorBite: '💔 נשיכת טורף! (-1 חיים)',
    predatorSwallowed: 'נטרפת על ידי טורף מעמקים מסוכן!',
    genericFish: 'דג',

    // Start Modal
    ruleFeedTitle: 'אכלו',
    ruleFeedDesc: 'טרפו פלנקטון, צדפות בקרקעית ודגים קטנים מכם כדי לצבור ביומסה.',
    ruleSurviveTitle: 'שרדו',
    ruleSurviveDesc: 'היזהרו מדגים גדולים מכם! עקבו אחר אותות הסונאר האדומים והסתתרו ביערות אצות.',
    ruleEvolveTitle: 'התפתחו',
    ruleEvolveDesc: 'עברו 4 שלבי אבולוציה: מדגיג חסר ישע ועד ללווייתן אוקיינוס מיתולוגי!',
    controlsPcTitle: '💻 במחשב:',
    controlsPcDesc: 'עכבר — שחייה בעקבות הסמן<br>רווח / קליק שמאלי — זינוק טורבו<br>WASD / מקשי חיצים — שחייה ידנית',
    controlsMobileTitle: '📱 בנייד / טאבלט:',
    controlsMobileDesc: 'ג\'ויסטיק וירטואלי משמאל (או מגע בכל מקום)<br>כפתור ⚡ מימין — זינוק',
    chooseLighting: 'בחרו תאורה התחלתית:',
    chooseLanguage: 'שפת המשחק / Language / Язык:',
    startGame: 'התחלת צלילה',

    // Evolution Modal
    evoModalTitle: 'צורת אבולוציה חדשה!',
    perkSpeed: '⚡ מהירות 25%+',
    perkShells: '🦪 פתיחת צדפות גדולות',
    perkSonar: '👁️ טווח סונאר 30%+',
    continueHunt: 'המשך בציד',

    // Pause Modal
    gamePaused: 'המשחק הושהה',
    oceanFrozen: 'האוקיינוס קפא בזמן',
    langLabel: 'שפה / Language:',
    themeLabel: 'תאורת שונית:',
    resumeBtn: 'המשך',
    restartBtn: 'התחל מחדש',

    // Game Over Modal
    swallowedTitle: 'נבלעת!',
    swallowedDefault: 'טורף גדול יותר היה מהיר ואכזר יותר.',
    finalLength: 'גודל שהושג:',
    finalMass: 'ביומסה מרבית:',
    finalEaten: 'נטרפו סה"כ:',
    finalScore: 'ניקוד סופי:',
    respawnBtn: 'להיוולד מחדש באוקיינוס',

    // Victory Modal
    victoryTitle: 'ראש שרשרת המזון!',
    victoryDesc: 'התפתחת ללווייתן האוקיינוס האגדי! שום יצור במצולות אינו יכול עוד לאיים עליך!',
    freeplayBtn: 'המשך שחייה חופשית',

    // Evolution stage names
    stageNames: {
      1: 'דגיג זעיר',
      2: 'צייד השונית',
      3: 'טורף אימתני',
      4: 'לווייתן אגדי'
    },
    stageDescs: {
      1: 'טטרה זעירה וזריזה בעלת פס ניאון זוהר וזנב אדום. ניזונו מפלנקטון!',
      2: 'הלסתות שלך התחזקו, וסנפיר הגב מאפשר התקפות מארב בזק!',
      3: 'מהירות חמקמקה ושיני פגיון מאפשרות צייד של דגים גדולים!',
      4: 'הגעת להוד מוחלט — שליט המצולות ואדון כל המים!'
    },

    // Fish species names
    species: {
      neontetra: {
        name: 'טטרה ניאון',
        fullName: 'טטרה ניאון (דגיג)',
        lengthCm: '4 - 12 ס"מ',
        desc: 'טטרה זעירה וזריזה בעלת פס ניאון זוהר וזנב אדום. ניזונו מפלנקטון!'
      },
      clownfish: {
        name: 'שושנון',
        fullName: 'שושנון (אוסלריס)',
        lengthCm: '15 - 35 ס"מ',
        desc: 'דג שונית ססגוני בעל 3 פסים לבנים וקצוות סנפיר שחורים. צודו רכיכות!'
      },
      bluetang: {
        name: 'נתחן כחול (דורי)',
        fullName: 'נתחן כחול (דורי)',
        lengthCm: '20 - 30 ס"מ',
        desc: 'דג שונית מהיר בעל צבע אולטרה-מרין עמוק וזנב צהוב בוהק.'
      },
      yellowtang: {
        name: 'זברסומה צהובה',
        fullName: 'זברסומה צהובה',
        lengthCm: '15 - 20 ס"מ',
        desc: 'שוכנת אטולים אלמוגיים בצבע לימון בוהק.'
      },
      lionfish: {
        name: 'זהרון הדור',
        fullName: 'זהרון הדור',
        lengthCm: '30 - 40 ס"מ',
        desc: 'טורף בעל קוצי סנפיר מניפתיים ארסיים וגוף מפוספס.'
      },
      barracuda: {
        name: 'ברקודה גדולה',
        fullName: 'ברקודה גדולה',
        lengthCm: '70 - 150 ס"מ',
        desc: 'טורף דמוי חץ בעל לסת תחתונה בולטת, שיני פגיון ופסי נמר!'
      },
      shark: {
        name: 'עמלץ לבן',
        fullName: 'עמלץ לבן',
        lengthCm: '3 - 6 מטרים',
        desc: 'טורף העל של האוקיינוס: 5 חריצי זימים, זנב סהרוני ושורות שיניים קטלניות!'
      }
    }
  }
};

class I18nManager {
  constructor() {
    this.supportedLanguages = ['ru', 'en', 'he'];
    this.currentLang = this.detectLanguage();
    this.translations = TRANSLATIONS;
    this.listeners = [];
  }

  detectLanguage() {
    try {
      const saved = localStorage.getItem('aqua_lang');
      if (saved && this.supportedLanguages.includes(saved)) {
        return saved;
      }
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('he') || navLang.startsWith('iw')) return 'he';
      if (navLang.startsWith('en')) return 'en';
      if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('uk')) return 'ru';
    } catch (e) {}
    return 'ru'; // По умолчанию русский
  }

  getLang() {
    return this.currentLang;
  }

  isRTL() {
    return this.currentLang === 'he';
  }

  setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) return;
    this.currentLang = lang;
    try {
      localStorage.setItem('aqua_lang', lang);
    } catch (e) {}

    // Обновляем атрибуты документа
    if (typeof document !== 'undefined') {
      if (document.documentElement) {
        document.documentElement.lang = lang;
        document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
      }
      if (document.body) {
        if (this.isRTL()) {
          document.body.classList.add('rtl-layout');
        } else {
          document.body.classList.remove('rtl-layout');
        }
      }

      this.applyToDOM();
    }

    // Оповещаем подписчиков (например, игровой движок)
    for (const cb of this.listeners) {
      try { cb(lang); } catch (e) { console.error(e); }
    }
  }

  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  t(key, params = {}) {
    const langDict = this.translations[this.currentLang] || this.translations.ru;
    let text = langDict[key] || this.translations.ru[key] || key;
    if (typeof text === 'string') {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return text;
  }

  getSpeciesName(speciesKey, isFull = false) {
    const langDict = this.translations[this.currentLang] || this.translations.ru;
    const spec = (langDict.species && langDict.species[speciesKey]) || 
                 (this.translations.ru.species && this.translations.ru.species[speciesKey]);
    if (!spec) return speciesKey;
    return isFull ? (spec.fullName || spec.name) : spec.name;
  }

  getSpeciesDesc(speciesKey) {
    const langDict = this.translations[this.currentLang] || this.translations.ru;
    const spec = (langDict.species && langDict.species[speciesKey]) || 
                 (this.translations.ru.species && this.translations.ru.species[speciesKey]);
    return spec ? spec.desc : '';
  }

  getStageName(stageNum) {
    const langDict = this.translations[this.currentLang] || this.translations.ru;
    const stages = langDict.stageNames || this.translations.ru.stageNames;
    return stages[stageNum] || `Stage ${stageNum}`;
  }

  getStageDesc(stageNum) {
    const langDict = this.translations[this.currentLang] || this.translations.ru;
    const descs = langDict.stageDescs || this.translations.ru.stageDescs;
    return descs[stageNum] || '';
  }

  applyToDOM() {
    if (typeof document === 'undefined') return;

    // Обновляем title документа
    document.title = this.t('gameTitle');

    // Текстовые элементы с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.t(key);
    });

    // HTML элементы с data-i18n-html
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = this.t(key);
    });

    // Атрибуты title с data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', this.t(key));
    });

    // Атрибуты aria-label с data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', this.t(key));
    });

    // Обновление активных кнопок языка
    document.querySelectorAll('[data-lang]').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === this.currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

// Создаем глобальный синглтон
const i18n = new I18nManager();
if (typeof window !== 'undefined') {
  window.I18N = i18n;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18nManager, TRANSLATIONS, i18n };
}
