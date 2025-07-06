async function loadApp() {
  const res = await fetch('data.json');
  const data = await res.json();

  renderHome(data.home, data.words);
  renderHiragana(data.hiragana);
  renderKatakana(data.katakana);
  renderQuiz(data.quiz);
  renderKanjiLevels(data.KanjiLevels, data.Kanji);
  setupNavigation();
}

function renderHome(home, words) {
  const el = document.getElementById('home');
  el.innerHTML = `
    <input
      id="words-search"
      type="text"
      placeholder="🔍 Search your words..."
      class="search-bar"
    />

    <div class="card">
      <div class="japanese-text">${home.welcome}</div>
      <h2>${home.title}</h2>
      <p>${home.description}</p>
    </div>

    <div id="words-popup-container">
      ${
        Object.entries(words).map(([jpWord, entries]) => `
          <div class="word-popup"
               data-jp="${jpWord.toLowerCase()}"
               data-romaji="${entries.map(e => e.romaji.toLowerCase()).join(' ')}"
               data-en="${entries.map(e => e.en.toLowerCase()).join(' ')}"
               data-np="${entries.map(e => e.np.toLowerCase()).join(' ')}">
            <p><strong>${jpWord}</strong></p>
            <p class="romaji">${entries.map(e => e.romaji).join(' / ')}</p>
            <p class="en">${entries.map(e => e.en).join(' / ')}</p>
            <p class="np">${entries.map(e => e.np).join(' / ')}</p>
          </div>
        `).join('')
      }
    </div>
  `;

  const popupContainer = document.getElementById('words-popup-container');
  const searchInput = document.getElementById('words-search');
  const wordElements = Array.from(popupContainer.querySelectorAll('.word-popup'));

  let animationInterval = null;

  function hideAllWords() {
    wordElements.forEach(el => el.classList.remove('visible'));
  }

  function isOverlapping(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(
      r1.right < r2.left ||
      r1.left > r2.right ||
      r1.bottom < r2.top ||
      r1.top > r2.bottom
    );
  }

function showMultipleRandomWords() {
  hideAllWords();
  
  const popupHeight = 300;
  const popupWidth = 200;
  const margin = 10;

  const maxTop = popupContainer.clientHeight - popupHeight - margin;
  const maxLeft = popupContainer.clientWidth - popupWidth - margin;

  console.log('maxLeft, maxTop:', maxLeft, maxTop);

  // If container is too small, don't try positioning
  if (maxTop <= 0 || maxLeft <= 0) {
    console.warn('Popup container too small to position words. Aborting showMultipleRandomWords.');
    return;
  }

  const count = Math.min(3, wordElements.length);
  const chosen = [];
  const alreadyPlaced = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    let attempt = 0;
    while (attempt < 20 && !placed) {
      const idx = Math.floor(Math.random() * wordElements.length);
      const word = wordElements[idx];

      if (chosen.includes(word)) {
        attempt++;
        continue;
      }

      const top = Math.random() * maxTop + margin;
      const left = Math.random() * maxLeft + margin;

      word.style.top = `${top}px`;
      word.style.left = `${left}px`;
      word.style.display = 'flex';

      placed = !alreadyPlaced.some(other => isOverlapping(word, other));

      if (placed) {
        word.classList.add('visible');
        chosen.push(word);
        alreadyPlaced.push(word);
      } else {
        word.style.display = 'none';
      }

      attempt++;
    }
  }
}


function startAnimation() {
  console.log('Starting animation');
  stopAnimation();
  function cycle() {
    console.log('Cycle start');
    hideAllWords();
    showMultipleRandomWords();
    animationInterval = setTimeout(() => {
      console.log('Cycle end');
      cycle();
    }, 4000);
  }
  cycle();
}

function stopAnimation() {
  console.log('Stopping animation');
  if (animationInterval) {
    clearTimeout(animationInterval);
    animationInterval = null;
  }
}


 searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  stopAnimation();
  hideAllWords();

  if (query === '') {
    // Reset words to absolute positioning for animation
    wordElements.forEach(word => {
      word.style.position = 'absolute';
      word.style.top = '';
      word.style.left = '';
      word.style.marginBottom = '';
      word.style.display = 'none';
      word.classList.remove('visible');
    });

    startAnimation();
  } else {
    // Show matched words in normal flow, stacked vertically
    const matches = wordElements.filter(el => {
      const jp = el.dataset.jp;
      const romaji = el.dataset.romaji;
      const en = el.dataset.en;
      const np = el.dataset.np;
      return jp.includes(query) || romaji.includes(query) || en.includes(query) || np.includes(query);
    });

    matches.forEach(el => {
      el.style.position = 'relative';   // Normal flow
      el.style.top = 'auto';
      el.style.left = 'auto';
      el.style.marginBottom = '1rem';   // Spacing between words
      el.style.display = 'flex';
      el.classList.add('visible');
    });
  }
});

  startAnimation();
}


