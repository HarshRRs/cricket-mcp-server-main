# Cricket Khelega Backend (Production v3.0)

Production-ready backend for the Cricket Khelega application, powered by robust APIs instead of web scraping.

## 🚀 Features

- **Live Scores:** Real-time match data from CricketData.org (5-minute cache).
- **Schedule:** Comprehensive upcoming match list (2-hour cache).
- **Rankings:** ICC player and team rankings (6-hour cache).
- **News:** Latest cricket news from NewsData.io (1-hour cache).
- **Player Stats:** Detailed batting and bowling statistics (24-hour cache).
- **Production Ready:** Uses `gunicorn` for high-concurrency handling.
- **Scalable:** Built to handle 1M+ users within free API tier limits through aggressive caching.

## 🛠️ Tech Stack

- **Python 3.10+**
- **Flask** (Web Framework)
- **Gunicorn** (WSGI Server)
- **Requests** (HTTP Client)
- **Waitress/Gunicorn** (Production Server)

## 🔑 Environment Variables

Set these in your Railway dashboard or `.env` file:

```env
CRICKET_API_KEY=your_cricketdata_org_key
NEWS_API_KEY=your_newsdata_io_key
PORT=5000
DEBUG=false
```

## 📦 Deployment

This repository is configured for automatic deployment on **Railway**.

1. Connect your GitHub repo to Railway.
2. Add the environment variables.
3. Railway will automatically detect the `Procfile` and deploy.

## 📝 API Endpoints

- `GET /live` - Live matches
- `GET /schedule` - Upcoming matches
- `GET /rankings` - ICC rankings
- `GET /news` - Cricket news
- `GET /players/<name>` - Player search & stats
- `GET /match-details?id=<id>` - Match scorecard (requires ID from /live)
- `GET /commentary?id=<id>` - Match commentary (requires ID from /live)
- `GET /health` - System status & cache stats
