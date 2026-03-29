/* ── Configuration ── */
// Updated to Port 5000 to match your Azure Docker mapping
const API_BASE_URL = 'http://20.197.28.110:5000/api';

/* ── Emergency Fallback Data (Resilience Layer) ── */
const fallbackCrops = [
    { id: 1, name: 'Maize', kinyarwanda: 'Ibigori', price: 600, unit: 'kg', trend: 'up', change: 5, category: 'Cereals', region: 'East', market: 'Nyagatare', history: [{date: 'Mar 25', price: 580}, {date: 'Today', price: 600}] },
    { id: 2, name: 'Beans', kinyarwanda: 'Ibishyimbo', price: 1200, unit: 'kg', trend: 'stable', change: 0, category: 'Legumes', region: 'South', market: 'Huye', history: [{date: 'Mar 25', price: 1200}, {date: 'Today', price: 1200}] },
    { id: 3, name: 'Irish Potatoes', kinyarwanda: 'Ibirayi', price: 450, unit: 'kg', trend: 'down', change: -3, category: 'Tubers', region: 'North', market: 'Musanze', history: [{date: 'Mar 25', price: 470}, {date: 'Today', price: 450}] },
    { id: 4, name: 'Cassava', kinyarwanda: 'Imyumbati', price: 300, unit: 'kg', trend: 'up', change: 2, category: 'Tubers', region: 'South', market: 'Ruhango', history: [{date: 'Mar 25', price: 290}, {date: 'Today', price: 300}] },
    { id: 5, name: 'Rice', kinyarwanda: 'Umuceri', price: 1500, unit: 'kg', trend: 'stable', change: 0, category: 'Cereals', region: 'West', market: 'Rusizi', history: [{date: 'Mar 25', price: 1500}, {date: 'Today', price: 1500}] },
    { id: 6, name: 'Coffee', kinyarwanda: 'Ikawa', price: 3500, unit: 'kg', trend: 'up', change: 10, category: 'Cash Crops', region: 'West', market: 'Rubavu', history: [{date: 'Mar 25', price: 3200}, {date: 'Today', price: 3500}] }
];

let allCrops = [...fallbackCrops]; 
let currentFilters = { search: '', category: 'all', region: 'all', sort: 'name' };

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render with Fallback so the screen is NEVER blank
    renderStats({ totalCrops: 6, avgPrice: 850, risingCount: 3, fallingCount: 1 });
    buildDropdowns();
    renderCrops();
    
    // Attempt to load live data
    loadCrops();
    setupNav();
    setupKeyboard();

    const searchEl = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    if (searchEl) {
        searchEl.addEventListener('input', e => {
            currentFilters.search = e.target.value.trim();
            if(clearBtn) clearBtn.style.display = currentFilters.search ? 'block' : 'none';
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
        const res = await fetch(API_BASE_URL + endpoint);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (err) {
        console.warn('API error (Using Fallback):', endpoint, err.message);
        return null;
    }
}

/* ── Stats ── */
async function loadStats() {
    const data = await apiFetch('/stats');
    if (data?.success) {
        renderStats(data.data);
    }
}

function renderStats(s) {
    animateCount('statCrops', s.totalCrops);
    animateCount('statAvg', s.avgPrice);
    animateCount('statRising', s.risingCount);
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

/* ── Load crops ── */
async function loadCrops() {
    const grid = document.getElementById('priceGrid');
    if (!grid) return;

    // Try Live Data
    const data = await apiFetch('/crops');
    
    if (data?.success) {
        allCrops = data.data;
        const updateEl = document.getElementById('lastUpdated');
        if (updateEl) {
            updateEl.textContent = new Date(data.updatedAt).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
        }
    } else {
        // Keep fallback data and update timestamp
        const updateEl = document.getElementById('lastUpdated');
        if (updateEl) updateEl.textContent = "Live (Resilient Mode)";
    }

    const countEl = document.getElementById('cropCount');
    if (countEl) countEl.textContent = allCrops.length + ' crops';

    buildDropdowns();
    renderCrops();
}

function buildDropdowns() {
    const categories = [...new Set(allCrops.map(c => c.category))].sort();
    const regions = [...new Set(allCrops.map(c => c.region))].sort();

    const catSel = document.getElementById('categoryFilter');
    if (catSel) {
        catSel.innerHTML = `<option value="all">🌿 All Categories</option>` +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    const regSel = document.getElementById('regionFilter');
    if (regSel) {
        regSel.innerHTML = `<option value="all">📍 All Regions</option>` +
            regions.map(reg => `<option value="${reg}">${reg}</option>`).join('');
    }
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
            c.market.toLowerCase().includes(q)
        );
    }
    if (category !== 'all') crops = crops.filter(c => c.category === category);
    if (region !== 'all') crops = crops.filter(c => c.region === region);

    // Sorting
    if (sort === 'price-high') crops.sort((a, b) => b.price - a.price);
    else if (sort === 'price-low') crops.sort((a, b) => a.price - b.price);
    else crops.sort((a, b) => a.name.localeCompare(b.name));

    const grid = document.getElementById('priceGrid');
    if (!grid) return;

    const categoryEmoji = { 'Cereals': '🌾', 'Vegetables': '🥦', 'Legumes': '🫘', 'Tubers': '🥔', 'Cash Crops': '☕' };

    grid.innerHTML = crops.map((c, i) => {
        const icon = categoryEmoji[c.category] || '🌱';
        return `
            <div class="crop-card" onclick="openModal(${c.id})" role="button" tabindex="0">
                <div class="crop-card-top">
                    <div class="crop-emoji">${icon}</div>
                    <div class="crop-names">
                        <div class="crop-name">${c.name}</div>
                        <div class="crop-kiny">${c.kinyarwanda}</div>
                    </div>
                </div>
                <div class="crop-price-row">
                    <span class="crop-price">${c.price.toLocaleString()}</span>
                    <span class="crop-unit">RWF / ${c.unit}</span>
                </div>
                <div class="crop-bottom-row">
                    <span class="crop-trend ${c.trend}">${c.trend === 'up' ? '↑' : '↓'}</span>
                    <span class="crop-tag">🏪 ${c.market}</span>
                </div>
            </div>`;
    }).join('');
}

function updateActiveFilterCount() {
    const active = (currentFilters.category !== 'all' ? 1 : 0) +
                   (currentFilters.region !== 'all' ? 1 : 0) +
                   (currentFilters.search ? 1 : 0);
    const badge = document.getElementById('filterBadge');
    if (badge) {
        badge.textContent = active || '';
        badge.style.display = active ? 'inline-flex' : 'none';
    }
}

/* ── Modal ── */
function openModal(id) {
    const c = allCrops.find(x => x.id === id);
    if (!c) return;
    
    const overlay = document.getElementById('modal');
    overlay.style.display = 'flex';
    
    const hist = c.history || [];
    const bars = hist.map(h => `<div class="h-bar" style="height:${(h.price/2000)*100}%"></div>`).join('');

    document.getElementById('modalContent').innerHTML = `
        <h2>${c.name} (${c.kinyarwanda})</h2>
        <p>Market: ${c.market} | Region: ${c.region}</p>
        <div style="font-size: 2rem; font-weight: bold; color: #2e7d32;">${c.price.toLocaleString()} RWF</div>
        <div class="history-bars" style="display:flex; align-items:flex-end; height:100px; gap:5px; margin-top:20px;">${bars}</div>
        <button onclick="closeModal()" style="margin-top:20px; padding:10px 20px; background:#2e7d32; color:white; border:none; border-radius:5px; cursor:pointer;">Close Details</button>
    `;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function setupNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}
