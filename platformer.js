// Tile-based Scrolling Platformer Game with DeltaTime

const TILE_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Player sprite configuration
const PLAYER_SPRITE_HEIGHT = 32; // Target height for player sprite (width calculated from aspect ratio)
const PLAYER_SCALE = 0.2

// Target frame rate for physics calculations (60 FPS baseline)
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

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

// Player images - now stores both image and dimensions
const PLAYER_IMAGES = {
    run: [], // Will hold objects with {image, width, height} for each frame
    jump: null,
    wallSlide: null,
    idle: null
};

const PLAYER_IMAGE_PATHS = {
    run: Array.from({ length: 16 }, (_, i) => `images/player/run${i + 1}.png`),
    jump: 'images/player/jump.png',
    wallSlide: 'images/player/wallslide.png',
    idle: 'images/player/idle.png'
};

let imagesLoaded = false;
let playerSpriteDimensions = null; // Will store average/base dimensions for hitbox

// Calculate player sprite dimensions from loaded image
function calculateSpriteDimensions(image) {
    if (!image || !image.naturalWidth || !image.naturalHeight) {
        return { width: 24, height: 32 }; // Fallback
    }

    // Use natural dimensions (no scaling)
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    console.log(`Sprite natural size: ${width}x${height}`);

    return { width, height };
}

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

