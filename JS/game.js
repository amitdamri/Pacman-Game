var context;
var shape = new Object(); // pacman position
var board;
var score;
var pac_color;
var start_time;
var interval;
var interval2;
var lives;
var initial_food;
var game_length;
var monsters; // monsters amount
var monsters_position; // array of monsters positions
var greenMonster;
var blueMonster;
var redMonster;
var yellowMonster;
var movingPointsGif;
var isMovingPointsEaten;
var pill;
var audio;
var lastPacmanPos;
var timeRemain;
var userLoggedIn;
var firstDraw;
var gameRunning = false;
var monsters_color = new Array(4);
var movingPoints = new Object();
var food_color = new Array(4); //[0]=5 points, [1]=15 points, [2]=25 points
var game_keys = [38, 40, 37, 39]; //[0]= up, [1]= down, [2]= left, [3]= right



$(document).ready(function () {
    context = canvas.getContext("2d");

    $("#startNewGame").click(function () {
        stopGame();
        Start(userLoggedIn);
    });
});


// start game - init variable and execute
// few marks on the board - [0=free cell] [2=pacman] [4=wall] [5=5 pts candy] [6=15 pts candy] [7=25 pts candy]
// [9=monster] [10=monster and 5 pts candy] [11=monster and 15 pts candy] [12=monster and 25 pts candy]
// [13=moving points] [14=moving points and 5 pts candy] [15=moving points and 15 pts candy] [16=moving points and 25 pts candy]
// [20=pill] [21=pill and monster] [22=pill and moving points]
function Start(userName) {
    //inits fields
    timeRemain = game_length;
    firstDraw = true;
    gameRunning = true;
    userLoggedIn = userName;
    lblName.innerText = userLoggedIn;
    isMovingPointsEaten = false;
    score = 0;
    lives = 5;
    pac_color = "white";
    lastPacmanPos = 4;

    //game functions
    initBoard();
    buildWalls(board);
    placeCharacters(board);
    spreadFood(board, food_remain);
    loadImages();
    Draw(4);
    playAudio();

    //sets game labels
    lblLives.value = lives;
    lblScore.value = score;

    //Intervals and listeners
    addEventListener("keydown", gameKeyEventDown);
    interval = setInterval(updateTime, 100);
    interval2 = setInterval(updatePositionsOfAutomaticCharacters, 500);
}

//Init the board arrays
function initBoard() {
    board = new Array(20);
    for (var i = 0; i < 20; i++) {
        board[i] = new Array(20);
    }
}

//Loads game images - monsters, pill and moving point.
function loadImages() {
    //Load images
    greenMonster = document.getElementById("greenMonster");
    blueMonster = document.getElementById("blueMonster");
    redMonster = document.getElementById("redMonster");
    yellowMonster = document.getElementById("yellowMonster");
    pill = document.getElementById("pill");
    movingPointsGif = document.getElementById("movingPoints");

    //Sets monster images
    monsters_color[0] = greenMonster;
    monsters_color[1] = blueMonster;
    monsters_color[2] = redMonster;
    monsters_color[3] = yellowMonster;
}

// restart game after a death - monster touched pacman
function restartAfterDeath() {

    lastPacmanPos = 4;
    clearCharacters();
    placeCharacters(board);
    Draw(4);
}

// clear pacman, monsters and moving points from board
function clearCharacters() {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == 2) board[i][j] = 0;
            else if (board[i][j] == 9 || board[i][j] == 13) board[i][j] = 0;
            else if (board[i][j] == 10 || board[i][j] == 14) board[i][j] = 5;
            else if (board[i][j] == 11 || board[i][j] == 15) board[i][j] = 6;
            else if (board[i][j] == 12 || board[i][j] == 16) board[i][j] = 7;
            else if (board[i][j] == 21 || board[i][j] == 22) board[i][j] = 20;
        }
    }

}

//Checks if the key that was clicked is one of the directions-
//if it is calls updatePosition function with this direction.
function gameKeyEventDown(event) {
    if (game_keys[0] == event.keyCode) {
        UpdatePosition(1);
    } else if (game_keys[1] == event.keyCode) {
        UpdatePosition(2);
    } else if (game_keys[2] == event.keyCode) {
        UpdatePosition(3);
    } else if (game_keys[3] == event.keyCode) {
        UpdatePosition(4);
    }
    event.preventDefault();
    return false;
}

