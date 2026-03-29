/* ── Configuration ── */
// Updated to Port 5000 to match your Azure Docker mapping and fixed variable name
const API_BASE_URL = 'http://20.197.28.110:5000/api';

let allCrops = [];
let currentFilters = { search: '', category: 'all', region: 'all', sort: 'name' };

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadCrops();
  setupNav();
  setupKeyboard();

  const searchEl = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');

  if (searchEl) {
    searchEl.addEventListener('input', e => {
      currentFilters.search = e.target.value.trim();
      clearBtn.style.display = currentFilters.search ? 'block' : 'none';
      renderCrops();
      updateActiveFilterCount();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchEl.value = '';
      currentFilters.search = '';
      clearBtn.style.display = 'none';
      renderCrops();
      updateActiveFilterCount();
    });
  }

  document.getElementById('categoryFilter')?.addEventListener('change', e => {
    currentFilters.category = e.target.value;
    renderCrops();
    updateActiveFilterCount();
  });

  document.getElementById('regionFilter')?.addEventListener('change', e => {
    currentFilters.region = e.target.value;
    renderCrops();
    updateActiveFilterCount();
  });

  document.getElementById('sortBy')?.addEventListener('change', e => {
    currentFilters.sort = e.target.value;
    renderCrops();
  });

  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
});

/* ── API helper ── */
async function apiFetch(endpoint) {
  try {
    // FIXED: Using API_BASE_URL instead of the undefined 'API' variable
    const res = await fetch(API_BASE_URL + endpoint);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.error('API error:', endpoint, err.message);
    return null;
  }
}

/* ── Stats ── */
async function loadStats() {
  const data = await apiFetch('/stats');
  if (!data?.success) return;
  const s = data.data;
  animateCount('statCrops',   s.totalCrops);
  animateCount('statAvg',     s.avgPrice);
  animateCount('statRising',  s.risingCount);
  animateCount('statFalling', s.fallingCount);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = Math.ceil(target / 40) || 1;
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 20);
}

