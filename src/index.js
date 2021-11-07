import Phaser from "phaser";

import Game from './game';
import Start from './start';
import End from './end';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "phaser-example",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 600,
    height: 450,
  },
  scene:
  [
    Start,
    Game,
    End,
  ],
};

const game = new Phaser.Game(config);