// place candies in free cells by required amount: 60% of 5 pts, 30% of 15 pts, 10% of 25 pts 
function spreadFood(board, initial_food) {
    let array = new Array();
    let index = 0;
    let food_remained = initial_food;

    let firstIndex = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            array[index] = [i, j];
            index++;
        }
    }

    let candy = getShuffledCandiesArray(initial_food);
    let candy_index = 0;
    let randomIndex = Math.floor(Math.random() * array.length - firstIndex) + firstIndex;
    //spread food randomally over all 2-d array, pick a random free cell and place there a candy
    while (food_remained > 0) {
        let position = array[randomIndex];

        if (board[position[0]][position[1]] == 0) {
            board[position[0]][position[1]] = candy[candy_index]; // set a candy
            candy_index++;
            food_remained--;
            array[randomIndex] = array[firstIndex]; // so it would't rand again
            firstIndex++; // rand between firstIndex to end of array
        }
        randomIndex = Math.floor(Math.random() * array.length - firstIndex) + firstIndex;
    }

    let freeCell = findRandomEmptyCell(board);
    board[freeCell[0]][freeCell[1]] = 20; // pill which gives you another live

}

// place charachters on the board - monsters in corners, pacman and moving points on a random free cells 
function placeCharacters(board) {

    // monsters
    monsters_position = new Array(monsters);
    for (let i = 0; i < monsters; i++) {
        monsters_position[i] = new Object();
        if (i == 0) {
            monsters_position[i].i = 1;
            monsters_position[i].j = 1;
            board[1][1] = 9;
        } else if (i == 1) {
            monsters_position[i].i = 18;
            monsters_position[i].j = 18;
            board[18][18] = 9;
        } else if (i == 2) {
            monsters_position[i].i = 1;
            monsters_position[i].j = 18;
            board[1][18] = 9;
        } else if (i == 3) {
            monsters_position[i].i = 18;
            monsters_position[i].j = 1;
            board[18][1] = 9;
        }
    }

    // pacman
    let position = findRandomEmptyCell(board);
    while (placedNextToMonsters(position))
    {
        position = findRandomEmptyCell(board);
    }
    shape.i = position[0];
    shape.j = position[1];
    board[position[0]][position[1]] = 2;

    // moving points
    if (isMovingPointsEaten) return;

    if (monsters < 4) { // place it in the corner
        movingPoints.i = 18;
        movingPoints.j = 1;
        board[18][1] = 13; // a free corner for sure
    }
    else {
        position = findRandomEmptyCell(board);
        movingPoints.i = position[0];
        movingPoints.j = position[1];
        board[position[0]][position[1]] = 13;
    }

}

// return true if pacman was placed right next to monster its first position 
function placedNextToMonsters(position) {

    // up right monster
    if (position.i == 2 && position.j == 1) return true;
    if (position.i == 2 && position.j == 2) return true;
    if (position.i == 1 && position.j == 2) return true;
    
    // up left monster
    if (position.i == 17 && position.j == 1) return true;
    if (position.i == 17 && position.j == 2) return true;
    if (position.i == 18 && position.j == 2) return true;

    // bottom right monster
    if (position.i == 17 && position.j == 18) return true;
    if (position.i == 17 && position.j == 17) return true;
    if (position.i == 18 && position.j == 17) return true;

    // bottom left monster
    if (position.i == 17 && position.j == 1) return true;
    if (position.i == 17 && position.j == 2) return true;
    if (position.i == 18 && position.j == 2) return true;

    return false;

}

// returns a free cell [no charachters or candies]
function findRandomEmptyCell(board) {
    let i = Math.floor(Math.random() * 19 + 1);
    let j = Math.floor(Math.random() * 19 + 1);
    while (board[i][j] != 0) {
        i = Math.floor(Math.random() * 19 + 1);
        j = Math.floor(Math.random() * 19 + 1);
    }
    return [i, j];
}

// Updates time every according to the interval
function updateTime() {
    timeRemain = timeRemain - 0.1;
    document.getElementById("lblTime").value = timeRemain.toFixed(1);
    if (timeRemain <= 0) {
        //clearInterval(interval);
        if (score < 100) {
            alert("You are better than " + score + " points!");
        } else {
            alert("Winner!!!");
        }
        if (window.confirm("Start New game?")) {
            stopGame();
            Start(userLoggedIn);
        } else {
            switchScreen("#welcomeScreen");
        }
    }
}

