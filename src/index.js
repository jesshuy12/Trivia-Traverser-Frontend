const canvas = document.getElementById("canvas")
const body = document.querySelector("body")
const startButton = document.getElementById("button")
const play = document.getElementById("play") // new button to play
const scoresButton = document.getElementById("scores")
const instructions = document.getElementById("instructions")
const about = document.getElementById("about")
const overlay = document.querySelector(".overlay")
let player
let obstacles = []
let gameSpeed = 1
let obstacleSpacing = -2
let x;
let y;
let score
let playerScore
let topTen = []

// application state
let myQuestions = []

//##############################################################################
//setting the canvas as the game area, and creates start, clear and, stop Functions
//start - starts the game
//clear - clears the canvas
//stop - stops the interval

let gameArea = {
  canvas : canvas,
  start : function() { //start function
    this.context = this.canvas.getContext("2d");
    if (newGame === false) {
      this.frameNo = playerScore
      this.interval = setInterval(updateGameArea, 5);
    } else {
    this.frameNo = 0
    this.interval = setInterval(updateGameArea, 5);
    }

  },
  clear : function() { // clear function
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
  clearInterval(this.interval);
  },
}//end of gameArea object

function everyinterval(n) {
  if ((gameArea.frameNo / n) % 1 == 0) {return true;}
  return false;
}

//##############################################################################
//creates Components in the gameArea
//crash logic

function component (width, height, color, x, y, type) {
  this.type = type
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.frameNo = 0
  this.update = function() { //updates the gameArea with the component
    ctx = gameArea.context;
    if (this.type == "text") {
      ctx.font = this.width + " " + this.height;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
    } else {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  this.newPosition = function() {  //updates new position
    this.x += this.speedX;
    this.y += this.speedY;
    //#################################
    //y (up and down) position
    if (this.y < 0) {
      this.y = 0
    } else if (this.y > 505) {
      this.y = 505
    }
    if (this.x < 0) {
      this.x = 0
    } else if (this.x > 960) {
      this.x = 960
    }
  }//end of newPosition Function

  this.crash = function(pipe) {  //crash function
  let playerleft = this.x;
  let playerright = this.x + (this.width);
  let playertop = this.y;
  let playerbottom = this.y + (this.height);
  let pipeleft = pipe.x;
  let piperight = pipe.x + (pipe.width);
  let pipetop = pipe.y;
  let pipebottom = pipe.y + (pipe.height);
  let crash = true;
    if ((playerbottom < pipetop) || (playertop > pipebottom) || (playerright < pipeleft) || (playerleft > piperight)) {
      crash = false;
    }
    return crash;
  }//end of crash function
}//end of compnent

//##############################################################################
//Movement Functions

function up() {
  player.speedY -= 1;
}

function down() {
  player.speedY += 1;
}

function left() {
  player.speedX -= 1;
}

function right() {
  player.speedX += 1;
}

function stop() {
  player.speedX = 0;
  player.speedY = 0;
}

//##############################################################################
//Movement addEventListener

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

document.onkeydown = function(e) {
  switch (e.keyCode) {
      case 37:
          left()
          break;
      case 38:
          up()
          break;
      case 39:
          right()
          break;
      case 40:
          down()
          break;
  }//end of switch
}//end of onkeydown

document.onkeyup = function(e) {
  switch (e.keyCode) {
      case 37:
          stop()
          break;
      case 38:
          stop()
          break;
      case 39:
          stop()
          break;
      case 40:
          stop()
          break;
  }//end of switch
}//end of onkeyup

//##############################################################################
//start and update game Functions

function startGame() {
    gameArea.start()
    player = new component(40, 40, "aqua", 10, 250) // create new player instance
    score = new component ("30px", "Consolas", "red", 50, 50, "text");



} //startGame function

function fetchData() {
  // for each new game fetch and store all the questions
  fetch(`http://localhost:3000/questions`
  )
  .then(res => res.json())
  .then(data => {
    myQuestions = data
    // set an "asked" key with value false for each question
    myQuestions.forEach(question => {
      question["asked"] = "false"
    })
    shuffleArray(myQuestions)
  })
}

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [array[i], array[j]] = [array[j], array[i]];
   }
}

play.addEventListener("click", function(e) {

  gameArea.stop() //stops the interval
  obstacles = [] // resets the obstacles to nothing
  fetchData()
  startGame() // restarts the game
})//end of start button event listener

function updateGameArea() {
    for (i = 0; i < obstacles.length; i += 1) { //loops for the obstacles array
      if (player.crash(obstacles[i])) {     //if player crashes into any of the objects
        if (player.crash(obstacles[i+1])){
          gameArea.stop();                        //game stops
          playerScore = gameArea.frameNo
          // build quiz goes here
          readyQuiz()
          toggleModal()
        }

        console.log(obstacles[i]);
        gameArea.stop();                        //game stops
        playerScore = gameArea.frameNo
        // build quiz goes here
        readyQuiz()
        toggleModal()
        // alert("Game Over!")
        // return;
      }
    }
    gameArea.clear();
    gameArea.frameNo += 1;
    score.frameNo += 1;
    if (gameArea.frameNo == 1 || everyinterval(150)) {
      x = gameArea.canvas.width;
      minHeight = 20;
      maxHeight = 200;
      height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
      minGap = 55;
      maxGap = 175;
      gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);// creates random sized gap for obstacle
      //component (width, height, color, x, y)
      obstacles.push(new component(55, height, "SlateGray ", x, 0)); //top obstacle
      obstacles.push(new component(55, 50, "SlateGray ", x, height + gap));
      obstacles.push(new component(55, 50, "Yellow ", x, height + 50 + gap));
      obstacles.push(new component(55, 400, "SlateGray ", x, height + gap + 100));
    }
    for (i = 0; i < obstacles.length; i += 1) {
      obstacles[i].x += obstacleSpacing;
      obstacles[i].update();
    }
    score.text = "SCORE: " + gameArea.frameNo;
    score.update();
    player.newPosition()
    player.update()
  }//end of updateGameArea

function fetchScores() {
  fetch('http://localhost:3000/statistics')
  .then(res => res.json())
  .then(scores => {
    topTen = scores
  })
}

// fetchScores()

scoresButton.addEventListener('click', () => {
  fetchScores()
  toggleModal()
  modalContent.innerHTML = '<div style="text-align: center" id="modal-text">Loading...</div>'
  setTimeout(function() {scoreContent = `<div style="text-align: center" id="modal-text">Top Scores</div>
                  <ol class="center-ol" id="modal-text">
                  ${topTen.map( (stat, index) => {
                    return `${index + 1}. ${stat.name} - <span id="mt-color">${stat.score}</span> <br>`
                  }).join("")}
                  </ol>
                  `

  modalContent.innerHTML = scoreContent}, 1000)
})

instructions.addEventListener("click", function(e) {
  toggleModal()
  modalContent.innerHTML = '<div style="text-align: center" id="modal-text">Dodge the Pipes <br> Keys: Up, Down, Left, Right <br> Answer Trivia Correct to Continue Game <br> Answer Trivia Incorrect, you lose</div>'
})//end of instructions addEventListener

about.addEventListener("click", function(e) {
  toggleModal()
  modalContent.innerHTML = '<div style="text-align: center" id="modal-text">Created By: <br> Dave and Jessy</div>'
})//end of instructions addEventListener

overlay.addEventListener("click", function(e) {
  const modalContent = document.querySelector('.modal_content')
  if (modalContent.innerText.includes("Top Scores") || modalContent.innerText.includes("Dodge") || modalContent.innerText.includes("Dave")) {
    toggleModal()
  }


})
