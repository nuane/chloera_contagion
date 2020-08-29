var textUI = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function textUI (scene, x, y)
  {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.scene = scene;
    this.depth = 11;

    this.text = scene.add.text(10, 10, '', { fontFamily: 'Arial', fontSize: 24, color: '#000000' });
    this.add(this.text);

    scene.add.existing(this);
  },
  setText(text){
    this.text.setText(text);
  },
  bringUpDialgoueScreen()
  {
    this.background.setVisible(true);
  },
  showDeathCounters(cityBlock){
    cityBlock.forEach(c => {
      c.deathCounters.setAlpha(1)
    });
  },

});
export default textUI;
