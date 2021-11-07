import T from './gameText';

var DialogueEvent = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function DialogueEvent (scene, x, y, type, id, block)
  {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    scene.add.existing(this);

    //redudadant but useful properties
    this.scene = scene;
    this.player = scene.player;
    this.city = scene.city;

    this.depth = 3;

    this.background = scene.add.image(0, 0, 'dialogue-background').setOrigin(0);
    // this.add(this.background);

    this.textFontConfig = { fontFamily: 'Cursive',
                            fontSize: 12,
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            wordWrap: { width: 150 }
                          };

    this.facePosition = {   x: 169,y: 45}
    this.textPosition = {   x: 10, y: 20};
    this.option1Position = {x: 10, y: 145};
    this.option2Position = {x: 10, y: 160};
    this.option3Position = {x: 10, y: 175};

    //transition tween expresses where dialogue box aligns to on screen
    this.transitionTween1 = scene.tweens.add({
      targets: this,
      x: '0',
      y: '0',
      duration: 30,
      ease: 'Power3',
    });

    this.initBox();
    switch (type) {
      case `residential`:
      case `residentialB`:
        this.add(this.residentialEvent(id, block));
        break;
      case `industrial`:
      case `industrialB`:
        this.add(this.residentialEvent(id, block));
        break;
      case `waterpump`:
        this.add(this.waterpumpEvent(id, block));
        break;
      case `start`:
        this.add(this.startEvent(id, block));
        break;
      case `classic`:
        this.add(this.classicStartEvent(id, block));
        break;
      case `bonus`:
        this.add(this.specialEvent(id, block));
        break;
      default:
    }
  },
  initBox(){
    this.scene.disableMapInput = true; //global flag
    this.setVisible(true);
    this.add(this.background);
  },
  exitBox(pointer) {
    if (!this.scene.enableInput) return;
    this.scene.action = `exploring`;
    this.scene.disableMapInput = false; //global flag
    this.destroy();
  },
  transition(){
    this.transitionTween1.play();
  },


  specialEvent(cell, cityBlocks){
    let _txt = `You have arrived at ${cell.identifier}`;
    let text = this.scene.add.text(this.textPosition.x, this.textPosition.y, _txt, this.textFontConfig);

    let portrait = this.scene.add.image(this.facePosition.x, this.facePosition.y, cell.identifier).setOrigin(0);
    let special = this.scene.add.text(this.option2Position.x, this.option2Position.y, `Inquire`, this.textFontConfig)
      .setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', (pointer) => {
        let txt = this.specialEventHandler(cell.identifier);
        text.setText(`${txt}`);
      }, this);

    let exit = this.scene.add.text(this.option3Position.x, this.option3Position.y, 'Leave to map', this.textFontConfig)
      .setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', this.exitBox, this);

    return [text, portrait, exit, special];
  },

  textSelected(pointer){
    this.setStyle({backgroundColor: '#ffffff', color: '#000000'});
  },
  textDeselected(pointer){
    this.setStyle({backgroundColor: '#000000', color: '#ffffff'});
  },

  startEvent(){
    // let portrait = this.scene.add.image(169, 45, 'whitehead_henry').setOrigin(0);
    let face = this.scene.add.image(this.facePosition.x, this.facePosition.y, 'johnsnow').setOrigin(0);
    let openingText = `The most terrible outbreak of cholera which ever occurred in this kingdom, is probably that which took place these last few days. Whereupon further reflections, I took it upon myself to discover the source of the cholera`;
    let text = this.scene.add.text(this.textPosition.x, this.textPosition.y, openingText, this.textFontConfig);

    // let text = this.scene.add.bitmapText(this.textPosition.x, this.textPosition.y, 'atari', openingText, 10).setOrigin(0).setMaxWidth(150);

    let exit = this.scene.add.text(this.option3Position.x, this.option3Position.y, 'Leave to map', this.textFontConfig).setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', this.exitBox, this);

    // this.add([text, portrait, audit, exit]);
    return [text, face, exit];
  },
  classicStartEvent(){
    // let portrait = this.scene.add.image(169, 45, 'whitehead_henry').setOrigin(0);
    let face = this.scene.add.image(this.facePosition.x, this.facePosition.y).setOrigin(0);
    let openingText = `A Cholera outbreak has occured and the outbreak is linked to a faulty waterpump. Find the water pump by recording each casuality on every block. Click once for all missing, click twice for Cholera deaths---`;
    let text = this.scene.add.text(this.textPosition.x, this.textPosition.y, openingText, this.textFontConfig);

    // let text = this.scene.add.bitmapText(this.textPosition.x, this.textPosition.y, 'atari', openingText, 10).setOrigin(0).setMaxWidth(150);

    let exit = this.scene.add.text(this.option3Position.x, this.option3Position.y, 'Leave to map', this.textFontConfig).setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', this.exitBox, this);

    // this.add([text, portrait, audit, exit]);
    return [text, face, exit];
  },
  waterpumpEvent(pumpSprite, pumpSelected){

    const mainname = [`Little Pulteney`, `Great Windmill`, `Queen`, `Sherrard`, `Brewer`, `Tyler`, `Marshall`, `Tyler Court`, `Bridle`];
    let pumpName = mainname[pumpSprite._id%mainname.length];
    let pumpDetail = (pumpSelected) ? `has been flagged` : ``;

    let face = this.scene.add.image(this.facePosition.x, this.facePosition.y, 'water-pump-event').setOrigin(0);
    let text = this.scene.add.text(this.textPosition.x, this.textPosition.y, `${pumpName} street pump ${pumpDetail}`, this.textFontConfig);

    let audit = this.scene.add.text(this.option2Position.x, this.option2Position.y, 'Flag as Contagion', this.textFontConfig)
      .setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', (pointer) => {
        if (pumpSprite.isSelected) {
          pumpSprite.setTexture('water-pump');
          pumpSprite.isSelected = false;
          text.setText('pump flag has been removed');
        } else {
          pumpSprite.setTexture('water-pump-selected');
          pumpSprite.isSelected = true;
          text.setText('pump is flagged');
        }
      }, this);

    let exit = this.scene.add.text(this.option3Position.x, this.option3Position.y, 'Leave to map', this.textFontConfig)
      .setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', this.exitBox, this);

    return [text, face, audit, exit];

  },
  residentialEvent(cell, block){
    const cityBlock = block[cell.id];

    //use proportion of cells per block and deaths per block to generate different text
    const deathsOnBlock = block[cell.id].map(cell => cell.deathCounters).filter(elem => elem.length > 0).flat();
    const reputationThreshold = (deathsOnBlock.length * 1.5 > cityBlock.length) ? cell.id%13 + 1 : cell.id%27 + 1;
    //draw portrait in left side
    let rndFace = `pic` + (cell.id%7);
    let face = this.scene.add.image(this.facePosition.x, this.facePosition.y, rndFace).setOrigin(0);
    //game text displayed in upper left corner
    let textDialogue = this.getProcBlockText(cell, block[cell.id], deathsOnBlock);
    let text = this.scene.add.text(this.textPosition.x, this.textPosition.y, textDialogue, this.textFontConfig);
    let take = this.scene.add.text(this.option1Position.x, this.option1Position.y, 'Take an audit of block', this.textFontConfig)
      .setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', (pointer) => {
        if (this.scene.enableAction){
          if (this.player.reputation > reputationThreshold){
            //subtract reputation from player
            this.player.reputation = -reputationThreshold;
            this.scene.action = `auditing..`

            //check for everything then deduct according to
            let checkingFor = [`cholera`, `flu`, `other`];
            if (block[cell.id][0].checked1) checkingFor.pop();
            if (block[cell.id][0].checked2) checkingFor.pop();

            let countedDeaths = this.city.countBlackDotsOnBlock(block[cell.id], checkingFor);
            let t1 = (checkingFor.length > 2) ?
              `By discussing with the current land-lord, ` :
              `After conducting thorough interviews with all the residents families, `;
            let t2 = (checkingFor.length == 3) ?
              `are missing.` :
              (checkingFor.length === 2) ?
              `have recently passed from a lethal illness` :
              `have most definetely perished due to Cholera!` ;
            let txt = `${t1} you have discovered that ${countedDeaths} ${t2}.`;
            if (countedDeaths == 0) txt = `After careful examination, you've concluded that none are afflicted---`;

            text.setText(txt);
            this.scene.time.addEvent({
              delay: 140,
              callback: () => this.scene.fastForward(Math.floor(countedDeaths/15) + 1),
              callbackScope: this
            });
          } else {
            text.setText(`The people have no respect for you`);
          }
        }
      }, this);
    //choices given in bottom right
    let care = this.scene.add.text(this.option2Position.x, this.option2Position.y, 'Care for these people', this.textFontConfig).setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', (pointer) => this.careForPeople(block, cell, deathsOnBlock, text), this);

    let exit = this.scene.add.text(this.option3Position.x, this.option3Position.y, 'Leave to map', this.textFontConfig).setInteractive()
      .on('pointerover', this.textSelected)
      .on('pointerout', this.textDeselected)
      .on('pointerdown', this.exitBox, this);

    return [face, text, take, care, exit]
  },
  //function used to procedurally generate dialogue
  careForPeople(_block, cell, deathsOnBlock, text){
    if (this.scene.enableAction){
      let block = _block[cell.id];
      //16 primes
      let primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
      let min = 0;
      let max = primes.length-1;

      //algorithm min/maxes get care and reputation optimizations
      if (block.some(c => c.choleraInfection)) min += 2;

      //looks at ratio of deaths on block and size of block
      (deathsOnBlock.length * 1.5 > block.length) ? max -= 4 : min += 4;
      (deathsOnBlock.length > block.length) ? max -= 2 : min += 2;

      let ds = T.getCare.descriptor;
      let bs = T.getCare.badSymptons;
      let fs = T.getCare.falseSymptons;
      let ns = T.getCare.noSymptons;

      let careForText = ds[Phaser.Math.Between(0, ds.length-1)];
      let symptoms = '';
      let conditional = false;

      //go through  block to check for cholera infections
      if (block.some(c => c.choleraInfection)) {
              //create a mapped array of all the boolean choleraInfections for bonus cred
              // uncomment to enable bonuses at cholera infecter area
              // let choleraArray = block.map(c => c.choleraInfection);
              // conditional = choleraArray[Phaser.Math.Between(0, choleraArray.length)];
              // if (conditional) this.bonusEvent(6, T.choleraQuizes, this.bStamina);
        symptoms = bs[Phaser.Math.Between(0, bs.length-1)];
      } else if (block.some(c => c.falseInfection || c.influenzaMeter > 0)){
        let falseArray = block.map(c => c.falseInfection || c.influenzaMeter > 0);
        conditional = falseArray[Phaser.Math.Between(0, falseArray.length)];
        symptoms = fs[Phaser.Math.Between(0, fs.length-1)];
        if (conditional) {
          this.player.reputation = 42; //the greatest meaningful amount of reputation ;)
          symptoms = `The people feel that your reputation is well deserved.`;
          this.bonusEvent(4, T.choleraQuizes, this.bStamina);
        }

      } else {
        max -= 3;
        min = max-3; //no infection rare, so helping people greatly increases reputation
        if (Math.random > 0.6) this.bonusEvent(1, T.choleraQuizes, this.bCred);
        symptoms = ns[Phaser.Math.Between(0, ns.length-1)]
      }

      this.player.reputation = primes[Phaser.Math.Between(min, max)];
      this.scene.action = `caring for..`

      careForText += symptoms;
      text.setText(careForText);
      this.scene.time.addEvent({
        delay: 140,
        callback: () => this.scene.fastForward(Phaser.Math.Between(1,3)),
        callbackScope: this
      });
    }
  },


  getProcBlockText(cell, block, deaths){
    let deathRatio = deaths.length / block.length;
    let deathThresholds = (deathRatio > 1.5) ? 0 : (deathRatio > 1) ? 1 : (deathRatio > 0.5) ? 2 : 3;
    let reputThresholds = Math.floor(this.player.reputation / 20);

    let rndText = (cell.type === `residential`) ? T.allText[reputThresholds] : T.indText[deathThresholds];
    let envText = T.hintText[deathThresholds];

    return rndText + envText;
  },

  closeBonusEvent(container){
    this.scene.time.addEvent({
      delay: 1717,
      callback: () => container.setVisible(false)
    });
  },

  //BOILERPLATE CODE TO SET DYNAMIC ANSWERS (if needed)
  // for (let i = 1; i < quiz.length; i++) {
  //   this.bonus.add(this.scene.add.text(10, 40, quiz[1], { fontFamily: 'Cursive', fontSize: 12, color: '#000000' }).setInteractive()
  //     .on('pointerover', this.textDeselected)
  //     .on('pointerout', this.textSelected)
  //     .on('pointerdown', (pointer) => {
  //       this.bonus.setVisible(false);
  //       this.bonus.asdf('option 1');
  //     }, this)
  //   );
  // }
  bonusEvent(amount, quizes, callback){
    const rng = Phaser.Math.Between(0, quizes.length-1);
    const quiz = quizes[rng];

    let correct = quiz[4];
    let display = this.scene.add.image(0, 0, 'text-quiz').setOrigin(0);
    let questionFont = {
      fontFamily: 'Cursive', fontSize: 18, color: '#000000',
      wordWrap: { width: display.width-10 }
    };
    let answerFont = { fontFamily: 'Cursive', fontSize: 14, color: '#000000' };
    let responseAnswer = '';

    let question = this.scene.add.text(10, 10, quiz[0], questionFont).setOrigin(0);
    this.bonus = this.scene.add.container(5, 5);
    this.bonus.add([display, question]);
    this.bonus.add(this.scene.add.text(10, question.height+20, quiz[1], answerFont)
      .setInteractive()
      .on('pointerover', this.textDeselected)
      .on('pointerout', this.textSelected)
      .on('pointerdown', (pointer) => {
        this.closeBonusEvent(this.bonus);
        if (quiz[4] == 1) {
          let responseAnswer = callback(this, amount);
          question.setText(`Correct! ${responseAnswer}`);
        } else {
          let responseAnswer = callback(this, -amount);
          question.setText(`Wrong! ${responseAnswer}`);
        }
      }, this)
    );
    this.bonus.add(this.scene.add.text(10, question.height+40, quiz[2], answerFont)
      .setInteractive()
      .on('pointerover', this.textDeselected)
      .on('pointerout', this.textSelected)
      .on('pointerdown', (pointer) => {
        this.closeBonusEvent(this.bonus);
        if (quiz[4] == 2) {
          let responseAnswer = callback(this, amount);
          question.setText(`Correct! ${responseAnswer}`);
        } else {
          let responseAnswer = callback(this, -amount);
          question.setText(`Wrong! ${responseAnswer}`);
        }
      }, this)
    );
    this.bonus.add(this.scene.add.text(10, question.height+60, quiz[3], answerFont)
      .setInteractive()
      .on('pointerover', this.textDeselected)
      .on('pointerout', this.textSelected)
      .on('pointerdown', (pointer) => {
        this.closeBonusEvent(this.bonus);
        if (quiz[4] == 3) {
          let responseAnswer = callback(this, amount);
          question.setText(`Correct! ${responseAnswer}`);
        } else {
          let responseAnswer = callback(this, -amount);
          question.setText(`Wrong! ${responseAnswer}`);
        }
      }, this)
    );
    this.bonus.setDepth(5);
  },

  specialEventHandler(bonus){
    switch (bonus) {
      case 'HENRY WHITEHEAD ESTATE':
        if (this.player.credibility < 1)
          return `I'm sorry. I need more credibility on you behalf to help you.`

        this.player.credibility = -1;
        this.fastForward(1);
        //arranged in order like a deck of cards
        let bonusDeck = [
          this.bRep, this.bRep, this.bRep,
          this.bPlot, this.bPlot, this.bPlot, this.bPlot,
          this.bInsight, this.bCred
        ];
        let rnd = Phaser.Math.Between(0, bonusDeck.length-1);
        let a = rnd%this.player.credibility + 1;
        //higher credibility => more powerful bonus
        this.bonusEvent(a, T.medicalQuizes, bonusDeck[rnd]);
        return `Thank you good sir. And what more can I do for you today?`;

      case 'CITY GUARD':
        //need to have cred above diff to end game
        if (this.player.credibility >= this.scene.endConfig.difficulty) {
          this.scene.endGame(false);
        }
        return `The city and it's guard have done all the can and more. Gain some credibility before you decide to come back here!`;

      case 'HOSPITAL':
        if (this.player.reputation == 100) {
          this.player.reputation = -83;
          this.bRemove(this);
          this.bonusEvent(5, T.medicalQuizes, this.bCred);
        //Range: [51 - 99]
        } else if (this.player.reputation > 50) {
          this.player.reputation = -50;
          this.bonusEvent(3, T.medicalQuizes, this.bCred);
        //Range: [21 - 50]
      } else if (this.player.reputation > 20) {
        this.bonusEvent(this.player.reputation, T.medicalQuizes, this.bStamina);
        this.player.reputation = -17;
      } else {
        return `The HOSPITAL has no more time for you having been completely overrun from the plauge!`;
      }
      //default HOSPITAL text
      return `What else can we do for someone of your reputation!`;
    }

  },

  //callback functions for bonus quizes
  bRep(self, amount) {
    let ra = amount * 17;
    self.player.reputation = ra;
    return `Reputation incremented by ${ra}.`;
  },
  bCred(self, amount) {
    self.player.credibility = amount;
    return `Credibility incremented by ${amount}.`;
  },
  bInsight(self, amount) {
    self.scene.insight += amount * 7;
    return `You have attained an amount of insight.`;
  },
  bStamina(self, amount) {
    self.scene.stamina += amount;
    return `You feel rejuvenated.`;
  },
  bPlot(self, amount) {
    if (amount < 0) return
    let ans = 0;

    self.city.allCityCells.forEach(cell => cell.deathCounters.forEach(counter => {
      let rnd = Math.random() > 0.9 - (amount*0.08);
      if (rnd) {
        let dot = self.scene.add.image(counter[0], counter[1], 'black_dot').setOrigin(0);
        dot.causeOfDeath = counter[2];
        cell.deathCounterSprites.add(dot);
        ans++;
      }
    }));
    return `You've plotted a rough list of those missing.`;
  },
  bRemove(self) {
    self.city.removeFalseBlackDots('cholera');
    return `bRemove`;
  },

});
export default DialogueEvent;
