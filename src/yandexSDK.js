// Платформенный слой VK Play: сохранения, покупки, без рекламы.
// Имя файла оставлено как в яндекс-версии, чтобы сцены импортировали тот же путь.

import { CONFIG, LANGS, setLang } from './config.js?v=20261122e';
import {
  currencyOf, ensureUser, handshake, inIframe, isVkPlay, loadCloudSave, looksLikeVkPlay,
  pay, userUid, waitForIframeApi, waitForUid, writeCloudSave, VKPLAY_PRICES, VKPLAY_SAVE_URL
} from './vkplay.js?v=20261122e';

export const defaultData = () => ({
  v: 1,
  coins: CONFIG.balance.startCoins,
  best: 0,
  level: 1,
  maxTier: 0,
  games: 0,
  sound: true,
  lang: '',
  tokens: [],
  giftAt: 0,
  updatedAt: 0
});

function normalize(raw) {
  const d = Object.assign(defaultData(), raw || {});
  for (const k of ['coins', 'best', 'level', 'maxTier', 'games', 'giftAt']) {
    if (!isFinite(d[k]) || d[k] < 0) d[k] = k === 'level' ? 1 : 0;
    d[k] = Math.min(d[k], 1e300);
  }
  d.level = Math.max(1, Math.floor(d.level));
  d.sound = !!d.sound;
  if (!Array.isArray(d.tokens)) d.tokens = [];
  if (!LANGS.includes(d.lang)) d.lang = '';
  return d;
}

function writeInto(dst, src) {
  const n = normalize(src);
  for (const key of Object.keys(n)) {
    dst[key] = Array.isArray(n[key]) ? n[key].slice() : n[key];
  }
  return dst;
}

// Windows/Android: берём лучший прогресс с обоих устройств, а не «кто последний зашёл».
function mergeSaves(a, b) {
  if (!a) return normalize(b);
  if (!b) return normalize(a);
  const x = normalize(a);
  const y = normalize(b);
  const out = defaultData();
  for (const k of ['coins', 'best', 'level', 'maxTier', 'games']) {
    out[k] = Math.max(x[k] || 0, y[k] || 0);
  }
  out.level = Math.max(1, out.level);
  out.tokens = Array.from(new Set([].concat(x.tokens || [], y.tokens || []))).slice(-CONFIG.shop.maxStoredTokens);
  const recent = (x.updatedAt || 0) >= (y.updatedAt || 0) ? x : y;
  out.lang = recent.lang;
  out.sound = recent.sound;
  out.giftAt = Math.max(x.giftAt || 0, y.giftAt || 0);
  out.updatedAt = Math.max(x.updatedAt || 0, y.updatedAt || 0, Date.now());
  return out;
}

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

class YandexSDKManager {
  constructor() {
    this.mode = 'none';
    this.vkApi = null;
    this.game = null;
    this.ready = false;
    this.data = defaultData();
    this.busy = false;
    this._reasons = new Set();
    this._sleeping = false;
    this._saveTimer = null;
    this._gameplayOn = false;
    this._loadingReadySent = false;
    this._cloudReady = false;
    this.handshakeError = '';
  }

