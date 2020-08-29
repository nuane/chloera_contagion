import Dialogue from './dialogue';
import {Delaunay} from 'd3-delaunay';

import textUI from './textUI';

// case 'residential' : return "0x008080";
// case 'commercial' : return "0x008080";
// case 'industrial': return "0xFF69b4";
// case 'road': return "0x303030";

class House extends Phaser.Scene {
  constructor() {
  super({
      key: 'house',
      physics: {
        arcade: {
          debug: true,
          gravity: { y: 0 }
        },
      }
    });
  }
  preload() {
    this.load.audio('shot', 'assets/s_atari_lasershot.wav');
    this.load.audio('cycle', 'assets/s_dead.wav');
    this.load.audio('click', 'assets/s_click.wav');

    // this.load.image('white_square', 'assets/white_square.png');
    // this.load.image('black_dot', 'assets/black_dot.png');
    this.load.image('white_dot', 'assets/white_dot.png');
    this.load.image('tile0', 'assets/tile-000.png');

    this.load.image('road', 'assets/tile-road.png');
    this.load.image('residential', 'assets/tile-home.png');
    this.load.image('commercial', 'assets/tile-home.png');
    this.load.image('industrial', 'assets/tile-industrial.png');


    this.load.image('water_pump', 'assets/water_pump.png');

    this.load.image('test', 'assets/_test.png');
    this.load.image('overlay', 'assets/overlay.png');
    // this.load.image('tile0', 'assets/tile0.png');
    // this.load.image('tile1', 'assets/tile1.png');
    // this.load.image('tile2', 'assets/tile2.png');
    // this.load.image('tile3', 'assets/tile3.png');
    // this.load.image('tile4', 'assets/tile4.png');


    this.load.image('face0', 'assets/8bit_face0.png');
    this.load.image('face1', 'assets/8bit_face1.png');
    this.load.image('face2', 'assets/8bit_face2.png');
    this.load.image('face3', 'assets/8bit_face3.png');
    this.load.image('face4', 'assets/8bit_face4.png');
    this.load.image('face5', 'assets/8bit_face5.png');



  }

