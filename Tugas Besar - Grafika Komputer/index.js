const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const trackWidth = 500;
const trackCenterX = W / 2;
const laneLeft = trackCenterX - trackWidth / 2;
const laneRight = trackCenterX + trackWidth / 2;

const trackStripHeight = 60;
let trackStrip = ctx.createImageData(W, trackStripHeight);

function setPixel(imgData, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= W || y >= imgData.height) return;
  let idx = (y * W + x) * 4;
  imgData.data[idx] = r;
  imgData.data[idx + 1] = g;
  imgData.data[idx + 2] = b;
  imgData.data[idx + 3] = a;
}

function generateTrackStrip() {
  for (let y = 0; y < trackStripHeight; y++) {
    for (let x = 0; x < W; x++) {
      if (x >= laneLeft && x <= laneRight) setPixel(trackStrip, x, y, 255, 255, 255);
      else setPixel(trackStrip, x, y, 0, 0, 0);
    }
  }
}
generateTrackStrip();

const kongWidth = 40;
const kongHeight = 40;
let kingkong = {
  x: trackCenterX,
  y: H - 100,
  speedX: 0,
  maxSpeedX: 7,
  accelerationX: 1.2,
  frictionX: 0.8
};

const keys = { left: false, right: false };
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

function updateKingkong() {
  if (keys.left) kingkong.speedX -= kingkong.accelerationX;
  if (keys.right) kingkong.speedX += kingkong.accelerationX;

  kingkong.speedX *= kingkong.frictionX;
  if (kingkong.speedX > kingkong.maxSpeedX) kingkong.speedX = kingkong.maxSpeedX;
  if (kingkong.speedX < -kingkong.maxSpeedX) kingkong.speedX = -kingkong.maxSpeedX;

  kingkong.x += kingkong.speedX;

  let minX = laneLeft + kongWidth / 2;
  let maxX = laneRight - kongWidth / 2;
  if (kingkong.x < minX) {
    kingkong.x = minX;
    kingkong.speedX = 0;
  }
  if (kingkong.x > maxX) {
    kingkong.x = maxX;
    kingkong.speedX = 0;
  }
}

const OBSTACLE_TYPES = ['barrel', 'rock'];
const ITEM_TYPE = 'banana';

class ObjectEntity {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
  }

  update() {
    this.y += 5;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case 'barrel': drawBarrel(0, 0); break;
      case 'rock': drawRock(0, 0); break;
      case 'banana': drawBanana(0, 0); break;
    }

    ctx.restore();
  }

  isColliding(kong) {
    let dx = Math.abs(this.x - kong.x);
    let dy = Math.abs(this.y - kong.y);
    return dx < (this.width / 2 + kongWidth / 2) && dy < (this.height / 2 + kongHeight / 2);
  }
}

function drawBarrel(x, y) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x - 12, y - 15, 24, 30);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 10);
  ctx.lineTo(x + 12, y - 10);
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x + 12, y);
  ctx.moveTo(x - 12, y + 10);
  ctx.lineTo(x + 12, y + 10);
  ctx.stroke();
}

function drawRock(x, y) {
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 15, 10, Math.PI / 4, 0, 2 * Math.PI);
  ctx.fill();
}

function drawBanana(x, y) {
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.quadraticCurveTo(x, y - 15, x + 10, y);
  ctx.quadraticCurveTo(x, y + 8, x - 10, y);
  ctx.fill();
  ctx.strokeStyle = '#996600';
  ctx.stroke();
}

function drawKingkong(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-7, -5, 3, 0, Math.PI * 2);
  ctx.arc(7, -5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

let objects = [];
let spawnTimer = 0;
let score = 0;
let isGameOver = false;
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');
const scoreDisplay = document.getElementById('scoreDisplay');

function spawnObjects() {
  if (spawnTimer <= 0) {
    let rand = Math.random();
    let xPos = laneLeft + 15 + Math.random() * (trackWidth - 30);
    if (rand < 0.6) {
      let type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      objects.push(new ObjectEntity(type, xPos, -40));
    } else {
      objects.push(new ObjectEntity(ITEM_TYPE, xPos, -40));
    }
    spawnTimer = 40 + Math.random() * 50;
  } else {
    spawnTimer--;
  }
}

function updateObjects() {
  objects.forEach(o => o.update());
  objects = objects.filter(o => o.y < H + 40);
}

function checkCollision() {
  for (let i = 0; i < objects.length; i++) {
    let o = objects[i];
    if (o.isColliding(kingkong)) {
      if (o.type === ITEM_TYPE) {
        score += 10;
        objects.splice(i, 1);
        i--;
      } else {
        isGameOver = true;
        finalScore.textContent = 'Skor akhir: ' + score;
        gameOverScreen.style.display = 'block';
        break;
      }
    }
  }
}

let scrollY = 0;
function drawTrack() {
  let yOffset = scrollY % trackStripHeight;
  for (let y = -yOffset; y < H; y += trackStripHeight) {
    ctx.putImageData(trackStrip, 0, y);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawTrack();

  if (!isGameOver) {
    spawnObjects();
    updateObjects();
    checkCollision();
    updateKingkong();
    scoreDisplay.textContent = 'Skor: ' + score;
  }

  drawKingkong(kingkong.x, kingkong.y);
  objects.forEach(o => o.draw());
  scrollY += 5;

  if (!isGameOver) requestAnimationFrame(gameLoop);
}

function restartGame() {
  isGameOver = false;
  objects = [];
  kingkong.x = trackCenterX;
  kingkong.speedX = 0;
  scrollY = 0;
  score = 0;
  gameOverScreen.style.display = 'none';
  scoreDisplay.textContent = 'Skor: 0';
  gameLoop();
}

restartButton.addEventListener('click', restartGame);
gameLoop();
