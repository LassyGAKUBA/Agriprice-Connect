const express = require('express');
const app = express();
const port = 5000;

// This will be the API for your farmers to get prices later!
app.get('/api/prices', (req, res) => {
  res.json([
    { item: 'Beans', price: '1200 RWF' },
    { item: 'Maize', price: '800 RWF' }
  ]);
});

app.get('/', (req, res) => {
  res.send('AgriPrice Connect Backend is Live in Kigali!');
});

app.listen(port, '0.0.0.0', () => {
  console.log('Backend listening at http://0.0.0.0:' + port);
});