/* ── Load crops + build dropdowns from data ── */
async function loadCrops() {
  const grid = document.getElementById('priceGrid');
  if (!grid) return;

  grid.innerHTML = Array(8).fill(0).map(() =>
    `<div class="crop-card skeleton" style="height:190px"></div>`
  ).join('');

  const data = await apiFetch('/crops');
  if (!data?.success) {
    grid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Cannot connect to server</h3>
        <p>Make sure the backend is running on Azure Port 5000.</p>
      </div>`;
    return;
  }

  allCrops = data.data;
  const updateEl = document.getElementById('lastUpdated');
  if (updateEl) {
    updateEl.textContent = new Date(data.updatedAt).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
  }
  
  const countEl = document.getElementById('cropCount');
  if (countEl) countEl.textContent = allCrops.length + ' crops';

  buildDropdowns();
  buildAdminSelect();
  renderCrops();
}

function buildDropdowns() {
  const categories = [...new Set(allCrops.map(c => c.category))].sort();
  const regions    = [...new Set(allCrops.map(c => c.region))].sort();

  const catSel = document.getElementById('categoryFilter');
  if (catSel) {
    catSel.innerHTML = `<option value="all">🌿 All Categories</option>` +
      categories.map(cat => {
        const count = allCrops.filter(c => c.category === cat).length;
        return `<option value="${cat}">${cat} (${count})</option>`;
      }).join('');
  }

  const regSel = document.getElementById('regionFilter');
  if (regSel) {
    regSel.innerHTML = `<option value="all">📍 All Regions</option>` +
      regions.map(reg => {
        const count = allCrops.filter(c => c.region === reg).length;
        return `<option value="${reg}">${reg} (${count})</option>`;
      }).join('');
  }
}

function buildAdminSelect() {
  const sel = document.getElementById('adminCrop');
  if (!sel) return;
  const byCategory = {};
  allCrops.forEach(c => {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });
  sel.innerHTML = `<option value="">— Select a crop —</option>` +
    Object.entries(byCategory).map(([cat, crops]) =>
      `<optgroup label="${cat}">` +
      crops.map(c => `<option value="${c.id}">${c.name} · ${c.kinyarwanda} (${c.price.toLocaleString()} RWF)</option>`).join('') +
      `</optgroup>`
    ).join('');
}

/* ── Render crops ── */
function renderCrops() {
  let crops = [...allCrops];
  const { search, category, region, sort } = currentFilters;

  if (search) {
    const q = search.toLowerCase();
    crops = crops.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.kinyarwanda.toLowerCase().includes(q) ||
      c.market.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }
  if (category !== 'all') crops = crops.filter(c => c.category === category);
  if (region   !== 'all') crops = crops.filter(c => c.region   === region);

  if      (sort === 'price-high') crops.sort((a, b) => b.price - a.price);
  else if (sort === 'price-low')  crops.sort((a, b) => a.price - b.price);
  else if (sort === 'trend')      crops.sort((a, b) => ({ up: 0, stable: 1, down: 2 }[a.trend] - { up: 0, stable: 1, down: 2 }[b.trend]));
  else if (sort === 'change')     crops.sort((a, b) => b.change - a.change);
  else                            crops.sort((a, b) => a.name.localeCompare(b.name));

  const grid = document.getElementById('priceGrid');
  const none = document.getElementById('noResults');
  const countEl = document.getElementById('resultCount');

  if (countEl) countEl.textContent = `${crops.length} result${crops.length !== 1 ? 's' : ''}`;

  if (!grid) return;
  if (crops.length === 0) {
    grid.innerHTML = '';
    if (none) none.style.display = 'flex';
    return;
  }
  if (none) none.style.display = 'none';

  const categoryEmoji = {
    'Cereals': '🌾', 'Vegetables': '🥦', 'Legumes': '🫘',
    'Tubers': '🥔', 'Fruits': '🍓', 'Cash Crops': '☕', 'Livestock': '🐄'
  };

  grid.innerHTML = crops.map((c, i) => {
    const icon       = categoryEmoji[c.category] || '🌱';
    const trendIcon  = c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→';
    const changeText = c.change !== 0 ? `${c.change > 0 ? '+' : ''}${c.change}%` : '0%';
    return `
      <div class="crop-card" style="animation-delay:${Math.min(i,12) * 40}ms" onclick="openModal(${c.id})" role="button" tabindex="0">
        <div class="crop-card-top">
          <div class="crop-emoji">${icon}</div>
          <div class="crop-names">
            <div class="crop-name">${c.name}</div>
            <div class="crop-kiny">${c.kinyarwanda}</div>
          </div>
          <span class="crop-category">${c.category}</span>
        </div>
        <div class="crop-price-row">
          <span class="crop-price">${c.price.toLocaleString()}</span>
          <span class="crop-unit">RWF / ${c.unit}</span>
        </div>
        <div class="crop-bottom-row">
          <span class="crop-trend ${c.trend}">${trendIcon} ${changeText}</span>
          <span class="crop-tag">🏪 ${c.market}</span>
        </div>
        <div class="crop-region-tag">📍 ${c.region} Province</div>
      </div>`;
  }).join('');
}

function updateActiveFilterCount() {
  const active = (currentFilters.category !== 'all' ? 1 : 0) +
                 (currentFilters.region   !== 'all' ? 1 : 0) +
                 (currentFilters.search              ? 1 : 0);
  const badge = document.getElementById('filterBadge');
  if (badge) {
    badge.textContent = active || '';
    badge.style.display = active ? 'inline-flex' : 'none';
  }
}

/* ── Modal ── */
async function openModal(id) {
  const overlay = document.getElementById('modal');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('modalContent').innerHTML =
    `<div class="skeleton" style="height:360px;border-radius:12px"></div>`;

  const data = await apiFetch(`/crops/${id}`);
  if (!data?.success) {
    document.getElementById('modalContent').innerHTML = '<p style="color:red">Failed to load crop details.</p>';
    return;
  }
  const c = data.data;
  const trendIcon  = c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→';
  const changeText = c.change !== 0 ? `${c.change > 0 ? '+' : ''}${c.change}%` : '0%';
  const categoryEmoji = { 'Cereals':'🌾','Vegetables':'🥦','Legumes':'🫘','Tubers':'🥔','Fruits':'🍓','Cash Crops':'☕','Livestock':'🐄' };
  const icon = categoryEmoji[c.category] || '🌱';

  const hist  = c.history || [];
  const maxP  = Math.max(...hist.map(h => h.price), 1);
  const minP  = Math.min(...hist.map(h => h.price), 0);
  const range = maxP - minP || 1;

  const bars = hist.map((h, i) => {
    const pct = Math.max(6, ((h.price - minP) / range) * 100);
    const isToday = i === hist.length - 1;
    return `<div class="h-bar ${isToday ? 'today' : ''}" style="height:${pct}%" title="${h.date}: ${h.price.toLocaleString()} RWF">
              <div class="h-bar-tip">${h.date}<br>${h.price.toLocaleString()} RWF</div>
            </div>`;
  }).join('');

  const priceChange = hist.length > 1 ? hist[hist.length - 1].price - hist[0].price : 0;
  const pctChange = hist.length > 1 ? (((hist[hist.length-1].price - hist[0].price) / hist[0].price) * 100).toFixed(1) : 0;

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header-row">
      <span class="modal-emoji">${icon}</span>
      <div>
        <div class="modal-crop-name">${c.name}</div>
        <div class="modal-crop-kiny">${c.kinyarwanda}</div>
      </div>
      <span class="crop-trend ${c.trend}" style="margin-left:auto">${trendIcon} ${changeText}</span>
    </div>
    <div class="modal-price-big">${c.price.toLocaleString()} <span class="modal-currency">RWF</span></div>
    <div class="modal-unit-line">per ${c.unit} · ${c.market} Market</div>
    <div class="modal-info-grid">
      <div class="modal-info-item">
        <div class="modal-info-label">Category</div>
        <div class="modal-info-val">${icon} ${c.category}</div>
      </div>
      <div class="modal-info-item">
        <div class="modal-info-label">Region</div>
        <div class="modal-info-val"> ${c.region}</div>
      </div>
      <div class="modal-info-item">
        <div class="modal-info-label">Market</div>
        <div class="modal-info-val"> ${c.market}</div>
      </div>
      <div class="modal-info-item">
        <div class="modal-info-label">14-Day Change</div>
        <div class="modal-info-val ${priceChange >= 0 ? 'text-green' : 'text-red'}">
          ${priceChange >= 0 ? '+' : ''}${priceChange.toLocaleString()} RWF (${pctChange}%)
        </div>
      </div>
    </div>
    <div class="history-title">14-Day Price History
      <span class="history-range">${hist[0]?.date || ''} → ${hist[hist.length-1]?.date || ''}</span>
    </div>
    <div class="history-bars">${bars}</div>
    <div class="history-legend">
      <span>Low: ${minP.toLocaleString()} RWF</span>
      <span>Today</span>
      <span>High: ${maxP.toLocaleString()} RWF</span>
    </div>
    <button class="btn-update-quick" onclick="closeModal(); switchToAdmin(${c.id})">
      ✏️ Update this price
    </button>`;
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function switchToAdmin(cropId) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const adminLink = document.querySelector('[data-view="admin"]');
  if (adminLink) adminLink.classList.add('active');
  
  document.getElementById('viewPrices').style.display  = 'none';
  document.getElementById('viewMarkets').style.display = 'none';
  document.getElementById('viewAdmin').style.display   = 'block';
  
  if (cropId) {
    const sel = document.getElementById('adminCrop');
    if (sel) {
      sel.value = cropId;
      sel.dispatchEvent(new Event('change'));
    }
  }
}

/* ── Markets ── */
async function loadMarkets() {
  const grid = document.getElementById('marketsGrid');
  if (!grid) return;
  grid.innerHTML = Array(4).fill(0).map(() =>
    `<div class="market-card skeleton" style="height:160px"></div>`
  ).join('');

  const data = await apiFetch('/markets');
  if (!data?.success) return;

  const regionEmoji = { Kigali:'🏙️', North:'⛰️', South:'🌿', East:'🌅', West:'🌊' };
  grid.innerHTML = data.data.map(m => {
    const emoji = regionEmoji[m.region] || '📍';
    const cropList = allCrops
      .filter(c => c.market === m.market)
      .slice(0, 5)
      .map(c => `<span class="market-crop-chip">${c.name}</span>`)
      .join('');
    return `
      <div class="market-card">
        <div class="market-name">${emoji} ${m.market}</div>
        <div class="market-region">📍 ${m.region} Province</div>
        <div class="market-stat">
          <span class="market-stat-label">Crops tracked</span>
          <span class="market-stat-val">${m.crops}</span>
        </div>
        <div class="market-stat">
          <span class="market-stat-label">Average price</span>
          <span class="market-stat-val">${m.avgPrice.toLocaleString()} RWF</span>
        </div>
        <div class="market-crops-list">${cropList}</div>
      </div>`;
  }).join('');
}

/* ── Nav ── */
function setupNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.getElementById('viewPrices').style.display  = view === 'prices'  ? 'block' : 'none';
      document.getElementById('viewMarkets').style.display = view === 'markets' ? 'block' : 'none';
      document.getElementById('viewAdmin').style.display   = view === 'admin'   ? 'block' : 'none';
      if (view === 'markets') loadMarkets();
    });
  });
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
  });
}

function clearFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) catFilter.value = 'all';
  
  const regFilter = document.getElementById('regionFilter');
  if (regFilter) regFilter.value = 'all';
  
  const sortBy = document.getElementById('sortBy');
  if (sortBy) sortBy.value = 'name';
  
  currentFilters = { search: '', category: 'all', region: 'all', sort: 'name' };
  renderCrops();
  updateActiveFilterCount();
}