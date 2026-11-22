import { createGameConfig } from './config.js?v=20261122';
import { BootScene } from './scenes/BootScene.js?v=20261122';
import { MenuScene } from './scenes/MenuScene.js?v=20261122';
import { PlayScene } from './scenes/PlayScene.js?v=20261122';
import { ShopScene } from './scenes/ShopScene.js?v=20261122';

const game = new Phaser.Game(createGameConfig([BootScene, MenuScene, PlayScene, ShopScene]));
if (location.search.includes('debug')) window.__game = game;
