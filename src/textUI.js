var textUI = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function textUI (scene, x, y)
  {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.scene = scene;
    this.depth = 11;

    this.background = scene.add.image(0, 0, 'text-background').setOrigin(0);
    //classicMode has smaller textBox
    if (this.scene.isInClassicMode) {
      this.background.setPosition(0,5);
      this.background.setScale(0.5);
    }
    this.text = scene.add.text(10, 10, '', { fontFamily: 'Courier', fontSize: 8, color: '#ffffff' });
    this.add([this.background, this.text]);

    this.selectedBlock = {number: '', identifier: ''};

    scene.add.existing(this);
  },

  setText(counter){
    let daysOfWeek = [`Sun.`, `Mon.`, `Tues.`, `Wed.`, `Thur.`, `Fri.`, `Sat.`];
    let hourOfDay = counter%12;
    let ampm = (Math.floor(counter%24 / 12)) ? `pm` : `am`;
    let weekDay = daysOfWeek[Math.floor(counter/24) % 7];
    let blockProceduralName = `${this.selectedBlock.number} ${this.selectedBlock.identifier}`;

    let re = this.scene.player.reputation;
    let cr = this.scene.player.credibility;

    let text = `${weekDay} ${hourOfDay+1} ${ampm}    ${this.scene.action}\n${blockProceduralName}\n  cred: ${cr}, rep: ${re}`;
    //classic mode has differenct text displayed
    if (this.scene.isInClassicMode) text = `Time Left:\n${this.scene.maxTime - counter}`;
    this.text.setText(text);
  },


});
export default textUI;
