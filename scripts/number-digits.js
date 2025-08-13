// Initialize game state
let score = 0;
let lives = 3;
let highScore = localStorage.getItem("digitsHighScore") || 0;
let currentNumber = 0;

// Initialize DOM elements
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const repeatBtn = document.getElementById("repeat-btn");
const placeholders = document.querySelectorAll(".placeholder");
const cards = document.querySelectorAll(".card");
const modal = document.getElementById("game-over-modal");
const finalScoreEl  = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const gameIntroOverlay = document.getElementById("game-intro");

// Set initial high score
highScoreEl.textContent = highScore;

// Drag and drop setup
cards.forEach(card => {
  card.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.textContent);
  });
});

placeholders.forEach(ph => {
  ph.addEventListener("dragover", e => {
    e.preventDefault();
  });
  ph.addEventListener("drop", e => {
    e.preventDefault();
    const digit = e.dataTransfer.getData("text/plain");
    e.target.textContent = digit;
    e.target.dataset.value = digit;
    // Add green color when number is placed
    e.target.classList.remove('incorrect');
    e.target.classList.add('has-number');
  });
});

function speakNumber(num) {
  const msg = new SpeechSynthesisUtterance(num.toString());
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}

function startGame() {
  // Hide the intro overlay
  gameIntroOverlay.classList.add('hidden');
  
  // Reset game state
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  
  // Show and enable the Check Answer button
  submitBtn.style.display = "inline-block";
  submitBtn.disabled = false;
  
  // Show the Repeat Number button
  repeatBtn.style.display = "inline-flex";
  
  // Start first round
  nextRound();
}

function nextRound() {
  // Clear placeholders and reset colors
  placeholders.forEach(ph => {
    ph.textContent = ph.dataset.place.charAt(0).toUpperCase() + ph.dataset.place.slice(1);
    delete ph.dataset.value;
    // Reset all color classes
    ph.classList.remove('has-number', 'incorrect');
  });
  currentNumber = Math.floor(Math.random() * 900) + 100; // Ensure 3 digits (100-999)
  speakNumber(currentNumber);
  
  // Enable submit button for the new round
  submitBtn.disabled = false;
}

function checkAnswer() {
  const hundredsEl = placeholders[0];
  const tensEl = placeholders[1];
  const onesEl = placeholders[2];

  const hundreds = parseInt(hundredsEl.dataset.value || 0) || 0;
  const tens = parseInt(tensEl.dataset.value || 0) || 0;
  const ones = parseInt(onesEl.dataset.value || 0) || 0;
  const answer = hundreds * 100 + tens * 10 + ones;

  if (answer === currentNumber) {
    // If correct, increment score and start new round with clean board
    score++;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("digitsHighScore", highScore);
      highScoreEl.textContent = highScore;
    }
    nextRound();
  } else {
    // If incorrect, mark wrong digits in red but keep correct ones green
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      gameOver();
      return;
    }

    const correctDigits = currentNumber.toString().padStart(3, '0');
    
    // Check each digit and mark incorrect ones
    [
      { el: hundredsEl, value: hundreds, correct: parseInt(correctDigits[0]) },
      { el: tensEl, value: tens, correct: parseInt(correctDigits[1]) },
      { el: onesEl, value: ones, correct: parseInt(correctDigits[2]) }
    ].forEach(({ el, value, correct }) => {
      if (value !== correct) {
        el.classList.remove('has-number');
        el.classList.add('incorrect');
        // Reset animation
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = null;
      } else {
        el.classList.add('has-number');
        el.classList.remove('incorrect');
      }
    });
  }
}

function gameOver() {
  // Hide and disable the Check Answer button
  submitBtn.style.display = "none";
  submitBtn.disabled = true;
  // Hide the Repeat Number button
  repeatBtn.style.display = "none";
  finalScoreEl.textContent = score;
  modal.classList.remove("hidden");
}

// Event Listeners
startBtn.addEventListener("click", () => {
  startGame();
  modal.classList.add("hidden");
  // No need to hide start button as it's in the overlay
  submitBtn.style.display = "inline-block";
  repeatBtn.style.display = "inline-flex";
});

submitBtn.addEventListener("click", checkAnswer);

repeatBtn.addEventListener("click", () => {
  if (currentNumber > 0) {
    speakNumber(currentNumber);
  }
});

restartBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  startGame();
});
