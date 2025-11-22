// Tile-based Scrolling Platformer Game with Advanced 15-Tile Auto-tiling

const TILE_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Player sprite configuration
const PLAYER_SPRITE_HEIGHT = 32;
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

// Tile images - now with 15 variants for advanced auto-tiling materials
const TILE_IMAGES = {};
const TILE_IMAGE_PATHS = {
    // Ground tiles (15 variants for advanced auto-tiling)
    [TILES.GROUND]: {
        1: 'images/ground/ground1.png',   // Top-left corner (outer)
        2: 'images/ground/ground2.png',   // Top edge
        3: 'images/ground/ground3.png',   // Top-right corner (outer)
        4: 'images/ground/ground4.png',   // Left edge
        5: 'images/ground/ground5.png',   // Center (all sides connected)
        6: 'images/ground/ground6.png',   // Right edge
        7: 'images/ground/ground7.png',   // Bottom-left corner (outer)
        8: 'images/ground/ground8.png',   // Bottom edge
        9: 'images/ground/ground9.png',   // Bottom-right corner (outer)
        10: 'images/ground/ground10.png', // Top isolated (connects below only)
        11: 'images/ground/ground11.png', // Vertical left edge
        12: 'images/ground/ground12.png', // Vertical right edge
        13: 'images/ground/ground13.png', // Bottom isolated (connects above only)
        14: 'images/ground/ground14.png', // Inner corner (bottom-left concave)
        15: 'images/ground/ground15.png'  // Inner corner (bottom-right concave)
    },
    // Non-auto-tiling tiles (single image)
    [TILES.BRICK]: 'images/brick.png',
    [TILES.SPIKE]: 'images/spike.png',
    [TILES.FLAG]: 'images/flag.png',
    [TILES.COIN]: 'images/coin.png'
};

// Materials that support auto-tiling
const AUTO_TILE_MATERIALS = [TILES.GROUND, TILES.BRICK];
// Player images
const PLAYER_IMAGES = {
    run: [],
    jump: null,
    wallSlide: null,
    idle: null
};

const PLAYER_IMAGE_PATHS = {
    run: Array.from({ length: 16 }, (_, i) => `images/player/run${i + 1}.png`),
    jump: 'images/player/jump.png',
    fall: 'images/player/fall.png',
    wallSlide: 'images/player/wallslide.png',
    idle: 'images/player/idle.png'

};

let imagesLoaded = false;
let playerSpriteDimensions = null;

// Calculate player sprite dimensions from loaded image
function calculateSpriteDimensions(image) {
    if (!image || !image.naturalWidth || !image.naturalHeight) {
        return { width: 24, height: 32 };
    }
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    console.log(`Sprite natural size: ${width}x${height}`);
    return { width, height };
}