  create(){
    this.input.keyboard.on('keydown', this.handleKey, this);

    this.dialogueUI = this.add.container(0, 0).setVisible(false);
    this.dialogueUI.background = this.add.image(0, 0, 'overlay').setOrigin(0);
    this.dialogueUI.add(this.dialogueUI.background);
    this.dialogueUI.depth = 12;


    // this.textUI = this.add.text(10, 10, '', { fontFamily: 'Arial', fontSize: 24, color: '#000000' });
    // this.textUI.depth = 11;
    this.textUI = new textUI(this, 10, 10);

    this.score = 2000;
    this.reputation = 0;


    this.shotSound = this.sound.add('shot');
    this.cycleSound = this.sound.add('cycle');
    this.clickSound = this.sound.add('click');

    let tileSize = 5;
  
    //drawCityGrid uses algorithm from her' https://stackoverflow.com/questions/48318881/generating-a-city-town-on-a-grid-simply-my-approach
    //returns 2d array of cells
    let gridWidth = this.game.config.width / tileSize;
    let gridHeight = this.game.config.height / tileSize;

    let offSet = 4;
    let numOfPumps = 40;

    this.cityGrid = this.drawCityGrid(gridWidth-offSet, gridHeight-offSet, tileSize);
    this.allCityCells = [];
    this.cityPlanner = {};


    for (let y of this.cityGrid) {
      for (let cell of y){
        // this.groundLayer.putTileAt(cell.type, cell.j, cell.i);
        //if not a road push to cityPlanner
        if (cell.type !== 'road'){
          if (!this.cityPlanner[cell.id]) this.cityPlanner[cell.id] = [];
          this.cityPlanner[cell.id].push(cell);
          this.allCityCells.push(cell);
        }

        //setting block color here
        let tileSprite = `${cell.type}`
        cell.sprite = this.add.image((cell.j+2)*tileSize, (cell.i+2)*tileSize, tileSprite).setInteractive().setOrigin(0);

        cell.state = {
          atRisk: false, infected: false, immune: false,
          healthy: true,
        }
        cell.influenza = 0;
        cell.influenzaRisk = true;

        cell.atRisk = false;
        cell.infected = false;
        cell.immune = false;
        cell.timeToHeal = Phaser.Math.Between(30, 120);

        cell.health = Phaser.Math.Between(7, 17);
        cell.deathCounters = this.add.container(cell.x, cell.y)
          .setAlpha(1); //comment to see all counters


        cell.sprite.on('pointerover', function (event) {

          this.cityPlanner[cell.id].forEach(cell => cell.sprite.setAlpha(0.9));
        }, this);
        cell.sprite.on('pointerout', function (event) {
          this.cityPlanner[cell.id].forEach(cell => cell.sprite.clearAlpha());
        }, this);
        cell.sprite.on('pointerdown', function(event) {

          let test0 = this.cityPlanner[cell.id].filter(cell => cell.infected);
          let test1 = this.cityPlanner[cell.id].filter(c => c.deaths);//.reduce((sum, cur) => sum + cur, 0);
          // console.log(test0, test1);
          this.cityPlanner[cell.id].forEach(c => c.deathCounters.setAlpha(1));


          this.dialogueUI.removeAll();
          this.dialogueUI.add(this.dialogueUI.background);
          // this.dialogueUI.setVisible(true);
          this.dialogueUI.flag = true;

          let rndFace = `face` + Phaser.Math.Between(0,5);

          let face = this.add.image(100, 100, rndFace);
          let allText = [
            `What can I do for yer'`,
            `I don't know what you been talking about, but I'm talking about the real issues`,
            `Please to bother ya. But do ya' know the time. I don't...`,
            `Will I be safe doc?`,
            `Please! Won't somebody think of the children`,
          ];
          let rnd = Phaser.Math.Between(0,4);
          let text = this.add.text(210, 20, allText[rnd], {fontFamily: 'Arial', fontSize: 12, color: '#ffffff', wordWrap: { width: 100 }});
          let help = this.add.text(210, 120, 'Take Care', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' }).setInteractive()
            .on('pointerdown', (pointer) => {
                if (!this.dialogueUI.flag) return;
                text.setText('Thank you kindly!');
                this.reputation += 10;
                this.fastForward = Phaser.Math.Between(1,5);
                // this.dialogueUI.setVisible(false);
              // this.dialogueUI.
                this.dialogueUI.flag = false;

            }, this);

          let audit = this.add.text(210, 140, 'AUDIT', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' }).setInteractive()
            .on('pointerdown', (pointer) => {
              if (!this.dialogueUI.flag) return;
              if (this.reputation > 20) {
                this.reputation -= 5;
                this.fastForward = 2;
                this.cityPlanner[cell.id].forEach(c => {
                  console.log(c.deathCounters.length);
                  this.score += c.deathCounters.length;
                  // c.deathCounters.setAlpha(1)
                  // console.log(c.deathCounters);
                  c.deathCounters.list.forEach(count =>{
                    console.log(count);
                    this.add.image(count.x, count.y, 'black_dot');
                  })
                });
              } else {

                text.setText('Why should we trust you!');

              }
              this.dialogueUI.flag = false;
              // this.dialogueUI.setVisible(false);
              // this.dialogueUI.
            }, this);
          let exit = this.add.text(210, 160, 'EXIT', { fontFamily: 'Arial', fontSize: 12, color: '#ffffff' }).setInteractive()
            .on('pointerdown', (pointer) => {
              this.dialogueUI.setVisible(false);
              // this.dialogueUI.
            });
          this.dialogueUI.add([face, help, text, audit, exit]);
          // this.dialogueUI.bringUpDialgoueScreen(this.cityPlanner[cell.id]);

        }, this);

      }
    }

    this.input.on('pointerdown', (pointer) => console.log(pointer.x, pointer.y));

    this.cityWaterPumps = [];

    //creates set of points to be used as waterpumps
    for (let i = 0; i < numOfPumps; i++){
      let unvalidPoint = true;
      while (unvalidPoint){
        let x = Phaser.Math.Between(0, gridWidth-offSet-1);
        let y = Phaser.Math.Between(0, gridHeight-offSet-1);
        if (this.cityGrid[y][x].type === 'road'){
          //map all water pumps and filter out any with length less than 10
          if (!this.cityWaterPumps.map(p => Math.pow(p.j-x, 2) + Math.pow(p.i-y, 2)).filter(p => p < 10).length)
          {
            this.cityWaterPumps.push(this.cityGrid[y][x]);
            unvalidPoint = false;
          }
        }
      }
    }

    //// TODO
    // this.cityWaterPumps.forEach(p => console.log(p));
    //create the seed for bad pump in cityWaterPumps
    let badPumpSeed = Phaser.Math.Between(0, this.cityWaterPumps.length-1);
    let waterPumpCoordinateMap = [];
    for (let pump in this.cityWaterPumps) {
      let ps = this.cityWaterPumps[pump].sprite;
      let waterPump = this.add.image(ps.x, ps.y, 'water_pump').setInteractive().setOrigin(0,0.8);

      waterPump.on('pointerdown', function (event) {
        //TODO make end game logic
        console.log(waterPump);
        (parseInt(pump) === badPumpSeed) ? this.scene.start('end', this.score+4000) : this.scene.start('end', 'Wrong! Game Over! Blown up!');
      }, this);
      waterPumpCoordinateMap.push([ps.x, ps.y]);
    }

    const delaunay = Delaunay.from(waterPumpCoordinateMap);
    const voronoi = delaunay.voronoi([0, 0, this.game.config.width, this.game.config.height]);
    let polygons = Array.from(voronoi.cellPolygons());
    let voronoi_cell_lines = [];

    //TODO graphics used for debuggins, not needed for production
    let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xaa6622 } });