// manages pacman movement
function UpdatePosition(keyPressed) {

    lastPacmanPos = keyPressed; // update last position, for next drawings when pacman isn't moving

    board[shape.i][shape.j] = 0; // pacman left the cell, it was a free cell or candy eaten

    updatePacmanPosition(keyPressed);

    pacmanPassedInCandyCell(); //pacman passed in candy cell or in free cell

    board[shape.i][shape.j] = 2; // set pacman's new position

    lblScore.value = score;
    lblLives.value = lives;

    if (isMonsterTouchedPacman())
        executeMonsterTouchedPacman();
    else
        Draw(keyPressed);

}

// update position of pacman when required key is pressed
function updatePacmanPosition(keyPressed) {

    if (keyPressed == 1) {
        if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) {
            shape.j--;
        }
    } else if (keyPressed == 2) {
        if (shape.j < board[0].length && board[shape.i][shape.j + 1] != 4) {
            shape.j++;
        }
    } else if (keyPressed == 3) {
        if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
            shape.i--;
        } 
        //if at the left end go back to the right end.
        else if (shape.i == 0) {
            shape.i = board.length - 1;
        }
    } else if (keyPressed == 4 || firstDraw) {
        firstDraw = false;
        if (shape.i < board.length - 1 && board[shape.i + 1][shape.j] != 4) {
            shape.i++;
        } 
        //if at the right end go back to the left end.
        else if (shape.i == board.length - 1) {
            shape.i = 0;
        }
    }
}

// evaluates score if pacman ate candy, pill or moving points
function pacmanPassedInCandyCell() {

    if (board[shape.i][shape.j] == 5) { // 5 pts candy
        score += 5;
    } else if (board[shape.i][shape.j] == 6) { // 15 pts candy
        score += 15;
    } else if (board[shape.i][shape.j] == 7) { // 25 pts candy
        score += 25;
    } else if (board[shape.i][shape.j] == 13) { // moving points 
        score += 50;
        isMovingPointsEaten = true;
    } else if (board[shape.i][shape.j] == 14) { // 5 pts candy and moving points
        score += 55;
        isMovingPointsEaten = true;
    } else if (board[shape.i][shape.j] == 15) { // 15 pts candy and moving points
        score += 65;
        isMovingPointsEaten = true;
    } else if (board[shape.i][shape.j] == 16) { // 25 pts candy and moving points
        score += 75;
        isMovingPointsEaten = true;
    } else if (board[shape.i][shape.j] == 20) { // pill
        lives++;
    } else if (board[shape.i][shape.j] == 22) { // pill and moving points
        lives++;
        score += 50;
        isMovingPointsEaten = true;
    }

}

// manages case when pacman touched monster
function executeMonsterTouchedPacman() {

    //monster number '0' makes pacman lose 2 lives and 20 pts
    let position = monsters_position[0];
    // special monster
    if (position.i == shape.i && position.j == shape.j) {
        if (score >= 20)
            score -= 20;
        else
            score = 0;

        if (lives > 2)
            lives -= 2;
        else
            lives = 0;
    }
    // regular monster
    else {
        if (score >= 10)
            score -= 10;
        else
            score = 0;

        lives--;
    }

    lblScore.value = score;
    lblLives.value = lives;
    checkLives();

}

// manages live reducing case: a complete restart after invalidation (no more lives) or restart after a death
function checkLives() {
    if (lives == 0) {
        alert("Loser!")
        if (window.confirm("Start New game?")) {
            stopGame();
            Start(userLoggedIn);
        } else {
            switchScreen("#welcomeScreen");
        }
    } else {
        alert("Monster Catch you.")
        restartAfterDeath();
    }
}

// calls each interval to update position of monsters and moving points
function updatePositionsOfAutomaticCharacters() {

    updatePositionMonsters();
    if (isMovingPointsEaten == false)
        updatePositionMovingPoints();
}

