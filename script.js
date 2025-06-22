async function loadApp() {
  const res = await fetch('data.json');
  const data = await res.json();

  renderHome(data.home);
  renderHiragana(data.hiragana);
  renderKatakana(data.katakana);
  renderVocabulary(data.vocabulary);
  renderQuiz(data.quiz);
  renderProgress(data.progress);
  setupNavigation();
}

// Example: Render Home
function renderHome(home) {
  const el = document.getElementById('home');
  el.innerHTML = `
    <div class="card">
      <div class="japanese-text">${home.welcome}</div>
      <h2>${home.title}</h2>
      <p>${home.description}</p>
    </div>
    <div class="card-grid">
      ${home.features.map(f => `
        <div class="card">
          <h3>${f.icon} ${f.title}</h3>
          <p>${f.desc}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Similar rendering functions:
function renderHiragana(hiragana) {
  const section = document.getElementById('hiragana');
  section.innerHTML = `<div class="card"><h2>Hiragana</h2>
    ${Object.entries(hiragana).map(([group, chars]) => `
      <h3>${group}</h3>
      <div class="hiragana-grid">
        ${chars.map(c => `
          <div class="hiragana-char">
            <div class="char-japanese">${c.char}</div>
            <div class="char-romaji">${c.romaji}</div>
          </div>`).join('')}
      </div>
    `).join('')}
  </div>`;
}

function renderKatakana(katakana) {
  const section = document.getElementById('katakana');
  section.innerHTML = `<div class="card"><h2>Katakana</h2>
    ${Object.entries(katakana).map(([group, chars]) => `

      <h3>${group}</h3>
      <div class="katakana-grid">
        ${chars.map(c => `
          <div class="katakana-char">
            <div class="char-japanese">${c.char}</div>
            <div class="char-romaji">${c.romaji}</div>
          </div>
        `).join('')}
      </div>

    `).join('')}
  </div>`;
}


function renderVocabulary(vocab) {
  const section = document.getElementById('vocabulary');
  section.innerHTML = `
    <div class="card"><h2>Vocabulary</h2></div>
    ${Object.entries(vocab).map(([title, words]) => `
      <div class="lesson-item">
        <h3>${title}</h3>
        ${words.map(w => `<p><strong>${w.jp}</strong> (${w.romaji}) - ${w.en}</p>`).join('')}
      </div>
    `).join('')}
  `;
}

function renderQuiz(questions) {
  const section = document.getElementById('quiz');
  section.innerHTML = `
    <div class="quiz-container">
      <h2>Quiz</h2>
      <div id="quiz-content">
        <div class="quiz-question" id="question"></div>
        <div class="quiz-options"></div>
        <button class="btn" onclick="nextQuestion()">Next</button>
      </div>
      <div id="quiz-result" style="display: none;">
        <h3>Quiz Complete!</h3>
        <p>Your Score: <span id="final-score">0</span></p>
        <button class="btn" onclick="restartQuiz()">Retry</button>
      </div>
    </div>
  `;
  quizData = questions;
  loadQuestion();
}

function renderProgress(progress) {
  const section = document.getElementById('progress');
  section.innerHTML = `
    <div class="card"><h2>Progress</h2>
    ${Object.entries(progress).map(([key, val]) => `
      <p>${key}: <progress value="${val}" max="100"></progress> ${val}%</p>
    `).join('')}
    </div>
  `;
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const id = item.getAttribute('data-section');
      document.getElementById(id).classList.add('active');
    });
  });
}

// Quiz logic (same as before)
let quizData = [], currentQuestion = 0, score = 0;

function loadQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById('question').textContent = q.question;
  const optionsEl = document.querySelector('.quiz-options');
  optionsEl.innerHTML = q.options.map((opt, idx) => `
    <div class="quiz-option" onclick="selectAnswer(this, ${idx === q.correct})">${opt}</div>
  `).join('');
}

function selectAnswer(el, isCorrect) {
  document.querySelectorAll('.quiz-option').forEach(opt => opt.style.pointerEvents = 'none');
  el.classList.add(isCorrect ? 'correct' : 'incorrect');
  if (isCorrect) score++;
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('final-score').textContent = score;
  }
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById('quiz-content').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  loadQuestion();
}

loadApp();
