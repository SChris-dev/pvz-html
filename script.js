const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// game images & objects
const backgroundImage = new Image();
backgroundImage.src = './Sprites/General/Background.jpg';

const shovelImage = new Image();
shovelImage.src = './Sprites/General/Shovel.png'

const shovel = {
    x: 630,
    y: 10,
    width: 70,
    height: 70
};

const seedPackets = [
    { x: 190, y: 16, width: 49, height: 69, type: "sunflower", imgSrc: "./Sprites/Seeds/SunFlowerSeed.png" },
    { x: 245, y: 16, width: 49, height: 69, type: "wallnut", imgSrc: "./Sprites/Seeds/WallNutSeed.png" },
    { x: 300, y: 16, width: 49, height: 69, type: "peashooter", imgSrc: "./Sprites/Seeds/PeaShooterSeed.png" },
    { x: 355, y: 16, width: 49, height: 69, type: "snowpea", imgSrc: "./Sprites/Seeds/IcePeaSeed.png" }
];

seedPackets.forEach(packet => {
    packet.image = new Image();
    packet.image.src = packet.imgSrc;
});


const lawnmowerImage = new Image();
lawnmowerImage.src = './Sprites/General/lawnmowerIdle.gif'

const lawnmowerActiveImage = new Image();
lawnmowerActiveImage.src = './Sprites/General/lawnmowerActivated.gif'

const lawnmowerWidth = 100;
const lawnmowerHeight = 100;
const lawnmowerSpeed = 15;

const lawnmowers = [
    {
        x: 5,
        y: 120,
        active: false,
        image: lawnmowerImage
    },
    {
        x: 5,
        y: 200,
        active: false,
        image: lawnmowerImage
    },
    {
        x: 5,
        y: 290,
        active: false,
        image: lawnmowerImage
    },
    {
        x: 5,
        y: 380,
        active: false,
        image: lawnmowerImage
    },
    {
        x: 5,
        y: 480,
        active: false,
        image: lawnmowerImage
    }
]

const sunImage = new Image();
sunImage.src = './Sprites/General/Sun.png';

let suns = [];

const peaImage = new Image();
peaImage.src = './Sprites/General/Pea.png';

const icePeaImage = new Image();
icePeaImage.src = './Sprites/General/IcePea.png';

// variables
const usernameText = document.getElementById('usernameText');
const scoreText = document.getElementById('scoreText');
const timerText = document.getElementById('timerText');
const sunCountText = document.getElementById('sunCountText');

// game variables
let score = 0;
let timer = 0;
let countdownTimer = 3;
let timerInterval;
let countdownInterval;
let sunCount = 50;
let selectedPlant = null;
let plants = [];
let shovelSelected = false;
let gameOver = false;
const WALL_NUT_HP = 100;

// grid
const rows = 5;
const cols = 8;
const cellWidth = 650 / cols;
const cellHeight = 450 / rows;
const grid = {
    rows: 5,
    cols: 8,
    cellWidth: 650 / cols,
    cellHeight: 450 / 5,
    offsetX: 100,
    offsetY: 115,
    cells: []
};

function drawGrid() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    grid.cells = [];

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            let x = col * grid.cellWidth + grid.offsetX;
            let y = row * grid.cellHeight + grid.offsetY;

            grid.cells.push({ row, col, x, y });

            // ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}

function getCellPosition(row, col) {
    return grid.cells.find(cell => cell.row === row && cell.col === col);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;

        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;

        let formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        timerText.innerHTML = formattedTime;
    }, 1000);
}

function createSun() {
    let x = Math.floor(Math.random() * (canvas.width - 92));
    let y = 0;

    return {
        x: x,
        y: y,
        width: 75,
        height: 79,
        speed: 1.5,
        spawnTime: Date.now()
    };
}

function summonSun() {
    suns.push(createSun());
}

function drawSun() {
    if (!sunImage.complete) return;
    
    const currentTime = Date.now();

    suns = suns.filter((sun) => {
        if (currentTime - sun.spawnTime > 7000) {
            return false;
        }

        ctx.drawImage(sunImage, sun.x, sun.y, sun.width, sun.height);
        sun.y += sun.speed;

        return true;
    });
}

function drawLawn() {
    if (!backgroundImage.complete) return;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawShovel() {
    if (!shovelImage.complete) return;

    ctx.drawImage(shovelImage, shovel.x, shovel.y, shovel.width, shovel.height);

    if (shovelSelected) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(shovel.x - 2, shovel.y - 2, shovel.width + 4, shovel.height + 4);
    }
}

function drawSeeds() {
    seedPackets.forEach(packet => {
        if (!packet.image.complete) return;
        ctx.drawImage(packet.image, packet.x, packet.y, packet.width, packet.height);
    });
}

