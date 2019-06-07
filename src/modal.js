const btn = document.getElementById('modal_opener');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal_content')

let newGame
let currentQuestion
let userAnswer

function toggleModal() {
  let currentState = modal.style.display;

  // If modal is visible, hide it - otherwise, display it
  if (currentState === 'none') {
    modal.style.display = 'block';
  } else {
    modal.style.display = 'none';
  }
}

const readyQuiz = function() {

  function buildQuiz() {

    // select the first question in the array
    if (myQuestions.length === 0) {
      newGame = true
      let endGameText = `<div style="text-align: center" id="modal-text">Game over! Enter username to save your score: <input id="username"><input type="submit" value="Save score" id="submit-score"></div>`
      modalContent.innerHTML = endGameText
      const submitScoreButton = document.getElementById("submit-score")
      submitScoreButton.addEventListener("click", () => {
        let score = ++playerScore
        let username = document.getElementById("username").value
        postScore(username, score)
        gameArea.clear()
        modalContent.innerHTML = `<div style="text-align: center" id="modal-text">Score saved! Press Play to start a new game</div>`
        setTimeout(function() {
          toggleModal()
        }, 2000)
      })
    } else {
      currentQuestion = myQuestions.shift()

      let quiz = `<h2 id="modal-text">You collided with a column!</h2>
                  <h3 style="text-align: center" id="modal-text">Answer this question to proceed:</h3>
                  <img src="${currentQuestion.url}" height="320" width="525" class="center"> <br> <br>`

      modalContent.innerHTML = quiz

      let answersForm = document.createElement('form')
      answersForm.className = "center-answers"
      modalContent.appendChild(answersForm)

      let answerA = `<input type="radio" value="a" name="answer"> a: ${currentQuestion.answers["a"]}  `
      let answerB = `<input type="radio" value="b" name="answer"> b: ${currentQuestion.answers["b"]}  `
      let answerC = `<input type="radio" value="c" name="answer"> c: ${currentQuestion.answers["c"]}  `

      answersForm.innerHTML += `${answerA}<br>`
      answersForm.innerHTML += `${answerB}<br>`
      answersForm.innerHTML += `${answerC}<br><br>`

      let newSubmitButton = document.createElement('button')
      newSubmitButton.id = "submit"
      newSubmitButton.style = "display: block; margin: 0 auto;"
      newSubmitButton.className = "form-submit-button"
      newSubmitButton.innerText = "Submit"
      answersForm.appendChild(newSubmitButton)

      newSubmitButton = document.getElementById("submit");
      newSubmitButton.addEventListener("click", handleSubmit);
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    // mark the question as asked
    currentQuestion.asked = "true"
    let correctAnswer = currentQuestion.correctAnswer
    userAnswer = document.querySelector('input[name="answer"]:checked').value;

    if (userAnswer === correctAnswer && myQuestions.length === 0) {
      newGame = false
      modalContent.innerHTML = '<div style="text-align: center" id="modal-text">You answered the final question correctly! The last round will resume in five seconds (make it count!)...</div>'
      setTimeout(function() {
        toggleModal()
        gameArea.stop() //stops the interval
        obstacles = [] // resets the obstacles to nothing
        startGame() // restarts the game
      }, 5000)
    } else if (userAnswer === correctAnswer) {
        newGame = false
        modalContent.innerHTML = '<div style="text-align: center" id="modal-text">Correct! Resuming in three seconds (your score will persist!)...</div>'
        setTimeout(function() {
          toggleModal()
          gameArea.stop() //stops the interval
          obstacles = [] // resets the obstacles to nothing
          startGame() // restarts the game
        }, 3000)
      } else {
        // if answer is wrong or blank
        newGame = true
        let endGameText = `<div style="text-align: center" id="modal-text">Incorrect. Enter username to save your score: <input id="username"><input type="submit" value="Save score" id="submit-score"></div>`
        modalContent.innerHTML = endGameText
        const submitScoreButton = document.getElementById("submit-score")
        submitScoreButton.addEventListener("click", () => {
          let score = ++playerScore
          let username = document.getElementById("username").value
          postScore(username, score)
          gameArea.clear()
          modalContent.innerHTML = `<div style="text-align: center" id="modal-text">Score saved! Press Play to start a new game</div>`
          setTimeout(function() {
            toggleModal()
          }, 2000)
        })
      }
  }

  function postScore(username, score) {
    fetch('http://localhost:3000/statistics', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          name: username,
          score: score
        })
      })
    }

  buildQuiz();
}
