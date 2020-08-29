import Phaser from "phaser";

import house from './house';
import start from './start';
import end from './end';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "phaser-example",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 200,
  },
  scene:
  [
    start,
    house,
    end,
  ],
};

const game = new Phaser.Game(config);