function drawLawnMowers() {
    if (!lawnmowerImage.complete) return;

    lawnmowers.forEach(mower => {
        ctx.drawImage(mower.image, mower.x, mower.y, lawnmowerWidth, lawnmowerHeight);
    })
}

const plantAnimations = {
    PeaShooter: {
        frames: [],
        totalFrames: 28,
        speed: 100
    },
    SunFlower: {
        frames: [],
        totalFrames: 20,
        speed: 120
    },
    WallNut: {
        frames: [],
        totalFrames: 28,
        speed: 100
    },
    IcePea: {
        frames: [],
        totalFrames: 28,
        speed: 100
    }
}

function preloadPlants(callback) {
    const delayOptions = ["0.06s", "0.12s"];
    let totalImages = 0;
    let loadedImages = 0;

    for (let type in plantAnimations) {
        let frames = new Array(plantAnimations[type].totalFrames);

        for (let i = 0; i < plantAnimations[type].totalFrames; i++) {
            let paddedIndex = i.toString().padStart(2, '0');
            let imgLoaded = false;

            for (let delay of delayOptions) {
                let img = new Image();
                img.src = `./Sprites/${type}/frame_${paddedIndex}_delay-${delay}.gif`;
                totalImages++;

                img.onload = function () {
                    if (!imgLoaded) {
                        frames[i] = img;
                        imgLoaded = true;
                    }
                    loadedImages++;
                    if (loadedImages === totalImages) callback();
                };

                img.onerror = function () {
                    // console.warn(`Missing: ${img.src}`);
                    loadedImages++;
                    if (loadedImages === totalImages) callback();
                };
            }
        }

        plantAnimations[type].frames = frames;
    }
}

function drawPlants() {
    let animationFrame = Math.floor(performance.now() / 20);

    for (let plant of plants) {
        let animationType = {
            peashooter: "PeaShooter",
            sunflower: "SunFlower",
            wallnut: "WallNut",
            snowpea: "IcePea"
        };

        let plantKey = animationType[plant.type];
        let frames = plantAnimations[plantKey]?.frames || [];

        if (frames.length === 0) continue;

        let frameIndex = (animationFrame / 5) % frames.length | 0;
        let img = frames[frameIndex];

        if (!img || !img.complete || img.naturalWidth === 0) continue;

        ctx.drawImage(img, plant.x, plant.y, 70, 80);
    }
}

function drawSeedSelected() {
    seedPackets.forEach(packet => {
        ctx.drawImage(packet.image, packet.x, packet.y, packet.width, packet.height);

        if (selectedPlant === packet.type) {
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;
            ctx.strokeRect(packet.x - 2, packet.y - 2, packet.width + 4, packet.height + 4);
        }
    });
}

// event listener for suns and seed packets
canvas.addEventListener('click', (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    suns.forEach((sun, index) => {
        if (
            mouseX >= sun.x && mouseX <= sun.x + sun.width &&
            mouseY >= sun.y && mouseY <= sun.y + sun.height
        ) {
            sunCount += 25;
            sunCountText.innerHTML = sunCount;
            suns.splice(index, 1);
        }
    });

    seedPackets.forEach(packet => {
        if (
            mouseX >= packet.x && mouseX <= packet.x + packet.width &&
            mouseY >= packet.y && mouseY <= packet.y + packet.height
        ) {
            selectedPlant = packet.type;
            console.log('Selected:', selectedPlant);
            drawSeedSelected();
        }
    })

});

// for not overlapping
function isCellOccupied(row, col) {
    return plants.some(plant => plant.row === row && plant.col === col);
}

// for shoveling
function findPlantIndex(row, col) {
    return plants.findIndex(plant => plant.row === row && plant.col === col);
}

const plantCosts = {
    peashooter: 100,
    sunflower: 50,
    wallnut: 50,
    snowpea: 175
};

function placePlant(row, col, plantType) {
    if (isCellOccupied(row, col)) {
        console.log(`Cell at row ${row}, col ${col} is occupied! Can't plant here.`);
        return;
    }

    let plantCost = plantCosts[plantType];
    if (sunCount < plantCost) {
        selectedPlant = null;
        return;
    }

    let cell = getCellPosition(row, col);
    if (!cell) return;

    let plantX = cell.x + grid.cellWidth / 2 - 40;
    let plantY = cell.y + grid.cellHeight / 2 - 35;

    sunCount -= plantCost;
    sunCountText.innerHTML = sunCount;

    let newPlant = { type: plantType, x: plantX, y: plantY, row, col, health: 30 };

    if (plantType === 'sunflower') {
        newPlant.lastSunTime = Date.now();
    } else if (plantType === 'wallnut') {
        newPlant.health = WALL_NUT_HP;
    }

    plants.push(newPlant);

    console.log(`Planted ${plantType} at row ${row}, col ${col}`);
}

