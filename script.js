// script.js - Clean & Fast Continue Watching

const mainContent = document.getElementById('mainContent');
const searchInput = document.getElementById('searchInput');

const API_KEY = "731a747b7083a0bdd240c0a658431e7f";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

const CW_KEY = 'fredflix_continue_watching';

// Continue Watching Functions
function getContinueWatching() {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY)) || [];
  } catch(e) {
    return [];
  }
}

function saveContinueWatching(list) {
  localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 15))); // max 15 items
}

function addToContinueWatching(item) {
  let list = getContinueWatching();
  // Remove old entry
  list = list.filter(i => !(i.id === item.id && i.type === item.type));
  
  list.unshift({
    id: item.id,
    type: item.type,
    title: item.title,
    poster_path: item.poster_path,
    season: item.season || 1,
    episode: item.episode || 1,
    progress: item.progress || 0,
    timestamp: Date.now()
  });
  
  saveContinueWatching(list);
}

// Create Card
function createCard(item, isContinue = false) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const title = item.title || item.name;
  
  card.innerHTML = `
    <div class="poster-container">
      <img src="${IMAGE_BASE}${item.poster_path || ''}" 
           alt="${title}" 
           onerror="this.src='https://via.placeholder.com/260x390/1f1f1f/666?text=${encodeURIComponent(title)}'">
      ${isContinue && item.progress > 5 ? `
        <div class="progress-bar">
          <div class="progress" style="width: ${item.progress}%"></div>
        </div>
      ` : ''}
    </div>
    <div class="card-info">
      <h3>${title}</h3>
      ${isContinue && item.season ? `
        <p class="continue-info">S${item.season} E${item.episode}</p>
      ` : ''}
    </div>
  `;

  card.addEventListener('click', () => {
    let url = `player.html?title=${encodeURIComponent(title)}&id=${item.id}&type=${item.type}`;
    if (item.type === 'tv') {
      url += `&season=${item.season || 1}&episode=${item.episode || 1}`;
    }
    window.location.href = url;
  });

  return card;
}

// Render All Content
function renderContent(searchTerm = '') {
  mainContent.innerHTML = '';

  const continueList = getContinueWatching();

  // Continue Watching Section
  if (continueList.length > 0 && !searchTerm) {
    const cwSection = document.createElement('div');
    cwSection.innerHTML = `<h2 class="section-title">Continue Watching</h2><div class="row" id="cw-row"></div>`;
    mainContent.appendChild(cwSection);

    const cwRow = document.getElementById('cw-row');
    continueList.forEach(item => {
      cwRow.appendChild(createCard(item, true));
    });
  }

  // Other Categories
  const categories = [
    { title: "Trending Now", items: [...movies.slice(0,8), ...shows.slice(0,8)] },
    { title: "Action Movies", items: movies },
    { title: "Popular TV Shows", items: shows }
  ];

  categories.forEach(cat => {
    let items = cat.items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (items.length === 0) return;

    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">${cat.title}</h2><div class="row" id="row-${cat.title.replace(/\s+/g,'')}"></div>`;
    mainContent.appendChild(section);

    const row = document.getElementById(`row-${cat.title.replace(/\s+/g,'')}`);
    items.forEach(item => {
      // Add type for navigation
      item.type = movies.some(m => m.id === item.id) ? 'movie' : 'tv';
      row.appendChild(createCard(item));
    });
  });
}

// Search
searchInput.addEventListener('input', (e) => {
  renderContent(e.target.value.trim());
});

// Start
renderContent();