// update position of monsters each interval
function updatePositionMonsters() {

    for (let i = 0; i < monsters; i++) {
        let position = monsters_position[i];
        let chosen_position = new Object();
        if (position.i + 1 < board.length && position.i < shape.i && board[position.i + 1][position.j] != 4 && !movingPointsOrMonsterPlace(position.i + 1, position.j)) {
            chosen_position.i = position.i + 1;
            chosen_position.j = position.j;
        } else if (position.j - 1 >= 0 && position.j > shape.j && board[position.i][position.j - 1] != 4 && !movingPointsOrMonsterPlace(position.i, position.j - 1)) {
            chosen_position.i = position.i;
            chosen_position.j = position.j - 1;
        } else if (position.i - 1 >= 0 && position.i > shape.i && board[position.i - 1][position.j] != 4 && !movingPointsOrMonsterPlace(position.i - 1, position.j)) {
            chosen_position.i = position.i - 1;
            chosen_position.j = position.j;
        } else if (position.j + 1 < board[0].length && position.j < shape.j && board[position.i][position.j + 1] != 4 && !movingPointsOrMonsterPlace(position.i, position.j + 1)) {
            chosen_position.i = position.i;
            chosen_position.j = position.j + 1;
        }
        // only one option is possible, choose it
        else {
            if (position.i + 1 < board.length && board[position.i + 1][position.j] != 4 && !movingPointsOrMonsterPlace(position.i + 1, position.j)) {
                chosen_position.i = position.i + 1;
                chosen_position.j = position.j;
            } else if (position.j - 1 >= 0 && board[position.i][position.j - 1] != 4 && !movingPointsOrMonsterPlace(position.i, position.j - 1)) {
                chosen_position.i = position.i;
                chosen_position.j = position.j - 1;
            } else if (position.i - 1 >= 0 && board[position.i - 1][position.j] != 4 && !movingPointsOrMonsterPlace(position.i - 1, position.j)) {
                chosen_position.i = position.i - 1;
                chosen_position.j = position.j;
            } else if (position.j + 1 < board[0].length && board[position.i][position.j + 1] != 4 && !movingPointsOrMonsterPlace(position.i, position.j + 1)) {
                chosen_position.i = position.i;
                chosen_position.j = position.j + 1;
            }
        }

        setMonsterPosition(board, position, chosen_position.i, chosen_position.j);

        position.i = chosen_position.i;
        position.j = chosen_position.j;

    }

    if (isMonsterTouchedPacman()) executeMonsterTouchedPacman();
    else Draw(lastPacmanPos);

}

// return true if it's an already catched place (by another characther)
function movingPointsOrMonsterPlace(i, j) {

    return (board[i][j] == 9 || board[i][j] == 10 || board[i][j] == 11 || board[i][j] == 12 ||
        board[i][j] == 13 || board[i][j] == 14 || board[i][j] == 15 || board[i][j] == 16 || board[i][j] == 21 || board[i][j] == 22);
}

// return true if any of the monsters touched a pacman at this very moment
function isMonsterTouchedPacman() {
    for (let i = 0; i < monsters; i++) {
        let position = monsters_position[i];
        if (position.i == shape.i && position.j == shape.j) {
            return true;
        }
    }
    return false;
}

// update position of moving points each interval
function updatePositionMovingPoints() {

    // set old position as it supposed to be
    if (board[movingPoints.i][movingPoints.j] == 13) {
        board[movingPoints.i][movingPoints.j] = 0;
    } else if (board[movingPoints.i][movingPoints.j] == 14) // movingPoints on 5 pts cell
    {
        board[movingPoints.i][movingPoints.j] = 5;
    } else if (board[movingPoints.i][movingPoints.j] == 15) // movingPoints on 15 pts cell
    {
        board[movingPoints.i][movingPoints.j] = 6;
    } else if (board[movingPoints.i][movingPoints.j] == 16) // movingPoints on 25 pts cell
    {
        board[movingPoints.i][movingPoints.j] = 7;
    } else if (board[movingPoints.i][movingPoints.j] == 22) // movingPoints on pill cell
    {
        board[movingPoints.i][movingPoints.j] = 20;
    }

    let possible_positions = getPossiblePositions(movingPoints.i, movingPoints.j);
    let i = Math.floor(Math.random() * possible_positions.length);
    movingPoints.i = possible_positions[i][0];
    movingPoints.j = possible_positions[i][1];

    // set new position as it supposed to be
    if (board[movingPoints.i][movingPoints.j] == 0) {
        board[movingPoints.i][movingPoints.j] = 13; // free cell and moving points together
    } else if (board[movingPoints.i][movingPoints.j] == 5) {
        board[movingPoints.i][movingPoints.j] = 14; // 5 pts cell and moving points together
    } else if (board[movingPoints.i][movingPoints.j] == 6) {
        board[movingPoints.i][movingPoints.j] = 15; // 15 pts cell and moving points together
    } else if (board[movingPoints.i][movingPoints.j] == 7) {
        board[movingPoints.i][movingPoints.j] = 16; // 25 pts cell and moving points together
    } else if (board[movingPoints.i][movingPoints.j] == 20) {
        board[movingPoints.i][movingPoints.j] = 22; // pill cell and moving points together
    } else if (board[movingPoints.i][movingPoints.j] == 2) { // moving points on pacman cell, eaten by pacman
        score += 50;
        lblScore.value = score;
        isMovingPointsEaten = true;
    }

    Draw(lastPacmanPos);
}

