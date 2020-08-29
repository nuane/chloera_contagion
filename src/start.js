class Start extends Phaser.Scene {
  constructor() {
  super({
      key: 'start',

    });
  }
  preload() {
    this.load.image('title', 'assets/splash_screen.png');
    this.load.image('john_snow', 'assets/john_snow1.png');
  }
  create(score){
    this.add.image(this.game.config.width/2 ,this.game.config.height/2 , 'john_snow');

    this.input.on('pointerdown', (pointer) => this.scene.start('house'));
    this.scene.start('house');
  }
}
export default Start;
