// Настройки игры, баланс, локализация и конфигурация Phaser.

export const DESIGN = { W: 600, H: 1000 };

export const LANGS = ['ru', 'en', 'tr'];

export const CONFIG = {
  storageKey: 'cosmic_merge_vk_save_v1',
  saveDebounceMs: 1500,

  jar: { left: 70, right: 530, floor: 848, top: 250, dangerY: 285, dropY: 210, wall: 90 },

  physics: {
    gravityY: 1.2,
    restitution: 0.1,
    friction: 0.22,
    frictionStatic: 0.5,
    frictionAir: 0.003,
    density: 0.0015
  },

  shop: {
    products: [
      { id: 'coins_500',  type: 'coins', coins: 500 },
      { id: 'coins_2000', type: 'coins', coins: 2000, badge: 'x1.2' },
      { id: 'coins_6000', type: 'coins', coins: 6000, badge: 'x1.5' }
    ],
    maxStoredTokens: 30
  },

  balance: {
    purgeCost: 40,
    purgeMaxTier: 2,
    startCoins: 50,
    dropCooldownMs: 450,
    dangerHoldMs: 2200,
    comboWindowMs: 1400,
    shakeCost: 25,
    freeCoinsReward: 80,
    freeCoinsCooldownMs: 90000,
    coinsPerScore: 0.04,
    winBonus: 40,
    reviveClearMargin: 120,
    reviveCost: 80,
    doubleCost: 40,
    spawnWeights: [34, 28, 20, 12, 6]
  }
};

export function targetTierForLevel(level) {
  return Math.min(4 + level, 10);
}

const hex = (s) => parseInt(s.slice(1), 16);

const RAW_TIERS = [
  { r: 16,  color: '#c58bff', deco: 'dust',    score: 0,   ru: 'Космопыль',      en: 'Stardust',    tr: 'Yıldız tozu' },
  { r: 23,  color: '#9a7b6a', deco: 'craters', score: 2,   ru: 'Астероид',       en: 'Asteroid',    tr: 'Asteroid' },
  { r: 31,  color: '#cfd8dc', deco: 'craters', score: 5,   ru: 'Луна',           en: 'Moon',        tr: 'Ay' },
  { r: 40,  color: '#ffb74d', deco: 'bands',   score: 9,   ru: 'Венера',         en: 'Venus',       tr: 'Venüs' },
  { r: 50,  color: '#e5533d', deco: 'craters', score: 14,  ru: 'Марс',           en: 'Mars',        tr: 'Mars' },
  { r: 61,  color: '#2f9bf0', deco: 'earth',   score: 20,  ru: 'Земля',          en: 'Earth',       tr: 'Dünya' },
  { r: 73,  color: '#4f5bd5', deco: 'bands',   score: 27,  ru: 'Нептун',         en: 'Neptune',     tr: 'Neptün' },
  { r: 86,  color: '#f2c14e', deco: 'ring',    score: 35,  ru: 'Сатурн',         en: 'Saturn',      tr: 'Satürn' },
  { r: 100, color: '#e08a5a', deco: 'storm',   score: 44,  ru: 'Юпитер',         en: 'Jupiter',     tr: 'Jüpiter' },
  { r: 115, color: '#30d5e8', deco: 'sun',     score: 54,  ru: 'Голубой гигант', en: 'Blue Giant',  tr: 'Mavi dev' },
  { r: 132, color: '#ffd93b', deco: 'sun',     score: 100, ru: 'Солнце',         en: 'Sun',         tr: 'Güneş' }
];
export const TIERS = RAW_TIERS.map((t) => ({ ...t, tint: hex(t.color) }));

