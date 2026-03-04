const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 400;
const TILE_COUNT = 20;
const TILE_SIZE = CANVAS_SIZE / TILE_COUNT;
const GAME_SPEED = 10; // Updates per second

// Game State
let headX = 10;
let headY = 10;
let velocityX = 0;
let velocityY = 0;

let trail = [];
let tailLength = 2;

let appleX = 5;
let appleY = 5;

let score = 0;

// Input buffering to prevent "suicide bug"
let lastVelocityX = 0;
let lastVelocityY = 0;

let lastTime = 0;

function gameLoop(currentTime) {
    window.requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastTime) / 1000;
    if (secondsSinceLastRender < 1 / GAME_SPEED) return;

    lastTime = currentTime;

    update();
    draw();
}

function update() {
    // Move the player
    headX += velocityX;
    headY += velocityY;

    // Update last processed velocity
    lastVelocityX = velocityX;
    lastVelocityY = velocityY;

    // Wall Wrapping
    if (headX < 0) headX = TILE_COUNT - 1;
    if (headX >= TILE_COUNT) headX = 0;
    if (headY < 0) headY = TILE_COUNT - 1;
    if (headY >= TILE_COUNT) headY = 0;

    // Check Body Collision
    for (let part of trail) {
        if (part.x === headX && part.y === headY) {
            resetGame();
            return;
        }
    }

    // Update Trail
    trail.push({ x: headX, y: headY });
    while (trail.length > tailLength) {
        trail.shift();
    }

    // Check Apple Collision
    if (headX === appleX && headY === appleY) {
        tailLength++;
        score++;
        document.getElementById('score').innerText = "Score: " + score;
        spawnApple();
    }
}

function spawnApple() {
    // Simple random spawn - in a full game we might check if it's on the snake
    appleX = Math.floor(Math.random() * TILE_COUNT);
    appleY = Math.floor(Math.random() * TILE_COUNT);
}

function draw() {
    // Clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    ctx.fillStyle = 'lime';
    for (let part of trail) {
        ctx.fillRect(part.x * TILE_SIZE, part.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    // Draw Apple
    ctx.fillStyle = 'red';
    ctx.fillRect(appleX * TILE_SIZE, appleY * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
}

function resetGame() {
    headX = 10;
    headY = 10;
    velocityX = 0;
    velocityY = 0;
    trail = [];
    tailLength = 2;
    score = 0;
    document.getElementById('score').innerText = "Score: " + score;
    spawnApple();
    lastVelocityX = 0;
    lastVelocityY = 0;
}

function keyDown(event) {
    // Up
    if (event.keyCode === 38) {
        if (lastVelocityY === 1) return;
        velocityX = 0;
        velocityY = -1;
    }
    // Down
    if (event.keyCode === 40) {
        if (lastVelocityY === -1) return;
        velocityX = 0;
        velocityY = 1;
    }
    // Left
    if (event.keyCode === 37) {
        if (lastVelocityX === 1) return;
        velocityX = -1;
        velocityY = 0;
    }
    // Right
    if (event.keyCode === 39) {
        if (lastVelocityX === -1) return;
        velocityX = 1;
        velocityY = 0;
    }
}

document.addEventListener('keydown', keyDown);

// Start game
gameLoop(0);
