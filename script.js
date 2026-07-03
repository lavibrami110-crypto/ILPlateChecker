const plateInput = document.getElementById('plateInput');
const searchButton = document.getElementById('searchButton');
const favoriteButton = document.getElementById('favoriteButton');
const favoriteNote = document.getElementById('favoriteNote');
const resultsCard = document.getElementById('resultsCard');
const statusDot = document.getElementById('statusDot');
const carModel = document.getElementById('carModel');
const cursorStar = document.getElementById('cursorStar');
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

const samplePlate1 = {
  plate: '12-345-67',
  manufacturer: 'Toyota',
  model: 'Corolla',
  year: '2018',
  fuel: 'Hybrid',
  owner: 'Lior Cohen',
  registration: 'Public',
  status: 'Active',
  statusColor: '#22d3ee',
  paint: ['#3b82f6', '#8b5cf6'],
  accent: '#22d3ee'
};

const samplePlate2 = {
  plate: '99-111-22',
  manufacturer: 'Mazda',
  model: '3',
  year: '2022',
  fuel: 'Gasoline',
  owner: 'Dana Levi',
  registration: 'Public',
  status: 'Active',
  statusColor: '#22d3ee',
  paint: ['#38bdf8', '#6366f1'],
  accent: '#f97316'
};

const samplePlate3 = {
  plate: '48-320-26',
  manufacturer: 'Hyundai',
  model: 'Ioniq 5',
  year: '2024',
  fuel: 'Electric',
  owner: 'Avi Gold',
  registration: 'Public',
  status: 'Active',
  statusColor: '#22d3ee',
  paint: ['#0ea5e9', '#a855f7'],
  accent: '#22d3ee'
};

const localData = {
  '12-345-67': samplePlate1,
  '12 345 67': samplePlate1,
  '1234567': samplePlate1,
  '99-111-22': samplePlate2,
  '99 111 22': samplePlate2,
  '9911122': samplePlate2,
  '48-320-26': samplePlate3,
  '48 320 26': samplePlate3,
  '4832026': samplePlate3
};

let currentResult = null;

function normalizePlate(value) {
  return (value || '').replace(/[^0-9]/g, '');
}

function formatPlate(value) {
  const digits = normalizePlate(value);
  if (/^\d{7}$/.test(digits)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  if (/^\d{8}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 6) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }
  return value.trim().toUpperCase();
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

const stars = [];

function createStars() {
  stars.length = 0;
  const count = Math.floor(window.innerWidth / 8);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.35,
      twinkle: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const star of stars) {
    star.phase += star.twinkle;
    const pulse = 0.7 + Math.sin(star.phase) * 0.25;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha * pulse})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

function updateCursorStar() {
  targetX += (mouseX - targetX) * 0.2;
  targetY += (mouseY - targetY) * 0.2;
  cursorStar.style.left = `${targetX}px`;
  cursorStar.style.top = `${targetY}px`;
}

const particles = [];

function emitParticle(x, y) {
  particles.push({
    x,
    y,
    radius: Math.random() * 2 + 1,
    alpha: 1,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7 - 0.4,
    life: 40
  });
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    p.alpha = p.life / 40;
    ctx.beginPath();
    ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function animate() {
  drawStars();
  drawParticles();
  updateCursorStar();
  requestAnimationFrame(animate);
}

function setResults(data) {
  document.getElementById('plateValue').textContent = data.plate;
  document.getElementById('manufacturerValue').textContent = data.manufacturer;
  document.getElementById('modelValue').textContent = data.model;
  document.getElementById('yearValue').textContent = data.year;
  document.getElementById('fuelValue').textContent = data.fuel;
  document.getElementById('ownerValue').textContent = data.registration === 'Public' ? data.owner : 'Private / Restricted';
  document.getElementById('registrationValue').textContent = data.registration;
  document.getElementById('statusValue').textContent = data.status;
  statusDot.style.background = data.statusColor;

  carModel.classList.toggle('found', data.status === 'Active');
  if (data.paint) {
    const body = document.querySelector('.car-body');
    body.style.background = `linear-gradient(135deg, ${data.paint[0]}, ${data.paint[1]})`;
  }

  if (!resultsCard.classList.contains('visible')) {
    resultsCard.classList.remove('hidden');
    void resultsCard.offsetWidth;
    resultsCard.classList.add('visible');
  }
}

async function searchPlate() {
  const query = plateInput.value.trim();
  const normalized = normalizePlate(query);
  if (!normalized) {
    return;
  }
  const formattedPlate = formatPlate(query);
  const compactQuery = query.replace(/[^0-9]/g, '');

  let result = null;

  if (window.pywebview && window.pywebview.api) {
    try {
      result = await window.pywebview.api.lookup_plate(formattedPlate);
    } catch (error) {
      result = { error: error.message || String(error) };
    }
  }

  const candidates = [
    normalized,
    compactQuery,
    formattedPlate,
    formattedPlate.replace(/\s+/g, ''),
    formattedPlate.replace(/-/g, ''),
    query,
    query.replace(/[-\s]+/g, '')
  ];
  let local = null;
  for (const candidate of candidates) {
    if (candidate && localData[candidate]) {
      local = localData[candidate];
      break;
    }
  }

  if (local) {
    result = local;
  } else if (!result || result.error) {
    result = {
      plate: formattedPlate || normalized || 'Unknown',
      manufacturer: 'Unknown',
      model: 'Unknown',
      year: 'Unknown',
      fuel: 'Unknown',
      owner: 'Not available',
      registration: 'Not available',
      status: result && result.error ? 'Lookup failed' : 'Not found',
      statusColor: '#f97316'
    };
  }
  currentResult = result;

  setResults(result);
  if (result.plate && result.plate !== 'Unknown') {
    saveSearchHistory({
      plate: result.plate,
      query,
      manufacturer: result.manufacturer,
      model: result.model,
      time: new Date().toLocaleString()
    });
  }
  renderHistory();

  for (let i = 0; i < 12; i++) {
    emitParticle(mouseX, mouseY);
  }
  cursorStar.classList.add('clicking');
  window.setTimeout(() => cursorStar.classList.remove('clicking'), 120);
}

favoriteButton.addEventListener('click', () => {
  if (!currentResult || currentResult.status !== 'Active') {
    favoriteNote.textContent = 'No active vehicle to save yet.';
    favoriteNote.style.color = '#f97316';
    return;
  }
  const saved = JSON.parse(localStorage.getItem('ilPlateFavorites') || '[]');
  if (!saved.some((item) => item.plate === currentResult.plate)) {
    saved.push(currentResult);
    localStorage.setItem('ilPlateFavorites', JSON.stringify(saved));
    favoriteNote.textContent = `Saved ${currentResult.plate} to favorites.`;
    favoriteNote.style.color = '#8b5cf6';
    renderFavorites();
  } else {
    favoriteNote.textContent = `${currentResult.plate} is already in favorites.`;
    favoriteNote.style.color = '#22d3ee';
  }
});

function renderFavorites() {
  const list = document.getElementById('favoritesList');
  const saved = JSON.parse(localStorage.getItem('ilPlateFavorites') || '[]');
  list.innerHTML = '';
  if (!saved.length) {
    list.innerHTML = '<p class="empty-favorites">No favorites yet. Save a result to see it here.</p>';
    return;
  }
  saved.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'favorite-item';
    row.innerHTML = `<div><strong>${item.plate}</strong><span>${item.manufacturer} ${item.model}</span></div><button class="fav-remove">Remove</button>`;
    row.querySelector('.fav-remove').addEventListener('click', () => {
      const filtered = saved.filter((entry) => entry.plate !== item.plate);
      localStorage.setItem('ilPlateFavorites', JSON.stringify(filtered));
      renderFavorites();
      favoriteNote.textContent = `${item.plate} removed from favorites.`;
      favoriteNote.style.color = '#f97316';
    });
    list.appendChild(row);
  });
}