const I18N = {
  ru: {
    loading: 'Загрузка',
    title1: 'КОСМИЧЕСКИЙ', title2: 'СИНТЕЗ',
    play: 'ИГРАТЬ', freeCoins: '+{n} МОНЕТ', wait: 'ЖДИТЕ {n}с',
    best: 'Рекорд', level: 'Уровень', goal: 'ЦЕЛЬ', next: 'ДАЛЕЕ', score: 'СЧЁТ',
    shake: 'ВСТРЯХНУТЬ', purge: 'ЧИСТКА', combo: 'КОМБО',
    shop: 'МАГАЗИН', coinsN: '{n} монет',
    owned: 'КУПЛЕНО', close: 'ЗАКРЫТЬ', payUnavailable: 'Покупки сейчас недоступны', purchased: 'Спасибо за покупку!',
    purchaseFail: 'Покупка не удалась', shopLoading: 'Загрузка товаров…', buy: 'КУПИТЬ',
    hint: 'Двигай и отпусти, чтобы бросить',
    reviveTitle: 'ОРБИТА ПЕРЕПОЛНЕНА!', reviveText: 'Потрать {n} монет — и мы расчистим верх банки',
    revive: 'ВОЗРОЖДЕНИЕ', noThanks: 'Нет, спасибо',
    victory: 'ПОБЕДА!', gameOver: 'КОНЕЦ ИГРЫ', newRecord: 'НОВЫЙ РЕКОРД!',
    earned: 'Монеты', double: 'x2 ЗА {n}', retry: 'ЗАНОВО', nextLevel: 'СЛЕДУЮЩИЙ УРОВЕНЬ', menu: 'В МЕНЮ',
    noCoins: 'Не хватает монет', reached: 'Достигнуто'
  },
  en: {
    loading: 'Loading',
    title1: 'COSMIC', title2: 'MERGE',
    play: 'PLAY', freeCoins: '+{n} COINS', wait: 'WAIT {n}s',
    best: 'Best', level: 'Level', goal: 'GOAL', next: 'NEXT', score: 'SCORE',
    shake: 'SHAKE', purge: 'CLEAR', combo: 'COMBO',
    shop: 'SHOP', coinsN: '{n} coins',
    owned: 'OWNED', close: 'CLOSE', payUnavailable: 'Purchases are unavailable right now', purchased: 'Thank you!',
    purchaseFail: 'Purchase failed', shopLoading: 'Loading products…', buy: 'BUY',
    hint: 'Move and release to drop',
    reviveTitle: 'ORBIT OVERFLOW!', reviveText: 'Spend {n} coins and we will clear the top of the jar',
    revive: 'REVIVE', noThanks: 'No, thanks',
    victory: 'VICTORY!', gameOver: 'GAME OVER', newRecord: 'NEW BEST!',
    earned: 'Coins', double: 'x2 FOR {n}', retry: 'RETRY', nextLevel: 'NEXT LEVEL', menu: 'MENU',
    noCoins: 'Not enough coins', reached: 'Reached'
  },
  tr: {
    loading: 'Yükleniyor',
    title1: 'KOZMİK', title2: 'BİRLEŞİM',
    play: 'OYNA', freeCoins: '+{n} JETON', wait: '{n}sn BEKLE',
    best: 'Rekor', level: 'Seviye', goal: 'HEDEF', next: 'SONRAKI', score: 'SKOR',
    shake: 'SALLA', purge: 'TEMİZLE', combo: 'KOMBO',
    shop: 'MAĞAZA', coinsN: '{n} jeton',
    owned: 'ALINDI', close: 'KAPAT', payUnavailable: 'Satın alımlar şu an yok', purchased: 'Teşekkürler!',
    purchaseFail: 'Satın alma başarısız', shopLoading: 'Ürünler yükleniyor…', buy: 'AL',
    hint: 'Sürükle ve bırak',
    reviveTitle: 'YÖRÜNGE DOLU!', reviveText: '{n} jeton harca, kavanozun üstünü temizleyelim',
    revive: 'YENİDEN DOĞ', noThanks: 'Hayır, teşekkürler',
    victory: 'ZAFER!', gameOver: 'OYUN BİTTİ', newRecord: 'YENİ REKOR!',
    earned: 'Jeton', double: 'x2 / {n}', retry: 'TEKRAR', nextLevel: 'SONRAKİ SEVİYE', menu: 'MENÜ',
    noCoins: 'Yeterli jeton yok', reached: 'Ulaşıldı'
  }
};

let currentLang = 'ru';
export function setLang(code) {
  code = String(code || 'ru').toLowerCase().slice(0, 2);
  if (['ru', 'be', 'kk', 'uk', 'uz', 'hy', 'az', 'ka', 'tg', 'ky', 'tk'].includes(code)) currentLang = 'ru';
  else if (code === 'tr') currentLang = 'tr';
  else currentLang = 'en';
  return currentLang;
}
export function getLang() { return currentLang; }
export function t(key, vars) {
  let s = (I18N[currentLang] && I18N[currentLang][key]) || I18N.ru[key] || key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}
export function tierName(i) {
  const key = currentLang === 'en' ? 'en' : (currentLang === 'tr' ? 'tr' : 'ru');
  return TIERS[i][key];
}
export function nextLang() {
  const i = LANGS.indexOf(currentLang);
  return LANGS[(i + 1) % LANGS.length];
}
export function langFlag() {
  return currentLang === 'en' ? 'EN' : (currentLang === 'tr' ? 'TR' : 'RU');
}

export function createGameConfig(scenes) {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0B0F12',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%'
    },
    render: { antialias: true, powerPreference: 'high-performance', roundPixels: false },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: CONFIG.physics.gravityY },
        debug: false,
        setBounds: false,
        enableSleeping: false,
        positionIterations: 8,
        velocityIterations: 6
      }
    },
    input: { activePointers: 2 },
    disableContextMenu: true,
    banner: false,
    scene: scenes
  };
}
