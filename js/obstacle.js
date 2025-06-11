class Obstacle {
  constructor(canvasWidth, canvasHeight) {
    this.width = 30;
    this.height = Math.random() * 100 + 50; // Random height between 50 and 150
    this.x = canvasWidth;
    this.y = Math.random() * (canvasHeight - this.height);
    this.speed = 0; // Will be set by game speed

    // Load obstacle image
    this.image = new Image();
    this.image.src = "assets/obstacle.png";
  }

  update(deltaTime, gameSpeed) {
    this.x -= gameSpeed;
  }

  render(ctx) {
    // Draw obstacle
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback rectangle if image isn't loaded
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
