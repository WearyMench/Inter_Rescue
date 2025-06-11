class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();

    this.player = null;
    this.obstacles = [];
    this.powerups = [];
    this.score = 0;
    this.highScore = localStorage.getItem("highScore") || 0;
    this.gameSpeed = 5;
    this.isGameOver = false;
    this.isPlaying = false;
    this.currentDimension = 1;
    this.backgrounds = ["background1", "background2", "background3"];

    this.setupEventListeners();
    this.setupScreens();
  }

  setupCanvas() {
    // Set canvas size to match container
    const container = document.getElementById("game-container");
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    // Handle window resize
    window.addEventListener("resize", () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    });
  }

  setupEventListeners() {
    // Mouse/Touch controls
    this.canvas.addEventListener("mousedown", () => this.handleInput(true));
    this.canvas.addEventListener("mouseup", () => this.handleInput(false));
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.handleInput(true);
    });
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.handleInput(false);
    });

    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") this.handleInput(true);
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") this.handleInput(false);
    });

    // Game control buttons
    document
      .getElementById("start-button")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("restart-button")
      .addEventListener("click", () => this.restartGame());
  }

  setupScreens() {
    this.startScreen = document.getElementById("start-screen");
    this.gameOverScreen = document.getElementById("game-over-screen");
  }

  handleInput(isPressed) {
    if (this.player && this.isPlaying) {
      this.player.setFlying(isPressed);
      if (isPressed) {
        assetManager.playSound("jump");
      }
    }
  }

  startGame() {
    this.startScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.isPlaying = true;
    this.isGameOver = false;
    this.score = 0;
    this.gameSpeed = 5;
    this.currentDimension = 1;

    // Initialize game objects
    this.player = new Player(this.canvas.width / 4, this.canvas.height / 2);
    this.obstacles = [];
    this.powerups = [];

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  restartGame() {
    this.startGame();
  }

  gameLoop(timestamp) {
    if (!this.isPlaying) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    if (!this.isGameOver) {
      requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    // Update player
    this.player.update(deltaTime);

    // Update obstacles
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update(deltaTime, this.gameSpeed);
      return obstacle.x + obstacle.width > 0;
    });

    // Update powerups
    this.powerups = this.powerups.filter((powerup) => {
      powerup.update(deltaTime, this.gameSpeed);
      return powerup.x + powerup.width > 0;
    });

    // Spawn new obstacles and powerups
    if (Math.random() < 0.02) {
      this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height));
    }
    if (Math.random() < 0.01) {
      this.powerups.push(new Powerup(this.canvas.width, this.canvas.height));
    }

    // Check collisions
    this.checkCollisions();

    // Update score
    this.score += 0.1;
    this.gameSpeed = 5 + Math.floor(this.score / 1000);
  }

  checkCollisions() {
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.player.checkCollision(obstacle)) {
        assetManager.playSound("gameOver");
        this.gameOver();
        return;
      }
    }

    // Check powerup collisions
    for (const powerup of this.powerups) {
      if (this.player.checkCollision(powerup)) {
        if (powerup.type === "portal") {
          // Change dimension
          this.currentDimension = (this.currentDimension % 3) + 1;
          assetManager.playSound("portal");
        } else {
          this.score += powerup.value;
          assetManager.playSound("collect");
        }
        powerup.collected = true;
      }
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.isPlaying = false;

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore);
    }

    // Show game over screen
    document.getElementById("final-score").textContent = Math.floor(this.score);
    document.getElementById("high-score").textContent = Math.floor(
      this.highScore
    );
    this.gameOverScreen.classList.remove("hidden");
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    const bgImage = assetManager.getImage(
      this.backgrounds[this.currentDimension - 1]
    );
    if (bgImage) {
      this.ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Fallback background color
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw game objects
    this.player.render(this.ctx);
    this.obstacles.forEach((obstacle) => obstacle.render(this.ctx));
    this.powerups.forEach((powerup) => powerup.render(this.ctx));

    // Draw score
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "24px Arial";
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 20, 40);
  }
}

// Initialize game when window loads
window.addEventListener("load", async () => {
  // Load assets first
  await assetManager.loadAssets();
  new Game();
});
