import {Delaunay} from 'd3-delaunay';

var generateCity = new Phaser.Class({
  initialize:
  /*
    scene: Phaser.Scene - reference to game scene
    cityWidth: Number - width of city for game
    cityHeight: Number - height of city for game
    pumps: Number - total number of pumps in game
    badPumps: Number - number of pumps that cause Cholera
  */
  function generateCity (scene, cityWidth, cityHeight, pumps, badPumps)
  {
    this.scene = scene;

    const tileSize = 5;
    const gridWidth = cityWidth / tileSize;
    const gridHeight = cityHeight / tileSize;

    const offSet = 2;
    const numOfPumps = pumps || 40;
    const numOfBadPumps = badPumps || 1;

    //draw brank city grid
    this.grid = this.draw2DCityGrid(gridWidth-offSet, gridHeight-offSet, tileSize);
    //flatten into 1d
    this.allCityCells = this.grid.flat();

    //create city planner based on cell ids
    this.cityPlanner = {};
    for (let cell of this.allCityCells) {
      if (cell.id){
        if (!this.cityPlanner[cell.id]) this.cityPlanner[cell.id] = [];
        this.cityPlanner[cell.id].push(cell);
      }
    }

    //iterate through and change blocks less than 5 to null
    for (let block in this.cityPlanner){
      if (this.cityPlanner[block].length < 5){
        this.cityPlanner[block].forEach(cell => {
          cell.id = null;
          cell.type = `road`;
        });
        delete this.cityPlanner[block]; //deletes roads from cityPlanner
      }
    }

    //guarentee bonus areas by removing 3 industrial blocks
    if (!this.scene.isInClassicMode) {
      const bonusAreas = [`CITY GUARD`, `HOSPITAL`, `HENRY WHITEHEAD ESTATE`];
      for (let block in this.cityPlanner){
        if (this.cityPlanner[block].some(cell => cell.type === `industrial`) && bonusAreas.length){
          let bonus = bonusAreas.splice(Phaser.Math.Between(0, bonusAreas.length-1), 1);
          this.cityPlanner[block].forEach(cell => {
            cell.type = 'bonus';
            cell.identifier = bonus[0];
          });
        }
      }
    }

    //procedurally roll over allCityCells to generate sprite, input events
    for (let c in this.allCityCells){
      // let tileSprite = `${cell.type}`;
      const cell = this.allCityCells[c];
      const px = (cell.j+1)*tileSize;
      const py = (cell.i+1)*tileSize;

      const pspr = this.setSprite(cell.type, parseInt(c,10), gridWidth, gridHeight);
      cell.sprite = scene.add.sprite(px, py, pspr).setInteractive().setOrigin(0);

      //used for input handling game loop events
      if (cell.type !== `road`){
        cell.deathCounterSprites = scene.add.container(cell.sprite.x, cell.sprite.y);
        cell.sprite.on('pointerover', (event) => {
          //select and animate block
          if (!this.scene.dialogueUI.active) this.scene.textUI.selectedBlock = cell;
          this.cityPlanner[cell.id].forEach(cell => cell.sprite.setTexture('select'), this);
        });
        cell.sprite.on('pointerout', (event) => this.cityPlanner[cell.id].forEach(cell => {
          //finish animating selected block
          cell.sprite.setTexture(cell.type);
        }, this));
        cell.sprite.on('pointerdown', function(event) {
          if (this.scene.dialogueUI.active) return;
          //use match (to simplify if then string conditionals) to seperate three set 'bonus' blocks from other industrial blocks
          (cell.identifier.match(/^(CITY GUARD|HOSPITAL|HENRY WHITEHEAD ESTATE)$/)) ?
            this.scene.select(`bonus`, cell, this.cityPlanner) :
            this.scene.select(cell.type, cell, this.cityPlanner) ;
        }, this);
      }
    }

    //creates random set of distrubted points to be used as waterpumps
    this.cityPumpLocations = [];
    for (let i = 0; i < numOfPumps; i++){
      let unvalidPoint = true;
      while (unvalidPoint){
        let x = Phaser.Math.Between(0, gridWidth-offSet-1);
        let y = Phaser.Math.Between(0, gridHeight-offSet-1);
        if (this.grid[y][x].type === 'road'){
          //map all water pumps and filter out any with length less than 10
          if (!this.cityPumpLocations.map(p => Math.pow(p.j-x, 2) + Math.pow(p.i-y, 2)).some(p => p < 10))
          {
            this.cityPumpLocations.push(this.grid[y][x]);
            unvalidPoint = false;
          }
        }
      }
    }

    //create the seed for bad pump in cityPumpLocations
    this.waterPumps = [];
    let badPumpSeeds = [];
    for (let i = 0; i < numOfBadPumps; i++){
      //catch duplicate pumps from being counted
      let rndPump = Phaser.Math.Between(0, this.cityPumpLocations.length-1);
      while (badPumpSeeds.includes(rndPump)) {
        rndPump = Phaser.Math.Between(0, this.cityPumpLocations.length-1);
      }

      badPumpSeeds.push(rndPump);
    }

    let waterPumpDelaunayPoints = [];
    for (let pump in this.cityPumpLocations) {
      let ps = this.cityPumpLocations[pump].sprite;
      let waterPump = scene.add.sprite(ps.x, ps.y, 'water-pump').setInteractive().setOrigin(0.5)
        .on('pointerdown', function (event) {
          this.scene.select(`waterpump`, this, this.isSelected);
        })
        .on('pointerover', function (event) {
          if (this.isSelected) return;
          this.setTexture('water-pump-selected');
        })
        .on('pointerout', function (event) {
          if (this.isSelected) return;
          this.setTexture('water-pump');
        });
      waterPump.isSelected = false;
      waterPump.isBad = badPumpSeeds.includes(parseInt(pump)) ? true : false;
      waterPump._id = pump;
      // if (waterPump.isBad) waterPump.setAlpha(0.5);// TODO: DELETE cheating

      this.waterPumps.push(waterPump);
      waterPumpDelaunayPoints.push([ps.x, ps.y]);
    }

    const delaunay = Delaunay.from(waterPumpDelaunayPoints);
    const voronoi = delaunay.voronoi([0, 0, cityWidth, cityHeight]);
    let polygons = Array.from(voronoi.cellPolygons());
    let voronoi_cell_lines = [];
    let graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x55ff55 } }); //uncomment to see voronoi cell lines

    //iterate through polygon output to set to game logic
    this.waterPumpPolygonalArea = [];
    for (let polygon of polygons){
      let [index, ...polyPoints] = polygon;
      let phaserPolygon = new Phaser.Geom.Polygon(polyPoints);
      this.waterPumpPolygonalArea.push(phaserPolygon);
      graphics.strokePoints(phaserPolygon.points, true);//uncomment to see voronoi lines
    }

    //sets district/building as choleraRisk instead of individual cell in radius of badWaterPump
    //inificient (not fast) way to do this since it goes over all the cells multiple times to change the flag
    for (let badPump of badPumpSeeds) {
      let badWaterPump = this.waterPumpPolygonalArea[badPump];
      this.allCityCells.forEach(cell => {
        if (Phaser.Geom.Polygon.Contains(badWaterPump, cell.sprite.x, cell.sprite.y) && cell.id) {
          //if block is has sterile source of water, then immune to Cholera
          //or if in classic mode all blocks are vulnerable
          if (!cell.identifier.match(/^(brewery|winery|workhouse|CITY GUARD|HOSPITAL|HENRY WHITEHEAD ESTATE)$/) || this.scene.isInClassicMode)
            this.cityPlanner[cell.id].forEach(cell => cell.choleraRisk = true);
        }
      });
    }
  },
  displayBadPumps(){
    for (let pump of this.waterPumps) {
      if (pump.isBad) pump.setTexture('water-pump-bad');
    }
  },
  setText(text){
    this.text.setText(text);
  },
  setSprite(type, index, width, height){
    if (type === 'road'){
      if (this.allCityCells[index+1] && this.allCityCells[index-1]) {
        // if (index<height || index)
        let a = this.allCityCells[index+1].type
        let b = this.allCityCells[index-1].type
        let ans = (a=='road' && b=='road') ? 'road2' : 'road1';
        return ans;
      } else {
        return 'road1';
      }
    } else {
      return type;
    }
  },

  createDot(cell, counter, sprite, tint = `0x000000`){
    let dot = this.scene.add.image(counter[0],counter[1],sprite).setOrigin(0).setTint(tint);
    dot.causeOfDeath = counter[2];
    dot.name = counter[2];
    cell.deathCounterSprites.add(dot);
  },
  countBlackDotsOnBlock(block, _type){
    let type = (Array.isArray(_type)) ? _type : [_type]; //convert to array
    let color = 0x000000; //BLACK
    let count = 0;
    let dot = 'white_dot';

    block.forEach(cell => {
      //switch check flags 1 then 2
      if (!cell.checked2 && cell.checked1) {
        cell.checked2 = true;
        //change type to *B to display when player has checked block < twice
      } else if (!cell.checked2 && !cell.checked1) {
        cell.checked1 = true;
        cell.type = cell.type + 'B';
        cell.sprite.setTexture(cell.type);
        color = 0x0000FF; //BLUE
      }

      //remove then place death counter sprites
      cell.deathCounterSprites.removeAll();
      cell.deathCounters.forEach(counter => {
        if (type.some(_t => counter[2].includes(_t))) {
          count++;
          this.createDot(cell, counter, dot, color);
        }
      });
    });
    return count;
  },

  removeFalseBlackDots(mask){
    //change param to array
    const trueDots = [mask];
    this.allCityCells.forEach(cell => {
      if (cell.deathCounterSprites.length) {
        cell.deathCounterSprites.removeAll();
        cell.deathCounters.forEach(counter => {
          if (counter[2].includes(trueDots)) this.createDot(cell, counter, 'black_dot');
        });
      }
    });
  },
  //returns number of deaths counted
  countAllDots(type){
    let count = 0;
    this.allCityCells.forEach(cell => {
      if (cell.type === `residential`) {
        cell.deathCounterSprites.list.forEach(child => (child.causeOfDeath === 'cholera') ? count++ : count--);
      }
    });
    count *= 10;
    return count
  },

  //logic for contagion spread
  cycleCities(){
    for (let y of this.grid) {
      for (let cell of y){
        if  (cell.type !== 'road'){
          //death counter algorithm, tracks a health integer on each cell. If health < 0, then counter increases by 1.
          let mortalWound = 0;
          //block immune to cholera
          if (cell.choleraImmune){
            cell.choleraRisk = false;
            cell.choleraInfection = false;
          //block infected w cholera
          } else if (cell.choleraInfection){
            cell.sprite.setTint(0xA00000); //uncomment to see CHOLERA
            //cholera has 40% chance of causing 1 damage
            mortalWound += (Math.random() > 0.6) ? 1 : 0;
            cell.choleraMeter -= Phaser.Math.Between(0,2);
            if (cell.choleraMeter < 0) cell.choleraImmune = true;
            //block can become infected with cholera, 1% chance every tick
          } else if (cell.choleraRisk){
            cell.choleraInfection = (Math.random() > 0.99) ? true : false;
            //during early game, every block has 0.0001% of becoming infected
            //simulates people who became infected from across the city
          } else if (this.scene.timerCounter < 48) {
            cell.choleraInfection = (Math.random() > 0.9999) ? true : false;
            mortalWound += (Math.random() > 0.9) ? 1 : 0;
          }
          //influenzaMeter-type miasma disease. Creates false flag in narrative
          if (cell.influenzaMeter > 0) {
            // cell.sprite.setTint(0x00FF00); //uncomment to see influenza
            mortalWound += (Math.random() > 0.95) ? 1 : 0;
            if (cell.influenzaMeter > 5) this.cityPlanner[cell.id].forEach(c => c.influenzaMeter = (Math.random() > 0.8) ? Phaser.Math.Between(12,72) : 0);
            cell.influenzaMeter -= Phaser.Math.Between(2,6);
            if (cell.influenzaMeter < 0) cell.influenzaRisk = false;
          } else {
            cell.influenzaMeter = (Math.random() > 0.9995 && cell.influenzaRisk) ? Phaser.Math.Between(36,72) : 0;
          }
          //false infections simulate the panick and misinformation during the epidemic
          if (cell.falseInfection) {
            // cell.sprite.setTint(0xFF55FF); //uncomment to see false infection (people left city)
            //10% chance of causing 3 damage to block
            mortalWound += (Math.random() > 0.9) ? 3 : 0;
            //60% chance falseInfection remains true
            cell.falseInfection = (Math.random() > 0.4) ? 1 : 0;
          } else {
            //1% chance turns true
            cell.falseInfection = (Math.random() > 0.99) ? 1 : 0;
          }

          //2.5% chance of 3 additional random damage taken (victorian london sucked!)
          //else 20% chance block actually technically heals 1
          mortalWound += (Math.random() > 0.975) ? 3 : (Math.random() > 0.8) ? -1 : 0;
          cell.health -= mortalWound;

          //if health < 0, reset health and add death counter
          //cause of death is dependent on flags, so if cholera flag is true, then death counter is cholera
          if (cell.health <= 0) {
            let t2 = cell.deathCounters.length;
            //set type of death based on cell variables
            let typeOfDeath = (cell.choleraInfection) ? `cholera` : (cell.falseInfection || cell.influenzaMeter > 0) ? `flu` : `other`;
            //First two parameters are xy coordinates relative to deathCounter container, type of death is a truthy value to flag death as correlating to cholera
            cell.deathCounters.push([(t2%3)*2, Math.floor(t2/3)*2, typeOfDeath]);
            //randomize health between 2 to 5
            cell.health = Phaser.Math.Between(2,5);
          }
        }
      }
    }
  },

  //draw2DCityGrid uses algorithm from her' https://stackoverflow.com/questions/48318881/generating-a-city-town-on-a-grid-simply-my-approach
  draw2DCityGrid(mapSizeX, mapSizeY, cellSize){
    const RandomRange = (min, max) => Math.random() * (max - min) + min;

    //list of block names
    const surname = [``, `st.`, `street`];
    const mainname = [`Little Pulteney`, `Great Windmill`, `Queen`, `Sherrard`, `Brewer`, `Tyler`, `Marshall`, `Tyler Court`, `Bridle`, `Broad`];
    const industrial = [`textile factory`, `butcher`, `goldsmith`, `workhouse`, `brewery`, `winery`, `school`, `church`];

    const getType = (i, j) => grid[i][j].id % 5;
    const getCell = (i, j) => grid[i][j];
    const IsInBounds = (i, j) => !(i < 0 || i >= mapSizeY || j < 0 || j >= mapSizeX);

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
    // Check if the neighbor to the right or below is a road and if so replace self as a road cell
    function checkIfRoad(i, j) {
      if (IsInBounds(i + 1, j) && grid[i + 1][j].id != grid[i][j].id) {
        grid[i][j].type = `road`;
        grid[i][j].id = null;
      }
      if (IsInBounds(i, j + 1) && grid[i][j + 1].id != grid[i][j].id) {
        grid[i][j].type = `road`;
        grid[i][j].id = null;
      }
    }

    function createIdentifier(i, j){
      let cell = grid[i][j];
      cell.number = cell.id%50 + 1;
      if (cell.type ===  `industrial`){
        cell.identifier = `${industrial[cell.id%industrial.length]}`;
      } else {
        //generate street name based on on surname and mainname
        let sur = surname[cell.id%surname.length];
        let name = mainname[cell.id%mainname.length];
        cell.identifier = `${name} ${sur}`;
      }
    }

    // Generate the grid
    var grid = [];
    for (let i = 0; i < mapSizeY; i++) {
      grid[i] = [];
      for (let j = 0; j < mapSizeX; j++) {
        grid[i][j] = new Cell(i, j);
      }
    }

    // Get a random order to loop through the cells
    const checkOrder = shuffle(GetAllCells());
    const minSize = 4;
    const maxSize = 8;
    const industrialToResidential = 0.8;

    for (var id = 1; id < checkOrder.length; id++) {
      const curTile = checkOrder[id];

      if (curTile.type === `road`) {
        const direction = (Math.random() > .5 ? 1 : 0);
        const square_width = RandomRange(minSize, (direction ? maxSize : minSize));
        const square_height = RandomRange(minSize, (direction ? minSize : maxSize));
        const zone = (Math.random() < industrialToResidential) ? `residential` : `industrial`;

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

    for (let i = 0; i < mapSizeY; i++) {
      for (let j = 0; j < mapSizeX; j++) {
        checkIfRoad(i, j);
        createIdentifier(i, j);
      }
    }
    return grid;
  },
});
export default generateCity;

class Cell {
  constructor(i, j){
    this.i = i;
    this.j = j;

    this.type = 'road';
    this.id = null;

    this.iNum = '';
    this.identifier = '';

    this.choleraMeter = Phaser.Math.Between(30, 120);
    //not infected but vulnerable
    this.choleraRisk = false;
    //infected with cholera
    this.choleraInfection = false;
    //immune to being infected
    this.choleraImmune = false;

    //false flags
    this.influenzaMeter = 0;
    this.influenzaRisk = true;
    //simulates people who left/disappeared
    this.falseRisk = true;
    this.falseInfection = false;

    this.health = Phaser.Math.Between(2, 5);
    this.deathCounters = [];
    this.deathCounterSprites = {};

    this.checked1 = false;
    this.checked2 = false;
  }
}
