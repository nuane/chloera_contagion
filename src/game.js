import DialogueEvent from './dialogueEvent';
import TextUI from './textUI';

import GenerateCity from './generateCity';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
  }
  preload() {
    this.load.audio('cycle', 'assets/sound-ominous.wav');
    this.load.audio('click', 'assets/sound-click.wav');

    this.load.audio('bloop0', 'assets/sound-bloop000.wav');
    this.load.audio('bloop1', 'assets/sound-bloop001.wav');
    this.load.audio('bloop2', 'assets/sound-bloop002.wav');
    this.load.audio('bloop3', 'assets/sound-bloop003.wav');
    this.load.audio('bloop4', 'assets/sound-bloop004.wav');

    this.load.image('white_dot', 'assets/dot-white.png');
    this.load.image('black_dot', 'assets/dot-black.png');

    this.load.image('road1', 'assets/tile-road1.png');
    this.load.image('road2', 'assets/tile-road2.png');
    this.load.image('road-select', 'assets/tile-road3.png');

    this.load.image('residential', 'assets/tile-residential.png');
    this.load.image('industrial', 'assets/tile-industrial.png');
    this.load.image('residentialB', 'assets/tile-residential2.png');
    this.load.image('industrialB', 'assets/tile-industrial2.png');
    this.load.image('bonus', 'assets/tile-bonus.png');

    this.load.image('select', 'assets/tile-selected.png');

    this.load.image('water-pump', 'assets/water-pump.png');
    this.load.image('water-pump-selected', 'assets/water-pump-selected.png');
    this.load.image('water-pump-bad', 'assets/water-pump-bad.png');
    this.load.image('water-pump-event', 'assets/water-pump-event.png');

    this.load.image('dialogue-background', 'assets/text-background2.png');

    this.load.image('text-background', 'assets/text-background4.png');
    this.load.image('text-quiz', 'assets/text-quiz.png');

    this.load.image('pic0', 'assets/residential00.png');
    this.load.image('pic1', 'assets/residential01a.png');
    this.load.image('pic2', 'assets/residential02.png');
    this.load.image('pic3', 'assets/residential03.png');
    this.load.image('pic4', 'assets/residential04.png');
    this.load.image('pic5', 'assets/residential05.png');
    this.load.image('pic6', 'assets/residential06.png');
    this.load.image('pic7', 'assets/residential00.png');

    this.load.image('empty', 'assets/residential-empty.png');

    this.load.image('HENRY WHITEHEAD ESTATE', 'assets/pic-whitehead-henry.png');
    this.load.image('HOSPITAL', 'assets/pic-hospital.png');
    this.load.image('CITY GUARD', 'assets/pic-hospital.png');

    this.load.image('johnsnow', 'assets/john-snow-portrait.png');
  }

  create(gameConfig){
    this.player = this.createPlayer();
    this.endConfig = gameConfig;

    this.isInClassicMode = gameConfig.classicMode;
    this.isMuted = gameConfig.mute;
    this.score = gameConfig.score;

    const rndynsA = Phaser.Math.Between(1, gameConfig.difficulty);
    const rndynsB = Phaser.Math.Between(gameConfig.difficulty, gameConfig.difficulty+2);

    this.pumpCount = 10 + (5*gameConfig.difficulty); //totoal number of pumps
    this.badPumpCount = Math.floor(rndynsB/2) + 1; //number of (bad) pumps

    this.classicCount = this.badPumpCount; //only for classic mode
    this.maxTime = 480 - (gameConfig.difficulty*20); //only for story mode
    // console.log(this.pumpCount, this.badPumpCount, 'diff: ', gameConfig.difficulty);

    //game variables //
    this.stamina = 68;
    this.insight = 4;
    this.action = `pondering--`;

    //create dialogue event handler
    this.dialogueUI = (this.isInClassicMode) ? new DialogueEvent(this, 0, 0, 'classic') : new DialogueEvent(this, 0, 0, 'start');
    //generate city and set infection based on voronoi diagram
    this.city = new GenerateCity(this, 320, 200, this.pumpCount, this.badPumpCount);

    //for diplaying time and city street
    this.textUI = new TextUI(this, 10, 15);
    this.textUI.depth = 4;
    this.disableMapInput = false;

    //game sounds
    this.cycleSound = this.sound.add('cycle');
    this.clickSound = this.sound.add('click');
    this.bloopLayer1 = this.sound.add('bloop0');
    this.bloopLayer2 = this.sound.add('bloop1');
    this.bloopLayer3 = this.sound.add('bloop3');
    this.bloopLayer4 = this.sound.add('bloop4');



    //timer delay handler for input events
    this.timerCounter = 0;
    this.timerDelay = 200;

    this.timerEvent = null;
    this.timerEventFlag = false;

    this.enableAction = true;
    this.enableInput = true;
    this.enableSound = true;
    this.enableMasterSound = false; //change to false to disable sound

    this.fastForward(60, 10, false);

    //init input handler
    this.input.keyboard.on('keydown', this.handleKey, this);
    //change cursor
    this.input.setDefaultCursor('url(assets/quill.cur), pointer');
  }

  update(time, delta){
    //check if game is over
    if (this.timerCounter >= this.maxTime) {
      this.enableInput = false;
      this.time.addEvent({ delay: 1000, callback: this.endGame, callbackScope: this, repeat: 1 });
    }
    //check timerevent progess
    if (this.timerEvent.getOverallProgress() === 1 && this.timerEventFlag) {
      //update game after time has passed
      this.timerEventFlag = false;

      this.dialogueUI.setVisible(true);
      this.dialogueUI.transition();
      //reenable input
      this.time.addEvent({ delay: 400, callback: () => {
        if (!this.isMuted) {
          this.bloopLayer3.play();
          this.clickSound.play();
        }
        // this.time.addEvent({delay: 140, callback: () => this.bloopLayer3.play(), callbackScope: this});
        this.enableInput = true;
        this.enableAction = true;
        this.action = `investigating.`;

        //player sleeping
        if (this.stamina < 0 && !this.isInClassicMode){
          this.action = `sleeping...`;
          this.dialogueUI.setVisible(false);
          this.stamina += 24;
          this.fastForward(8, 300);
          // for (var i = 1; i < 8; i++){
          //   this.fastForward(1, 100);
          // }
        }
      }, callbackScope: this });
    }

    //set text based on active pointer
    this.textUI.setText(this.timerCounter);
    if (this.dialogueUI.active) {
      this.textUI.setPosition(164, 0);
    } else {
      this.textUI.x = (this.input.activePointer.x > 160) ? 0 : 164;
      this.textUI.y = (this.input.activePointer.y > 100) ? 0 : 154;
    }
  }



  handleKey(e) {
    if (!this.enableInput) return;
    switch(e.code) {
      case 'KeyM':{
        this.scene.start('start');
        break;
      }
      case 'Space': {
        if (this.dialogueUI.active) {
          if (this.dialogueUI.bonus != undefined) return;
          this.dialogueUI.exitBox();
        }
        break;
      }
      case 'Enter': {
        //simulate random click
        let block = Object.keys(this.city.cityPlanner);
        let rndProp = block[Phaser.Math.Between(0,block.length)];
        let rndBlock = this.city.cityPlanner[rndProp];
        let rndCell = undefined;
        while (rndCell == undefined) {
          rndCell = rndBlock[Phaser.Math.Between(0,rndBlock.length)];
        }

        this.select('residential', rndCell, this.city.cityPlanner);
        break;
      }
      default: {}
    }
  }

  updateGameLogic(){
    this.timerCounter++;
    this.stamina--;
    if (this.enableMasterSound && this.enableSound && !this.isMuted) this.bloopLayer1.play();
    this.city.cycleCities();
    this.insightAction();
  }
  insightAction(){
    if (this.insight) {
      this.city.allCityCells.forEach(cell => {
        let rnd1 = Math.random() > 0.4;
        let rnd2 = Math.random() > 0.9 && rnd1;
        if (cell.choleraInfection && rnd2) {
          cell.sprite.setTint(0x0000AA)
        } else if (cell.influenzaMeter > 0 && rnd1) {
          cell.sprite.setTint(0x00FF00)
        } else if (cell.falseInfection) {
          cell.sprite.setTint(0x00FF00)
        } else {
          cell.sprite.clearTint();
        }
        // if (cell.falseInfection) cell.sprite.setTint(0x00FF00);
      });
      this.insight--;
      if (this.insight == 0) this.city.allCityCells.forEach( cell => cell.sprite.clearTint() );
    }
  }

  //controller in game class for dialogue class
  //block parameter is used as good/bad pump logic
  select(type, cell, block){
    if (this.disableMapInput || !this.enableInput) return;
    if (this.enableMasterSound && !this.isMuted) this.bloopLayer2.play();
    this.fastForward(1, 400);
    this.time.addEvent({
      delay: 160,
      callback: (this.isInClassicMode) ? this.classicAction(type, cell, block) : this.dialogueAction(type, cell, block),
      callbackScope: this
    });
  }

  dialogueAction(type, cell, block){
    this.dialogueUI = new DialogueEvent(this, 0, 0, type, cell, block);
  }

  classicAction(type, cell, block){
    if (type !== `waterpump`){

      //check for everything then deduct according to DRY
      let checkingFor = [`cholera`, `flu`, `other`];
      if (block[cell.id][0].checked1) checkingFor.pop();
      if (block[cell.id][0].checked2) checkingFor.pop();

      let countDeaths = this.city.countBlackDotsOnBlock(block[cell.id], checkingFor);
      let timeForward = Math.floor(countDeaths/10) + 1;

      this.fastForward(timeForward, 10);
    } else {
      //logic for pump click
      //passing references for readibility
      let pump = cell;
      let isSelected = block;
      if (isSelected){
        pump.setTexture('water-pump');
        pump.isSelected = false;
        this.classicCount++;
      } else {
        pump.setTexture('water-pump-selected');
        pump.isSelected = true;
        this.classicCount--;
      }
      //end game
      if (this.classicCount == 0) this.endGame(false);
    }
  }
  fastForward(hours, timeDelay = 150, enableSound = true){
    this.enableSound = enableSound;
    this.enableInput = false;
    this.enableAction = false;

    this.timerEventFlag = true;
    this.timerEvent = this.time.addEvent({
      delay: timeDelay,
      callback: this.updateGameLogic,
      callbackScope: this,
      repeat: hours-1
    });

  }

  endGame(_gameOver){
    let gameOver = _gameOver;
    let bonus1 = (this.maxTime/2 - this.timerCounter)*15;
    let bonus2 = this.city.countAllDots('cholera');

    let nofp = 0;
    for (let pump of this.city.waterPumps) {
      if (pump.isSelected) {
        nofp++;
        this.score += (pump.isBad) ? 1000 : -1500;
        if (!pump.isBad) {
          gameOver = true;
          bonus1 = 0;
        }
      }
    }
    if (this.badPumpCount != nofp) {
      gameOver = true;
      bonus1 = 0;
      this.score -= 1500;
    }
    this.score += bonus1 + bonus2 + this.endConfig.difficulty;

    this.endConfig.score = this.score;
    this.endConfig.gameOver = gameOver;

    //disable map input, color bad pumps magenta, remove textUI display
    this.enableInput = false;
    this.disableMapInput = true;
    this.city.displayBadPumps();
    this.textUI.setVisible(false);
    this.dialogueUI.setVisible(false);

    this.time.addEvent({ delay: 3000, callback: this.endSwitch, callbackScope: this });
  }
  endSwitch(){
    this.scene.start('end', this.endConfig);
  }
  createPlayer(){
    return {
      _reputation: 0,
      _credibility: 0,
      _insight: 0,

      get reputation(){
        return this._reputation;
      },
      get credibility(){
        return this._credibility;
      },
      get insight(){

        return this._insight;
      },

      set credibility(amount){
        this._credibility += amount;
        if (this._credibility <= 0) this.reputation = 0;
      },
      set reputation(amount){
        this._reputation += amount;
        if (this._reputation > 100) {
          this._reputation = 100;
        } else if (this._reputation < 0) {
          this._reputation += 100;
          this._credibility--;
        }
      }
    }
  }
}
export default Game;
