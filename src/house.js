import Hero from './hero';
import {Delaunay} from 'd3-delaunay';

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
    this.load.image('tiles', 'assets/sample_indoor_kenny.png');
    this.load.image('white_square', 'assets/white_square.png');

    this.load.tilemapTiledJSON('map', 'assets/sample_indoor1.json');
    // this.load.tilemapTiledJSON('map', 'assets/this.cityGrid.json');

    this.load.atlas('player', 'assets/rpg_basic_opt.png','assets/rpg_basic.json');


    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: 'assets/rexuiplugin.min.js',
      sceneKey: 'rexUI'
    });

  }

  create(){
    this.input.keyboard.on('keydown', this.handleKey, this);

    let tileSize = 16;
    const getColor = (zone) => {
      switch (zone) {
        case 'residential' : return "0x00FF00";
        case 'commercial' : return "0x0000FF";
        case 'industrial': return "0xFF0000";
        case 'road': return "0x303030";
      }
    }

    //drawCityGrid uses algorithm from her' https://stackoverflow.com/questions/48318881/generating-a-city-town-on-a-grid-simply-my-approach
    //returns 2d array of cells
    this.cityGrid = this.drawCityGrid(40, 26, 16);
    this.allCityCells = [];
    this.cityPlanner = {};
    this.cityWaterPumps = [];


    //creates set of points to be used as waterpumps
    for (let i = 1; i < 15; i++){
      let validPoint = true;
      while (validPoint){
        let x = Phaser.Math.Between(0, 39);
        let y = Phaser.Math.Between(0, 25);
        if (this.cityGrid[y][x].type === 'road')
        {
          this.cityWaterPumps.push(this.cityGrid[y][x]);
          validPoint = false;
        }
      }
    }

    for (let y of this.cityGrid) {
      for (let cell of y){
        // this.groundLayer.putTileAt(cell.type, cell.j, cell.i);
        let color = getColor(cell.type);
        //if not a road push to cityPlanner
        if (cell.type !== 'road'){
          if (!this.cityPlanner[cell.id]) this.cityPlanner[cell.id] = [];
          this.cityPlanner[cell.id].push(cell);
          this.allCityCells.push(cell);
        }

        //setting block color here
        cell.sprite = this.add.image(cell.j*tileSize, cell.i*tileSize, 'white_square').setTint(color).setInteractive();

        cell.atRisk = false;
        cell.infected = false;
        cell.passedAway = false;
        cell.immune = false;

        cell.health = Phaser.Math.Between(3, 7);
        cell.timeToHeal = Phaser.Math.Between(5, 15);

        cell.sprite.on('pointerover', function (event) {
          this.cityPlanner[cell.id].forEach(cell => cell.sprite.setAlpha(0.7));
        }, this);
        cell.sprite.on('pointerout', function (event) {
          this.cityPlanner[cell.id].forEach(cell => cell.sprite.clearAlpha());
        }, this);
        cell.sprite.on('pointerdown', function (event) {
          console.log(this, cell.id);
        });

      }
    }
    // let a = this.cityWaterPumps[Phaser.Math.Between(0,this.cityWaterPumps.length)];
    // a.sprite.setAlpha(0.2);
    // console.log(a);
    // this.cityWaterPumps.forEach(pump => pump.sprite.setColor(0x000000));
    let waterPumpPositions = [];
    this.cityWaterPumps.forEach(pump => {
      let ps = pump.sprite;
      ps.setTint(0xffffff);
      waterPumpPositions.push([ps.x, ps.y]);
    });
    const delaunay = Delaunay.from(waterPumpPositions);
    const voronoi = delaunay.voronoi([0, 0, this.game.config.width, this.game.config.height]);
    let polygons = Array.from(voronoi.cellPolygons());
    let voronoi_cell_lines = [];

    //TODO graphics used for debuggins, not needed for production
    let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xaa6622 } });

    this.waterPumpPolygons = [];
    for (let polygon of polygons){
      let [index, ...polyPoints] = polygon;
      let phaserPolygon = new Phaser.Geom.Polygon(polyPoints);
      this.waterPumpPolygons.push(phaserPolygon);

      graphics.strokePoints(phaserPolygon.points, true);
    }

    let badPump = this.waterPumpPolygons[Phaser.Math.Between(0, this.waterPumpPolygons.length-1)];
    this.allCityCells.forEach(cell => {
      if (Phaser.Geom.Polygon.Contains(badPump, cell.sprite.x, cell.sprite.y)){
        //sets district/building as atRisk instead of individual cell in radius of badPump
        this.cityPlanner[cell.id].forEach(cell => cell.atRisk = true);
      }


    });

    this.timerCounter = 0;
    this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });
  }
  onEvent(){

    for (let district in this.cityPlanner) {

      // if (Math.random() > 0.998){
      //   this.cityPlanner[district].forEach(cell => cell.sprite.setTint(0xffffff));
      // }

    }
    this.timerCounter++;
    if (this.timerCounter > 42) this.scene.restart();

    for (let y of this.cityGrid) {
      for (let cell of y){
        if  (cell.type !== 'road'){
          // console.log(cell);
          let mortalWound = 0;
          if (cell.passedAway){
            cell.sprite.setAlpha(0.8);
            cell.sprite.setTint(0x000000);
          } else if (cell.immune){
            cell.atRisk = false;
            cell.infected = false;
          } else if (cell.atRisk){
            cell.sprite.setAlpha(0.9);
            cell.atRisk = false;
            cell.infected = (Math.random() > 0.2) ? true : false;
          } else if (cell.infected){
            this.cityPlanner[cell.id].forEach(c => c.atRisk = (Math.random() > 0.2) ? true : false);
            cell.sprite.setTint(0x89a203);
            mortalWound += (Math.random() > 0.8) ? 3 : 0;
            cell.timeToHeal -= 1;
            if (cell.timeToHeal < 0){
              cell.immune = true;
              cell.sprite.setTint(0x008080);
            }
          } else {
            cell.infected = (Math.random() > 0.999 && this.timerCounter < 10) ? true : false;
          }
          mortalWound += (Math.random() > 0.995) ? 1 : (Math.random() > 0.9) ? -1 : 0;
          cell.health -= mortalWound;
          if (cell.health <= 0) cell.passedAway = true;
        }

      }
    }
  }

  update(time, delta){

  }
  handleKey(e) {
    switch(e.code) {
      case 'KeyS': {
        console.log('keyS is down');
        break;
      }
      case 'Enter': {

        break;
      }
      default: {}
    }
  }





  drawCityGrid(mapSizeX = 40, mapSizeY = 25, cellSize = 16){


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

    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function Cell(i, j) {
      this.i = i;
      this.j = j;
      this.type = TYPES.NONE;
      this.id = -1;
      this.color = "";
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
    var maxSize = 10;

    for (var id = 1; id < checkOrder.length; id++) {
      var curTile = checkOrder[id];

      if (curTile.type == TYPES.NONE) {
        var direction = (Math.random() > .5 ? 1 : 0);
        var square_width = RandomRange(minSize, (direction ? maxSize : minSize));
        var square_height = RandomRange(minSize, (direction ? minSize : maxSize));

        var zones = [TYPES.RESIDENTIAL, TYPES.COMMERCIAL, TYPES.COMMERCIAL, TYPES.RESIDENTIAL, TYPES.INDUSTRIAL];
        var zone = zones[Math.floor(Math.random() * zones.length)];
        var color = getRandomColor();

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