// Load tile images
function loadTileImages(callback) {
    let loadedCount = 0;
    let totalImages = 0;

    // Count total images
    for (const [tileType, path] of Object.entries(TILE_IMAGE_PATHS)) {
        if (typeof path === 'object') {
            totalImages += Object.keys(path).length;
        } else {
            totalImages++;
        }
    }

    if (totalImages === 0) {
        callback();
        return;
    }

    for (const [tileType, paths] of Object.entries(TILE_IMAGE_PATHS)) {
        if (typeof paths === 'object') {
            // Auto-tiling material with multiple variants
            TILE_IMAGES[tileType] = {};
            for (const [variant, path] of Object.entries(paths)) {
                const img = new Image();
                img.onload = () => {
                    TILE_IMAGES[tileType][variant] = img;
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
        } else {
            // Single image tile
            const img = new Image();
            img.onload = () => {
                TILE_IMAGES[tileType] = img;
                loadedCount++;
                if (loadedCount === totalImages) {
                    callback();
                }
            };
            img.onerror = () => {
                console.log(`Failed to load ${paths}, using fallback color`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    callback();
                }
            };
            img.src = paths;
        }
    }
}

// Load player images
function loadPlayerImages(callback) {
    let loadedCount = 0;
    let totalImages = PLAYER_IMAGE_PATHS.run.length + 3;

    let totalWidth = 0;
    let totalHeight = 0;
    let frameCount = 0;

    PLAYER_IMAGE_PATHS.run.forEach((path, index) => {
        const img = new Image();
        img.onload = () => {
            const dims = calculateSpriteDimensions(img);
            PLAYER_IMAGES.run[index] = {
                image: img,
                width: dims.width,
                height: dims.height
            };

            totalWidth += dims.width;
            totalHeight += dims.height;
            frameCount++;

            loadedCount++;
            if (loadedCount === totalImages) {
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

    const fallImg = new Image();
    fallImg.onload = () => {
        const dims = calculateSpriteDimensions(fallImg);
        PLAYER_IMAGES.fall = {
            image: fallImg,
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
    fallImg.onerror = () => {
        console.log(`Failed to load jump sprite, using fallback`);
        loadedCount++;
        if (loadedCount === totalImages) {
            imagesLoaded = true;
            callback();
        }
    };
    fallImg.src = PLAYER_IMAGE_PATHS.fall;

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

// AUTO-TILING LOOKUP TABLE
// Pattern format: [Top][Right][Bottom][Left] where 0=exposed, 1=connected
// Example: '0110' = exposed top and left, connects right and bottom
const TILE_PATTERNS = {
    '0110': 1,  // Top-left outer corner
    '0111': 2,  // Top edge
    '0011': 3,  // Top-right outer corner
    '1110': 4,  // Left edge
    '1111': 5,  // Center (all sides connected)
    '1011': 6,  // Right edge
    '1100': 7,  // Bottom-left outer corner
    '1101': 8,  // Bottom edge
    '1001': 9,  // Bottom-right outer corner
    '0010': 10, // Top isolated (only bottom connects)
    '0100': 11, // Only right connects
    '0001': 12, // Only left connects
    '1000': 13, // Bottom isolated (only top connects)
    '0101': 14, // Left and right connect (horizontal strip)
    '1010': 15  // Top and bottom connect (vertical strip)
};

// ADVANCED AUTO-TILING ALGORITHM (15-tile system)
// Uses binary pattern matching: 0=exposed edge (blue), 1=connection (red)
function getAutoTileVariant(level, row, col, tileType) {
    // Check if this tile type supports auto-tiling
    if (!AUTO_TILE_MATERIALS.includes(tileType)) {
        return null; // Not an auto-tile material
    }

    // Check direct neighbors (only tiles of the same type connect)
    const hasTop = getTile(level, row - 1, col) === tileType;
    const hasRight = getTile(level, row, col + 1) === tileType;
    const hasBottom = getTile(level, row + 1, col) === tileType;
    const hasLeft = getTile(level, row, col - 1) === tileType;

    // Build connection pattern string: [Top][Right][Bottom][Left]
    const pattern = `${hasTop ? '1' : '0'}${hasRight ? '1' : '0'}${hasBottom ? '1' : '0'}${hasLeft ? '1' : '0'}`;

    // Look up the tile variant from the pattern
    const tileVariant = TILE_PATTERNS[pattern];

    if (tileVariant) {
        return tileVariant;
    }

    // Fallback to center tile if pattern not found
    console.log(`Unknown pattern: ${pattern} at row ${row}, col ${col}`);
    return 5;
}

function getTile(level, row, col) {
    if (row < 0 || row >= level.length || col < 0 || col >= level[0].length) {
        return TILES.EMPTY;
    }
    return level[row][col];
}

// Sample level
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
        this.width = spriteWidth || 24;
        this.height = spriteHeight || 32;
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
        this.onWall = false;
        this.wallSlideSpeed = 2;
        this.wallJumpPowerX = 12;
        this.wallJumpPowerY = 12;
        this.jumpReleased = true;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 1;
        this.facingRight = true;
    }

    updateHitbox() {
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
            this.velocityX = 0;
            this.velocityY = 0;
            if (keys.left) this.velocityX = -this.flySpeed;
            if (keys.right) this.velocityX = this.flySpeed;
            if (keys.up) this.velocityY = -this.flySpeed;
            if (keys.down) this.velocityY = this.flySpeed;
            this.x += this.velocityX * deltaTime;
            this.y += this.velocityY * deltaTime;
            this.x = Math.max(0, Math.min(this.x, level[0].length * TILE_SIZE - this.width));
            this.y = Math.max(0, Math.min(this.y, level.length * TILE_SIZE - this.height));
        } else {
            if (!keys.jump) {
                this.jumpReleased = true;
            }
            if (keys.left) {
                this.facingRight = false;
            } else if (keys.right) {
                this.facingRight = true;
            }
            if (keys.left) {
                this.velocityX += -this.speed * deltaTime;
            } else if (keys.right) {
                this.velocityX += this.speed * deltaTime;
            }
            this.velocityX *= Math.pow(0.9, deltaTime);
            if (keys.jump && this.jumpReleased) {
                if (this.onGround) {
                    this.velocityY = -this.jumpPower;
                    this.onGround = false;
                    this.jumpReleased = false;
                } else if (this.onWall && !this.onGround) {
                    let canWallJump = false;
                    if (this.onWall === 'left' && !keys.left) {
                        canWallJump = true;
                        this.velocityX = this.wallJumpPowerX;
                        this.velocityY = -this.wallJumpPowerY;
                        this.facingRight = true;
                    } else if (this.onWall === 'right' && !keys.right) {
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
            this.velocityY += this.gravity * deltaTime;
            if (this.onWall && !this.onGround && this.velocityY > 0) {
                if (this.velocityY > this.wallSlideSpeed) {
                    this.velocityY = this.wallSlideSpeed;
                }
            }
            if (this.velocityY > 15) {
                this.velocityY = 15;
            }
            this.x += this.velocityX * deltaTime;
            this.checkCollisionX(level);
            this.y += this.velocityY * deltaTime;
            this.checkCollisionY(level);
            this.updateAnimation(deltaTime);
        }
    }

    updateAnimation(deltaTime) {
        if (Math.abs(this.velocityX) > 0.5 && this.onGround) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 16;
            }
        } else {
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }

    checkCollisionX(level) {
        const hitboxLeft = this.x + this.hitboxOffsetX;
        const hitboxRight = hitboxLeft + this.hitboxWidth;
        const hitboxTop = this.y + this.hitboxOffsetY;
        const hitboxBottom = hitboxTop + this.hitboxHeight;
        const leftTile = Math.floor(hitboxLeft / TILE_SIZE);
        const rightTile = Math.floor(hitboxRight / TILE_SIZE);
        const topTile = Math.floor((hitboxTop + 1) / TILE_SIZE);
        const bottomTile = Math.floor((hitboxBottom - 1) / TILE_SIZE);
        this.onWall = false;
        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityX > 0) {
                        this.x = col * TILE_SIZE - this.hitboxWidth - this.hitboxOffsetX;
                        this.onWall = 'right';
                    } else if (this.velocityX < 0) {
                        this.x = (col + 1) * TILE_SIZE - this.hitboxOffsetX;
                        this.onWall = 'left';
                    }
                    this.velocityX = 0;
                }
                if (getTile(level, row, col) === TILES.COIN) {
                    level[row][col] = TILES.EMPTY;
                    this.coins++;
                }
            }
        }
        if (!this.onWall && !this.onGround) {
            const leftWallCol = Math.floor((hitboxLeft - 1) / TILE_SIZE);
            for (let row = topTile; row <= bottomTile; row++) {
                if (this.isSolidTile(level, row, leftWallCol)) {
                    this.onWall = 'left';
                    break;
                }
            }
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
        const hitboxLeft = this.x + this.hitboxOffsetX;
        const hitboxRight = hitboxLeft + this.hitboxWidth;
        const hitboxTop = this.y + this.hitboxOffsetY;
        const hitboxBottom = hitboxTop + this.hitboxHeight;
        const leftTile = Math.floor((hitboxLeft + 1) / TILE_SIZE);
        const rightTile = Math.floor((hitboxRight - 1) / TILE_SIZE);
        const topTile = Math.floor(hitboxTop / TILE_SIZE);
        const bottomTile = Math.floor(hitboxBottom / TILE_SIZE);
        this.onGround = false;
        for (let row = topTile; row <= bottomTile; row++) {
            for (let col = leftTile; col <= rightTile; col++) {
                if (this.isSolidTile(level, row, col)) {
                    if (this.velocityY > 0) {
                        this.y = row * TILE_SIZE - this.hitboxHeight - this.hitboxOffsetY;
                        this.onGround = true;
                    } else if (this.velocityY < 0) {
                        this.y = (row + 1) * TILE_SIZE - this.hitboxOffsetY;
                    }
                    this.velocityY = 0;
                }
                if (getTile(level, row, col) === TILES.SPIKE) {
                    this.respawn();
                }
                if (getTile(level, row, col) === TILES.COIN) {
                    level[row][col] = TILES.EMPTY;
                    this.coins++;
                }
            }
        }
    }

    isSolidTile(level, row, col) {
        const tile = getTile(level, row, col);
        return tile === TILES.GROUND || tile === TILES.BRICK;
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
        let currentSpriteData = null;
        if (imagesLoaded) {
            if (this.onWall && !this.onGround) {
                currentSpriteData = PLAYER_IMAGES.wallSlide;
            } else if (!this.onGround) {
                if (this.velocityY < 0) {
                    currentSpriteData = PLAYER_IMAGES.jump;
                } else {
                    currentSpriteData = PLAYER_IMAGES.fall;
                }
            } else if (Math.abs(this.velocityX) > 0.5) {
                currentSpriteData = PLAYER_IMAGES.run[this.animationFrame];
            } else {
                currentSpriteData = PLAYER_IMAGES.idle;
            }
        }
        if (currentSpriteData && currentSpriteData.image) {
            ctx.save();
            const spriteWidth = currentSpriteData.width * PLAYER_SCALE;
            const spriteHeight = currentSpriteData.height * PLAYER_SCALE;
            const offsetX = (this.width - spriteWidth) / 2;
            const offsetY = (this.height - spriteHeight) / 2;
            if (!this.facingRight) {
                ctx.translate(screenX + this.width, screenY);
                ctx.scale(-1, 1);
                ctx.drawImage(currentSpriteData.image, offsetX, offsetY, spriteWidth, spriteHeight);
            } else {
                ctx.drawImage(currentSpriteData.image, screenX + offsetX, screenY + offsetY, spriteWidth, spriteHeight);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(screenX, screenY, this.width, this.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX + 8, screenY + 8, 4, 4);
            ctx.fillRect(screenX + 16, screenY + 8, 4, 4);
            ctx.fillRect(screenX + 8, screenY + 18, 12, 2);
        }
        if (this.onWall && !this.onGround && !currentSpriteData) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            if (this.onWall === 'left') {
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(screenX - 4, screenY + 6 + i * 8, 2, 4);
                }
            } else if (this.onWall === 'right') {
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
        this.x += ((player.x + player.width / 2 - CANVAS_WIDTH / 2) - this.x) / 20;
        this.y += ((player.y + player.height / 2 - CANVAS_HEIGHT / 2) - this.y) / 20;
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

        this.currentLevelIndex = 1;
        this.totalLevels = 4;
        this.levelFiles = [
            'levels/level1.txt',
            'levels/level2.txt',
            'levels/level3.txt',
            'levels/level4.txt'
        ];

        this.level = JSON.parse(JSON.stringify(LEVEL_1));
        this.levelWidth = this.level[0].length * TILE_SIZE;
        this.levelHeight = this.level.length * TILE_SIZE;

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
        this.lastTime = performance.now();
        this.deltaTime = 0;

        this.setupInput();
        this.setupEditor();
        this.loadLevelFromFile(this.currentLevelIndex);
        this.gameLoop();
    }

    async loadLevelFromFile(levelNumber) {
        if (levelNumber < 1 || levelNumber > this.totalLevels) {
            console.log('Invalid level number');
            return;
        }
        try {
            const levelPath = this.levelFiles[levelNumber - 1];
            const response = await fetch(levelPath);
            const compressed = await response.text();
            const levelString = atob(compressed.trim());
            const newLevel = JSON.parse(levelString);
            if (!Array.isArray(newLevel) || !Array.isArray(newLevel[0])) {
                throw new Error('Invalid level format');
            }
            this.level = newLevel;
            this.levelWidth = this.level[0].length * TILE_SIZE;
            this.levelHeight = this.level.length * TILE_SIZE;
            this.camera = new Camera(this.levelWidth, this.levelHeight);
            const dims = playerSpriteDimensions || { width: 24, height: 32 };
            this.player = new Player(64, 300, dims.width, dims.height);
            this.player.editMode = this.editMode;
            console.log(`Level ${levelNumber} loaded successfully!`);
        } catch (error) {
            console.error(`Error loading level ${levelNumber}:`, error);
            alert(`Could not load level ${levelNumber}. Using default level.`);
        }
    }

    nextLevel() {
        this.currentLevelIndex++;
        if (this.currentLevelIndex > this.totalLevels) {
            alert(`🎉 Congratulations! You've completed all ${this.totalLevels} levels! 🎉\n\nTotal Coins: ${this.player.coins}`);
            this.currentLevelIndex = 1;
        }
        this.loadLevelFromFile(this.currentLevelIndex);
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (this.editMode) this.keys.up = true;
                else this.keys.jump = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
            if (e.key === ' ') {
                if (!this.editMode) this.keys.jump = true;
                e.preventDefault();
            }
            if (e.key === 'e' || e.key === 'E') this.toggleEditMode();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.keys.up = false;
                this.keys.jump = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
            if (e.key === ' ') this.keys.jump = false;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.editMode) {
                this.mouseDown = true;
                this.placeTile(e);
            }
        });
        this.canvas.addEventListener('mouseup', () => { this.mouseDown = false; });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.editMode && this.mouseDown) this.placeTile(e);
        });
    }

    setupEditor() {
        document.getElementById('toggleMode').addEventListener('click', () => this.toggleEditMode());
        document.querySelectorAll('.tile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTile = parseInt(btn.dataset.tile);
            });
        });
        document.querySelector('.tile-btn').classList.add('active');
        document.getElementById('saveLevel').addEventListener('click', () => this.saveLevel());
        document.getElementById('loadLevel').addEventListener('click', () => this.loadLevel());
        document.getElementById('clearLevel').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the level?')) this.clearLevel();
        });
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
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }

    placeTile(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = mouseX + this.camera.x;
        const worldY = mouseY + this.camera.y;
        const tileCol = Math.floor(worldX / TILE_SIZE);
        const tileRow = Math.floor(worldY / TILE_SIZE);
        if (tileRow >= 0 && tileRow < this.level.length && tileCol >= 0 && tileCol < this.level[0].length) {
            this.level[tileRow][tileCol] = this.selectedTile;
        }
    }

    saveLevel() {
        const levelString = JSON.stringify(this.level);
        const compressed = btoa(levelString);
        document.getElementById('levelData').value = compressed;
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
            const levelString = atob(compressed);
            const newLevel = JSON.parse(levelString);
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
        const rows = this.level.length;
        const cols = this.level[0].length;
        this.level = Array(rows).fill(0).map(() => Array(cols).fill(0));
        for (let col = 0; col < cols; col++) {
            this.level[rows - 1][col] = TILES.GROUND;
            this.level[rows - 2][col] = TILES.GROUND;
        }
    }

    createNewLevel(width, height) {
        if (width < 10 || width > 200 || height < 10 || height > 100) {
            alert('Invalid dimensions! Width must be 10-200, height must be 10-100.');
            return;
        }
        this.level = Array(height).fill(0).map(() => Array(width).fill(0));
        for (let col = 0; col < width; col++) {
            this.level[height - 1][col] = TILES.GROUND;
            this.level[height - 2][col] = TILES.GROUND;
        }
        this.levelWidth = width * TILE_SIZE;
        this.levelHeight = height * TILE_SIZE;
        this.camera = new Camera(this.levelWidth, this.levelHeight);
        this.player.x = 64;
        this.player.y = 300;
        this.player.velocityX = 0;
        this.velocityY = 0;
        this.player.coins = 0;
        alert(`New ${width}x${height} level created!`);
    }

    update() {
        this.player.update(this.keys, this.level, this.deltaTime);
        this.camera.follow(this.player);
        if (!this.editMode) {
            const hitboxCenterX = this.player.x + this.player.hitboxOffsetX + this.player.hitboxWidth / 2;
            const hitboxCenterY = this.player.y + this.player.hitboxOffsetY + this.player.hitboxHeight / 2;
            const flagCol = Math.floor(hitboxCenterX / TILE_SIZE);
            const flagRow = Math.floor(hitboxCenterY / TILE_SIZE);
            if (this.level[flagRow] && this.level[flagRow][flagCol] === TILES.FLAG) {
                alert(`Level ${this.currentLevelIndex} Complete! Coins collected: ${this.player.coins}`);
                this.nextLevel();
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawLevel();
        this.player.draw(this.ctx, this.camera);
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
        const x = col * TILE_SIZE - Math.round(this.camera.x);
        const y = row * TILE_SIZE - Math.round(this.camera.y);

        // AUTO-TILING: Get the correct variant based on neighbors
        const variant = getAutoTileVariant(this.level, row, col, tile);

        // Try to use image first, fallback to colored rectangles
        if (variant && TILE_IMAGES[tile] && TILE_IMAGES[tile][variant]) {
            // Auto-tiling material with variant
            this.ctx.drawImage(TILE_IMAGES[tile][variant], x, y, TILE_SIZE, TILE_SIZE);
        } else if (TILE_IMAGES[tile] && typeof TILE_IMAGES[tile] !== 'object') {
            // Single image tile (no auto-tiling)
            this.ctx.drawImage(TILE_IMAGES[tile], x, y, TILE_SIZE, TILE_SIZE);
        } else {
            // Fallback to colored rectangles
            this.ctx.fillStyle = TILE_COLORS[tile];
            this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            if (tile === TILES.GROUND || tile === TILES.BRICK) {
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }

            if (tile === TILES.SPIKE) {
                this.ctx.fillStyle = '#FF4444';
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + TILE_SIZE);
                this.ctx.lineTo(x + TILE_SIZE / 2, y);
                this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
                this.ctx.closePath();
                this.ctx.fill();
            }

            if (tile === TILES.FLAG) {
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(x + 12, y, 4, TILE_SIZE);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 16, y + 4);
                this.ctx.lineTo(x + 28, y + 10);
                this.ctx.lineTo(x + 16, y + 16);
                this.ctx.closePath();
                this.ctx.fill();
            }

            if (tile === TILES.COIN) {
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
        const fps = Math.round(1000 / (this.deltaTime * FRAME_TIME));
        this.ctx.fillText(`FPS: ${fps}`, 20, 75);
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
        const rawDeltaTime = currentTime - this.lastTime;
        this.deltaTime = rawDeltaTime / FRAME_TIME;
        this.lastTime = currentTime;
        if (this.deltaTime > 3) {
            this.deltaTime = 1;
        }
        this.update();
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

window.addEventListener('load', () => {
    loadTileImages(() => {
        loadPlayerImages(() => {
            const game = new Game();
            if (playerSpriteDimensions) {
                game.player.setDimensions(playerSpriteDimensions.width, playerSpriteDimensions.height);
                console.log('Applied sprite dimensions to player:', playerSpriteDimensions);
            }
        });
    });
});