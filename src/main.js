import { createGameConfig } from './config.js?v=20261122h';
import { BootScene } from './scenes/BootScene.js?v=20261122h';
import { MenuScene } from './scenes/MenuScene.js?v=20261122h';
import { PlayScene } from './scenes/PlayScene.js?v=20261122h';
import { ShopScene } from './scenes/ShopScene.js?v=20261122h';

const game = new Phaser.Game(createGameConfig([BootScene, MenuScene, PlayScene, ShopScene]));
if (location.search.includes('debug')) window.__game = game;
