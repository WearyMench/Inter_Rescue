class Powerup {
  constructor(canvasWidth, canvasHeight) {
    this.width = 30;
    this.height = 30;
    this.x = canvasWidth;
    this.y = Math.random() * (canvasHeight - this.height);
    this.value = 10;
    this.collected = false;
    this.type = Math.random() < 0.2 ? "portal" : "crystal"; // 20% chance for portal

    // Load powerup images
    this.crystalImage = new Image();
    this.crystalImage.src = "assets/crystal.png";
    this.portalImage = new Image();
    this.portalImage.src = "assets/portal.png";
  }

  update(deltaTime, gameSpeed) {
    this.x -= gameSpeed;
  }

  render(ctx) {
    if (this.collected) return;

    // Draw powerup
    if (this.type === "crystal") {
      if (this.crystalImage.complete) {
        ctx.drawImage(
          this.crystalImage,
          this.x,
          this.y,
          this.width,
          this.height
        );
      } else {
        // Fallback shape if image isn't loaded
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      if (this.portalImage.complete) {
        ctx.drawImage(
          this.portalImage,
          this.x,
          this.y,
          this.width,
          this.height
        );
      } else {
        // Fallback shape if image isn't loaded
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}
