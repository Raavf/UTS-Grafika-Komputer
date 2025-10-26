const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const gridSize = 20;
const gridWidth = W / gridSize;
const gridHeight = H / gridSize;

const menu = document.getElementById('menu');
const container = document.getElementById('container');
const scoresDiv = document.getElementById('scores');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const score2Wrapper = document.getElementById('score2Display');

const gameOverScreen = document.getElementById('gameOverScreen');
const finalScores = document.getElementById('finalScores');
const restartButton = document.getElementById('restartButton');
const countdownDiv = document.getElementById('countdown');

let mode = 'single'; // 'single' atau 'two'

let snake1 = [];
let direction1 = 'right';
let nextDirection1 = 'right';
let score1 = 0;
let alive1 = true;

let snake2 = [];
let direction2 = 'left';
let nextDirection2 = 'left';
let score2 = 0;
let alive2 = true;

let food = null;
let gameRunning = false;

function initGame() {
  snake1 = [
    {x: 5, y: 10},
    {x: 4, y: 10},
    {x: 3, y: 10}
  ];
  direction1 = 'right';
  nextDirection1 = 'right';
  score1 = 0;
  alive1 = true;

  if (mode === 'two') {
    snake2 = [
      {x: gridWidth - 6, y: 10},
      {x: gridWidth - 5, y: 10},
      {x: gridWidth - 4, y: 10}
    ];
    direction2 = 'left';
    nextDirection2 = 'left';
    score2 = 0;
    alive2 = true;
  } else {
    snake2 = [];
    alive2 = false;
    score2 = 0;
  }

  spawnFood();
  gameOverScreen.style.display = 'none';
  updateScores();
}

function spawnFood() {
  while(true) {
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    if(
      !snake1.some(s => s.x === x && s.y === y) &&
      !snake2.some(s => s.x === x && s.y === y)
    ) {
      food = {x, y};
      break;
    }
  }
}

function drawRect(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * gridSize, y * gridSize, gridSize-1, gridSize-1);
}

function updateSnake(snake, direction, nextDirection, alive) {
  if(!alive) return {snake, direction, alive, ateFood: false};

  direction = nextDirection;
  let head = {...snake[0]};

  switch(direction) {
    case 'right': head.x++; break;
    case 'left': head.x--; break;
    case 'up': head.y--; break;
    case 'down': head.y++; break;
  }

  // Cek tembok dan diri sendiri
  if(head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    alive = false;
    return {snake, direction, alive, ateFood: false};
  }

  if(snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    alive = false;
    return {snake, direction, alive, ateFood: false};
  }

  snake.unshift(head);

  let ateFood = (head.x === food.x && head.y === food.y);
  if(!ateFood) snake.pop();

  return {snake, direction, alive, ateFood};
}

function updateScores() {
  score1Display.textContent = score1;
  score2Display.textContent = score2;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if(food) drawRect(food.x, food.y, '#f00');

  snake1.forEach((seg, i) => {
    drawRect(seg.x, seg.y, i === 0 ? '#0f0' : '#0a0');
  });

  if (mode === 'two') {
    snake2.forEach((seg, i) => {
      drawRect(seg.x, seg.y, i === 0 ? '#00f' : '#005');
    });
  }
}

function endGame() {
  gameRunning = false;
  gameOverScreen.style.display = 'block';
  finalScores.innerHTML = `Skor Pemain 1: ${score1} <br> Skor Pemain 2: ${mode === 'two' ? score2 : 0}`;
}

function gameLoop() {
  if(!gameRunning) return;

  if(alive1 || (mode === 'two' && alive2)) {
    let res1 = updateSnake(snake1, direction1, nextDirection1, alive1);
    snake1 = res1.snake;
    direction1 = res1.direction;
    alive1 = res1.alive;
    if(res1.ateFood) {
      score1++;
      spawnFood();
      updateScores();
    }

    if (mode === 'two') {
      let res2 = updateSnake(snake2, direction2, nextDirection2, alive2);
      snake2 = res2.snake;
      direction2 = res2.direction;
      alive2 = res2.alive;
      if(res2.ateFood) {
        score2++;
        spawnFood();
        updateScores();
      }
    }

    draw();
    setTimeout(gameLoop, 100);
  } else {
    endGame();
  }
}

function startCountdown(callback) {
  countdownDiv.style.display = 'block';
  let count = 3;
  countdownDiv.textContent = count;

  let interval = setInterval(() => {
    count--;
    if(count > 0) {
      countdownDiv.textContent = count;
    } else {
      clearInterval(interval);
      countdownDiv.style.display = 'none';
      callback();
    }
  }, 1000);
}

restartButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startCountdown(() => {
    initGame();
    gameRunning = true;
    gameLoop();
  });
});

document.getElementById('btnSingle').addEventListener('click', () => {
  mode = 'single';
  menu.style.display = 'none';
  container.style.display = 'block';
  scoresDiv.style.display = 'flex';
  score2Wrapper.style.display = 'none';

  startCountdown(() => {
    initGame();
    gameRunning = true;
    gameLoop();
  });
});

document.getElementById('btnTwo').addEventListener('click', () => {
  mode = 'two';
  menu.style.display = 'none';
  container.style.display = 'block';
  scoresDiv.style.display = 'flex';
  score2Wrapper.style.display = 'block';

  startCountdown(() => {
    initGame();
    gameRunning = true;
    gameLoop();
  });
});

window.addEventListener('keydown', e => {
  if(!gameRunning) return;
  switch(e.key.toLowerCase()) {
    case 'w': if(direction1 !== 'down') nextDirection1 = 'up'; break;
    case 's': if(direction1 !== 'up') nextDirection1 = 'down'; break;
    case 'a': if(direction1 !== 'right') nextDirection1 = 'left'; break;
    case 'd': if(direction1 !== 'left') nextDirection1 = 'right'; break;
    case 'arrowup': if(mode==='two' && direction2 !== 'down') nextDirection2 = 'up'; break;
    case 'arrowdown': if(mode==='two' && direction2 !== 'up') nextDirection2 = 'down'; break;
    case 'arrowleft': if(mode==='two' && direction2 !== 'right') nextDirection2 = 'left'; break;
    case 'arrowright': if(mode==='two' && direction2 !== 'left') nextDirection2 = 'right'; break;
  }
});