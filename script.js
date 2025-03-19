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
const plants = [];

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
        speed: 2,
    };
}

function summonSun() {
    suns.push(createSun());
}

function drawSun() {
    if (!sunImage.complete) return;
    
    suns.forEach((sun) => {
        ctx.drawImage(sunImage, sun.x, sun.y, sun.width, sun.height);
        sun.y += sun.speed;
    })
}

function drawLawn() {
    if (!backgroundImage.complete) return;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawShovel() {
    if (!shovelImage.complete) return;

    ctx.drawImage(shovelImage, shovel.x, shovel.y, shovel.width, shovel.height);
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

function drawPlants() {
    for (let plant of plants) {
        let img = new Image();
        img.src = `./Sprites/PeaShooter/frame_09.gif`;
        ctx.drawImage(img, plant.x, plant.y, 70, 80)
    }
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
        }
    })

});

function placePlant(row, col, plantType) {
    let cell = getCellPosition(row, col);
    if (!cell) return;

    let plantX = cell.x + grid.cellWidth / 2 - 25;
    let plantY = cell.y + grid.cellHeight / 2 - 35;

    plants.push({ type: plantType, x: plantX, y: plantY });

    console.log(`Planted ${plantType} at row ${row}, col ${col}`);
}

// event listener for planting
canvas.addEventListener('click', (e) => {
    if (!selectedPlant) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let cell of grid.cells) {
        if (
            mouseX >= cell.x && mouseX <= cell.x + grid.cellWidth &&
            mouseY >= cell.y && mouseY <= cell.y + grid.cellHeight
        ) {
            placePlant(cell.row, cell.col, selectedPlant);
            selectedPlant = null;
            break;
        }
    }
})


function updateFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLawn();
    drawGrid();
    drawShovel();
    drawSeeds();
    drawLawnMowers();
    drawPlants();
    drawSun();

    requestAnimationFrame(updateFrame);
}

function gameStart() {
    updateFrame();
    startTimer();
    
    setInterval(summonSun, 3000);

    for (let i = 0; i < 2; i++) {
        suns.push(createSun());
    }
}