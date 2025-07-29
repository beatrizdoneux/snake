//Constants
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const GAME_SPEED = 300;
const INITIAL_SNAKE = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 10 };

//HTML elements
const page = document.getElementById("wrapper");
const board = document.getElementById("game-board");
const currentScoreContainer = document.getElementById("current-score");
const highestScoreContainer = document.getElementById("highest-score");

//Initial state
let snake = [...INITIAL_SNAKE];
let direction = { x: 0, y: 0 };
let food = { ...INITIAL_FOOD };
let headPosition = "right";
let currentScore = 0;
let highestScore = 0;

//Swipe movement initial values
let initialX = null;
let initialY = null;

//Scores
highestScoreContainer.innerHTML = `<p>0</p>`
updateScores(currentScore);

let movement = "";

//Game Loop
setInterval(gameLoop, 300);
addEventListeners();

/*******************************************************************************
 FUNCTIONS
*******************************************************************************/

//Game logic
function gameLoop() {
    if (direction.x !== 0 || direction.y !== 0) {
        drawSnake();
    }
    drawBoard();
}

function resetGame() {
    console.log("Game Over");
    snake = [...INITIAL_SNAKE];
    direction = { x: 0, y: 0 };
    food = {...INITIAL_FOOD};
    updateScores(0);
    headPosition = "right";
    highestScoreContainer.innerHTML = `<p>${highestScore}</p>`;
    initialX = null;
    initialY = null;
}

//Event listeners
function addEventListeners() {
    //Detect keydown movements on desktop
    document.addEventListener("keydown", (event) => {
        handleKeypress(event.key);
    })

    //Detect swipe movements on touchscreen devices
    page.addEventListener("touchstart", startTouch, false);
    page.addEventListener("touchmove", moveTouch, false);
}

//Handle events
function handleKeypress(key) {

    handleMovement(getPressedKey(key));

    movement = key;
}

function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
};

function moveTouch(e) {

    let direction = "";

    if (initialX === null || initialY === null) {
        return;
    }

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;

    let deltaX = initialX - currentX;
    let deltaY = initialY - currentY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) { //Swipe horizontally
        deltaX > 0 ? "left" : "right"
    }
    else { //Swipe vertically
        deltaY > 0 ? "up" : "down"
    }

    handleMovement(direction);

    initialX = null;
    initialY = null;

    e.preventDefault();
};

function handleMovement(lastMove) {

    switch (lastMove) {
        case "left":
            if (direction.x !== 1) direction = { x: -1, y: 0 };
            if (lastMove !== "right") headPosition = "left";
            break;
        case "right":
            if (direction.x !== -1) direction = { x: 1, y: 0 };
            if (lastMove !== "left") headPosition = "right";
            break;
        case "up":
            if (direction.y !== 1) direction = { x: 0, y: -1 };
            if (lastMove !== "down") headPosition = "up";
            break;
        case "down":
            if (direction.y !== -1) direction = { x: 0, y: 1 };
            if (lastMove !== "up") headPosition = "down";
            break;
        default:
            break;
    }

    movement = lastMove;

}

//Draw elements
function drawBoard() {

    board.innerHTML = "";

    snake.forEach((segment, index) => {
        const snakeElement = document.createElement("div");
        snakeElement.classList.remove();
        snakeElement.classList.add("snake");

        if (index === 0) {
            snakeElement.classList.remove();
            snakeElement.classList.add(headPosition);
            snakeElement.classList.add("head");
        } else if (index < snake.length - 1) {
            let isCurve = compareCoordinates(snake[index - 1], snake[index], snake[index + 1]);

            if (isCurve !== "") {
                snakeElement.classList.add(isCurve);
            }

        }

        snakeElement.style.gridColumnStart = segment.x;
        snakeElement.style.gridRowStart = segment.y;
        board.appendChild(snakeElement);
    });

    const foodElement = document.createElement("div");
    foodElement.innerHTML = `<i class="fa-solid fa-apple-whole food-icon icon"></i>`
    foodElement.classList.add("food");
    foodElement.style.gridColumnStart = food.x;
    foodElement.style.gridRowStart = food.y;
    board.appendChild(foodElement);
}

function drawSnake() {
    const nextHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collisions
    const isFood = detectCollisionWithFood(nextHead, food);
    const isWall = delectCollisionWithWall(nextHead, GRID_WIDTH, GRID_HEIGHT);
    const isSnake = detectCollisionWithSnake(nextHead);

    if (isWall || isSnake) {
        resetGame();
        return;
    }

    // Move snake head
    snake.unshift(nextHead);


    // Handle food collision
    if (isFood) {
        drawFood(); // Generate new food position
        currentScore += 1; // Update score
        updateScores(currentScore);
    } else {
        snake.pop(); // Remove the tail if no food is eaten
    }


}

function drawFood() {
    // Create a set of all possible grid positions
    const possiblePositions = [];
    for (let x = 1; x <= GRID_WIDTH; x++) {
        for (let y = 1; y <= GRID_HEIGHT; y++) {
            if (!isPositionSnake({ x, y })) {
                possiblePositions.push({ x, y });
            }
        }
    }

    // If there are no possible positions, log an error
    if (possiblePositions.length === 0) {
        console.error("No space to place food");
        return;
    }

    // Randomly select a position for the food
    const randomIndex = getRandomInt(possiblePositions.length) - 1;
    food = possiblePositions[randomIndex];
}

function isPositionSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

//Collision detection
function detectCollisionWithFood(snakeHead, food) {
    return snakeHead.x === food.x && snakeHead.y === food.y;
}

function delectCollisionWithWall(snakeHead, gridWidth, gridHeight) {
    return snakeHead.x > gridWidth || snakeHead.x < 1 || snakeHead.y > gridHeight || snakeHead.y < 1
}

function detectCollisionWithSnake(snakeHead) {
    return snake.some(segment => segment.x === snakeHead.x && segment.y === snakeHead.y);
}

//Utilities
function getRandomInt(limit) {
    return Math.floor(Math.random() * limit) + 1;
}

function compareCoordinates(previous, current, next) {
    //Compares the coordinates of three points to determine the styling of a snake segment on curves, returns where the middle point is compared to the previous and next points

    let curvePosition = "";

    if (current.x === previous.x && current.y < previous.y && current.y === next.y) { //Snake is facing up
        current.x < next.x ? curvePosition = "top-left" : curvePosition = "top-right";
    }
    if (current.x === previous.x && current.y > previous.y && current.y === next.y) { //Snake is facing down
        current.x < next.x ? curvePosition = "bottom-left" : curvePosition = "bottom-right";
    }
    else if (current.x < previous.x && current.y === previous.y && current.x === next.x) { //Snake is facing left
        current.y < next.y ? curvePosition = "top-left" : curvePosition = "bottom-left";
    }
    else if (current.x > previous.x && current.y === previous.y && current.x === next.x) { //Snake is facing right
        current.y < next.y ? curvePosition = "top-right" : curvePosition = "bottom-right"
    }

    return curvePosition;
}

function updateScores(score) {
    currentScore = score;
    currentScoreContainer.innerHTML = `<p>${score}</p>`;

    if (currentScore > highestScore) {
        highestScore = currentScore;
    }

    // highestScoreContainer.innerHTML = `<p>${highestScore}</p>`
}

function getPressedKey(key) {
    switch (key) {
        case "ArrowLeft": return "left";
        case "ArrowRight": return "right";
        case "ArrowUp": return "up";
        case "ArrowDown": return "down";
        default:
            break;
    }
}