function renderHiragana(hiragana) {
  const section = document.getElementById('hiragana');

  // Build the HTML content for the Hiragana chart
  section.innerHTML = `
    <div class="card">
      <h2>Hiragana-Chart&nbsp;&nbsp;&nbsp;[With Sound 🔊]</h2>
      ${Object.entries(hiragana).map(([group, chars]) => `
        <h3>${group}</h3>
        <div class="hiragana-grid">
          ${chars.map(c => `
            <div class="hiragana-char">
              <div class="char-japanese" data-audio="${c.audio}">${c.char}</div>
              <div class="char-romaji">${c.romaji}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  // Initialize a single reusable audio player
  const audioPlayer = new Audio();
  audioPlayer.preload = 'auto'; // or 'none' if needed

  // Select all characters with audio
  const chars = section.querySelectorAll('.char-japanese');

  // Attach audio play behavior
  chars.forEach(charEl => {
    ['mouseenter', 'click'].forEach(event => {
      charEl.addEventListener(event, () => {
        const src = charEl.getAttribute('data-audio');
        if (!src) return;

        const currentSrc = audioPlayer.src.split('/').pop(); // filename only
        const newSrc = src.split('/').pop();

        if (currentSrc !== newSrc) {
          audioPlayer.pause();
          audioPlayer.src = src;
        }

        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Audio play error:', err);
          }
        });
      });
    });
  });
}


function renderKatakana(katakana) {
  const section = document.getElementById('katakana');
  section.innerHTML = `<div class="card"><h2>Hiragana-Chart&nbsp;&nbsp;&nbsp;[With Sound 🔊]</h2>
    ${Object.entries(katakana).map(([group, chars]) => `
      <h3>${group}</h3>
      <div class="katakana-grid">
        ${chars.map(c => `
          <div class="katakana-char">
            <div class="char-japanese" data-audio="${c.audio}">${c.char}</div>
            <div class="char-romaji">${c.romaji}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>`;

  const chars = section.querySelectorAll('.char-japanese');
  const audioPlayer = new Audio();

  chars.forEach(charEl => {
    ['mouseenter', 'click'].forEach(event => {
      charEl.addEventListener(event, () => {
        const src = charEl.getAttribute('data-audio');
        if (!src) return;

        if (audioPlayer.src !== src) {
          audioPlayer.pause();
          audioPlayer.src = src;
        }

        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Audio play error:', err);
          }
        });
      });
    });
  });
}



function renderKanjiLevels(levelsData, kanjiDescriptions) {
  const container = document.getElementById('levels-container');
  const descEl = document.getElementById('kanji-desc');
  let activeLevel = null;

  // Hide the kanji description initially
  descEl.style.display = 'none';
  container.style.display = 'flex'; // Ensure it's visible on load

  // Render all level cards
  container.innerHTML = Object.keys(levelsData).map(level => {
    const descObj = kanjiDescriptions.find(k => k.char === level);
    const description = descObj ? descObj.romaji : "No description available";

    return `
      <div class="kanji-level-card" data-level="${level}">
        <h3>${level}</h3>
        <p class="level-desc">${description}</p>
        <p>Click to see</p>
      </div>
    `;
  }).join('');

  // Click event for selecting a level
  container.addEventListener('click', e => {
    const card = e.target.closest('.kanji-level-card');
    if (!card) return;

    const level = card.getAttribute('data-level');
    const kanjiList = levelsData[level] || [];

    activeLevel = level;

 descEl.innerHTML = `
  <button id="back-to-levels" style="margin-bottom:1rem;">← Back to Levels</button>
  <h3>${level} Kanji:</h3>
  <input type="text" id="kanji-search" placeholder="Search kanji meaning or Nepali..." style="margin-bottom:1rem; padding: 0.5rem; width: 100%; box-sizing: border-box;"/>
  <div id="kanji-list">
    ${
      kanjiList.length > 0
      
      ? kanjiList.map(k => `
        <div class="kanji-item">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: baseline;">
            <span class="kanji-char"><strong>${k.char}</strong></span>
            <span class="kanji-furigana">${k.furigana}</span>
            <span class="kanji-meaning">${k.meaning}</span>
            <span class="kanji-nepali">${k.nepali}</span>
          </div>
          <div class="kanji-readings" style="margin-left: 2rem; color: #555;">
            ${k.readings || ""}
          </div>
        </div>
      `).join('')
        : `<p>No kanji data available for ${level}</p>`
    }
  </div>
`;

// Add this right here:
const searchInput = document.getElementById('kanji-search');
const kanjiListContainer = document.getElementById('kanji-list');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  const kanjiItems = kanjiListContainer.querySelectorAll('.kanji-item');

  kanjiItems.forEach(item => {
    const meaning = item.querySelector('.kanji-meaning').textContent.toLowerCase();
    const nepali = item.querySelector('.kanji-nepali').textContent.toLowerCase();
    const char = item.querySelector('.kanji-char').textContent.toLowerCase();
    const furigana = item.querySelector('.kanji-furigana').textContent.toLowerCase();

    if (
      meaning.includes(query) ||
      nepali.includes(query) ||
      char.includes(query) ||
      furigana.includes(query)   // <-- add this line
    ) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
});


    // Hide levels, show kanji
    container.style.display = 'none';
    descEl.style.display = 'block';

    // Enable back button
    document.getElementById('back-to-levels').addEventListener('click', () => {
      descEl.style.display = 'none';
      container.style.display = 'flex'; // Or 'grid', depending on your layout
      activeLevel = null;
    });
  });
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
  currentQuestion = 0;
  score = 0;
  loadQuestion();
}

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
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-content').style.display = 'block';
  loadQuestion();
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

loadApp();
