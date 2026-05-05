// script.js - Fixed Speed + Posters + Clean Player Title

const mainContent = document.getElementById('mainContent');
const searchInput = document.getElementById('searchInput');

const API_KEY = "731a747b7083a0bdd240c0a658431e7f";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

// Popular items for initial load
const popularItems = [
  {title: "Breaking Bad", id: 1396, type: "tv"},
  {title: "Better Call Saul", id: 60059, type: "tv"},
  {title: "Snowfall", id: 71694, type: "tv"},
  {title: "The Boys", id: 76479, type: "tv"},
  {title: "Stranger Things", id: 66732, type: "tv"},
  {title: "The Mandalorian", id: 82856, type: "tv"},
  {title: "House of the Dragon", id: 94997, type: "tv"},
  {title: "Arcane", id: 94605, type: "tv"},
  {title: "Deadpool & Wolverine", id: 533535, type: "movie"},
  {title: "Dune: Part Two", id: 693134, type: "movie"},
  {title: "The Batman", id: 414906, type: "movie"},
  {title: "Reacher", id: 94997, type: "tv"}
];

// Search TMDB
async function searchTMDB(query) {
  if (!query || query.length < 2) return [];
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    ]);
    const movies = await movieRes.json();
    const tvs = await tvRes.json();

    return [
      ...movies.results.map(m => ({...m, type: 'movie'})),
      ...tvs.results.map(t => ({...t, type: 'tv'}))
    ].slice(0, 30);
  } catch (e) {
    return [];
  }
}

// Create Card
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="poster-container">
      <img src="${IMAGE_BASE}${item.poster_path || ''}" 
           alt="${item.title || item.name}" 
           onerror="this.src='https://via.placeholder.com/260x390/1f1f1f/666?text=${encodeURIComponent(item.title || item.name)}'">
    </div>
    <div class="card-info">
      <h3>${item.title || item.name}</h3>
    </div>
  `;

  card.addEventListener('click', () => {
    const title = encodeURIComponent(item.title || item.name);
    const type = item.type;
    let url = `player.html?title=${title}&id=${item.id}&type=${type}`;
    if (type === 'tv') url += "&season=1&episode=1";
    window.location.href = url;
  });

  return card;
}

// Render Search
async function renderSearch(query) {
  mainContent.innerHTML = `<h2 class="section-title">Results for "${query}"</h2><div class="row" id="search-row"></div>`;
  const row = document.getElementById('search-row');
  const results = await searchTMDB(query);
  
  results.forEach(item => row.appendChild(createCard(item)));
}

// Initial Load
async function loadInitialContent() {
  mainContent.innerHTML = `<h2 class="section-title">Trending Now</h2><div class="row" id="popular-row"></div>`;
  const row = document.getElementById('popular-row');

  // Fetch posters for popular items
  for (let item of popularItems) {
    try {
      const type = item.type;
      const res = await fetch(`https://api.themoviedb.org/3/${type}/${item.id}?api_key=${API_KEY}`);
      const data = await res.json();
      if (data.poster_path) item.poster_path = data.poster_path;
    } catch (e) {}
    row.appendChild(createCard(item));
  }
}

// Event Listener
searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length >= 2) {
    await renderSearch(query);
  } else {
    loadInitialContent();
  }
});

// Start
loadInitialContent();