    //iterate through polygon output to set to game logic
    this.waterPumpPolygonalArea = [];
    for (let polygon of polygons){
      let [index, ...polyPoints] = polygon;
      let phaserPolygon = new Phaser.Geom.Polygon(polyPoints);
      this.waterPumpPolygonalArea.push(phaserPolygon);

      //uncomment to see voronoi lines
      // graphics.strokePoints(phaserPolygon.points, true);
    }

    let badWaterPump = this.waterPumpPolygonalArea[badPumpSeed];
    this.allCityCells.forEach(cell => {
      //sets district/building as atRisk instead of individual cell in radius of badWaterPump
      //inificient way to do this since it goes over all the cells multiple times to change the flag
      if (Phaser.Geom.Polygon.Contains(badWaterPump, cell.sprite.x, cell.sprite.y)) this.cityPlanner[cell.id].forEach(cell => cell.atRisk = true);


    });

    this.timerCounter = 0;
    this.timerDelay = 200;
    // this.timedEvent = this.time.addEvent({ delay: this.timerDelay, callback: this.onEvent, callbackScope: this, loop: true });
    this.time.addEvent({ delay: this.timerDelay, callback: this.onEvent, callbackScope: this});

    this.choleraDeathsCounter = 0;
    this.influenzaDeathsCounter = 0;
    this.otherDeathsCounter = 0;


    // this.camera.main.zoom(4);

