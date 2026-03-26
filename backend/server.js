const express = require('express');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let crops = [
  { id: 1,  name: "Maize",         kinyarwanda: "Ibigori",      category: "Cereals",    price: 350,  unit: "kg",    market: "Kimironko", region: "Kigali", trend: "up",    change: 5.2  },
  { id: 2,  name: "Sorghum",       kinyarwanda: "Amakama",      category: "Cereals",    price: 310,  unit: "kg",    market: "Rwamagana", region: "East",   trend: "stable",change: 0.0  },
  { id: 3,  name: "Wheat",         kinyarwanda: "Ingano",       category: "Cereals",    price: 520,  unit: "kg",    market: "Musanze",   region: "North",  trend: "stable",change: 0.5  },
  { id: 4,  name: "Rice",          kinyarwanda: "Umuceri",      category: "Cereals",    price: 680,  unit: "kg",    market: "Rwamagana", region: "East",   trend: "up",    change: 4.0  },
  { id: 5,  name: "Millet",        kinyarwanda: "Uburo",        category: "Cereals",    price: 420,  unit: "kg",    market: "Huye",      region: "South",  trend: "up",    change: 3.1  },
  { id: 6,  name: "Barley",        kinyarwanda: "Sereseri",     category: "Cereals",    price: 480,  unit: "kg",    market: "Musanze",   region: "North",  trend: "down",  change: -1.5 },
  { id: 7,  name: "Irish Potato",  kinyarwanda: "Ibirayi",      category: "Vegetables", price: 280,  unit: "kg",    market: "Nyabugogo", region: "Kigali", trend: "down",  change: -2.1 },
  { id: 8,  name: "Tomatoes",      kinyarwanda: "Inyanya",      category: "Vegetables", price: 450,  unit: "kg",    market: "Musanze",   region: "North",  trend: "up",    change: 3.7  },
  { id: 9,  name: "Onion",         kinyarwanda: "Ibitunguru",   category: "Vegetables", price: 580,  unit: "kg",    market: "Nyabugogo", region: "Kigali", trend: "up",    change: 11.2 },
  { id: 10, name: "Cabbage",       kinyarwanda: "Ishu",         category: "Vegetables", price: 220,  unit: "kg",    market: "Huye",      region: "South",  trend: "stable",change: -0.3 },
  { id: 11, name: "Carrot",        kinyarwanda: "Karoti",       category: "Vegetables", price: 390,  unit: "kg",    market: "Kimironko", region: "Kigali", trend: "stable",change: 1.1  },
  { id: 12, name: "Spinach",       kinyarwanda: "Isombe",       category: "Vegetables", price: 300,  unit: "kg",    market: "Kimironko", region: "Kigali", trend: "up",    change: 2.8  },
  { id: 13, name: "Eggplant",      kinyarwanda: "Indimu",       category: "Vegetables", price: 340,  unit: "kg",    market: "Rubavu",    region: "West",   trend: "down",  change: -2.9 },
  { id: 14, name: "Green Pepper",  kinyarwanda: "Urusenda",     category: "Vegetables", price: 600,  unit: "kg",    market: "Musanze",   region: "North",  trend: "up",    change: 7.3  },
  { id: 15, name: "Leek",          kinyarwanda: "Poreyo",       category: "Vegetables", price: 420,  unit: "kg",    market: "Huye",      region: "South",  trend: "stable",change: 0.4  },
  { id: 16, name: "Beans",         kinyarwanda: "Ibishyimbo",   category: "Legumes",    price: 620,  unit: "kg",    market: "Huye",      region: "South",  trend: "up",    change: 8.4  },
  { id: 17, name: "Peas",          kinyarwanda: "Amashaza",     category: "Legumes",    price: 780,  unit: "kg",    market: "Rubavu",    region: "West",   trend: "up",    change: 6.1  },
  { id: 18, name: "Soybeans",      kinyarwanda: "Soya",         category: "Legumes",    price: 550,  unit: "kg",    market: "Nyagatare", region: "East",   trend: "up",    change: 4.5  },
  { id: 19, name: "Groundnuts",    kinyarwanda: "Arakeke",      category: "Legumes",    price: 890,  unit: "kg",    market: "Rwamagana", region: "East",   trend: "stable",change: 0.8  },
  { id: 20, name: "Cowpeas",       kinyarwanda: "Nzobazoba",    category: "Legumes",    price: 670,  unit: "kg",    market: "Huye",      region: "South",  trend: "down",  change: -1.2 },
  { id: 21, name: "Sweet Potato",  kinyarwanda: "Umusorosoro",  category: "Tubers",     price: 200,  unit: "kg",    market: "Rubavu",    region: "West",   trend: "down",  change: -4.5 },
  { id: 22, name: "Cassava",       kinyarwanda: "Imyumbati",    category: "Tubers",     price: 180,  unit: "kg",    market: "Nyagatare", region: "East",   trend: "up",    change: 2.3  },
  { id: 23, name: "Yam",           kinyarwanda: "Umushatsi",    category: "Tubers",     price: 320,  unit: "kg",    market: "Rubavu",    region: "West",   trend: "stable",change: 0.2  },
  { id: 24, name: "Taro",          kinyarwanda: "Imikazi",      category: "Tubers",     price: 260,  unit: "kg",    market: "Huye",      region: "South",  trend: "up",    change: 1.9  },
  { id: 25, name: "Banana",        kinyarwanda: "Umunyinya",    category: "Fruits",     price: 150,  unit: "bunch", market: "Kimironko", region: "Kigali", trend: "down",  change: -1.8 },
  { id: 26, name: "Avocado",       kinyarwanda: "Avoka",        category: "Fruits",     price: 120,  unit: "piece", market: "Musanze",   region: "North",  trend: "down",  change: -3.2 },
  { id: 27, name: "Mango",         kinyarwanda: "Manga",        category: "Fruits",     price: 200,  unit: "piece", market: "Nyagatare", region: "East",   trend: "up",    change: 9.1  },
  { id: 28, name: "Passion Fruit", kinyarwanda: "Marakuya",     category: "Fruits",     price: 80,   unit: "piece", market: "Rubavu",    region: "West",   trend: "up",    change: 5.5  },
  { id: 29, name: "Pineapple",     kinyarwanda: "Inanasi",      category: "Fruits",     price: 500,  unit: "piece", market: "Rwamagana", region: "East",   trend: "stable",change: 0.6  },
  { id: 30, name: "Watermelon",    kinyarwanda: "Inkeri",       category: "Fruits",     price: 800,  unit: "piece", market: "Nyagatare", region: "East",   trend: "up",    change: 3.4  },
  { id: 31, name: "Coffee",        kinyarwanda: "Ikawa",        category: "Cash Crops", price: 2800, unit: "kg",    market: "Huye",      region: "South",  trend: "up",    change: 6.8  },
  { id: 32, name: "Tea",           kinyarwanda: "Icyayi",       category: "Cash Crops", price: 1200, unit: "kg",    market: "Rubavu",    region: "West",   trend: "up",    change: 4.2  },
  { id: 33, name: "Pyrethrum",     kinyarwanda: "Ikinabururu",  category: "Cash Crops", price: 1800, unit: "kg",    market: "Musanze",   region: "North",  trend: "stable",change: 1.0  },
  { id: 34, name: "Cow Milk",      kinyarwanda: "Amata",        category: "Livestock",  price: 450,  unit: "litre", market: "Nyabugogo", region: "Kigali", trend: "stable",change: 0.3  },
  { id: 35, name: "Eggs",          kinyarwanda: "Amagi",        category: "Livestock",  price: 150,  unit: "piece", market: "Kimironko", region: "Kigali", trend: "up",    change: 2.1  },
  { id: 36, name: "Honey",         kinyarwanda: "Ubuki",        category: "Livestock",  price: 3500, unit: "litre", market: "Huye",      region: "South",  trend: "up",    change: 5.0  },
];

