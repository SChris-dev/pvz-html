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

const lawnmowerWidth = 100;
const lawnmowerHeight = 100;

const lawnmowerFirstLane = {
    x: 5,
    y: 100,
}

const lawnmowerSecondLane = {
    x: 5,
    y: 200,
}

const lawnmowerThirdLane = {
    x: 5,
    y: 290,
}

const lawnmowerFourthLane = {
    x: 5,
    y: 380,
}

const lawnmowerFifthLane = {
    x: 5,
    y: 480,
}

const sunImage = new Image();
sunImage.src = './Sprites/General/Sun.png';

let suns = [];

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
        width: 92,
        height: 95,
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

    // suns.forEach((sun) => {
    //     ctx.drawImage(sunImage, sun.x, sun.y, sun.width, sun.height);
    //     sun.y += sun.speed;
    // })
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

    // first lane
    ctx.drawImage(lawnmowerImage, lawnmowerFirstLane.x, lawnmowerFirstLane.y, lawnmowerWidth, lawnmowerHeight);

    // second lane
    ctx.drawImage(lawnmowerImage, lawnmowerSecondLane.x, lawnmowerSecondLane.y, lawnmowerWidth, lawnmowerHeight);

    // third lane
    ctx.drawImage(lawnmowerImage, lawnmowerThirdLane.x, lawnmowerThirdLane.y, lawnmowerWidth, lawnmowerHeight);

    // fourth lane
    ctx.drawImage(lawnmowerImage, lawnmowerFourthLane.x, lawnmowerFourthLane.y, lawnmowerWidth, lawnmowerHeight);

    // fifth lane
    ctx.drawImage(lawnmowerImage, lawnmowerFifthLane.x, lawnmowerFifthLane.y, lawnmowerWidth, lawnmowerHeight);
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

    let newPlant = { type: plantType, x: plantX, y: plantY, row, col };

    if (plantType === 'sunflower') {
        newPlant.lastSunTime = Date.now();
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
                width: 92,
                height: 95,
                speed: 0,
                spawnTime: Date.now()
            });

            plant.lastSunTime = currentTime;
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


function updateFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLawn();
    drawGrid();
    drawShovel();
    drawSeeds();
    drawSeedSelected();
    drawLawnMowers();
    drawPlants();
    updateSunflowers();
    drawSun();

    requestAnimationFrame(updateFrame);
}

function gameStart() {
    updateFrame();
    startTimer();
    preloadPlants();
    
    setInterval(summonSun, 15000);

    for (let i = 0; i < 2; i++) {
        suns.push(createSun());
    }
}