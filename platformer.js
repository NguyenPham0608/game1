// Tile-based Scrolling Platformer Game

const TILE_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Tile types
const TILES = {
    EMPTY: 0,
    GROUND: 1,
    BRICK: 2,
    SPIKE: 3,
    FLAG: 4,
    COIN: 5
};

// Color mapping for tiles
const TILE_COLORS = {
    [TILES.EMPTY]: null,
    [TILES.GROUND]: '#8B4513',
    [TILES.BRICK]: '#CD853F',
    [TILES.SPIKE]: '#FF4444',
    [TILES.FLAG]: '#FFD700',
    [TILES.COIN]: '#FFA500'
};

// Tile images
const TILE_IMAGES = {};
const TILE_IMAGE_PATHS = {
    [TILES.GROUND]: 'images/ground.png',
    [TILES.BRICK]: 'images/brick.png',
    [TILES.SPIKE]: 'images/spike.png',
    [TILES.FLAG]: 'images/flag.png',
    [TILES.COIN]: 'images/coin.png'
};

// Load tile images
function loadTileImages(callback) {
    let loadedCount = 0;
    const totalImages = Object.keys(TILE_IMAGE_PATHS).length;

    if (totalImages === 0) {
        callback();
        return;
    }

    for (const [tileType, path] of Object.entries(TILE_IMAGE_PATHS)) {
        const img = new Image();
        img.onload = () => {
            TILE_IMAGES[tileType] = img;
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.log(`Failed to load ${path}, using fallback color`);
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.src = path;
    }
}

// Sample level (you can easily create more levels)
const LEVEL_1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 12;
        this.gravity = 0.5;
        this.onGround = false;
        this.coins = 0;
        this.editMode = false;
        this.flySpeed = 8;
        this.onWall = false; // 'left', 'right', or false
        this.wallSlideSpeed = 2;
        this.wallJumpPowerX = 18; // Increased even more for better horizontal distance
        this.wallJumpPowerY = 12;
        this.jumpReleased = true; // Track if jump button was released
    }

    update(keys, level) {
        if (this.editMode) {
            // Flying controls in edit mode
            this.velocityX = 0;
            this.velocityY = 0;

            if (keys.left) this.velocityX = -this.flySpeed;
            if (keys.right) this.velocityX = this.flySpeed;
            if (keys.up) this.velocityY = -this.flySpeed;
            if (keys.down) this.velocityY = this.flySpeed;

            this.x += this.velocityX;
            this.y += this.velocityY;

            // Keep player in bounds
            this.x = Math.max(0, Math.min(this.x, level[0].length * TILE_SIZE - this.width));
            this.y = Math.max(0, Math.min(this.y, level.length * TILE_SIZE - this.height));
        } else {
            // Track if jump button was released
            if (!keys.jump) {
                this.jumpReleased = true;
            }

            // Normal play mode physics
            // Horizontal movement
            if (keys.left) {
                this.velocityX += -this.speed;
            } else if (keys.right) {
                this.velocityX += this.speed;
            }
            this.velocityX *= 0.8; // Friction

            // Jumping and wall jumping - only if jump button was released
            if (keys.jump && this.jumpReleased) {
                if (this.onGround) {
                    // Normal jump from ground
                    this.velocityY = -this.jumpPower;
                    this.onGround = false;
                    this.jumpReleased = false;
                } else if (this.onWall && !this.onGround) {
                    // Wall jump - allowed unless pressing INTO the wall
                    let canWallJump = false;

                    if (this.onWall === 'left' && !keys.left) {
                        // On left wall, can jump if NOT pressing left (into wall)
                        canWallJump = true;
                        this.velocityX = this.wallJumpPowerX;
                        this.velocityY = -this.wallJumpPowerY;
                    } else if (this.onWall === 'right' && !keys.right) {
                        // On right wall, can jump if NOT pressing right (into wall)
                        canWallJump = true;
                        this.velocityX = -this.wallJumpPowerX;
                        this.velocityY = -this.wallJumpPowerY;
                    }

                    if (canWallJump) {
                        this.onWall = false;
                        this.jumpReleased = false;
                    }
                }
            }

            // Apply gravity
            this.velocityY += this.gravity;

            // Wall slide - slow down fall speed when on wall
            if (this.onWall && !this.onGround && this.velocityY > 0) {
                if (this.velocityY > this.wallSlideSpeed) {
                    this.velocityY = this.wallSlideSpeed;
                }
            }

            // Terminal velocity
            if (this.velocityY > 15) {
                this.velocityY = 15;
            }

            // Update position with collision detection
            this.x += this.velocityX;
            this.checkCollisionX(level);

            this.y += this.velocityY;
            this.checkCollisionY(level);
        }
    }

    checkCollisionX(level) {
        // Add small margin to avoid checking ground tiles directly beneath
        const leftTile = Math.floor(this.x / TILE_SIZE);
        const rightTile = Math.floor((this.x + this.width) / TILE_SIZE);
        const topTile = Math.floor((this.y + 1) / TILE_SIZE); // +1 to avoid ground below
        const bottomTile = Math.floor((this.y + this.height - 1) / TILE_SIZE); // -1 to avoid ground below

        // Reset wall state
        this.onWall = false;

        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityX > 0) {
                        // Moving right, collide with left side of tile
                        this.x = col * TILE_SIZE - this.width;
                        this.onWall = 'right'; // On right wall
                    } else if (this.velocityX < 0) {
                        // Moving left, collide with right side of tile
                        this.x = (col + 1) * TILE_SIZE;
                        this.onWall = 'left'; // On left wall
                    }
                    this.velocityX = 0;
                }

                // Collect coins
                if (this.getTile(level, row, col) === TILES.COIN) {
                    level[row][col] = TILES.EMPTY;
                    this.coins++;
                }
            }
        }

        // Check if still touching a wall even when not moving
        if (!this.onWall && !this.onGround) {
            // Check left wall
            const leftWallCol = Math.floor((this.x - 1) / TILE_SIZE);
            for (let row = topTile; row <= bottomTile; row++) {
                if (this.isSolidTile(level, row, leftWallCol)) {
                    this.onWall = 'left';
                    break;
                }
            }

            // Check right wall
            if (!this.onWall) {
                const rightWallCol = Math.floor((this.x + this.width + 1) / TILE_SIZE);
                for (let row = topTile; row <= bottomTile; row++) {
                    if (this.isSolidTile(level, row, rightWallCol)) {
                        this.onWall = 'right';
                        break;
                    }
                }
            }
        }
    }

    checkCollisionY(level) {
        // Add small margin to avoid checking walls to the sides
        const leftTile = Math.floor((this.x + 1) / TILE_SIZE); // +1 to avoid side walls
        const rightTile = Math.floor((this.x + this.width - 1) / TILE_SIZE); // -1 to avoid side walls
        const topTile = Math.floor(this.y / TILE_SIZE);
        const bottomTile = Math.floor((this.y + this.height) / TILE_SIZE);

        this.onGround = false;

        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityY > 0) {
                        // Falling down, collide with top of tile
                        this.y = row * TILE_SIZE - this.height;
                        this.onGround = true;
                    } else if (this.velocityY < 0) {
                        // Jumping up, collide with bottom of tile
                        this.y = (row + 1) * TILE_SIZE;
                    }
                    this.velocityY = 0;
                }

                // Check for spikes
                if (this.getTile(level, row, col) === TILES.SPIKE) {
                    this.respawn();
                }

                // Collect coins
                if (this.getTile(level, row, col) === TILES.COIN) {
                    level[row][col] = TILES.EMPTY;
                    this.coins++;
                }
            }
        }
    }

    isSolidTile(level, row, col) {
        const tile = this.getTile(level, row, col);
        return tile === TILES.GROUND || tile === TILES.BRICK;
    }

    getTile(level, row, col) {
        if (row < 0 || row >= level.length || col < 0 || col >= level[0].length) {
            return TILES.EMPTY;
        }
        return level[row][col];
    }

    respawn() {
        this.x = 64;
        this.y = 300;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    draw(ctx, camera) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(
            this.x - camera.x,
            this.y - camera.y,
            this.width,
            this.height
        );

        // Draw a simple face
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - camera.x + 8, this.y - camera.y + 8, 4, 4);
        ctx.fillRect(this.x - camera.x + 16, this.y - camera.y + 8, 4, 4);
        ctx.fillRect(this.x - camera.x + 8, this.y - camera.y + 18, 12, 2);

        // Draw wall slide indicator
        if (this.onWall && !this.onGround) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            if (this.onWall === 'left') {
                // Draw lines on left side
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(
                        this.x - camera.x - 4,
                        this.y - camera.y + 6 + i * 8,
                        2,
                        4
                    );
                }
            } else if (this.onWall === 'right') {
                // Draw lines on right side
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(
                        this.x - camera.x + this.width + 2,
                        this.y - camera.y + 6 + i * 8,
                        2,
                        4
                    );
                }
            }
        }
    }
}