// get all possible positions for a moving points to pass to, moving points will choose a random one
function getPossiblePositions(i, j) {

    let ans = new Array();

    if (i + 1 < board.length && (board[i + 1][j] == 0 || board[i + 1][j] == 2 || board[i + 1][j] == 5 || board[i + 1][j] == 6 || board[i + 1][j] == 7)) {
        ans.push([i + 1, j]);
    }
    if (i - 1 >= 0 && (board[i - 1][j] == 0 || board[i - 1][j] == 2 || board[i - 1][j] == 5 || board[i - 1][j] == 6 || board[i - 1][j] == 7)) {
        ans.push([i - 1, j]);
    }
    if (j + 1 < board[0].length &&  (board[i][j + 1] == 0 || board[i][j + 1] == 2 || board[i][j + 1] == 5 || board[i][j + 1] == 6 || board[i][j + 1] == 7)) {
        ans.push([i, j + 1]);
    }
    if (j - 1 >= 0 && (board[i][j - 1] == 0 || board[i][j - 1] == 2 || board[i][j - 1] == 5 || board[i][j - 1] == 6 || board[i][j - 1] == 7)) {
        ans.push([i, j - 1]);
    }
    return ans;
}

// draw game: walls, passages, candies, charachters
function Draw(key) {

    canvas.width = canvas.width; //clean board    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let value = board[i][j];

            let center = new Object();
            center.x = i * 35 + 17.5;
            center.y = j * 28 + 14;

            if (value == 0) drawPassages(center.x, center.y);
            else if (value == 2) drawPacmanShape(key, center.x, center.y);
            else if (value == 4) drawWalls(center.x, center.y);
            else if (value == 5 || value == 6 || value == 7 || value == 20) drawCandies(i, j, center.x, center.y);
            else if (value == 9 || value == 10 || value == 11 || value == 12 || value == 21) drawMonsters(center.x, center.y);
            else if (value == 13 || value == 14 || value == 15 || value == 16 || value == 22) drawMovingPoints(center.x, center.y);
        }
    }

}

// draw free cells
function drawPassages(x, y) {
    context.clearRect(x - 17.5, y - 14, 35, 28);
    context.beginPath();
    context.rect(x - 17.5, y - 14, 35, 28);
    context.lineWidth = 5;
    context.fillStyle = "black"; //color
    context.fill();
}

// manage pacman drawing by given pressed-key 
function drawPacmanShape(key, x, y) {
    if (key == 1) {
        drawPacman(x, y, 1.7 * Math.PI, 1.4 * Math.PI, key);
    } else if (key == 2) {
        drawPacman(x, y, 0.65 * Math.PI, 0.3 * Math.PI, key);
    } else if (key == 3) {
        drawPacman(x, y, 1.2 * Math.PI, 0.85 * Math.PI, key);
    } else if (key == 4) {
        drawPacman(x, y, 0.15 * Math.PI, 1.85 * Math.PI, key);
    }
}

// draw walls
function drawWalls(x, y) {

    context.beginPath();
    context.rect(x - 17.5, y - 14, 35, 28);
    context.lineWidth = 2;
    context.strokeStyle = "white";
    context.stroke();

}

