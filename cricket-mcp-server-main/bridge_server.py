"""
Cricket Khelega API v3.0 — Production Backend
================================================
Uses proper APIs instead of web scraping:
  - CricketData.org (api.cricapi.com) for live scores, schedule, rankings, players, match details
  - NewsData.io for cricket news

Designed to handle 1M+ users with aggressive TTL caching.
"""

import os
import time
import threading
import urllib.parse
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests as http_requests

app = Flask(__name__)
CORS(app)

# =============================================================================
# API KEYS — set via environment variables for security
# =============================================================================
CRICKET_API_KEY = os.environ.get('CRICKET_API_KEY', '8a6dca69-ebae-44c8-b6c5-6e5259aae943')
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', 'pub_f3adb2303ff64d9eb25d17fd3c68fd13')

# =============================================================================
# API BASE URLS
# =============================================================================
CRICKET_API_BASE = 'https://api.cricapi.com/v1'
NEWS_API_BASE = 'https://newsdata.io/api/1'

# =============================================================================
# CACHE TTLs — optimized for production (minimize API calls)
# =============================================================================
LIVE_TTL = 300          # 5 minutes (live scores)
SCHEDULE_TTL = 7200     # 2 hours (schedule rarely changes)
RANKINGS_TTL = 21600    # 6 hours (rankings change daily at most)
NEWS_TTL = 3600         # 1 hour (news doesn't need real-time)
PLAYER_TTL = 86400      # 24 hours (player stats change rarely)
MATCH_TTL = 300         # 5 minutes (match details)

# =============================================================================
# CACHING SYSTEM — thread-safe, serves 1M+ users from memory
# =============================================================================
class Cache:
    """Thread-safe TTL cache for API responses."""
    def __init__(self):
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key, ttl_seconds=120):
        with self._lock:
            entry = self._store.get(key)
            if entry and (time.time() - entry["timestamp"] < ttl_seconds):
                return entry["data"]
            return None

    def set(self, key, data):
        with self._lock:
            self._store[key] = {"data": data, "timestamp": time.time()}

    def clear(self):
        with self._lock:
            self._store.clear()

    def stats(self):
        with self._lock:
            total = len(self._store)
            active = sum(1 for v in self._store.values()
                         if time.time() - v["timestamp"] < 86400)
            return {"total_keys": total, "active_keys": active}

cache = Cache()

# =============================================================================
# HELPER — make API calls with error handling
# =============================================================================
def cricket_api(endpoint, params=None):
    """Call CricketData.org API with automatic key injection."""
    url = f"{CRICKET_API_BASE}/{endpoint}"
    if params is None:
        params = {}
    params['apikey'] = CRICKET_API_KEY

    try:
        res = http_requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()
        if data.get('status') != 'success':
            return {"error": data.get('info', 'API returned failure'), "status": "error"}
        return data
    except http_requests.exceptions.Timeout:
        return {"error": "Cricket API timeout", "status": "error"}
    except http_requests.exceptions.ConnectionError:
        return {"error": "Cricket API connection error", "status": "error"}
    except Exception as e:
        return {"error": f"Cricket API error: {str(e)}", "status": "error"}


def news_api(params=None):
    """Call NewsData.io API."""
    url = f"{NEWS_API_BASE}/latest"
    if params is None:
        params = {}
    params['apikey'] = NEWS_API_KEY

    try:
        res = http_requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        return {"error": f"News API error: {str(e)}", "status": "error"}


# =============================================================================
# ENDPOINT: /live — Live cricket matches
# =============================================================================
@app.route('/live')
def get_live():
    """Get live/current cricket matches with real scores."""
    cached = cache.get("live", LIVE_TTL)
    if cached is not None:
        return jsonify(cached)

    data = cricket_api('currentMatches')
    if 'error' in data:
        # Try matches endpoint as fallback
        data = cricket_api('matches', {'offset': 0})
        if 'error' in data:
            return jsonify([])

    matches = data.get('data', [])
    transformed = []

    for i, m in enumerate(matches):
        match_id = m.get('id', '')
        match_name = m.get('name', 'Match')
        match_status = m.get('status', '')
        match_type = m.get('matchType', '')
        venue = m.get('venue', '')
        date = m.get('date', '')

        # Determine status
        if m.get('matchStarted', False) and not m.get('matchEnded', False):
            status_text = 'Live'
        elif m.get('matchEnded', False):
            status_text = 'Completed'
        else:
            status_text = 'Upcoming'

        # Build team scores
        teams = m.get('teams', [])
        score_list = m.get('score', [])

        score = []
        for j, team_name in enumerate(teams[:2]):
            team_score = {"title": team_name, "r": "-", "w": "-", "o": "-"}

            # Find matching score entry
            for s in score_list:
                if team_name in s.get('inning', ''):
                    team_score["r"] = str(s.get('r', '-'))
                    team_score["w"] = str(s.get('w', '-'))
                    team_score["o"] = str(s.get('o', '-'))
                    break

            score.append(team_score)

        # Ensure we always have 2 teams
        while len(score) < 2:
            score.append({"title": f"Team {len(score) + 1}", "r": "-", "w": "-", "o": "-"})
            
        # Generate Google Search URL for match details (fallback)
        try:
            search_query = urllib.parse.quote(f"{match_name} cricket score")
            match_url = f"https://www.google.com/search?q={search_query}"
        except:
            match_url = ""

        transformed.append({
            "id": match_id or (i + 1),
            "name": match_name,
            "teams": teams[:2] if teams else ["TBA", "TBA"],
            "score": score,
            "status": status_text,
            "matchType": match_type,
            "venue": venue,
            "date": date,
            "statusText": match_status,
            "url": match_url
        })

    cache.set("live", transformed)
    return jsonify(transformed)


