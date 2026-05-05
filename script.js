// script.js - Continue Watching Added (Preserves your original design)

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
  localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 12)));
}

function addToContinueWatching(item) {
  let list = getContinueWatching();
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

// Create Card with Continue Support
function createCard(item, isContinue = false) {
  const card = document.createElement('div');
  card.className = 'card';
  const title = item.title;

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
      ${isContinue && item.season ? `<p class="continue-info">S${item.season} E${item.episode}</p>` : ''}
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

// Render Continue Watching at top
function renderContinueWatching() {
  const cw = getContinueWatching();
  if (cw.length === 0) return;

  const html = `
    <h2 class="section-title">Continue Watching</h2>
    <div class="row" id="continue-row"></div>
  `;
  mainContent.insertAdjacentHTML('afterbegin', html);

  const row = document.getElementById('continue-row');
  cw.forEach(item => row.appendChild(createCard(item, true)));
}

// Your original render function (modified slightly)
async function renderRows(searchTerm = '') {
  mainContent.innerHTML = '';
  
  // Add Continue Watching first (only when not searching)
  if (!searchTerm) {
    renderContinueWatching();
  }

  // Original Trending + Categories
  const categories = [
    { title: "Trending Now", items: shows.slice(0, 12) },
    { title: "Action Movies", items: movies },
    { title: "Popular TV Shows", items: shows }
  ];

  categories.forEach(cat => {
    let filtered = cat.items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) return;

    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">${cat.title}</h2><div class="row" id="row-${cat.title.replace(/\s+/g,'')}"></div>`;
    mainContent.appendChild(section);

    const row = document.getElementById(`row-${cat.title.replace(/\s+/g,'')}`);

    filtered.forEach(item => {
      item
