# NASA APOD Explorer

A full-stack application to explore NASA's Astronomy Picture of the Day.

## Features

- **Today's APOD**: View the current astronomy picture with full details
- **Date Picker**: Browse historical APODs back to June 16, 1995
- **Gallery View**: Browse recent 14 days of cosmic imagery
- **Detailed Modal**: Click any gallery image for full details
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Caching**: node-cache (1 hour TTL, max 100 entries)

## Setup

### Prerequisites
- Node.js 18+

### Backend

```bash
cd backend
npm install
# Optional: Create .env file with NASA_API_KEY=your_key
npm run dev
```

Runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/apod` | Today's APOD |
| `GET /api/apod/:date` | APOD for specific date (YYYY-MM-DD) |
| `GET /api/apod/range?start=&end=` | APODs in date range |
| `GET /api/random?count=N` | Random APODs (max 20) |
| `GET /api/health` | Health check with cache stats |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NASA_API_KEY` | DEMO_KEY | NASA API key (get one at https://api.nasa.gov) |
| `PORT` | 3001 | Backend server port |

## ScreenShots
