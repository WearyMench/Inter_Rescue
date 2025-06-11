class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.velocity = 0;
    this.gravity = 0.5;
    this.jumpForce = -10;
    this.isFlying = false;

    // Load player image
    this.image = new Image();
    this.image.src = "assets/player.png";
  }

  update(deltaTime) {
    // Apply gravity
    if (!this.isFlying) {
      this.velocity += this.gravity;
    } else {
      this.velocity = this.jumpForce;
    }

    // Update position
    this.y += this.velocity;

    // Keep player within canvas bounds
    const canvas = document.getElementById("gameCanvas");
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.velocity = 0;
    }
  }

  setFlying(isFlying) {
    this.isFlying = isFlying;
  }

  checkCollision(object) {
    return (
      this.x < object.x + object.width &&
      this.x + this.width > object.x &&
      this.y < object.y + object.height &&
      this.y + this.height > object.y
    );
  }

  render(ctx) {
    // Draw player
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback rectangle if image isn't loaded
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