    // this.add.image(0, 0, 'test').setOrigin(0).setScale(2);
  }

  update(time, delta){
    //bad line unbalances game
    // if (this.score < 0 || this.reputation < 0) this.scene.start('end', 'You know nothing John Snow!');
    if (this.fastForward){
      console.log(this.fastForward);
      this.time.addEvent({ delay: 100, callback: this.onEvent, callbackScope: this, repeat: this.fastForward });
      this.fastForward = 0;
    }

    this.textUI.setText(`${Math.floor(this.timerCounter/24)}  ${this.timerCounter%24}`);
  }
  handleKey(e) {
    switch(e.code) {
      case 'KeyS': {
        // console.log('keyS is down');
        break;
      }
      case 'Enter': {

        break;
      }
      default: {}
    }
  }


  onEvent(){
    this.score -= 10;
    if (this.timerCounter % 24 === 0){
      this.timerDelay = 500;
    } else {
      this.timerDelay = 50;
    }
    this.time.addEvent({ delay: this.timerDelay, callback: this.onEvent, callbackScope: this});
    if (this.timerCounter > 240) {
      this.time.addEvent({ delay: 500, callback: () => this.scene.start('house', this.score), callbackScope: this, loop: true });
      return;
    }
    this.timerCounter++;

    // this.clickSound.play();
    // if (this.timerCounter > 240) this.scene.start('house', this.score);
    if (this.timerCounter%4 === 0) console.log(this.choleraDeathsCounter, this.influenzaDeathsCounter, this.otherDeathsCounter);
    for (let y of this.cityGrid) {
      for (let cell of y){
        if  (cell.type !== 'road'){

          // console.log(cell);
          //death counter algorithm, tracks a health integer on each cell. If health < 0, then counter increases by 1.
          let mortalWound = 0;
          if (cell.immune){
            cell.atRisk = false;
            cell.infected = false;
          } else if (cell.infected){
            cell.sprite.setTint(0x00ff00); //// TODO:
            mortalWound += (Math.random() > 0.6) ? 1 : 0;
            cell.timeToHeal -= Phaser.Math.Between(0,2);
            if (cell.timeToHeal < 0) cell.immune = true;
          } else if (cell.atRisk){
            // cell.sprite.setTint(0xff00ff); //// TODO:
            cell.infected = (Math.random() > 0.99) ? true : false;
            // cell.immune = (Math.random() > 0.9995) ? true : false;
          } else if (this.timerCounter < 48) {
            cell.infected = (Math.random() > 0.9999) ? true : false;
          }


          //testing influenza-type disease. Will change to miasma... I think
          if (cell.influenza > 0) {
            cell.sprite.setTint(0x0000AA); //// TODO:
            if (cell.influenza > 5) this.cityPlanner[cell.id].forEach(c => c.influenza = (Math.random() > 0.6 && c.influenzaRisk) ? Phaser.Math.Between(12,72) : 0);
            cell.influenza -= Phaser.Math.Between(2,12);
            if (cell.influenza < 0) cell.influenzaRisk = false;
            mortalWound += Phaser.Math.Between(0,2);
          } else {
            if (!cell.infected) cell.sprite.setTint(0xffffff); //// TODO:
            cell.influenza = (Math.random() > 0.999 && cell.influenzaRisk) ? Phaser.Math.Between(36,72) : 0;
          }

          mortalWound += (Math.random() > 0.99) ? 7 : (Math.random() > 0.8) ? -1 : 0;
          cell.health -= mortalWound;
          if (cell.health <= 0) {
            let cs = cell.sprite;
            let ticker = cell.deathCounters.list.length;

            let deathCounter = this.add.image(cs.x + ((ticker%3)*2), cs.y + Math.floor((ticker/3))*2, 'white_dot').setOrigin(0);
            if (cell.infected) {
              this.choleraDeathsCounter++
              // deathCounter.setTint(0x000000);
            } else if (cell.influenza !== 0){
              this.influenzaDeathsCounter++
            } else {
              this.otherDeathsCounter++;
              // deathCounter.setTint(0xaa5500);
            }
            deathCounter.setTint(0x000000);
            cell.deathCounters.add(deathCounter);
            cell.health = Phaser.Math.Between(7,17);
          }
        }
      }
    }
  }



  drawCityGrid(mapSizeX, mapSizeY, cellSize){


    var TYPES = {
      NONE: 'none',
      RESIDENTIAL: 'residential',
      COMMERCIAL: 'commercial',
      INDUSTRIAL: 'industrial',
      ROAD: 'road'
    }

    function RandomRange(min, max) {
      return Math.random() * (max - min) + min;
    }


    function Cell(i, j) {
      this.i = i;
      this.j = j;

      this.type = TYPES.ROAD;
      this.id = -1;

      this.atRisk = false;
      this.infected = false;
    }

    function setId(i, j, id) {
      if (i < mapSizeY && j < mapSizeX) {
        grid[i][j].id = id;
      }
    }

    function shuffle(array) {
      var copy = [],
        n = array.length,
        i;

      // While there remain elements to shuffle…
      while (n) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * array.length);

        // If not already shuffled, move it to the new array.
        if (i in array) {
          copy.push(array[i]);
          delete array[i];
          n--;
        }
      }

      return copy;
    }

    // Get all cells as a 1 dimensional array
    function GetAllCells() {
      var cells = [];
      for (var i = 0; i < mapSizeY; i+=2) {
        for (var j = 0; j < mapSizeX; j+=2) {
          cells.push(grid[i][j]);
        }
      }
      return cells;
    }

    function getType(i, j) {
      return grid[i][j].id % 5;
    }

    function getCell(i, j) {
      return grid[i][j];
    }

    function getNeighbors(i, j) {
      var neighbors = [];

      if (IsInBounds(i - 1, j))
        neighbors.push(getCell(i - 1, j));
      if (IsInBounds(i + 1, j))
        neighbors.push(getCell(i + 1, j));
      if (IsInBounds(i, j - 1))
        neighbors.push(getCell(i, j - 1));
      if (IsInBounds(i, j + 1))
        neighbors.push(getCell(i, j + 1));

      return neighbors;
    }

    function IsInBounds(i, j) {
      return !(i < 0 || i >= mapSizeY || j < 0 || j >= mapSizeX);
    }

    // Check if the neighbor to the right or below is a road and if so replace self as a road cell
    function checkIfRoad(i, j) {
      if (IsInBounds(i + 1, j) && grid[i + 1][j].id != grid[i][j].id) {
        grid[i][j].type = TYPES.ROAD;
      }

      if (IsInBounds(i, j + 1) && grid[i][j + 1].id != grid[i][j].id) {
        grid[i][j].type = TYPES.ROAD;
      }
    }



    // Generate the grid
    var grid = [];

    for (var i = 0; i < mapSizeY; i++) {
      grid[i] = [];
      for (var j = 0; j < mapSizeX; j++) {
        grid[i][j] = new Cell(i, j);
      }
    }

    // Get a random order to loop through the cells
    var checkOrder = shuffle(GetAllCells());
    var minSize = 4;
    var maxSize = 8;

    for (var id = 1; id < checkOrder.length; id++) {
      var curTile = checkOrder[id];

      if (curTile.type == TYPES.ROAD) {
        var direction = (Math.random() > .5 ? 1 : 0);
        var square_width = RandomRange(minSize, (direction ? maxSize : minSize));
        var square_height = RandomRange(minSize, (direction ? minSize : maxSize));

        var zones = [TYPES.RESIDENTIAL, TYPES.COMMERCIAL, TYPES.COMMERCIAL, TYPES.RESIDENTIAL, TYPES.INDUSTRIAL];
        var zone = zones[Math.floor(Math.random() * zones.length)];

        for (var i = 0; i < square_width; i+=2) {
          for (var j = 0; j < square_height; j+=2) {
            if (IsInBounds(curTile.i + i+1, curTile.j + j+1)) {
              grid[curTile.i + i][curTile.j + j].id = id;					// [x] O
              grid[curTile.i + i][curTile.j + j].type = zone;		 	//	O  O

              grid[curTile.i + i+1][curTile.j + j].id = id;		 	 	//	x [O]
              grid[curTile.i + i+1][curTile.j + j].type = zone;	 	//	O  O

              grid[curTile.i + i][curTile.j + j+1].id = id;				//	x  O
              grid[curTile.i + i][curTile.j + j+1].type = zone;	 	// [O] O

              grid[curTile.i + i+1][curTile.j + j+1].id = id;     //  x  O
              grid[curTile.i + i+1][curTile.j + j+1].type = zone;	// 	O [O]
            }
          }
        }
      }
    }

    for (var i = 0; i < mapSizeY; i++) {
      for (var j = 0; j < mapSizeX; j++) {
        checkIfRoad(i, j);
      }
    }
    return grid;
  }
}
export default House;
