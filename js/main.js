class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();

    this.player = null;
    this.obstacles = [];
    this.powerups = [];
    this.score = 0;
    this.gameSpeed = 5;
    this.isGameOver = false;
    this.isPlaying = false;
    this.currentDimension = 1;
    this.backgrounds = ["background1", "background2", "background3"];
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastFrameTime = 0;

    this.settings = {
      soundEnabled: true,
      difficulty: "normal",
      particleEffects: true,
    };
    this.loadSettings();
    this.highScore = this.getHighScoreForDifficulty();

    this.setupEventListeners();
    this.setupScreens();
    this.setupSettingsToggle();
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
    document
      .getElementById("return-menu-button")
      .addEventListener("click", () => this.returnToMenu());
  }

  setupScreens() {
    this.startScreen = document.getElementById("start-screen");
    this.gameOverScreen = document.getElementById("game-over-screen");
  }

  setupSettingsToggle() {
    const settingsToggle = document.getElementById("settings-toggle");
    const settingsContainer = document.getElementById("settings-container");
    const gameTitle = document.getElementById("game-title");
    const startButton = document.getElementById("start-button");

    // Initialize settings container state
    settingsContainer.classList.remove("visible");

    settingsToggle.addEventListener("click", () => {
      const isVisible = settingsContainer.classList.contains("visible");
      if (isVisible) {
        settingsContainer.classList.remove("visible");
        settingsToggle.innerHTML =
          '<span class="settings-icon">⚙️</span>Settings';
        gameTitle.style.display = "";
        startButton.style.display = "";
      } else {
        settingsContainer.classList.add("visible");
        settingsToggle.innerHTML =
          '<span class="settings-icon">⚙️</span>Hide Settings';
        gameTitle.style.display = "none";
        startButton.style.display = "none";
      }
    });
  }

  getHighScoreKey() {
    return `highScore_${this.settings.difficulty}`;
  }

  getHighScoreForDifficulty() {
    return parseFloat(localStorage.getItem(this.getHighScoreKey())) || 0;
  }

  setHighScoreForDifficulty(score) {
    localStorage.setItem(this.getHighScoreKey(), score);
  }

  loadSettings() {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }

    // Update UI to match loaded settings
    document.getElementById("sound-toggle").checked =
      this.settings.soundEnabled;
    document.getElementById("difficulty").value = this.settings.difficulty;
    document.getElementById("particle-effects").checked =
      this.settings.particleEffects;

    // Add event listeners for settings changes
    document.getElementById("sound-toggle").addEventListener("change", (e) => {
      this.settings.soundEnabled = e.target.checked;
      this.saveSettings();
    });

    document.getElementById("difficulty").addEventListener("change", (e) => {
      this.settings.difficulty = e.target.value;
      this.saveSettings();
      this.highScore = this.getHighScoreForDifficulty();
      // Update high score display if on game over screen
      if (
        this.gameOverScreen &&
        !this.gameOverScreen.classList.contains("hidden")
      ) {
        document.getElementById("high-score").textContent = Math.floor(
          this.highScore
        );
      }
    });

    document
      .getElementById("particle-effects")
      .addEventListener("change", (e) => {
        this.settings.particleEffects = e.target.checked;
        this.saveSettings();
      });
  }

  saveSettings() {
    localStorage.setItem("gameSettings", JSON.stringify(this.settings));
  }

  handleInput(isPressed) {
    if (this.player && this.isPlaying) {
      this.player.setFlying(isPressed);
      if (isPressed && this.settings.soundEnabled) {
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
    this.gameSpeed = this.getInitialGameSpeed();
    this.currentDimension = 1;
    this.highScore = this.getHighScoreForDifficulty();

    // Initialize game objects
    this.player = new Player(this.canvas.width / 4, this.canvas.height / 2);
    this.obstacles = [];
    this.powerups = [];

    // Start game loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  restartGame() {
    this.startGame();
  }

  returnToMenu() {
    this.gameOverScreen.classList.add("hidden");
    this.startScreen.classList.remove("hidden");
  }

  gameLoop(timestamp) {
    if (!this.isPlaying) return;

    // Calculate time since last frame
    const elapsed = timestamp - this.lastFrameTime;

    // Only update if enough time has passed
    if (elapsed > this.frameInterval) {
      const deltaTime = this.frameInterval; // Use fixed delta time for consistent speed
      this.lastFrameTime = timestamp - (elapsed % this.frameInterval);

      this.update(deltaTime);
      this.render();
    }

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
    // Adjust gameSpeed based on difficulty
    if (this.settings.difficulty === "easy") {
      this.gameSpeed = 3 + Math.floor(this.score / 1500);
    } else if (this.settings.difficulty === "hard") {
      this.gameSpeed = 7 + Math.floor(this.score / 700);
    } else {
      this.gameSpeed = 5 + Math.floor(this.score / 1000);
    }
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
    // Update high score for current difficulty
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.setHighScoreForDifficulty(this.highScore);
    }
    if (this.settings.soundEnabled) {
      assetManager.playSound("gameOver");
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

  getInitialGameSpeed() {
    switch (this.settings.difficulty) {
      case "easy":
        return 3;
      case "hard":
        return 7;
      default:
        return 5;
    }
  }
}

// Initialize game when window loads
window.addEventListener("load", async () => {
  // Load assets first
  await assetManager.loadAssets();
  new Game();
});
