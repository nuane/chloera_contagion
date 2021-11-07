class End extends Phaser.Scene {
  constructor() {
  super({
      key: 'end',

    });
  }
  preload() {
    this.load.image('title', 'assets/splash_screen.png');
    this.load.image('js', 'assets/john-snow-portrait.png');
  }
  create(_config){
    let textConfig = { fontFamily: 'Cursive', fontSize: 30, backgroundColor: '#000000', color: '#ffffff', wordWrap: {width: 300} };
    let mf = { fontFamily: 'Fantasy', fontSize: 14, color: '#ffffff', backgroundColor: '#000000' };
    let config = _config;

    let endText = this.add.text(10, 10, '', textConfig).setOrigin(0);
    if (config.gameOver) {
      endText.setText(`After a careful peer review, nobody believes you!\n FINAL SCORE: ${config.score}`);
      let opt1 = this.add.text(180, 180, `Go back to main menu.`, mf)
          .setInteractive()
          .on('pointerover', (pointer) => opt1.setStyle({backgroundColor: '#ffffff', color: '#000000'}))
          .on('pointerout', (pointer) => opt1.setStyle({backgroundColor: '#000000', color: '#ffffff'}))
          .on('pointerdown', (pointer) => {
            this.scene.start('start');
          });
    } else {
      endText.setText(`Although nobody believes you, the epidemic has subsisted... score: ${config.score}`);
      config.difficulty++;
      let opt2 = this.add.text(180, 180, `Next difficulty level.`, mf)
          .setInteractive()
          .on('pointerover', (pointer) => opt2.setStyle({backgroundColor: '#ffffff', color: '#000000'}))
          .on('pointerout', (pointer) => opt2.setStyle({backgroundColor: '#000000', color: '#ffffff'}))
          .on('pointerdown', (pointer) => {
            this.scene.start('game', config);
          });
    }

    // this.input.on('pointerdown', (pointer) => this.scene.start('start'))

  }
}
export default End;