  async init(game) {
    this.game = game;
    if (this.ready) return;
    const isLocal = ['localhost', '127.0.0.1', '', '0.0.0.0'].includes(location.hostname) || location.protocol === 'file:';
    const onGithubPages = /github\.io$/i.test(location.hostname);
    const wantVk = looksLikeVkPlay() || onGithubPages || !isLocal;
    if (wantVk) await waitForIframeApi(inIframe() ? 6000 : 0);

    this.mode = (wantVk || isVkPlay() || onGithubPages || !isLocal) ? 'vkplay' : 'offline';
    if (typeof window.iframeApi === 'function') {
      try {
        this.vkApi = await withTimeout(handshake(), 10000);
        try { await ensureUser(this.vkApi); } catch (e) { console.warn('[VKPlay] auth:', e && e.message ? e.message : e); }
      } catch (e) {
        console.warn('[VKPlay] handshake failed:', e);
        this.handshakeError = String(e && e.message ? e.message : e);
        this.vkApi = null;
      }
    }

    setLang(this.data.lang || navigator.language);

    document.addEventListener('visibilitychange', () => { if (document.hidden) this.flushCloud(); });
    window.addEventListener('pagehide', () => this.flushCloud());
    window.addEventListener('freeze', () => this.flushCloud());
    this.ready = true;
    try {
      if (inIframe()) {
        parent.postMessage({ cosmicSdk: {
          mode: this.mode,
          pay: this.paymentsAvailable,
          iframeApi: typeof window.iframeApi,
          uid: userUid(),
          keys: this.vkApi ? Object.keys(this.vkApi) : [],
          err: this.handshakeError || ''
        } }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  gameReady() {
    this._loadingReadySent = true;
  }
  gameplayStart() { this._gameplayOn = true; }
  gameplayStop() { this._gameplayOn = false; }

  _readLocal() {
    try { const raw = localStorage.getItem(CONFIG.storageKey); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  _writeLocal() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.data)); } catch (e) { /* приватный режим */ }
  }

  async loadData() {
    const local = this._readLocal();
    let cloud = null;
    if (this.mode === 'vkplay') {
      if (this.vkApi) {
        try { await ensureUser(this.vkApi); } catch (e) { /* ignore */ }
      }
      const uid = await waitForUid(6000);
      if (uid) {
        try { cloud = await withTimeout(loadCloudSave(uid), 5000); }
        catch (e) { console.warn('[VKPlay] cloud load failed:', e); }
      } else {
        console.warn('[VKPlay] no uid, cloud skipped');
      }
    }
    writeInto(this.data, mergeSaves(cloud, local));
    this._cloudReady = true;
    if (this.data.lang) setLang(this.data.lang);
    this.applyAudioState();
    this._writeLocal();
    if (this.mode === 'vkplay' && userUid()) this.flushCloud();
    if (this.mode === 'vkplay' && !userUid()) this._watchUid();
    return this.data;
  }

  _watchUid() {
    if (this._uidWatch) return;
    this._uidWatch = true;
    (async () => {
      const uid = await waitForUid(20000);
      this._uidWatch = false;
      if (!uid) return;
      let cloud = null;
      try { cloud = await withTimeout(loadCloudSave(uid), 5000); }
      catch (e) { console.warn('[VKPlay] late cloud load failed:', e); }
      writeInto(this.data, mergeSaves(cloud, this.data));
      this._writeLocal();
      this.flushCloud();
      if (this.onDataReload) {
        try { this.onDataReload(); } catch (e) { /* ignore */ }
      }
    })();
  }

  setUserLang(code) {
    this.data.lang = setLang(code);
    this.save(true);
    this.flushCloud();
  }

  save(important = false) {
    this.data.updatedAt = Date.now();
    this._writeLocal();
    const wait = important ? CONFIG.saveDebounceMs : 4000;
    if (this._saveTimer && !important) return;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.flushCloud(), wait);
  }

  flushCloud() {
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    this._writeLocal();
    if (!this._cloudReady) return;
    if (this.mode !== 'vkplay') return;
    const uid = userUid();
    if (!uid) return;
    const body = JSON.stringify({ uid: String(uid), save: this.data });
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon && document.visibilityState === 'hidden') {
        navigator.sendBeacon(VKPLAY_SAVE_URL, new Blob([body], { type: 'application/json' }));
        return;
      }
    } catch (e) { /* fallback на fetch */ }
    writeCloudSave(uid, this.data).catch((e) => console.warn('[VKPlay] cloud save failed:', e));
  }

  persist(important = true) {
    this.save(important);
    if (important) this.flushCloud();
  }

  _suspend(reason) {
    this._reasons.add(reason);
    this.applyAudioState();
  }
  _resume(reason) {
    this._reasons.delete(reason);
    this.applyAudioState();
  }

  applyAudioState() {
    const g = this.game;
    if (!g) return;
    const paused = this._reasons.size > 0;
    if (paused && !this._sleeping) { g.loop.sleep(); this._sleeping = true; }
    if (!paused && this._sleeping) { g.loop.wake(); this._sleeping = false; }
    g.sound.mute = paused || !this.data.sound;
  }

  setSound(on) {
    this.data.sound = !!on;
    this.applyAudioState();
    this.save(true);
  }

  get paymentsAvailable() { return this.mode === 'vkplay' && !!this.vkApi; }

  async getCatalog() {
    const out = {};
    const cur = currencyOf();
    const mark = { RUB: '₽', USD: '$', EUR: '€' }[cur] || cur;
    for (const id of Object.keys(VKPLAY_PRICES)) {
      const row = VKPLAY_PRICES[id];
      const lang = this.data.lang || 'ru';
      const title = lang === 'en' ? row.en : (lang === 'tr' ? row.tr : row.ru);
      out[id] = { price: row[cur] + ' ' + mark, priceValue: String(row[cur]), title };
    }
    return out;
  }

  async purchase(id) {
    if (!this.paymentsAvailable || this.busy) return false;
    this._suspend('pay');
    try {
      if (!this.vkApi) throw new Error('vkplay-api');
      await pay(this.vkApi, id, this.data.lang || 'ru');
      await this._grant({ productID: id, purchaseToken: 'vk-' + Date.now() + '-' + Math.random() });
      return true;
    } catch (e) {
      console.warn('[VKPlay] purchase failed:', e && e.message ? e.message : e);
      return false;
    } finally {
      this._resume('pay');
    }
  }

  async _grant(purchase) {
    const prod = CONFIG.shop.products.find((p) => p.id === purchase.productID);
    if (!prod) return;
    const d = this.data;
    if (prod.type === 'coins') {
      if (!d.tokens.includes(purchase.purchaseToken)) {
        d.coins += prod.coins;
        d.tokens.push(purchase.purchaseToken);
        if (d.tokens.length > CONFIG.shop.maxStoredTokens) d.tokens.shift();
        this.persist(true);
        if (this.onGrant) this.onGrant(prod);
      }
    }
  }

  async restorePurchases() { /* VK Play начисляет только после paymentReceivedCallback */ }

  adsAllowed() { return false; }
  canShowInterstitial() { return false; }
  canShowRewarded() { return false; }
  showInterstitial() { return Promise.resolve(false); }
  showRewarded() { return Promise.resolve(false); }
}

export const YandexSDK = new YandexSDKManager();
export { mergeSaves, normalize };
