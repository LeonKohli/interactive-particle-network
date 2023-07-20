// Starry background with connecting constellations
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stars = [];
const mouse = { x: null, y: null };
const numberOfStars = 300;
const maxDistance = 70;

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function Star(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
}

Star.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.x += star.speedX;
        star.y += star.speedY;
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
            if (distance < maxDistance && mouseDistance < 200) {
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(otherStar.x, otherStar.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${(maxDistance - distance) / maxDistance})`;
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animateStars);
}

function createStars() {
    resizeCanvas();
    for (let i = 0; i < numberOfStars; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        stars.push(new Star(x, y));
    }
}

createStars();
animateStars();