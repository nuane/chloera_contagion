export default class Hero {
  constructor(scene, x, y, sprites) {
    this.scene = scene;
    const anims = scene.anims;
    this.setupAllCharacterAnimations(anims, sprites);

    this.attachedWith = {};
    this.attachedOffsetX = 0;
    this.attachedOffsetY = 0;

    this.defaultStamina = 9000;
    this.weakStamina = 4000;
    this.stamina = this.defaultStamina;

    this.player = scene.physics.add.sprite(x, y, sprites);
    this.player.attach = (object) => {
      this.attachedWith = object;
      this.attachedOffsetX = 1.5*(object.x - this.player.x); //increase by 50% so player doesn't constantly collide and not move
      this.attachedOffsetY = 1.5*(object.y - this.player.y);
    };

    this.hero_cursors = scene.input.keyboard.createCursorKeys();


  }

  update() {
    this.stamina--;


    const {space, up, down, left, right} = this.hero_cursors;
    const hero = this.player;

    if (this.attachedWith.active){
      this.attachedWith.x = hero.x+this.attachedOffsetX;
      this.attachedWith.y = hero.y+this.attachedOffsetY;
    }

    if (left.isDown){
      hero.setVelocityX(-200);
      hero.play('walk_side', true);
    } else if (right.isDown){
      hero.setVelocityX(200);
      hero.play('walk_side', true);
    } else {
      hero.setVelocityX(0);
    }
    if (hero.body.velocity.x > 0) {
      this.player.setFlipX(false);
    } else if (hero.body.velocity.x < 0) {
      this.player.setFlipX(true);
    }

    if (up.isDown){
      hero.setVelocityY(-200);
      hero.play('walk_up', true);
    } else if (down.isDown){
      hero.setVelocityY(200);
      hero.play('walk_down', true);
    } else {
      hero.setVelocityY(0);
    }
    if (space.isDown) console.log('here', this.player.x, this.player.y);
  }

  setupAllCharacterAnimations(anims, sprites){
    anims.create({
      key: 'walk_side',
      frames: anims.generateFrameNames(sprites, {
        prefix: 'laura_side',
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1
    });
    anims.create({
      key: 'walk_up',
      frames: anims.generateFrameNames(sprites, {
        prefix: 'laura_up',
        start: 1,
        end: 2,
      }),
      frameRate: 4,
      repeat: -1
    });
    anims.create({
      key: 'walk_down',
      frames: anims.generateFrameNames(sprites, {
        prefix: 'laura_down',
        start: 1,
        end: 2,
      }),
      frameRate: 4,
      repeat: -1
    });
    anims.create({
      key: 'idle_side',
      frames: [{ key: sprites, frame: 'laura_side0' }],
      frameRate: 10,
    });

    anims.create({
      key: 'walk_down_mom',
      frames: anims.generateFrameNames(sprites, {
        prefix: 'mom_down',
        start: 1,
        end: 2,
      }),
      frameRate: 4,
      repeat: -1
    });
  }

}

// class State {
//   enter() {}
//   execute() {}
// }
//
