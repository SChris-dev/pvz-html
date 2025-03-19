// variables
const gameContainer = document.getElementById('gameContainer');
const menuContainer = document.getElementById('menuContainer');
const usernameInput = document.getElementById('usernameInput');
const selectLevel = document.getElementById('selectLevel');
const startBtn = document.getElementById('startBtn');
const instructionBtn = document.getElementById('instructionBtn');
const instructionContainer = document.getElementById('instructionContainer');
const closeInstructionBtn = document.getElementById('closeInstructionBtn');

// validate
function validateInput() {
    let username = usernameInput.value;
    let levelSelected = selectLevel.value;

    startBtn.disabled = username.trim() === '' || levelSelected === '0';
}

// event listeners

instructionBtn.addEventListener('click', () => {
    instructionContainer.style.display = 'flex';
})

closeInstructionBtn.addEventListener('click', () => {
    instructionContainer.style.display = 'none';
})

usernameInput.addEventListener('input', validateInput);
selectLevel.addEventListener('change', validateInput);


// start game

startBtn.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    instructionContainer.style.display = 'none';
    gameContainer.style.display = 'flex';

    usernameText.innerHTML = usernameInput.value;

    gameStart();
})