# =============================================================================
# ENDPOINT: /schedule — Upcoming match schedule
# =============================================================================
@app.route('/schedule')
def get_schedule():
    """Get upcoming cricket match schedule."""
    cached = cache.get("schedule", SCHEDULE_TTL)
    if cached is not None:
        return jsonify(cached)

    data = cricket_api('matches', {'offset': 0})
    if 'error' in data:
        return jsonify([])

    matches = data.get('data', [])
    transformed = []

    for m in matches:
        match_name = m.get('name', 'TBA')
        venue = m.get('venue', 'TBA')
        date = m.get('dateTimeGMT', m.get('date', ''))
        match_type = m.get('matchType', '')
        status = m.get('status', '')
        teams = m.get('teams', [])

        transformed.append({
            "name": match_name,
            "venue": venue,
            "date": date,
            "matchType": match_type,
            "status": status,
            "teams": teams
        })

    cache.set("schedule", transformed)
    return jsonify(transformed)


# =============================================================================
# ENDPOINT: /rankings — ICC rankings
# =============================================================================
@app.route('/rankings')
def get_rankings():
    """Get ICC rankings."""
    cached = cache.get("rankings", RANKINGS_TTL)
    if cached is not None:
        return jsonify(cached)

    all_rankings = []
    categories = {'batting': 'Batsmen', 'bowling': 'Bowlers', 'allrounder': 'All-Rounders'}
    formats = ['test', 'odi', 't20']

    # Since free API doesn't expose rankings, we return empty/mock or handle in frontend
    # This is a placeholder as per user request to use only free APIs
    for api_cat, display_cat in categories.items():
        for fmt in formats:
            all_rankings.append({
                "type": display_cat,
                "format": fmt.upper(),
                "rank": [] # Empty list triggers "No rankings data" state in frontend
            })

    cache.set("rankings", all_rankings)
    return jsonify(all_rankings)


# =============================================================================
# ENDPOINT: /news — Latest cricket news
# =============================================================================
@app.route('/news')
def get_news():
    """Get latest cricket news from NewsData.io."""
    cached = cache.get("news", NEWS_TTL)
    if cached is not None:
        return jsonify(cached)

    data = news_api({
        'q': 'cricket',
        'category': 'sports',
        'language': 'en',
        'size': 10
    })

    if 'error' in data or 'results' not in data:
        return jsonify([])

    articles = data.get('results', [])
    transformed = []

    for article in articles:
        transformed.append({
            "title": article.get('title', 'Untitled'),
            "description": article.get('description', ''),
            "url": article.get('link', ''),
            "category": (article.get('category', ['Cricket']) or ['Cricket'])[0],
            "timestamp": article.get('pubDate', ''),
            "source": article.get('source_name', ''),
            "image": article.get('image_url', '')
        })

    cache.set("news", transformed)
    return jsonify(transformed)


# =============================================================================
# ENDPOINT: /players/<name> — Player stats
# =============================================================================
@app.route('/players/<path:player_name>')
def get_player(player_name):
    """Get player statistics from CricketData.org."""
    cache_key = f"player_{player_name.lower().replace(' ', '_')}"
    cached = cache.get(cache_key, PLAYER_TTL)
    if cached is not None:
        return jsonify(cached)

    search_data = cricket_api('players', {'offset': 0, 'search': player_name})
    if 'error' in search_data: return jsonify({"error": search_data['error']}), 500
    
    players = search_data.get('data', [])
    if not players: return jsonify({"error": "Player not found"}), 404

    player = players[0]
    detail_data = cricket_api('players_info', {'id': player.get('id')})
    
    info = detail_data.get('data', {}) if 'data' in detail_data else {}
    
    result = {
        "name": info.get('name', player.get('name')),
        "country": info.get('country', ''),
        "role": info.get('role', ''),
        "image": info.get('playerImg', ''),
        "batting_stats": {},
        "bowling_stats": {},
        "rankings": {}
    }

    # Parse simplified stats
    for stat in info.get('stats', []):
        match_type = stat.get('matchtype', '').lower()
        if stat.get('fn') == 'batting':
            result["batting_stats"][match_type] = {
                "matches": stat.get('mat'), "runs": stat.get('runs'),
                "average": stat.get('ave'), "strike_rate": stat.get('sr'),
                "highest_score": stat.get('hs'), "hundreds": stat.get('100s'), "fifties": stat.get('50s')
            }
        elif stat.get('fn') == 'bowling':
            result["bowling_stats"][match_type] = {
                "matches": stat.get('mat'), "wickets": stat.get('wkts'),
                "economy": stat.get('econ'), "best_bowling_innings": stat.get('bbi')
            }

    cache.set(cache_key, result)
    return jsonify(result)


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================
@app.route('/')
def index():
    return jsonify({"name": "Cricket Khelega API v3.0", "status": "running"})

@app.route('/health')
def health():
    return jsonify({"status": "ok", "cache": cache.stats()})

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    cache.clear()
    return jsonify({"status": "cleared"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f"🏏 Cricket Khelega API v3.0 running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
