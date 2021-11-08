# Source Code for Cholera Contagion

A game about Cholera epidemics. Find the infectious water pump and mark it on the map. Click each block to count the number of casualties, each click deduces how the patient perished/vanished.
Game is hosted on itch.io, and can be played here-

https://supersleepygrumpybear.itch.io/cholera-contagion

Uses a basic square overlap procedural generation. Infection spreads around water-pumps based on Voronoi Diagram. Cholera infections are blue; false-flag infections are green (for influenza) and pink (for missing).

![cc_gifE](https://user-images.githubusercontent.com/3844434/140787794-c7d05b82-3444-43a2-86d9-da20e46f12ca.gif)
![cc_gifE](https://user-images.githubusercontent.com/3844434/140787846-307ecc2a-ebbe-4567-bebc-a7fa26d0f124.gif)

# Built Using Phaser 3 Webpack Project Template

BOILERPLATE used to build Cholera Contagion

https://github.com/photonstorm/phaser3-project-template

Uses Phaser 3 project template with ES6 support via [Babel 7](https://babeljs.io/) and [Webpack 4](https://webpack.js.org/) that includes hot-reloading for development and production-ready builds.

Updated for Phaser 3.50.0 version and above.

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm start` | Build project and open web server running project |
| `npm run build` | Builds code bundle with production settings (minification, uglification, etc..) |