// Load player images
function loadPlayerImages(callback) {
    let loadedCount = 0;
    let totalImages = PLAYER_IMAGE_PATHS.run.length + 3; // run frames + jump + wallSlide + idle

    // Track dimensions for calculating average hitbox size
    let totalWidth = 0;
    let totalHeight = 0;
    let frameCount = 0;

    // Load running animation frames
    PLAYER_IMAGE_PATHS.run.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            const dims = calculateSpriteDimensions(img);
            PLAYER_IMAGES.run[index] = {
                image: img,
                width: dims.width,
                height: dims.height
            };

            // Track for average
            totalWidth += dims.width;
            totalHeight += dims.height;
            frameCount++;

            loadedCount++;
            if (loadedCount === totalImages) {
                // Calculate average dimensions for hitbox
                playerSpriteDimensions = {
                    width: Math.floor(totalWidth / frameCount * PLAYER_SCALE),
                    height: Math.floor(totalHeight / frameCount * PLAYER_SCALE)
                };
                console.log('Average player sprite dimensions for hitbox:', playerSpriteDimensions);
                imagesLoaded = true;
                callback();
            }
        };
        img.onerror = () => {
            console.log(`Failed to load ${path}, player will use fallback rectangle`);
            loadedCount++;
            if (loadedCount === totalImages) {
                imagesLoaded = true;
                callback();
            }
        };
        img.src = path;
    });

    // Load jump sprite
    const jumpImg = new Image();
    jumpImg.onload = () => {
        const dims = calculateSpriteDimensions(jumpImg);
        PLAYER_IMAGES.jump = {
            image: jumpImg,
            width: dims.width,
            height: dims.height
        };

        loadedCount++;
        if (loadedCount === totalImages) {
            if (!playerSpriteDimensions) {
                playerSpriteDimensions = dims;
            }
            imagesLoaded = true;
            callback();
        }
    };
    jumpImg.onerror = () => {
        console.log(`Failed to load jump sprite, using fallback`);
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    jumpImg.src = PLAYER_IMAGE_PATHS.jump;

    // Load wall slide sprite
    const wallSlideImg = new Image();
    wallSlideImg.onload = () => {
        const dims = calculateSpriteDimensions(wallSlideImg);
        PLAYER_IMAGES.wallSlide = {
            image: wallSlideImg,
            width: dims.width,
            height: dims.height
        };
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    wallSlideImg.onerror = () => {
        console.log(`Failed to load wall slide sprite, using fallback`);
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    wallSlideImg.src = PLAYER_IMAGE_PATHS.wallSlide;

    // Load idle sprite
    const idleImg = new Image();
    idleImg.onload = () => {
        const dims = calculateSpriteDimensions(idleImg);
        PLAYER_IMAGES.idle = {
            image: idleImg,
            width: dims.width,
            height: dims.height
        };
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    idleImg.onerror = () => {
        console.log(`Failed to load idle sprite, using fallback`);
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    idleImg.src = PLAYER_IMAGE_PATHS.idle;
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
    constructor(x, y, spriteWidth = null, spriteHeight = null) {
        this.x = x;
        this.y = y;

        // Visual dimensions (will be set based on loaded sprite)
        // Default fallback if images don't load
        this.width = spriteWidth || 24;
        this.height = spriteHeight || 32;

        // Hitbox dimensions (85% of sprite size for better gameplay feel)
        this.updateHitbox();

        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 0.65;
        this.jumpPower = 9;
        this.gravity = 0.4;
        this.onGround = false;
        this.coins = 0;
        this.editMode = false;
        this.flySpeed = 8;
        this.onWall = false; // 'left', 'right', or false
        this.wallSlideSpeed = 2;
        this.wallJumpPowerX = 12;
        this.wallJumpPowerY = 12;
        this.jumpReleased = true;

        // Animation properties
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 1; // Frames to wait before changing sprite (lower = faster)
        this.facingRight = true;
    }

    updateHitbox() {
        // Hitbox is 85% of sprite size, centered
        this.hitboxWidth = Math.floor(this.width * 0.85);
        this.hitboxHeight = Math.floor(this.height * 0.85);
        this.hitboxOffsetX = Math.floor((this.width - this.hitboxWidth) / 2);
        this.hitboxOffsetY = Math.floor((this.height - this.hitboxHeight) / 2);
    }

    setDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.updateHitbox();
    }

    update(keys, level, deltaTime) {
        if (this.editMode) {
            // Flying controls in edit mode
            this.velocityX = 0;
            this.velocityY = 0;

            if (keys.left) this.velocityX = -this.flySpeed;
            if (keys.right) this.velocityX = this.flySpeed;
            if (keys.up) this.velocityY = -this.flySpeed;
            if (keys.down) this.velocityY = this.flySpeed;

            this.x += this.velocityX * deltaTime;
            this.y += this.velocityY * deltaTime;

            // Keep player in bounds
            this.x = Math.max(0, Math.min(this.x, level[0].length * TILE_SIZE - this.width));
            this.y = Math.max(0, Math.min(this.y, level.length * TILE_SIZE - this.height));
        } else {
            // Track if jump button was released
            if (!keys.jump) {
                this.jumpReleased = true;
            }

            // Update facing direction based on movement
            if (keys.left) {
                this.facingRight = false;
            } else if (keys.right) {
                this.facingRight = true;
            }

            // Normal play mode physics
            // Horizontal movement
            if (keys.left) {
                this.velocityX += -this.speed * deltaTime;
            } else if (keys.right) {
                this.velocityX += this.speed * deltaTime;
            }
            this.velocityX *= Math.pow(0.9, deltaTime); // Friction with deltaTime compensation

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
                        this.facingRight = true;
                    } else if (this.onWall === 'right' && !keys.right) {
                        // On right wall, can jump if NOT pressing right (into wall)
                        canWallJump = true;
                        this.velocityX = -this.wallJumpPowerX;
                        this.velocityY = -this.wallJumpPowerY;
                        this.facingRight = false;
                    }

                    if (canWallJump) {
                        this.onWall = false;
                        this.jumpReleased = false;
                    }
                }
            }

            // Apply gravity
            this.velocityY += this.gravity * deltaTime;

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
            this.x += this.velocityX * deltaTime;
            this.checkCollisionX(level);

            this.y += this.velocityY * deltaTime;
            this.checkCollisionY(level);

            // Update animation
            this.updateAnimation(deltaTime);
        }
    }

    updateAnimation(deltaTime) {
        // Only animate when moving horizontally
        if (Math.abs(this.velocityX) > 0.5 && this.onGround) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 16; // Cycle through 16 frames
            }
        } else {
            // Reset to first frame when not moving
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }

    checkCollisionX(level) {
        // Use hitbox for collision detection
        const hitboxLeft = this.x + this.hitboxOffsetX;
        const hitboxRight = hitboxLeft + this.hitboxWidth;
        const hitboxTop = this.y + this.hitboxOffsetY;
        const hitboxBottom = hitboxTop + this.hitboxHeight;

        // Add small margin to avoid checking ground tiles directly beneath
        const leftTile = Math.floor(hitboxLeft / TILE_SIZE);
        const rightTile = Math.floor(hitboxRight / TILE_SIZE);
        const topTile = Math.floor((hitboxTop + 1) / TILE_SIZE); // +1 to avoid ground below
        const bottomTile = Math.floor((hitboxBottom - 1) / TILE_SIZE); // -1 to avoid ground below

        // Reset wall state
        this.onWall = false;

        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityX > 0) {
                        // Moving right, collide with left side of tile
                        this.x = col * TILE_SIZE - this.hitboxWidth - this.hitboxOffsetX;
                        this.onWall = 'right'; // On right wall
                    } else if (this.velocityX < 0) {
                        // Moving left, collide with right side of tile
                        this.x = (col + 1) * TILE_SIZE - this.hitboxOffsetX;
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
            const leftWallCol = Math.floor((hitboxLeft - 1) / TILE_SIZE);
            for (let row = topTile; row <= bottomTile; row++) {
                if (this.isSolidTile(level, row, leftWallCol)) {
                    this.onWall = 'left';
                    break;
                }
            }

            // Check right wall
            if (!this.onWall) {
                const rightWallCol = Math.floor((hitboxRight + 1) / TILE_SIZE);
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
        // Use hitbox for collision detection
        const hitboxLeft = this.x + this.hitboxOffsetX;
        const hitboxRight = hitboxLeft + this.hitboxWidth;
        const hitboxTop = this.y + this.hitboxOffsetY;
        const hitboxBottom = hitboxTop + this.hitboxHeight;

        // Add small margin to avoid checking walls to the sides
        const leftTile = Math.floor((hitboxLeft + 1) / TILE_SIZE); // +1 to avoid side walls
        const rightTile = Math.floor((hitboxRight - 1) / TILE_SIZE); // -1 to avoid side walls
        const topTile = Math.floor(hitboxTop / TILE_SIZE);
        const bottomTile = Math.floor(hitboxBottom / TILE_SIZE);

        this.onGround = false;

        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityY > 0) {
                        // Falling down, collide with top of tile
                        this.y = row * TILE_SIZE - this.hitboxHeight - this.hitboxOffsetY;
                        this.onGround = true;
                    } else if (this.velocityY < 0) {
                        // Jumping up, collide with bottom of tile
                        this.y = (row + 1) * TILE_SIZE - this.hitboxOffsetY;
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
        const screenX = Math.round(this.x - camera.x);
        const screenY = Math.round(this.y - camera.y);

        // Determine which sprite to use
        let currentSpriteData = null;

        if (imagesLoaded) {
            if (this.onWall && !this.onGround) {
                // Wall sliding
                currentSpriteData = PLAYER_IMAGES.wallSlide;
            } else if (!this.onGround) {
                // Jumping/falling
                currentSpriteData = PLAYER_IMAGES.jump;
            } else if (Math.abs(this.velocityX) > 0.5) {
                // Running
                currentSpriteData = PLAYER_IMAGES.run[this.animationFrame];
            } else {
                // Idle
                currentSpriteData = PLAYER_IMAGES.idle;
            }
        }

        // Draw the sprite with its natural dimensions
        if (currentSpriteData && currentSpriteData.image) {
            // Save canvas state
            ctx.save();

            // Calculate offset to keep sprite centered on hitbox
            const spriteWidth = currentSpriteData.width * PLAYER_SCALE;
            const spriteHeight = currentSpriteData.height * PLAYER_SCALE;

            // Center the sprite on the player's position
            const offsetX = (this.width - spriteWidth) / 2;
            const offsetY = (this.height - spriteHeight) / 2;

            // Flip sprite if facing left
            if (!this.facingRight) {
                ctx.translate(screenX + this.width, screenY);
                ctx.scale(-1, 1);
                ctx.drawImage(currentSpriteData.image, offsetX, offsetY, spriteWidth, spriteHeight);
            } else {
                ctx.drawImage(currentSpriteData.image, screenX + offsetX, screenY + offsetY, spriteWidth, spriteHeight);
            }

            // Restore canvas state
            ctx.restore();
        } else {
            // Fallback to rectangle if images aren't loaded
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(screenX, screenY, this.width, this.height);

            // Draw a simple face
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX + 8, screenY + 8, 4, 4);
            ctx.fillRect(screenX + 16, screenY + 8, 4, 4);
            ctx.fillRect(screenX + 8, screenY + 18, 12, 2);
        }

        // Optional: Draw hitbox outline for debugging (uncomment to see hitbox)
        // ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        // ctx.lineWidth = 2;
        // ctx.strokeRect(
        //     screenX + this.hitboxOffsetX, 
        //     screenY + this.hitboxOffsetY, 
        //     this.hitboxWidth, 
        //     this.hitboxHeight
        // );

        // Draw wall slide indicator (optional visual feedback)
        if (this.onWall && !this.onGround && !currentSpriteData) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            if (this.onWall === 'left') {
                // Draw lines on left side
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(screenX - 4, screenY + 6 + i * 8, 2, 4);
                }
            } else if (this.onWall === 'right') {
                // Draw lines on right side
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(screenX + this.width + 2, screenY + 6 + i * 8, 2, 4);
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

        // Level management
        this.currentLevelIndex = 1; // Start with level 1
        this.totalLevels = 4; // Update this if you add more levels
        this.levelFiles = [
            'levels/level1.txt',
            'levels/level2.txt',
            'levels/level3.txt',
            'levels/level4.txt'
        ];

        this.level = JSON.parse(JSON.stringify(LEVEL_1)); // Deep copy (fallback)
        this.levelWidth = this.level[0].length * TILE_SIZE;
        this.levelHeight = this.level.length * TILE_SIZE;

        // Create player with dimensions from loaded sprites (or defaults)
        const dims = playerSpriteDimensions || { width: 24, height: 32 };
        this.player = new Player(64, 300, dims.width, dims.height);
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

        // Delta time tracking
        this.lastTime = performance.now();
        this.deltaTime = 0;

        this.setupInput();
        this.setupEditor();

        // Load the first level from file
        this.loadLevelFromFile(this.currentLevelIndex);

        this.gameLoop();
    }

    // NEW METHOD: Load level from file
    async loadLevelFromFile(levelNumber) {
        if (levelNumber < 1 || levelNumber > this.totalLevels) {
            console.log('Invalid level number');
            return;
        }

        try {
            const levelPath = this.levelFiles[levelNumber - 1];
            const response = await fetch(levelPath);
            const compressed = await response.text();

            // Decode the level
            const levelString = atob(compressed.trim());
            const newLevel = JSON.parse(levelString);

            // Validate level format
            if (!Array.isArray(newLevel) || !Array.isArray(newLevel[0])) {
                throw new Error('Invalid level format');
            }

            this.level = newLevel;
            this.levelWidth = this.level[0].length * TILE_SIZE;
            this.levelHeight = this.level.length * TILE_SIZE;
            this.camera = new Camera(this.levelWidth, this.levelHeight);

            // Reset player
            const dims = playerSpriteDimensions || { width: 24, height: 32 };
            this.player = new Player(64, 300, dims.width, dims.height);
            this.player.editMode = this.editMode;

            console.log(`Level ${levelNumber} loaded successfully!`);
        } catch (error) {
            console.error(`Error loading level ${levelNumber}:`, error);
            alert(`Could not load level ${levelNumber}. Using default level.`);
        }
    }

    // NEW METHOD: Progress to next level
    nextLevel() {
        this.currentLevelIndex++;
        if (this.currentLevelIndex > this.totalLevels) {
            // Game completed!
            alert(`🎉 Congratulations! You've completed all ${this.totalLevels} levels! 🎉\n\nTotal Coins: ${this.player.coins}`);
            this.currentLevelIndex = 1; // Loop back to level 1
        }
        this.loadLevelFromFile(this.currentLevelIndex);
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

        // New level button
        document.getElementById('newLevel').addEventListener('click', () => {
            const width = parseInt(document.getElementById('levelWidth').value);
            const height = parseInt(document.getElementById('levelHeight').value);

            if (confirm(`Create a new ${width}x${height} level? This will clear the current level.`)) {
                this.createNewLevel(width, height);
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

    createNewLevel(width, height) {
        // Validate dimensions
        if (width < 10 || width > 200 || height < 10 || height > 100) {
            alert('Invalid dimensions! Width must be 10-200, height must be 10-100.');
            return;
        }

        // Create new empty level with specified dimensions
        this.level = Array(height).fill(0).map(() => Array(width).fill(0));

        // Add ground at the bottom two rows
        for (let col = 0; col < width; col++) {
            this.level[height - 1][col] = TILES.GROUND;
            this.level[height - 2][col] = TILES.GROUND;
        }

        // Update level dimensions
        this.levelWidth = width * TILE_SIZE;
        this.levelHeight = height * TILE_SIZE;

        // Create new camera with updated dimensions
        this.camera = new Camera(this.levelWidth, this.levelHeight);

        // Reset player position
        this.player.x = 64;
        this.player.y = 300;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.coins = 0;

        alert(`New ${width}x${height} level created!`);
    }

    update() {
        this.player.update(this.keys, this.level, this.deltaTime);
        this.camera.follow(this.player);

        // Check if player reached flag (only in play mode)
        if (!this.editMode) {
            // Use hitbox center for flag collision
            const hitboxCenterX = this.player.x + this.player.hitboxOffsetX + this.player.hitboxWidth / 2;
            const hitboxCenterY = this.player.y + this.player.hitboxOffsetY + this.player.hitboxHeight / 2;
            const flagCol = Math.floor(hitboxCenterX / TILE_SIZE);
            const flagRow = Math.floor(hitboxCenterY / TILE_SIZE);

            if (this.level[flagRow] && this.level[flagRow][flagCol] === TILES.FLAG) {
                // Level completed! Progress to next level
                alert(`Level ${this.currentLevelIndex} Complete! Coins collected: ${this.player.coins}`);
                this.nextLevel();
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
        // Round camera position to prevent tile gaps during movement
        const x = col * TILE_SIZE - Math.round(this.camera.x);
        const y = row * TILE_SIZE - Math.round(this.camera.y);

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
        this.ctx.fillRect(10, 10, 200, 80);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Level: ${this.currentLevelIndex}/${this.totalLevels}`, 20, 35);
        this.ctx.fillText(`Coins: ${this.player.coins}`, 20, 55);

        // Display FPS
        const fps = Math.round(1000 / (this.deltaTime * FRAME_TIME));
        this.ctx.fillText(`FPS: ${fps}`, 20, 75);

        // Edit mode indicator
        if (this.editMode) {
            this.ctx.fillStyle = 'rgba(118, 75, 162, 0.9)';
            this.ctx.fillRect(10, 100, 150, 40);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('EDIT MODE', 20, 125);
        }
    }

    resetGame() {
        this.currentLevelIndex = 1;
        this.loadLevelFromFile(this.currentLevelIndex);
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time (normalized to 60 FPS baseline)
        const rawDeltaTime = currentTime - this.lastTime;
        this.deltaTime = rawDeltaTime / FRAME_TIME;
        this.lastTime = currentTime;

        // Cap deltaTime to prevent spiral of death on lag spikes
        if (this.deltaTime > 3) {
            this.deltaTime = 1;
        }

        this.update();
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    // Load tile images first, then player images, then start game
    loadTileImages(() => {
        loadPlayerImages(() => {
            const game = new Game();

            // If sprite dimensions were calculated during loading, update the player
            if (playerSpriteDimensions) {
                game.player.setDimensions(playerSpriteDimensions.width, playerSpriteDimensions.height);
                console.log('Applied sprite dimensions to player:', playerSpriteDimensions);
            }
        });
    });
});