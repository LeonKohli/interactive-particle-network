// Starry background with connecting constellations
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Default options
const defaultOptions = {
  numberOfStars: 300,
  maxDistance: 70,
  starSize: { min: 1, max: 5 },
  speedFactor: 1,
  mouseRadius: 200,
  starColor: "#fff",
  connectionColor: "rgba(255, 255, 255, ${opacity})",
  canvasBackgroundColor: "#000",
  lineThickness: 1,
  starShapes: ["circle", "star"],
  randomStarSpeeds: true,
  rotationSpeed: { min: 0.001, max: 0.003 },
  connectionsWhenNoMouse: false,
  percentStarsConnecting: 10, // percentage of stars that can connect when mouse is not on canvas
  connectionLinesDashed: false, // option to make connection lines dashed
  dashedLinesConfig: [5, 15], // configuration for dashed lines
  canvasGradient: null, // gradient for canvas background
  starDensity: "medium", // Options: 'low', 'medium', 'high', 'ultra'
  interactive: false, // If true the user can add stars by clicking on the canvas
};

const userOptions = {};
// Star densities corresponding to 'low', 'medium', 'high', and 'ultra'
const starDensities = {
  low: 0.00005,
  medium: 0.0001,
  high: 0.0002,
  ultra: 0.0004,
};

// Merge user options with default options
const options = { ...defaultOptions, ...userOptions };

// Size of a cell in the hashmap
const CELL_SIZE = options.maxDistance;
// The hashmap
let cells = {};

window.addEventListener("resize", function () {
  stars.length = 0; // Clear the existing stars
  cells = {}; // Clear the existing cells
  resizeCanvas();
  createStars(); // Create new stars according to the new screen size
});

const stars = [];
const mouse = { x: null, y: null };

window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousemove", function (event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // setup gradient if defined
  if (options.canvasGradient) {
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    options.canvasGradient.forEach((color, index) => {
      gradient.addColorStop(index / (options.canvasGradient.length - 1), color);
    });
    canvas.style.background = gradient;
  } else {
    canvas.style.background = options.canvasBackgroundColor;
  }
}

function Star(x, y) {
  this.x = x;
  this.y = y;
  this.size =
    Math.random() * (options.starSize.max - options.starSize.min) +
    options.starSize.min;
  this.shape =
    options.starShapes[Math.floor(Math.random() * options.starShapes.length)];
  this.speedX =
    (Math.random() - 0.5) *
    (options.randomStarSpeeds ? options.speedFactor : 1);
  this.speedY =
    (Math.random() - 0.5) *
    (options.randomStarSpeeds ? options.speedFactor : 1);
  this.rotation = 0;
  this.rotationSpeed =
    Math.random() * (options.rotationSpeed.max - options.rotationSpeed.min) +
    options.rotationSpeed.min;
  this.connects =
    options.connectionsWhenNoMouse &&
    Math.random() < options.percentStarsConnecting / 100;
}

Star.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = options.starColor;
  switch (this.shape) {
    case "circle":
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      break;
    case "star":
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      // Five-point star shape
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(0, -this.size / 2);
        ctx.translate(0, -this.size / 2);
        ctx.rotate((Math.PI * 2) / 10);
        ctx.lineTo(0, -this.size / 2);
        ctx.translate(0, -this.size / 2);
        ctx.rotate(-((Math.PI * 6) / 10));
      }
      ctx.lineTo(0, -this.size / 2);
      ctx.restore();
      break;
    // More shapes can be added here
  }
  ctx.closePath();
  ctx.fill();
};

function animateStars() {
  if (options.canvasGradient) {
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    options.canvasGradient.forEach((color, index) => {
      gradient.addColorStop(index / (options.canvasGradient.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  stars.forEach((star) => {
    star.x += star.speedX;
    star.y += star.speedY;
    if (star.shape === "star") star.rotation += star.rotationSpeed;
    if (star.x > canvas.width || star.x < 0) {
      star.speedX = -star.speedX;
    }
    if (star.y > canvas.height || star.y < 0) {
      star.speedY = -star.speedY;
    }
    star.draw();

    let cellX = Math.floor(star.x / CELL_SIZE);
    let cellY = Math.floor(star.y / CELL_SIZE);
    // Check distances with stars in the same cell and neighboring cells
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let neighbourCellX = cellX + i;
        let neighbourCellY = cellY + j;
        // If this cell exists...
        if (cells[neighbourCellX] && cells[neighbourCellX][neighbourCellY]) {
          // ...check distances with its stars
          cells[neighbourCellX][neighbourCellY].forEach((otherStar) => {
            let dx = star.x - otherStar.x;
            let dy = star.y - otherStar.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let mouseDx = star.x - mouse.x;
            let mouseDy = star.y - mouse.y;
            let mouseDistance = Math.sqrt(
              mouseDx * mouseDx + mouseDy * mouseDy
            );
            if (
              distance < options.maxDistance &&
              (mouseDistance < options.mouseRadius ||
                (star.connects && otherStar.connects))
            ) {
              ctx.beginPath();
              ctx.moveTo(star.x, star.y);
              ctx.lineTo(otherStar.x, otherStar.y);
              const opacity =
                (options.maxDistance - distance) / options.maxDistance;
              ctx.lineWidth = options.lineThickness;
              ctx.strokeStyle = options.connectionColor.replace(
                "${opacity}",
                opacity
              );
              if (options.connectionLinesDashed) {
                ctx.setLineDash(options.dashedLinesConfig);
              } else {
                ctx.setLineDash([]);
              }
              ctx.stroke();
            }
          });
        }
      }
    }
  });
  requestAnimationFrame(animateStars);
}

function createStars() {
  resizeCanvas();
  const numberOfStars =
    starDensities[options.starDensity] * canvas.width * canvas.height;
  for (let i = 0; i < numberOfStars; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let star = new Star(x, y);
    stars.push(star);
    // Determine which cell this star belongs to
    let cellX = Math.floor(x / CELL_SIZE);
    let cellY = Math.floor(y / CELL_SIZE);
    // If the cell doesn't exist yet, create it
    if (!cells[cellX]) {
      cells[cellX] = {};
    }
    if (!cells[cellX][cellY]) {
      cells[cellX][cellY] = [];
    }
    // Add the star to the cell
    cells[cellX][cellY].push(star);
  }
}

window.addEventListener("click", function (event) {
  if (!options.interactive) return;
  const x = event.x;
  const y = event.y;
  const star = new Star(x, y);
  stars.push(star);
});

createStars();
animateStars();