// draw any type of candy
function drawCandies(i, j, x, y) {

    context.clearRect(x - 17.5, y - 14, 35, 28);
    context.beginPath();
    context.arc(x, y, 12, 0, 2 * Math.PI); // circle

    if (board[i][j] == 5) {
        context.fillStyle = food_color[0]; //5 pts candy
        context.fill();
    }
    else if (board[i][j] == 6) {
        context.fillStyle = food_color[1]; //10 pts candy
        context.fill();
    }
    else if (board[i][j] == 7) {
        context.fillStyle = food_color[2]; //25 pts candy
        context.fill();
    }
    else if (board[i][j] == 20) {
        context.clearRect(x - 17.5, y - 14, 35, 28);
        context.drawImage(pill, x - 17.5, y - 14, 35, 28);
    }
}

// draw pacman
function drawPacman(x, y, sAngle, eAngle, key) {

    context.clearRect(x - 17.5, y - 14, 35, 28);

    // Pacman face
    context.beginPath();
    context.arc(x, y, 14, sAngle, eAngle); // half circle
    context.lineTo(x, y);
    context.fillStyle = pac_color; //color
    context.fill();

    // Pacman eye
    context.beginPath();
    if (key == 1)
        context.arc(x - 10, y - 5, 3, 0, 2 * Math.PI); // circle
    else if (key == 2)
        context.arc(x - 10, y + 5, 3, 0, 2 * Math.PI); // circle
    else if (key == 3)
        context.arc(x - 2, y - 10, 3, 0, 2 * Math.PI); // circle
    else if (key == 4)
        context.arc(x + 2, y - 10, 3, 0, 2 * Math.PI); // circle

    context.fillStyle = "black"; //color
    context.fill();

}

// draw monsters
function drawMonsters() {

    for (let i = 0; i < monsters; i++) {
        let center = new Object();
        center.x = monsters_position[i].i * 35 + 17.5;
        center.y = monsters_position[i].j * 28 + 14;
        context.clearRect(center.x - 17.5, center.y - 14, 35, 28);
        context.drawImage(monsters_color[i], center.x - 17.5, center.y - 14, 35, 28);
    }
}

// draw moving points
function drawMovingPoints() {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            let center = new Object();
            center.x = i * 35 + 17.5;
            center.y = j * 28 + 14;
            if (board[i][j] == 13 || board[i][j] == 14 || board[i][j] == 15 || board[i][j] == 16) {
                context.clearRect(center.x - 17.5, center.y - 14, 35, 28);
                context.drawImage(movingPointsGif, center.x - 17.5, center.y - 14, 35, 28);
                break;
            }
        }
    }
}

// create walls
function buildWalls(board) {
    // start with greed full of passages
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (i == 0 || i == 19 || j == 0 || j == 19) board[i][j] = 4;
            else board[i][j] = 0;
        }
    }

    // create corridors
    board[0][9] = 0;
    board[0][10] = 0;
    board[19][9] = 0;
    board[19][10] = 0;

    writePacmanInWalls(board);

}

// write PAC '/n' MAN with walls
function writePacmanInWalls(board) {
    //P
    for (let i = 4; i < 7; i++) {
        board[i][4] = 4;
    }
    for (let i = 4; i < 7; i++) {
        board[i][5] = 4;
    }
    for (let i = 4; i < 7; i++) {
        board[i][6] = 4;
    }
    board[4][7] = 4;
    board[4][8] = 4;

    //A
    for (let i = 8; i < 11; i++) {
        board[i][4] = 4;
    }
    for (let i = 8; i < 11; i++) {
        board[i][5] = 4;
    }
    for (let i = 8; i < 11; i++) {
        board[i][6] = 4;
    }
    board[8][7] = 4;
    board[8][8] = 4;
    board[10][7] = 4;
    board[10][8] = 4;

    //C
    for (let i = 12; i < 15; i++) {
        board[i][4] = 4;
    }
    for (let i = 12; i < 15; i++) {
        board[i][8] = 4;
    }
    for (let i = 4; i < 9; i++) {
        board[12][i] = 4;
    }

    //M
    for (let i = 3; i < 8; i++) {
        board[i][12] = 4;
    }
    for (let i = 12; i < 17; i++) {
        board[3][i] = 4;
    }
    for (let i = 12; i < 17; i++) {
        board[5][i] = 4;
    }
    for (let i = 12; i < 17; i++) {
        board[7][i] = 4;
    }

    //A
    for (let i = 9; i < 12; i++) {
        board[i][12] = 4;
    }
    for (let i = 9; i < 12; i++) {
        board[i][13] = 4;
    }
    for (let i = 9; i < 12; i++) {
        board[i][14] = 4;
    }
    board[9][15] = 4;
    board[9][16] = 4;
    board[11][15] = 4;
    board[11][16] = 4;

    //N
    for (let i = 12; i < 17; i++) {
        board[13][i] = 4;
    }
    board[14][12] = 4;
    for (let i = 12; i < 17; i++) {
        board[15][i] = 4;
    }

}

