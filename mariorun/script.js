const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Game State
let gameState = 'PLAYING'; // PLAYING, GAMEOVER, WIN
let score = 0;
let lives = 3;

// Physics
const GRAVITY = 0.5;
const FRICTION = 0.8;

// Input
const keys = {
    right: false,
    left: false,
    up: false
};

// Camera
let cameraX = 0;

// Player Class
class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = 100;
        this.y = CANVAS_HEIGHT - 100;
        this.dx = 0;
        this.dy = 0;
        this.speed = 6;
        this.jumpPower = 15;
        this.grounded = false;
        this.color = 'red';
    }

    update() {
        // Apply Gravity
        this.dy += GRAVITY;

        // Movement
        if (keys.right) {
            this.dx = this.speed;
        } else if (keys.left) {
            this.dx = -this.speed;
        } else {
            this.dx *= FRICTION;
        }

        // Apply Velocity
        this.x += this.dx;
        this.y += this.dy;

        // Ground Collision (Simple floor)
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.dy = 0;
            this.grounded = true;
            
            // Death by falling (if we had pits, this logic would change)
            // But for now, let's say falling below canvas (pits) kills you.
            // Since we have a "floor" platform, we handle pits differently.
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        // Draw body
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        // Draw hat/details (simple)
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - cameraX, this.y + 20, this.width, 20); // Pants
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // normal, win
        this.color = type === 'win' ? '#FFD700' : '#8B4513';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        
        // Grass top
        if (this.type === 'normal') {
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x - cameraX, this.y, this.width, 10);
        }
    }
}

// Enemy Class (Goomba-like)
class Enemy {
    constructor(x, y, range) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 2;
        this.minX = x;
        this.maxX = x + range;
        this.direction = 1;
        this.alive = true;
    }

    update() {
        if (!this.alive) return;
        this.x += this.speed * this.direction;
        if (this.x > this.maxX || this.x < this.minX) {
            this.direction *= -1;
        }
    }

    draw() {
        if (!this.alive) return;
        ctx.fillStyle = '#8B0000'; // Dark Red
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x - cameraX + 5, this.y + 5, 10, 10);
        ctx.fillRect(this.x - cameraX + 25, this.y + 5, 10, 10);
    }
}

