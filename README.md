# Interdimensional Rescue

A 2D endless runner game where you control a flying character through different dimensions, collecting energy crystals and avoiding obstacles.

## Features

- Smooth flying mechanics (similar to Flappy Bird)
- Multiple dimensions with unique backgrounds and obstacles
- Energy crystal collection for points
- Portal system to travel between dimensions
- High score system using localStorage
- Responsive design for both desktop and mobile
- Touch and keyboard controls

## Controls

- **Desktop**: Press and hold SPACE to fly up, release to fall
- **Mobile**: Touch and hold to fly up, release to fall

## Setup

1. Clone the repository
2. Create an `assets` folder in the root directory
3. Add the following image files to the `assets` folder:
   - player.png (40x40px)
   - obstacle.png (30x150px)
   - crystal.png (30x30px)
   - portal.png (30x30px)
   - background1.png (800x600px)
   - background2.png (800x600px)
   - background3.png (800x600px)
4. Add the following sound files to the `assets` folder:
   - jump.mp3
   - collect.mp3
   - portal.mp3
   - gameover.mp3
5. Open `index.html` in a modern web browser

## Development

The game is built using vanilla JavaScript and HTML5 Canvas. The code is organized into several modules:

- `main.js`: Game initialization and main loop
- `player.js`: Player character logic
- `obstacle.js`: Obstacle management
- `powerup.js`: Energy crystal and portal logic
- `assets.js`: Asset loading and management
- `utils.js`: Utility functions

## Browser Support

The game works best in modern browsers that support:

- HTML5 Canvas
- ES6+ JavaScript features
- Web Audio API
- LocalStorage

## License

MIT License - feel free to use this code for your own projects!