function getNavSections() {
  return {
    home: document.getElementById('homeSection'),
    history: document.getElementById('historySection'),
    favorites: document.getElementById('favoritesSection'),
    settings: document.getElementById('settingsSection'),
    about: document.getElementById('aboutSection')
  };
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  const sections = getNavSections();
  Object.entries(sections).forEach(([key, section]) => {
    if (section) {
      section.classList.toggle('visible', key === tab);
    }
  });
}

function saveSearchHistory(entry) {
  const saved = JSON.parse(localStorage.getItem('ilPlateHistory') || '[]');
  saved.unshift(entry);
  const unique = [];
  const seen = new Set();
  for (const item of saved) {
    const key = `${item.plate}|${item.query}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
    if (unique.length >= 20) break;
  }
  localStorage.setItem('ilPlateHistory', JSON.stringify(unique));
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const saved = JSON.parse(localStorage.getItem('ilPlateHistory') || '[]');
  list.innerHTML = '';
  if (!saved.length) {
    list.innerHTML = '<p class="empty-history">No history yet. Search a plate to save it here.</p>';
    return;
  }
  saved.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = `<div><strong>${item.plate}</strong><span>${item.manufacturer} ${item.model}</span></div><div class="history-meta">${item.query} · ${item.time}</div>`;
    row.addEventListener('click', () => {
      plateInput.value = item.query;
      searchPlate();
      switchTab('home');
    });
    list.appendChild(row);
  });
}

searchButton.addEventListener('click', searchPlate);
plateInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchPlate();
  }
});

window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  for (let i = 0; i < 2; i++) {
    if (Math.random() > 0.88) emitParticle(mouseX, mouseY);
  }
});

window.addEventListener('resize', () => {
  resizeCanvas();
  createStars();
});

window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  createStars();
  animate();
  renderFavorites();
  renderHistory();
  switchTab('home');
  document.documentElement.classList.add('fullscreen');
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  // Load Autoboom static excerpt (if available from backend)
  async function loadAutoboomInfo() {
    const aboutEl = document.querySelector('#aboutSection .about-copy');
    if (!aboutEl) return;
    let info = null;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.get_autoboom_info) {
      try {
        info = await window.pywebview.api.get_autoboom_info();
      } catch (e) {
        info = null;
      }
    }
    if (info && !info.error) {
      const container = document.createElement('div');
      container.className = 'autoboom-info';
      if (info.summary_he) container.innerHTML += `<p>${info.summary_he}</p>`;
      if (info.plate_colors_he) {
        container.innerHTML += '<h4>Plate colors (from Autoboom)</h4>';
        container.innerHTML += '<ul>' + Object.entries(info.plate_colors_he).map(([k,v])=>`<li><strong>${k}</strong>: ${v}</li>`).join('') + '</ul>';
      }
      aboutEl.appendChild(container);
    }
  }
  loadAutoboomInfo();
});

window.addEventListener('pointermove', (event) => {
  const px = (event.clientX / window.innerWidth - 0.5) * 16;
  const py = (event.clientY / window.innerHeight - 0.5) * 16;
  document.querySelector('.nebula-1').style.transform = `translate3d(${px * 0.12}px, ${py * 0.08}px, 0)`;
  document.querySelector('.nebula-2').style.transform = `translate3d(${px * -0.18}px, ${py * 0.1}px, 0)`;
  document.querySelector('.nebula-3').style.transform = `translate3d(${px * 0.1}px, ${py * -0.12}px, 0)`;
});
