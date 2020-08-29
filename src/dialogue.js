var Dialogue = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function Dialogue (scene, x, y)
  {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.scene = scene;
    this.background = scene.add.image(0, 0, 'overlay').setOrigin(0).setVisible(true);
    this.add(this.background);
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
export default Dialogue;
