// Starry background with connecting constellations
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Default options
const defaultOptions = {
    numberOfStars: 300,
    maxDistance: 70,
    starSize: { min: 1, max: 5 },
    speedFactor: 2,
    mouseRadius: 200,
    starColor: '#fff',
    connectionColor: 'rgba(255, 255, 255, ${opacity})',
    canvasBackgroundColor: '#000',
    lineThickness: 1,
    starShapes: ['circle', 'star'],
    randomStarSpeeds: true,
    rotationSpeed: { min: 0.001, max: 0.003 },
    connectionsWhenNoMouse: false,
    percentStarsConnecting: 10, // percentage of stars that can connect when mouse is not on canvas
    connectionLinesDashed: false, // option to make connection lines dashed
    dashedLinesConfig: [5, 15], // configuration for dashed lines
    canvasGradient: null, // gradient for canvas background
    starDensity: 'medium', // Options: 'low', 'medium', 'high', 'ultra'
    interactive: false, // If true the user can add stars by clicking on the canvas
};

const userOptions = {
}

// Star densities corresponding to 'low', 'medium', 'high', and 'ultra'
const starDensities = {
    'low': 0.00005,
    'medium': 0.0001,
    'high': 0.0002,
    'ultra': 0.0004,
};



// Merge user options with default options
const options = { ...defaultOptions, ...userOptions };

window.addEventListener('resize', function() {
    stars.length = 0; // Clear the existing stars
    resizeCanvas();
    createStars(); // Create new stars according to the new screen size
});

const stars = [];
const mouse = { x: null, y: null };

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // setup gradient if defined
    if (options.canvasGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
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
    this.size = Math.random() * (options.starSize.max - options.starSize.min) + options.starSize.min;
    this.shape = options.starShapes[Math.floor(Math.random() * options.starShapes.length)];
    this.speedX = (Math.random() - 0.5) * (options.randomStarSpeeds ? options.speedFactor : 1);
    this.speedY = (Math.random() - 0.5) * (options.randomStarSpeeds ? options.speedFactor : 1);
    this.rotation = 0;
    this.rotationSpeed = Math.random() * (options.rotationSpeed.max - options.rotationSpeed.min) + options.rotationSpeed.min;
    this.connects = options.connectionsWhenNoMouse && Math.random() < options.percentStarsConnecting / 100;
}

Star.prototype.draw = function () {
    ctx.beginPath();
    ctx.fillStyle = options.starColor;
    switch (this.shape) {
        case 'circle':
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            break;
        case 'star':
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            // Five-point star shape
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(0, -this.size / 2);
                ctx.translate(0, -this.size / 2);
                ctx.rotate((Math.PI * 2 / 10));
                ctx.lineTo(0, -this.size / 2);
                ctx.translate(0, -this.size / 2);
                ctx.rotate(-(Math.PI * 6 / 10));
            }
            ctx.lineTo(0, -this.size / 2);
            ctx.restore();
            break;
        // More shapes can be added here
    }
    ctx.closePath();
    ctx.fill();
}

function animateStars() {
    // Fill the entire canvas with the gradient
    if (options.canvasGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        options.canvasGradient.forEach((color, index) => {
            gradient.addColorStop(index / (options.canvasGradient.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    stars.forEach(star => {
        star.x += star.speedX;
        star.y += star.speedY;
        if (star.shape === 'star') star.rotation += star.rotationSpeed;
        if (star.x > canvas.width || star.x < 0) {
            star.speedX = -star.speedX;
        }
        if (star.y > canvas.height || star.y < 0) {
            star.speedY = -star.speedY;
        }
        star.draw();
        // draw lines between nearby stars
        stars.forEach(otherStar => {
            let dx = star.x - otherStar.x;
            let dy = star.y - otherStar.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let mouseDx = star.x - mouse.x;
            let mouseDy = star.y - mouse.y;
            let mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            if (distance < options.maxDistance && (mouseDistance < options.mouseRadius || (star.connects && otherStar.connects))) {
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(otherStar.x, otherStar.y);
                const opacity = (options.maxDistance - distance) / options.maxDistance;
                ctx.lineWidth = options.lineThickness;
                ctx.strokeStyle = options.connectionColor.replace('${opacity}', opacity);
                if (options.connectionLinesDashed) {
                    ctx.setLineDash(options.dashedLinesConfig);
                } else {
                    ctx.setLineDash([]);
                }
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animateStars);
}


function createStars() {
    resizeCanvas();
    // Use the star density corresponding to the user's option
    const numberOfStars = starDensities[options.starDensity] * canvas.width * canvas.height;
    for (let i = 0; i < numberOfStars; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        stars.push(new Star(x, y));
    }
}

window.addEventListener('click', function(event) {
    if (!options.interactive) return;
    const x = event.x;
    const y = event.y;
    const star = new Star(x, y);
    stars.push(star);
});

createStars();
animateStars();