// sunflower

function updateSunflowers() {
    let currentTime = Date.now();

    for (let plant of plants) {
        if (plant.type === 'sunflower' && currentTime - plant.lastSunTime > 10000) {
            suns.push({
                x: plant.x + 10,
                y: plant.y - 20,
                width: 75,
                height: 79,
                speed: 0,
                spawnTime: Date.now()
            });

            plant.lastSunTime = currentTime;
        }
    }
}

// peashooters
const projectiles = [];

function shootPea(plant) {
    projectiles.push({
        x: plant.x + 50,
        y: plant.y + 10,
        speed: 5,
        type: plant.type
    });
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let pea = projectiles[i];
        pea.x += pea.speed;

        // remove off screen
        if (pea.x > canvas.width) {
            projectiles.splice(i, 1);
            continue;
        }

        for (let j = zombies.length - 1; j >= 0; j--) {
            let zombie = zombies[j];
            if (
                pea.y > zombie.y - 10 && pea.y < zombie.y - 10 + zombieHeight &&
                pea.x > zombie.x && pea.x < zombie.x + zombieWidth
            ) {
                if (pea.type === 'snowpea') {
                    zombie.speed = 0.15;
                }

                zombie.health -= 20;
                projectiles.splice(i, 1);

                if (zombie.health <= 0) {
                    zombies.splice(j, 1);
                    score += Math.floor((Math.random() * 10) + 1);
                    scoreText.innerHTML = score;
                }

                break;
            }
        }
    }
}

function drawProjectiles() {
    projectiles.forEach(pea => {
        let img = pea.type === 'snowpea' ? icePeaImage : peaImage;
        if (img.complete) {
            ctx.drawImage(img, pea.x, pea.y, 20, 20);
        }
    })
}

function checkForZombiesInRow(row) {
    return zombies.some(zombie => zombie.row === row);
}

function updatePeashooterAttack() {
    const currentTime = Date.now();

    for (let plant of plants) {
        if (plant.type === 'peashooter') {
            if (checkForZombiesInRow(plant.row)) {
                
                if (!plant.lastShotTime || currentTime - plant.lastShotTime >= 1500) { 
                    shootPea(plant);
                    plant.lastShotTime = currentTime;
                }
            }
        }

        if (plant.type === 'snowpea') {
            if (checkForZombiesInRow(plant.row)) {
                if (!plant.lastShotTime || currentTime - plant.lastShotTime >= 1500) { 
                    ctx.fillStyle = 'blue';
                    shootPea(plant);
                    plant.lastShotTime = currentTime;
                }
            }
        }
    }
}

// event listener for planting
canvas.addEventListener('click', (e) => {
    if (!selectedPlant) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedInsideGrid = false;
    let clickedOnSeedPacket = false;

    for (let cell of grid.cells) {
        if (
            mouseX >= cell.x && mouseX <= cell.x + grid.cellWidth &&
            mouseY >= cell.y && mouseY <= cell.y + grid.cellHeight
        ) {
            placePlant(cell.row, cell.col, selectedPlant);
            selectedPlant = null;
            clickedInsideGrid = true;
            break;
        }
    }

    seedPackets.forEach(packet => {
        if (
            mouseX >= packet.x && mouseX <= packet.x + packet.width &&
            mouseY >= packet.y && mouseY <= packet.y + packet.height
        ) {
            clickedOnSeedPacket = true;
        }
    });

    if (!clickedInsideGrid && !clickedOnSeedPacket) {
        selectedPlant = null;
        console.log("Deselected plant");
    }

})

// event listener for shovel
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX >= shovel.x && mouseX <= shovel.x + shovel.width &&
        mouseY >= shovel.y && mouseY <= shovel.y + shovel.height
    ) {
        shovelSelected = true;
        selectedPlant = null;
        return;
    }

    if (shovelSelected) {
        for (let cell of grid.cells) {
            if (
                mouseX >= cell.x && mouseX <= cell.x + grid.cellWidth &&
                mouseY >= cell.y && mouseY <= cell.y + grid.cellHeight
            ) {
                let plantIndex = findPlantIndex(cell.row, cell.col);
                if (plantIndex !== -1) {
                    plants.splice(plantIndex, 1);
                    console.log(`Plant removed at row ${cell.row}, col ${cell.col}`);
                }
                shovelSelected = false;
                return;
            }
        }

        // if clicked not plant
        shovelSelected = false;
    }
})