class Camera {
    constructor(levelWidth, levelHeight) {
        this.x = 0;
        this.y = 0;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
    }

    follow(player) {
        // Center camera on player
        this.x = player.x + player.width / 2 - CANVAS_WIDTH / 2;
        this.y = player.y + player.height / 2 - CANVAS_HEIGHT / 2;

        // Keep camera within level bounds
        this.x = Math.max(0, Math.min(this.x, this.levelWidth - CANVAS_WIDTH));
        this.y = Math.max(0, Math.min(this.y, this.levelHeight - CANVAS_HEIGHT));
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.level = JSON.parse(JSON.stringify(LEVEL_1)); // Deep copy
        this.levelWidth = this.level[0].length * TILE_SIZE;
        this.levelHeight = this.level.length * TILE_SIZE;

        this.player = new Player(64, 300);
        this.camera = new Camera(this.levelWidth, this.levelHeight);

        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false
        };

        this.editMode = false;
        this.selectedTile = TILES.GROUND;
        this.mouseDown = false;

        this.setupInput();
        this.setupEditor();
        this.gameLoop();
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (this.editMode) {
                    this.keys.up = true;
                } else {
                    this.keys.jump = true;
                }
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.keys.down = true;
            }
            if (e.key === ' ') {
                if (!this.editMode) {
                    this.keys.jump = true;
                }
                e.preventDefault();
            }
            if (e.key === 'e' || e.key === 'E') {
                this.toggleEditMode();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.keys.up = false;
                this.keys.jump = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.keys.down = false;
            }
            if (e.key === ' ') {
                this.keys.jump = false;
            }
        });

        // Mouse controls for tile placement
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.editMode) {
                this.mouseDown = true;
                this.placeTile(e);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.editMode && this.mouseDown) {
                this.placeTile(e);
            }
        });
    }

    setupEditor() {
        // Toggle edit mode button
        document.getElementById('toggleMode').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // Tile selector buttons
        document.querySelectorAll('.tile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTile = parseInt(btn.dataset.tile);
            });
        });

        // Set first button as active
        document.querySelector('.tile-btn').classList.add('active');

        // Save level button
        document.getElementById('saveLevel').addEventListener('click', () => {
            this.saveLevel();
        });

        // Load level button
        document.getElementById('loadLevel').addEventListener('click', () => {
            this.loadLevel();
        });

        // Clear level button
        document.getElementById('clearLevel').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the level?')) {
                this.clearLevel();
            }
        });
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        this.player.editMode = this.editMode;

        if (this.editMode) {
            // Reset velocities when entering edit mode
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }

    placeTile(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert to world coordinates
        const worldX = mouseX + this.camera.x;
        const worldY = mouseY + this.camera.y;

        // Convert to tile coordinates
        const tileCol = Math.floor(worldX / TILE_SIZE);
        const tileRow = Math.floor(worldY / TILE_SIZE);

        // Place tile if in bounds
        if (tileRow >= 0 && tileRow < this.level.length &&
            tileCol >= 0 && tileCol < this.level[0].length) {
            this.level[tileRow][tileCol] = this.selectedTile;
        }
    }

    saveLevel() {
        // Compress the level data
        const levelString = JSON.stringify(this.level);
        const compressed = btoa(levelString); // Base64 encode

        document.getElementById('levelData').value = compressed;

        // Also copy to clipboard
        navigator.clipboard.writeText(compressed).then(() => {
            alert('Level saved! The code has been copied to your clipboard.');
        }).catch(() => {
            alert('Level saved! Copy the code from the text area.');
        });
    }

    loadLevel() {
        const compressed = document.getElementById('levelData').value.trim();

        if (!compressed) {
            alert('Please paste a level code in the text area first.');
            return;
        }

        try {
            const levelString = atob(compressed); // Base64 decode
            const newLevel = JSON.parse(levelString);

            // Validate level format
            if (!Array.isArray(newLevel) || !Array.isArray(newLevel[0])) {
                throw new Error('Invalid level format');
            }

            this.level = newLevel;
            this.levelWidth = this.level[0].length * TILE_SIZE;
            this.levelHeight = this.level.length * TILE_SIZE;
            this.camera = new Camera(this.levelWidth, this.levelHeight);

            alert('Level loaded successfully!');
        } catch (error) {
            alert('Error loading level: Invalid level code.');
            console.error(error);
        }
    }

    clearLevel() {
        // Create empty level with same dimensions
        const rows = this.level.length;
        const cols = this.level[0].length;

        this.level = Array(rows).fill(0).map(() => Array(cols).fill(0));

        // Add ground at the bottom
        for (let col = 0; col < cols; col++) {
            this.level[rows - 1][col] = TILES.GROUND;
            this.level[rows - 2][col] = TILES.GROUND;
        }
    }

    update() {
        this.player.update(this.keys, this.level);
        this.camera.follow(this.player);

        // Check if player reached flag (only in play mode)
        if (!this.editMode) {
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            const flagCol = Math.floor(playerCenterX / TILE_SIZE);
            const flagRow = Math.floor(playerCenterY / TILE_SIZE);

            if (this.level[flagRow] && this.level[flagRow][flagCol] === TILES.FLAG) {
                alert(`You win! Coins collected: ${this.player.coins}`);
                this.resetGame();
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw tiles
        this.drawLevel();

        // Draw player
        this.player.draw(this.ctx, this.camera);

        // Draw UI
        this.drawUI();
    }

    drawLevel() {
        const startCol = Math.floor(this.camera.x / TILE_SIZE);
        const endCol = Math.ceil((this.camera.x + CANVAS_WIDTH) / TILE_SIZE);
        const startRow = Math.floor(this.camera.y / TILE_SIZE);
        const endRow = Math.ceil((this.camera.y + CANVAS_HEIGHT) / TILE_SIZE);

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                if (row >= 0 && row < this.level.length && col >= 0 && col < this.level[0].length) {
                    const tile = this.level[row][col];
                    if (tile !== TILES.EMPTY) {
                        this.drawTile(tile, col, row);
                    }
                }
            }
        }
    }

    drawTile(tile, col, row) {
        const x = col * TILE_SIZE - this.camera.x;
        const y = row * TILE_SIZE - this.camera.y;

        // Try to use image first, fallback to colored rectangles
        if (TILE_IMAGES[tile]) {
            this.ctx.drawImage(TILE_IMAGES[tile], x, y, TILE_SIZE, TILE_SIZE);
        } else {
            // Fallback to colored rectangles
            this.ctx.fillStyle = TILE_COLORS[tile];
            this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            // Add some detail to tiles
            if (tile === TILES.GROUND || tile === TILES.BRICK) {
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }

            if (tile === TILES.SPIKE) {
                // Draw spike triangle
                this.ctx.fillStyle = '#FF4444';
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + TILE_SIZE);
                this.ctx.lineTo(x + TILE_SIZE / 2, y);
                this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
                this.ctx.closePath();
                this.ctx.fill();
            }

            if (tile === TILES.FLAG) {
                // Draw flag pole
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(x + 12, y, 4, TILE_SIZE);
                // Draw flag
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 16, y + 4);
                this.ctx.lineTo(x + 28, y + 10);
                this.ctx.lineTo(x + 16, y + 16);
                this.ctx.closePath();
                this.ctx.fill();
            }

            if (tile === TILES.COIN) {
                // Draw coin
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FF8C00';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    drawUI() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(10, 10, 150, 40);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Coins: ${this.player.coins}`, 20, 35);

        // Edit mode indicator
        if (this.editMode) {
            this.ctx.fillStyle = 'rgba(118, 75, 162, 0.9)';
            this.ctx.fillRect(10, 60, 150, 40);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('EDIT MODE', 20, 85);
        }
    }

    resetGame() {
        this.level = JSON.parse(JSON.stringify(LEVEL_1));
        this.player = new Player(64, 300);
        this.camera = new Camera(this.levelWidth, this.levelHeight);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    // Load tile images first, then start game
    loadTileImages(() => {
        new Game();
    });
});