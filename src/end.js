class End extends Phaser.Scene {
  constructor() {
  super({
      key: 'end',

    });
  }
  preload() {
    this.load.image('title', 'assets/splash_screen.png');
  }
  create(score){
    this.add.text(10, this.game.config.height/2, score);
    this.input.on('pointerdown', (pointer) => this.scene.start('start'))
  }
}
export default End;
