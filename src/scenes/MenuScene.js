import { CONFIG, DESIGN, t, nextLang, langFlag } from '../config.js?v=20261122g';
import { YandexSDK } from '../yandexSDK.js?v=20261122g';
import { Sfx } from '../audio.js?v=20261122g';
import { fitCamera, addBackground, makeText, gradientText, makeButton, makeRoundButton, floatText, toast } from '../ui.js?v=20261122g';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    fitCamera(this);
    addBackground(this);
    this.cameras.main.fadeIn(350, 11, 15, 18);

    const { W } = DESIGN;
    const d = YandexSDK.data;
    this.starting = false;

    YandexSDK.gameplayStop();
    Sfx.startMusic(this.game);

    // --- заголовок ---
    const t1 = makeText(this, W / 2, 140, t('title1'), 50, '#ffffff', { sw: 8 });
    const t2 = makeText(this, W / 2, 225, t('title2'), 104, '#ffffff', { sw: 12 });
    gradientText(t2, '#fff6a8', '#ff8a2b');
    this.tweens.add({ targets: t2, scale: 1.05, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: t1, y: 146, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // --- солнце и планеты на орбитах ---
    this.cx = W / 2; this.cy = 470;
    this.add.image(this.cx, this.cy, 'spark').setTint(0xffc83a).setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(640, 640).setAlpha(0.55).setDepth(0);
    this.sun = this.add.image(this.cx, this.cy, 'p10').setDisplaySize(210, 210).setDepth(3);
    this.tweens.add({ targets: this.sun, angle: 360, duration: 40000, repeat: -1 });
    this.tweens.add({ targets: this.sun, scale: this.sun.scale * 1.04, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.orbiters = [
      { img: this.add.image(0, 0, 'p5').setDisplaySize(74, 74), rx: 215, ry: 70, speed: 1.0, ph: 0 },
      { img: this.add.image(0, 0, 'p7').setDisplaySize(96, 96), rx: 255, ry: 95, speed: 0.6, ph: 2.1 },
      { img: this.add.image(0, 0, 'p2').setDisplaySize(44, 44), rx: 160, ry: 52, speed: 1.6, ph: 4.0 },
      { img: this.add.image(0, 0, 'p4').setDisplaySize(56, 56), rx: 195, ry: 80, speed: 0.8, ph: 5.2 }
    ];

    // --- статистика ---
    makeText(this, W / 2, 640, `${t('level')} ${d.level}   •   ${t('best')}: ${d.best}`, 26, '#cfe0ff');

    // --- кнопки ---
    this.playBtn = makeButton(this, W / 2, 728, t('play'), 'green', () => this.startGame(), { w: 400, h: 104, size: 48, pulse: true });
    this.freeBtn = makeButton(this, W / 2, 840, t('freeCoins', { n: CONFIG.balance.freeCoinsReward }), 'gold',
      () => this.claimFreeCoins(), { w: 400, h: 78, size: 30, icon: 'coin' });

    this.shopBtn = makeButton(this, W / 2, 932, t('shop'), 'blue', () => this.openShop(), { w: 280, h: 66, size: 26, icon: 'coin' });

    this.langBtn = makeButton(this, 70, 938, langFlag(), 'dark', () => this.cycleLang(), { w: 88, h: 56, size: 22 });
    this.soundBtn = makeRoundButton(this, W - 55, 938, d.sound ? 'ic_snd_on' : 'ic_snd_off', () => {
      YandexSDK.setSound(!YandexSDK.data.sound);
      this.soundBtn.setIcon(YandexSDK.data.sound ? 'ic_snd_on' : 'ic_snd_off');
    });
    YandexSDK.onDataReload = () => {
      if (!this.scene.isActive()) return;
      this.coinText.setText(String(YandexSDK.data.coins));
    };
    this.syncFreeBtn();

    // --- монеты ---
    this.add.image(40, 46, 'coin').setDisplaySize(40, 40);
    this.coinText = makeText(this, 68, 46, String(d.coins), 30, '#ffe27a', { ox: 0 });

    // Игра полностью загружена и готова — сообщаем платформе
    YandexSDK.gameReady();
  }

  update(time) {
    for (const o of this.orbiters) {
      const a = time * 0.0004 * o.speed + o.ph;
      const s = Math.sin(a);
      o.img.setPosition(this.cx + Math.cos(a) * o.rx, this.cy + s * o.ry);
      o.img.setDepth(s > 0 ? 5 : 1);
      o.img.setAlpha(s > 0 ? 1 : 0.85);
      o.img.rotation = a * 2;
    }
    this.syncFreeBtn();
  }

  syncFreeBtn() {
    const left = Math.ceil((YandexSDK.data.giftAt - Date.now()) / 1000);
    if (left > 0) this.freeBtn.setLabel(t('wait', { n: left })).setEnabled(false);
    else this.freeBtn.setLabel(t('freeCoins', { n: CONFIG.balance.freeCoinsReward })).setEnabled(true);
  }

  cycleLang() {
    YandexSDK.setUserLang(nextLang());
    this.scene.restart();
  }

  openShop() {
    if (YandexSDK.busy || this.starting) return;
    this.scene.launch('ShopScene', { parent: 'MenuScene' });
    this.scene.pause();
  }

  onShopClosed() {
    this.coinText.setText(String(YandexSDK.data.coins));
  }

  startGame() {
    if (this.starting || YandexSDK.busy) return;
    this.starting = true;
    this.cameras.main.fadeOut(250, 11, 15, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PlayScene', { level: YandexSDK.data.level }));
  }

  claimFreeCoins() {
    if (YandexSDK.busy) return;
    if (Date.now() < YandexSDK.data.giftAt) return;
    const reward = CONFIG.balance.freeCoinsReward;
    YandexSDK.data.coins += reward;
    YandexSDK.data.giftAt = Date.now() + CONFIG.balance.freeCoinsCooldownMs;
    YandexSDK.persist(true);
    this.coinText.setText(String(YandexSDK.data.coins));
    floatText(this, 200, 855, '+' + reward, '#ffe27a', 48);
    Sfx.play(this, 'coin');
    this.syncFreeBtn();
  }
}
