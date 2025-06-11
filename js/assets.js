class AssetManager {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.loaded = false;
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.loadPromises = [];
  }

  // Load all game assets
  async loadAssets() {
    const assets = {
      images: {
        player: "assets/player.png",
        obstacle: "assets/obstacle.png",
        crystal: "assets/crystal.png",
        portal: "assets/portal.png",
        background1: "assets/background1.png",
        background2: "assets/background2.png",
        background3: "assets/background3.png",
      },
      sounds: {
        jump: "assets/jump.mp3",
        collect: "assets/collect.mp3",
        portal: "assets/portal.mp3",
        gameOver: "assets/gameover.mp3",
      },
    };

    this.totalAssets =
      Object.keys(assets.images).length + Object.keys(assets.sounds).length;

    // Load images
    for (const [key, src] of Object.entries(assets.images)) {
      const promise = loadImage(src)
        .then((img) => {
          this.images[key] = img;
          this.loadedAssets++;
          console.log(`Loaded image: ${key}`);
        })
        .catch((error) => {
          console.error(`Failed to load image: ${src}`, error);
          // Create a fallback colored rectangle
          const canvas = document.createElement("canvas");
          canvas.width = 40;
          canvas.height = 40;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = key.includes("background") ? "#000" : "#4CAF50";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          this.images[key] = canvas;
          this.loadedAssets++;
        });
      this.loadPromises.push(promise);
    }

    // Load sounds
    for (const [key, src] of Object.entries(assets.sounds)) {
      try {
        const audio = new Audio();
        audio.src = src;
        audio.preload = "auto";

        // Create a promise that resolves when the audio is loaded
        const promise = new Promise((resolve, reject) => {
          audio.addEventListener(
            "canplaythrough",
            () => {
              this.sounds[key] = audio;
              this.loadedAssets++;
              console.log(`Loaded sound: ${key}`);
              resolve();
            },
            { once: true }
          );

          audio.addEventListener(
            "error",
            () => {
              console.error(`Failed to load sound: ${src}`);
              this.loadedAssets++;
              resolve(); // Resolve anyway to not block loading
            },
            { once: true }
          );
        });

        this.loadPromises.push(promise);
      } catch (error) {
        console.error(`Failed to initialize sound: ${src}`, error);
        this.loadedAssets++;
      }
    }

    // Wait for all assets to load
    await Promise.all(this.loadPromises);
    this.loaded = this.loadedAssets === this.totalAssets;
    console.log(
      `Asset loading complete. Loaded ${this.loadedAssets}/${this.totalAssets} assets.`
    );
    return this.loaded;
  }

  // Get an image by key
  getImage(key) {
    return this.images[key];
  }

  // Play a sound by key
  playSound(key) {
    const sound = this.sounds[key];
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const soundClone = sound.cloneNode();
      soundClone.volume = 0.5; // Set volume to 50%
      soundClone.play().catch((error) => {
        console.error(`Failed to play sound: ${key}`, error);
      });
    }
  }

  // Get loading progress
  getProgress() {
    return this.totalAssets > 0
      ? (this.loadedAssets / this.totalAssets) * 100
      : 0;
  }
}

// Create a global asset manager instance
const assetManager = new AssetManager();
