import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

// Cache with 1 hour TTL and max 100 entries
const cache = new NodeCache({ stdTTL: 3600, maxKeys: 100, checkperiod: 120 });

app.use(cors());
app.use(express.json());

// Helper to fetch from NASA API
async function fetchFromNasa(params = {}) {
  const url = new URL(NASA_APOD_URL);
  url.searchParams.set('api_key', NASA_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`NASA API error: ${response.status}`);
  }
  return response.json();
}

// GET /api/apod/range?start=YYYY-MM-DD&end=YYYY-MM-DD - APOD range (must be before :date)
app.get('/api/apod/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end dates required' });
    }
    
    const cacheKey = `apod_range_${start}_${end}`;
    let data = cache.get(cacheKey);
    
    if (!data) {
      data = await fetchFromNasa({ start_date: start, end_date: end });
      cache.set(cacheKey, data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/apod - Today's APOD
app.get('/api/apod', async (req, res) => {
  try {
    const cacheKey = 'apod_today';
    let data = cache.get(cacheKey);
    
    if (!data) {
      data = await fetchFromNasa();
      cache.set(cacheKey, data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/apod/:date - APOD for specific date (YYYY-MM-DD)
app.get('/api/apod/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const cacheKey = `apod_${date}`;
    let data = cache.get(cacheKey);
    
    if (!data) {
      data = await fetchFromNasa({ date });
      cache.set(cacheKey, data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/apod/random?count=N - Random APODs
app.get('/api/random', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 5, 20);
    const cacheKey = `apod_random_${count}_${Date.now().toString().slice(0, -5)}`;
    let data = cache.get(cacheKey);
    
    if (!data) {
      data = await fetchFromNasa({ count });
      cache.set(cacheKey, data, 300); // 5 min cache for random
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', cacheStats: cache.getStats() });
});

app.listen(PORT, () => {
  console.log(`NASA APOD API running on http://localhost:${PORT}`);
});

