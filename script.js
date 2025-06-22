async function searchWord() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsDiv = document.getElementById('results');

  if (!query) {
    alert("Please enter a word.");
    return;
  }

  try {
    const response = await fetch('dictionary.json');
    const data = await response.json();

    const filtered = data.filter(entry =>
      entry.kanji.includes(query) ||
      entry.reading.includes(query) ||
      entry.meaning.toLowerCase().includes(query)
    );

    resultsDiv.innerHTML = '';

    if (filtered.length === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
      filtered.forEach(entry => {
        resultsDiv.innerHTML += `
          <div class="entry">
            <div class="kanji">${entry.kanji}</div>
            <div class="reading">${entry.reading}</div>
            <div class="meaning">${entry.meaning}</div>
            <div class="example">${entry.example}</div>
          </div>
        `;
      });
    }

    resultsContainer.style.display = 'block';

  } catch (err) {
    console.error('Error loading dictionary:', err);
    resultsDiv.innerHTML = '<p>Error loading dictionary data.</p>';
    resultsContainer.style.display = 'block';
  }
}
