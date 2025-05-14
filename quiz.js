const questionBox = document.getElementById('question');
const answersContainer = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const navContainer = document.getElementById('question-nav');
const endButtons = document.getElementById('end-buttons');

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// Fetch questions
fetch('https://opentdb.com/api.php?amount=20&type=multiple')
  .then(res => res.json())
  .then(data => {
    questions = data.results.map(formatQuestion);
    generateQuestionNav();
    showQuestion();
  })
  .catch(err => {
    questionBox.textContent = 'Failed to load questions.';
    console.error(err);
  });

// Format and decode question
function formatQuestion(q) {
  const correct = decodeHTML(q.correct_answer);
  const incorrect = q.incorrect_answers.map(decodeHTML);
  const options = shuffle([correct, ...incorrect]);
  return {
    question: decodeHTML(q.question),
    correct,
    options
  };
}

// Display current question
function showQuestion() {
  const current = questions[currentQuestionIndex];
  questionBox.textContent = `Q${currentQuestionIndex + 1}: ${current.question}`;
  answersContainer.innerHTML = '';

  current.options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'option-card';

    const label = document.createElement('label');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = option;

    label.appendChild(input);
    label.appendChild(document.createTextNode(option));
    card.appendChild(label);
    answersContainer.appendChild(card);
  });
}

// Next button click
nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert('Please select an answer!');
    return;
  }

  userAnswers[currentQuestionIndex] = {
    question: questions[currentQuestionIndex].question,
    selected: selected.value,
    correct: questions[currentQuestionIndex].correct
  };

  highlightAttempted(currentQuestionIndex);

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

// Generate left-side navigation
function generateQuestionNav() {
  navContainer.innerHTML = '';
  questions.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.textContent = index + 1;
    btn.id = `nav-btn-${index}`;
    btn.addEventListener('click', () => {
      currentQuestionIndex = index;
      showQuestion();
    });
    navContainer.appendChild(btn);
  });
}

// Highlight attempted questions
function highlightAttempted(index) {
  const btn = document.getElementById(`nav-btn-${index}`);
  if (btn) {
    btn.style.backgroundColor = '#b2ebf2'; // Light blue
  }
}

// Show final result
function showResults() {
  let score = 0;
  userAnswers.forEach(ans => {
    if (ans.selected === ans.correct) score++;
  });

  // Save result to history in localStorage
const quizResult = {
  score: score,
  time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
};


  

  const resultHtml = `
    <h1>Quiz Completed!</h1>
    <p>Your Score: <strong>${score} / ${questions.length}</strong></p>
    <ul>
      ${userAnswers.map(ans => `
        <li>
          <strong>Q:</strong> ${ans.question}<br>
          <strong>Your answer:</strong> ${ans.selected}<br>
          <strong>Correct answer:</strong> ${ans.correct}
        </li>
      `).join('')}
    </ul>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="retryQuiz()" class="btn">Retry</button>
      <button onclick="goHome()" class="btn">Home</button>
    </div>
  `;

  document.querySelector('.quiz-container').innerHTML = resultHtml;
}

// Decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Shuffle options
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Retry the quiz
function retryQuiz() {
  location.reload();
}

// Go to home page
function goHome() {
  window.location.href = 'index.html'; // Or wherever your home page is
}
