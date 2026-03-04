const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// Sprites (1 = pixel, 0 = empty)
const SPRITE_PLAYER = [
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1]
];

const SPRITE_ALIEN_A = [
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1],
    [0,0,0,1,1,0,1,1,0,0,0]
];

const SPRITE_ALIEN_B = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,0,0,1,0,0],
    [0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,1]
];

const PIXEL_SIZE = 3;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let lives = 3; // Optional implementation
let frameCount = 0;

// Player
let player = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    width: SPRITE_PLAYER[0].length * PIXEL_SIZE,
    height: SPRITE_PLAYER.length * PIXEL_SIZE,
    speed: 5,
    dx: 0,
    cooldown: 0
};

// Bullets
let bullets = [];
let alienBullets = [];

// Aliens
let aliens = [];
let alienDirection = 1; // 1 = Right, -1 = Left
let alienSpeed = 1;
let alienDropDistance = 10;

// Input
let keys = {};

// Helper: Draw Sprite
function drawSprite(ctx, sprite, x, y, color) {
    ctx.fillStyle = color;
    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            if (sprite[r][c] === 1) {
                ctx.fillRect(x + c * PIXEL_SIZE, y + r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }
}

// Initialization
function initGame() {
    score = 0;
    aliens = [];
    bullets = [];
    alienBullets = [];
    alienSpeed = 1;
    player.x = CANVAS_WIDTH / 2;
    
    // Create Grid of Aliens
    const rows = 4;
    const cols = 8;
    const startX = 50;
    const startY = 50;
    const padding = 15;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let sprite = (r % 2 === 0) ? SPRITE_ALIEN_A : SPRITE_ALIEN_B;
            aliens.push({
                x: startX + c * (sprite[0].length * PIXEL_SIZE + padding),
                y: startY + r * (sprite.length * PIXEL_SIZE + padding),
                sprite: sprite,
                width: sprite[0].length * PIXEL_SIZE,
                height: sprite.length * PIXEL_SIZE,
                alive: true
            });
        }
    }
    
    gameState = 'PLAYING';
    document.getElementById('message').innerText = "";
    document.getElementById('score').innerText = "Score: " + score;
    gameLoop();
}

// Input Handling
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (gameState !== 'PLAYING' && e.code === 'Space') {
        initGame();
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    if (gameState !== 'PLAYING') return;

    // Player Movement
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    // Clamp Player
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;

    // Player Shooting
    if (player.cooldown > 0) player.cooldown--;
    if (keys['Space'] && player.cooldown === 0) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        player.cooldown = 20; // 20 frames cooldown
    }

    // Move Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }

    // Move Aliens
    let hitWall = false;
    let livingAliens = 0;
    
    aliens.forEach(alien => {
        if (!alien.alive) return;
        livingAliens++;
        alien.x += alienSpeed * alienDirection;
        if (alien.x <= 0 || alien.x + alien.width >= CANVAS_WIDTH) {
            hitWall = true;
        }
    });

    if (hitWall) {
        alienDirection *= -1;
        aliens.forEach(alien => {
            alien.y += alienDropDistance;
            if (alien.alive && alien.y + alien.height >= player.y) {
                gameOver();
            }
        });
        // Increase speed slightly
        alienSpeed += 0.2;
    }

    if (livingAliens === 0) {
        // Win Level - simplified: restart with faster speed? Or just Win.
        // Let's restart with faster speed logic or just announce Win.
        // For simplicity: Win and restart.
        alert("You Saved Earth! Score: " + score);
        initGame(); 
        // Ideally we would loop levels, but let's keep it simple as per plan.
        return; 
    }

    // Collision Detection
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        let hit = false;
        for (let j = 0; j < aliens.length; j++) {
            let a = aliens[j];
            if (a.alive && 
                b.x < a.x + a.width &&
                b.x + b.width > a.x &&
                b.y < a.y + a.height &&
                b.y + b.height > a.y) {
                    a.alive = false;
                    hit = true;
                    score += 10;
                    document.getElementById('score').innerText = "Score: " + score;
                    break;
            }
        }
        if (hit) bullets.splice(i, 1);
    }

    // Alien Shooting (Random)
    if (Math.random() < 0.02 && livingAliens > 0) { // 2% chance per frame
        // Find a random living alien to shoot
        let living = aliens.filter(a => a.alive);
        if (living.length > 0) {
            let shooter = living[Math.floor(Math.random() * living.length)];
            alienBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10,
                speed: 4
            });
        }
    }

    // Move Alien Bullets
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        alienBullets[i].y += alienBullets[i].speed;
        
        // Hit Player?
        if (alienBullets[i].x < player.x + player.width &&
            alienBullets[i].x + alienBullets[i].width > player.x &&
            alienBullets[i].y < player.y + player.height &&
            alienBullets[i].y + alienBullets[i].height > player.y) {
                gameOver();
                return;
        }

        if (alienBullets[i].y > CANVAS_HEIGHT) alienBullets.splice(i, 1);
    }
}

function draw() {
    // Clear Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'START') {
        ctx.fillStyle = '#0f0';
        ctx.font = '20px Courier New';
        ctx.fillText("PRESS SPACE TO START", CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2);
        return;
    }
    
    if (gameState === 'GAMEOVER') {
        ctx.fillStyle = '#f00';
        ctx.font = '30px Courier New';
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2);
        ctx.font = '20px Courier New';
        ctx.fillText("Press Space to Restart", CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT / 2 + 40);
        return;
    }

    // Draw Player
    drawSprite(ctx, SPRITE_PLAYER, player.x, player.y, '#0f0');

    // Draw Aliens
    aliens.forEach(alien => {
        if (alien.alive) {
            // Simple animation: use frameCount to toggle sprite?
            // For now, static sprite, but we can animate later.
            drawSprite(ctx, alien.sprite, alien.x, alien.y, '#fff');
        }
    });

    // Draw Bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Draw Alien Bullets
    ctx.fillStyle = '#ff0000';
    alienBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function gameOver() {
    gameState = 'GAMEOVER';
    document.getElementById('message').innerText = "GAME OVER";
}

function gameLoop() {
    update();
    draw();
    if (gameState === 'PLAYING') {
        requestAnimationFrame(gameLoop);
    } else if (gameState === 'GAMEOVER') {
        // Keep drawing one frame to show Game Over text, but stop updating loop
        draw(); 
        // We still need to listen for Space to restart, which the keydown listener handles
        // but it calls initGame(), which calls gameLoop() again.
        // So we stop the loop here.
    }
}

// Initial Draw
draw();