// Coin Class
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
    }

    draw() {
        if (this.collected) return;
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 10, this.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Level Setup
const player = new Player();
const platforms = [];
const enemies = [];
const coins = [];

function initLevel() {
    platforms.length = 0;
    enemies.length = 0;
    coins.length = 0;

    // --- ORIGINAL SECTION (0 - 2500) ---
    // Ground segments (with gaps)
    platforms.push(new Platform(0, 550, 800, 50));
    platforms.push(new Platform(900, 550, 600, 50));
    platforms.push(new Platform(1600, 550, 1000, 50));

    // Floating Platforms
    platforms.push(new Platform(300, 400, 150, 20));
    platforms.push(new Platform(500, 300, 150, 20));
    platforms.push(new Platform(1100, 400, 150, 20));
    platforms.push(new Platform(1300, 250, 150, 20));
    
    // Original Enemies
    enemies.push(new Enemy(400, 510, 200));
    enemies.push(new Enemy(1000, 510, 300));
    enemies.push(new Enemy(1700, 510, 200));

    // Original Coins
    coins.push(new Coin(350, 350));
    coins.push(new Coin(550, 250));
    coins.push(new Coin(1150, 350));
    coins.push(new Coin(1350, 200));
    coins.push(new Coin(1000, 500));
    coins.push(new Coin(1050, 500));

    // --- EXTENDED SECTION (2600 - 5000) ---
    
    // New Ground Segments
    platforms.push(new Platform(2700, 550, 500, 50)); // 2700-3200
    platforms.push(new Platform(3300, 550, 800, 50)); // 3300-4100
    platforms.push(new Platform(4300, 550, 800, 50)); // 4300-5100 (Final stretch)

    // New Floating Platforms - "Stairs" challenge
    platforms.push(new Platform(2750, 450, 100, 20));
    platforms.push(new Platform(2900, 350, 100, 20));
    platforms.push(new Platform(3050, 250, 100, 20)); // Peak of stairs

    // New Floating Platforms - High Islands
    platforms.push(new Platform(3400, 300, 150, 20));
    platforms.push(new Platform(3700, 300, 150, 20));
    platforms.push(new Platform(4000, 300, 150, 20)); // Long jump series

    // Tricky final jumps
    platforms.push(new Platform(4150, 450, 80, 20)); // Small safety platform

    // New Enemies
    enemies.push(new Enemy(2800, 510, 300)); // Guarding first new ground
    enemies.push(new Enemy(3400, 510, 200)); // Guarding under islands
    enemies.push(new Enemy(3800, 510, 200)); // Another guard under islands
    enemies.push(new Enemy(4400, 510, 400)); // Final long guard

    // New Coins
    // On stairs
    coins.push(new Coin(2800, 400));
    coins.push(new Coin(2950, 300));
    coins.push(new Coin(3100, 200)); 
    
    // Under islands
    coins.push(new Coin(3500, 500));
    coins.push(new Coin(3800, 500));

    // On islands
    coins.push(new Coin(3475, 250));
    coins.push(new Coin(3775, 250));
    coins.push(new Coin(4075, 250));

    // Final stretch coins
    coins.push(new Coin(4500, 500));
    coins.push(new Coin(4600, 500));
    coins.push(new Coin(4700, 500));

    // Win Platform (Moved to end)
    platforms.push(new Platform(5000, 500, 50, 50, 'win')); 
}

function checkCollisions() {
    if (gameState !== 'PLAYING') return;

    player.grounded = false;

    // Platform Collisions
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Win Condition
            if (platform.type === 'win') {
                if (gameState !== 'WIN') {
                    gameState = 'WIN';
                    alert("YOU WIN! Score: " + score);
                    document.location.reload();
                }
                return;
            }

            // Simple floor collision (landing on top)
            if (player.dy > 0 && player.y + player.height - player.dy <= platform.y) {
                player.grounded = true;
                player.dy = 0;
                player.y = platform.y - player.height;
            }
            // Ceiling collision
            else if (player.dy < 0 && player.y - player.dy >= platform.y + platform.height) {
                player.dy = 0;
                player.y = platform.y + platform.height;
            }
            // Side collision (simplified, often buggy in simple implementations but sufficient here)
            // Left/Right collisions are complex with AABB, for this scope we focus on vertical.
        }
    }

    // Death if fallen (Gaps)
    if (player.y > CANVAS_HEIGHT) {
        loseLife();
    }

    // Enemy Collisions
    for (let enemy of enemies) {
        if (enemy.alive &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Jump on top
            if (player.dy > 0 && player.y + player.height - player.dy <= enemy.y + enemy.height / 2) {
                enemy.alive = false;
                player.dy = -10; // Bounce
                score += 100;
            } else {
                // Hit by enemy
                loseLife();
            }
        }
    }

    // Coin Collection
    for (let coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score += 50;
        }
    }
}

function loseLife() {
    if (gameState !== 'PLAYING') return;
    
    lives--;
    if (lives <= 0) {
        gameState = 'GAMEOVER';
        alert("GAME OVER! Score: " + score);
        document.location.reload();
    } else {
        // Respawn
        player.x = 100;
        player.y = CANVAS_HEIGHT - 100;
        player.dx = 0;
        player.dy = 0;
        cameraX = 0;
    }
}

function update() {
    if (gameState !== 'PLAYING') return;

    player.update();
    
    // Update Camera (Follow player)
    if (player.x > CANVAS_WIDTH / 3) {
        cameraX = player.x - CANVAS_WIDTH / 3;
    }
    // Prevent camera form going left of 0
    if (cameraX < 0) cameraX = 0;

    enemies.forEach(e => e.update());
    
    checkCollisions();

    // Update HUD
    document.getElementById('score').innerText = "Score: " + score;
    document.getElementById('lives').innerText = "Lives: " + lives;
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background (Sky is handled by CSS, maybe clouds here?)
    
    platforms.forEach(p => p.draw());
    coins.forEach(c => c.draw());
    enemies.forEach(e => e.draw());
    player.draw();
}

function loop() {
    update();
    draw();
    if (gameState === 'PLAYING') {
        requestAnimationFrame(loop);
    }
}

// Input Handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if ((e.code === 'ArrowUp' || e.code === 'Space') && player.grounded) {
        player.dy = -player.jumpPower;
        player.grounded = false;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
});

// Init
initLevel();
loop();
