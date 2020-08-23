import Phaser from "phaser";

import house from './house';

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 640,
  height: 400,
  scene:
  [
    house,
  ],
};

const game = new Phaser.Game(config);