let priceHistory = {};
crops.forEach(c => {
  priceHistory[c.id] = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
    price: Math.round(c.price * (0.82 + Math.random() * 0.36))
  }));
  priceHistory[c.id][13].price = c.price;
});

app.get('/api/crops', (req, res) => {
  const { search, category, region } = req.query;
  let results = [...crops];
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.kinyarwanda.toLowerCase().includes(q) ||
      c.market.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }
  if (category && category !== 'all') results = results.filter(c => c.category === category);
  if (region   && region   !== 'all') results = results.filter(c => c.region   === region);
  res.json({ success: true, count: results.length, data: results, updatedAt: new Date().toISOString() });
});

app.get('/api/crops/:id', (req, res) => {
  const crop = crops.find(c => c.id === +req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
  res.json({ success: true, data: { ...crop, history: priceHistory[crop.id] } });
});

app.get('/api/categories', (_req, res) => {
  const cats = [...new Set(crops.map(c => c.category))].sort();
  res.json({ success: true, data: cats });
});

app.get('/api/regions', (_req, res) => {
  const regions = [...new Set(crops.map(c => c.region))].sort();
  res.json({ success: true, data: regions });
});

app.get('/api/markets', (_req, res) => {
  const map = {};
  crops.forEach(c => {
    if (!map[c.market]) map[c.market] = { market: c.market, region: c.region, crops: 0, avgPrice: 0, total: 0 };
    map[c.market].crops++;
    map[c.market].total += c.price;
    map[c.market].avgPrice = Math.round(map[c.market].total / map[c.market].crops);
  });
  res.json({ success: true, data: Object.values(map) });
});

app.get('/api/stats', (_req, res) => {
  const prices  = crops.map(c => c.price);
  const rising  = crops.filter(c => c.trend === 'up').length;
  const falling = crops.filter(c => c.trend === 'down').length;
  res.json({
    success: true,
    data: {
      totalCrops:   crops.length,
      avgPrice:     Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      maxPrice:     Math.max(...prices),
      minPrice:     Math.min(...prices),
      risingCount:  rising,
      fallingCount: falling,
      stableCount:  crops.length - rising - falling,
    }
  });
});

app.post('/api/crops/:id/price', (req, res) => {
  const crop = crops.find(c => c.id === +req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
  const { price } = req.body;
  if (!price || isNaN(price) || price <= 0) return res.status(400).json({ success: false, message: 'Invalid price' });
  const oldPrice = crop.price;
  crop.change    = +((((price - oldPrice) / oldPrice) * 100).toFixed(1));
  crop.trend     = crop.change > 0.5 ? 'up' : crop.change < -0.5 ? 'down' : 'stable';
  crop.price     = +price;
  priceHistory[crop.id].push({ date: new Date().toISOString().split('T')[0], price: +price });
  if (priceHistory[crop.id].length > 30) priceHistory[crop.id].shift();
  res.json({ success: true, data: crop });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AgriPrice Connect API running on http://localhost:${PORT}`));