// returns an shuffled array contains 60% 5 pts candy, 30% 15 pts candy, 10% 10 pts candy
function getShuffledCandiesArray(food) {
    let candies = new Array();

    //insert candies
    for (let i = 0; i < Math.floor(food * 0.6); i++) {
        candies[i] = 5;
    }

    for (let i = Math.floor(food * 0.6); i < Math.floor(food * 0.9); i++) {
        candies[i] = 6;
    }

    for (let i = Math.floor(food * 0.9); i < food; i++) {
        candies[i] = 7;
    }

    //shuffle array
    let from = 0;
    let to = Math.floor(Math.random() * food - from) + from;
    while (from != to) {
        let temp = candies[to];
        candies[to] = candies[from];
        candies[from] = temp;
        from++;
    }
    return candies;
}

// after monster movement - turn the cell's value as it was and set new cell's value
function setMonsterPosition(board, old_position, i, j) {

    if (board[old_position.i][old_position.j] == 9) {
        board[old_position.i][old_position.j] = 0;
        setNewMonstersPosition(i, j);
    } else if (board[old_position.i][old_position.j] == 10) {
        board[old_position.i][old_position.j] = 5;
        setNewMonstersPosition(i, j);
    } else if (board[old_position.i][old_position.j] == 11) {
        board[old_position.i][old_position.j] = 6;
        setNewMonstersPosition(i, j);
    } else if (board[old_position.i][old_position.j] == 12) {
        board[old_position.i][old_position.j] = 7;
        setNewMonstersPosition(i, j);
    } else if (board[old_position.i][old_position.j] == 21) {
        board[old_position.i][old_position.j] = 20;
        setNewMonstersPosition(i, j);
    }
}

// monster move to given cell, set new value
function setNewMonstersPosition(i, j) {

    if (board[i][j] == 0) {
        board[i][j] = 9; // 9 symbolize monster place and free
    } else if (board[i][j] == 5) {
        board[i][j] = 10; // 10 symbolize monster place and 5 pts candy
    } else if (board[i][j] == 6) {
        board[i][j] = 11; // 11 symbolize monster place and 15 pts candy
    } else if (board[i][j] == 7) {
        board[i][j] = 12; // 12 symbolize monster place and 25 pts candy
    } else if (board[i][j] == 20) {
        board[i][j] = 21; // 12 symbolize monster place and 25 pts candy
    }

}

/**Game settings setter - gets the values from the main screens*/
function setGameSettings(food_remain, game_length, monsters, food_color) {
    this.food_remain = food_remain;
    this.game_length = game_length;
    this.monsters = monsters;
    this.food_color = food_color;
}

/**Sets all the game keys */
function setsGameKeys(game_keys) {
    this.game_keys = game_keys;
}

/**Checks if the given key already in use by other direction*/
function keysEquals(index, key_code) {
    for (let i = 0; i < game_keys.length; i++) {
        if (i != index && game_keys[i] == key_code) {
            return true;
        }
    }
    return false;
}

/**Sets only one single key according to the index */
function setSingleKey(index, keyCode) {
    game_keys[index] = keyCode;
}

function playAudio() {

    audio = document.getElementById("gameAudio");
    audio.play();
    audio.loop = true;

}

//Stops the audio
function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
}

//Stops the game if already running
function stopGame() {
    if (gameRunning) {
        stopAudio();
        clearInterval(interval);
        clearInterval(interval2);
        removeEventListener("keydown", gameKeyEventDown);
        gameRunning = false;
    }
}

//Stops time and disables keys
function aboutModalOpened() {

    if (gameRunning) {
        clearInterval(interval);
        clearInterval(interval2);
        removeEventListener("keydown", gameKeyEventDown);
    }

    //removeEventListener("keyup", gameKeyEventUp);
}

//Returns time and enables keys
function aboutModalClosed() {
    if (gameRunning) {
        interval = setInterval(updateTime, 100);
        interval2 = setInterval(updatePositionsOfAutomaticCharacters, 500);
        addEventListener("keydown", gameKeyEventDown);
    }

}