// zombies
const zombies = [];
let zombieSpeed = 0.1;
const zombieWidth = 50;
const zombieHeight = 50;
const difficultySettings = {
    easy: 1,
    medium: 2,
    hard: 3
}

function spawnZombie() {
    let difficulty = selectLevel.value;
    let zombiesToSpawn = difficultySettings[difficulty] || 1;

    // Generate an array of all row indices
    let availableRows = [...Array(grid.rows).keys()];

    // Shuffle the rows randomly
    availableRows.sort(() => Math.random() - 0.5);

    for (let i = 0; i < zombiesToSpawn && availableRows.length > 0; i++) {
        let randomRow = availableRows.pop(); // Get a unique row

        let cell = getCellPosition(randomRow, grid.cols - 1);
        if (!cell) continue;

        zombies.push({
            x: canvas.width,
            y: cell.y + (grid.cellHeight / 2 - zombieHeight / 2),
            row: randomRow,
            speed: zombieSpeed,
            health: 100,
            lastBiteTime: 0
        });
    }
}


function updateZombies() {
    if (gameOver) return;

    let currentTime = Date.now();

    for (let i = zombies.length - 1; i >= 0; i--) {
        let zombie = zombies[i];
        let plant = plants.find(p => p.row === zombie.row && Math.abs(p.x - zombie.x) < 30);

        if (zombie.x <= 0) {
            initiateGameOver();
            return;
        }

        if (plant) {
            zombie.isBiting = true;
            zombie.speed = 0.01;

            if (!zombie.lastBiteTime || currentTime - zombie.lastBiteTime >= 1000) {
                plant.health -= 10;
                zombie.lastBiteTime = currentTime;

                if (plant.health <= 0) {
                    plants.splice(plants.indexOf(plant), 1);
                    zombie.isBiting = false;
                    zombie.speed = 0.2;
                }
            }
        } else {
            zombie.isBiting = false;
            zombie.speed = 0.2;
            zombie.x -= zombie.speed;
        }
    }
}


function drawZombies() {
    ctx.fillStyle = 'red';

    zombies.forEach(zombie => {
        ctx.fillRect(zombie.x, zombie.y, zombieWidth, zombieHeight);
        zombie.x -= zombie.speed;
    });
}

// lawn mowers

function updateLawnmowers() {
    for (let i = lawnmowers.length - 1; i >= 0; i--) {
        let mower = lawnmowers[i];

        if (!mower.active) {
            let zombieInLane = zombies.find(z => Math.abs(z.x - mower.x) < 30 && Math.abs(z.y - mower.y) < 30);
            if (zombieInLane) {
                mower.active = true;
                mower.image = lawnmowerActiveImage;
            }
        } else {
            mower.x += lawnmowerSpeed;

            for (let j = zombies.length - 1; j >= 0; j--) {
                let zombie = zombies[j];

                if (Math.abs(mower.y - zombie.y) < 30 && mower.x < zombie.x + zombieWidth) {
                    zombies.splice(j, 1);
                    break;
                }
            }

            if (mower.x > canvas.width) {
                lawnmowers.splice(i, 1);
            }
        }
    }
}

function updateFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLawn();
    drawGrid();
    drawShovel();
    drawSeeds();
    drawSeedSelected();
    drawPlants();
    updateSunflowers();
    updateZombies();
    drawZombies();
    updateLawnmowers();
    drawLawnMowers();
    updateProjectiles();
    drawProjectiles();
    updatePeashooterAttack();
    drawSun();

    requestAnimationFrame(updateFrame);
}


function gameStart() {
    updateFrame();
    startTimer();
    preloadPlants();
    
    setInterval(summonSun, 12500);
    setTimeout(() => {
        setInterval(spawnZombie, 5000);
    }, 5000);

    for (let i = 0; i < 2; i++) {
        suns.push(createSun());
    }
}

// game over

const gameOverContainer = document.getElementById('gameOverContainer');
const gameOverUsername = document.getElementById('gameOverUsername');
const gameOverScore = document.getElementById('gameOverScore');
const gameOverTime = document.getElementById('gameOverTime');
const gameStats = document.getElementById('gameStats');

function initiateGameOver() {
    clearInterval(timerInterval);
    canvas.style.display = 'none';
    gameStats.style.display = 'none';
    sunCountText.style.display = 'none';
    gameOverContainer.style.display = 'flex';
    gameOverUsername.innerHTML = usernameInput.value;
    gameOverScore.innerHTML = score;

    let minutes = Math.floor(timer / 60);
    let seconds = timer % 60;

    let formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    gameOverTime.innerHTML = formattedTime;
}