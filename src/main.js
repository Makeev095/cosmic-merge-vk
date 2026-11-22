import { createGameConfig } from './config.js?v=20261122e';
import { BootScene } from './scenes/BootScene.js?v=20261122e';
import { MenuScene } from './scenes/MenuScene.js?v=20261122e';
import { PlayScene } from './scenes/PlayScene.js?v=20261122e';
import { ShopScene } from './scenes/ShopScene.js?v=20261122e';

const game = new Phaser.Game(createGameConfig([BootScene, MenuScene, PlayScene, ShopScene]));
if (location.search.includes('debug')) window.__game = game;
