class Start extends Phaser.Scene {
  constructor() {
  super({
      key: 'start',

    });
  }
  preload() {
    this.load.image('title', 'assets/splash_screen.png');
    this.load.image('js', 'assets/john-snow-portrait.png');
    this.load.image('cholera', 'assets/cholera2.png');

    this.load.audio('greensleeve', 'assets/g.wav');
  }
  create(score){
    this.scale.resize(320, 200);

    let text0 = `The most terrible outbreak of cholera which ever occurred in this kingdom, is probably that which took place in Broad Street, Golden Square, and the adjoining streets, a few weeks ago. Within two hundred and fifty yards of the spot where Cambridge Street joins Broad Street, there were upwards of five hundred fatal attacks of cholera in ten days. The mortality in this limited area probably equals any that was ever caused in this country, even by the plague; and it was much more sudden, as the greater number of cases terminated in a few hours. The mortality would undoubtedly have been much greater had it not been for the flight of the population. Persons in furnished lodgings left first, then other lodgers went away, leaving their furniture to be sent for when they could meet with a place to put it in. Many houses were closed altogether, owing to the death of the proprietors; and, in a great number of instances, the tradesmen who remained had sent away their families: so that in less than six days from the commencement of the outbreak, the most afflicted streets were deserted by more than three-quarters of their inhabitants.`

    let text1 = `There were a few cases of cholera in the neighborhood of Broad Street, Golden Square, in the latter part of August; and the so-called outbreak, which commenced in the night between the 31st August and the 1st September, was, as in all similar instances, only a violent increase of the malady.  As soon as I became acquainted with the situation and extent of this irruption of cholera, I suspected some contamination of the water of the much-frequented street-pump in Broad Street, near the end of Cambridge Street; but on examining the water, on the evening of the 3rd September, I found so little impurity in it of an organic nature, that I hesitated to come to a conclusion. Further inquiry, however, showed me that there was no other circumstance or agent common to the circumscribed locality in which this sudden increase of cholera occurred, and not extending beyond it, except the water of the above mentioned pump.  I found, moreover, that the water varied, during the next two days, in the amount of organic impurity, visible to the naked eye, on close inspection, in the form of small white, flocculent particles; and I concluded that...`

    let menuFont0 = { fontFamily: 'Cursive', fontSize: 14, color: '#ffffff', backgroundColor: '#000000' };
    let menuFont1 = { fontFamily: 'Fantasy', fontSize: 14, color: '#ffffff', backgroundColor: '#000000' };

    this.add.image(0, 0, 'cholera').setOrigin(0);
    this.scrollingText0 = this.add.text(10, 20, text0, { fontFamily: 'Cursive', fontSize: 14, color: '#aaaaaa', wordWrap: { width: 310 } });
    this.scrollingText1 = this.add.text(10, this.scrollingText0.height, text1, { fontFamily: 'Cursive', fontSize: 14, color: '#aaaaaa', wordWrap: { width: 310 } });

    this.add.text(10, 10, 'CHOLERA\n   CONTAGION', { fontFamily: 'Cursive', fontSize: 18, color: '#ffffff', backgroundColor: '#000000', wordWrap: {width: 0}});
    this.add.text(230, 120, 'difficulty:', { fontFamily: 'URW Chancery L, Fantasy', fontSize: 14, color: '#ffffff', backgroundColor: '#000000', wordWrap: {width: 0}});

    this.config = {
      classicMode: true,
      mute: false,
      difficulty: 1,
      score: 0
    }

    this.muse = this.sound.add('greensleeve');
    this.muse.play(); 

    //new game
    let classicGame = this.createMenuButton(20, 100, `Classic Game`, true);
    let storyGame = this.createMenuButton(20, 130, `Story Game`, false);

    //settings
    let lvl = [];
    for (let i = 1; i <= 5; i++){
      let settingFont = {
        fontFamily: 'Cursive', fontSize: 14,
        backgroundColor: `#000000`, color: (this.config.difficulty == i) ? `#AA0000` : `#ffffff`
      };
      lvl[i] = this.add.text(215 + (i*15), 140, i, settingFont)
        .setInteractive()
        .setAlpha( (this.config.difficulty == i) ? 1 : 0.6 )
        .on('pointerover', (pointer) => lvl[i].setStyle({backgroundColor: (this.config.difficulty == i) ? `#AA0000` : `#ffffff`, color: '#000000'}))
        .on('pointerout', (pointer) => lvl[i].setStyle({backgroundColor: '#000000', color: (this.config.difficulty == i) ? `#AA0000` : `#ffffff`}))
        .on('pointerdown', (pointer) => {
          this.config.difficulty = i;

          //change display
          lvl.forEach(l => l.setStyle({backgroundColor: `#000000`, color: '#ffffff'}).setAlpha(0.6));
          lvl[i].setStyle({backgroundColor: (this.config.difficulty == i) ? `#AA0000` : `#ffffff`}).setAlpha(1);
        });
    }
    let mute = this.add.text(260, 180, 'Mute', menuFont0)
      .setInteractive()
      .on('pointerover', (pointer) => mute.setStyle({backgroundColor: '#ffffff', color: '#000000'}))
      .on('pointerout', (pointer) => mute.setStyle({backgroundColor: '#000000', color: '#ffffff'}))
      .on('pointerdown', (pointer) => {
        if (this.config.mute) {
          this.muse.play();
          this.config.mute = false;
          mute.setAlpha(1);
        } else {
          this.muse.stop();
          this.config.mute = true;
          mute.setAlpha(0.6);
        }
      });

  }
  createMenuButton(x,y,text,classic){
    let mf = { fontFamily: 'Fantasy', fontSize: 14, color: '#ffffff', backgroundColor: '#000000' };
    let btn = this.add.text(x, y, text, mf)
        .setInteractive()
        .on('pointerover', (pointer) => btn.setStyle({backgroundColor: '#ffffff', color: '#000000'}))
        .on('pointerout', (pointer) => btn.setStyle({backgroundColor: '#000000', color: '#ffffff'}))
        .on('pointerdown', (pointer) => {
          this.config.classicMode = classic;
          this.config.score = (this.config.difficulty-1) * 1500;
          this.scene.start('game', this.config);
          this.muse.stop();
        });
  }
  update(){
    this.scrollTextObject(this.scrollingText0);
    this.scrollTextObject(this.scrollingText1);
  }
  scrollTextObject(to){
    to.y -= 0.07;
    if (to.y < -to.height) to.y = to.height;
  }
}
export default Start;
