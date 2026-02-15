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
import scraper
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
    """Get live scores from API + Scraper (Hybrid Mode)."""
    # 1. Fetch Official API Data
    official_data = cache.get("live_matches", LIVE_TTL)
    if not official_data:
        data = cricket_api('currentMatches')
        if 'error' in data:
            # Try matches endpoint as fallback
            data = cricket_api('matches', {'offset': 0})
            
        if 'error' not in data:
            official_data = data.get('data', [])
            cache.set("live_matches", official_data)
        else:
            official_data = []

    # 2. Fetch Scraper Data (for missing matches like Ind vs Pak)
    scraped_data = cache.get("scraped_live", LIVE_TTL)    # 2. Fetch Premium Live Data (Scraper)
    if not scraped_data: # Only scrape if not in cache
        scraped_data = [] # Default empty
        try:
            # Run scraper in separate thread or just call it? 
            # It's blocking. We rely on cache.
            # For now, just call it.
            scraped_data = scraper.get_cricbuzz_matches()
            
            # --- DEMO INJECTION START ---
            # User requested India vs Pakistan T20 WC Hype Match for text/demo
            demo_match = {
                "id": "demo_ind_pak_2026",
                "name": "India vs Pakistan, T20 World Cup 2026",
                "status": "Upcoming • Today • 7:00 PM",
                "score": "High Voltage Clash",
                "team1": "India",
                "team2": "Pakistan",
                "source": "cricbuzz" 
            }
            # Check if already exists (unlikely if upcoming)
            found = False
            for m in scraped_data:
                if "India" in m.get("name", "") and "Pakistan" in m.get("name", ""):
                    found = True
                    break
            if not found:
                scraped_data.insert(0, demo_match) # Top priority
            # --- DEMO INJECTION END ---
            
            cache.set("scraped_live", scraped_data) # Cache the result including demo match
        except Exception as e:
            print(f"Scraper failed: {e}")
            scraped_data = []

    final_list = []
    
    # 3. Process Official Matches
    # Set of normalized match names to avoid duplicates
    official_match_names = set()
    
    for m in official_data:
        match_id = m.get('id', '')
        name = m.get('name', 'Match')
        official_match_names.add(name.lower().replace(" ", ""))
        
        # Determine status
        if m.get('matchStarted', False) and not m.get('matchEnded', False):
            status_text = 'Live'
        elif m.get('matchEnded', False):
            status_text = 'Completed'
        else:
            status_text = m.get('status', 'Upcoming')

        # Build team scores
        teams = m.get('teams', [])
        score_list = m.get('score', [])
        score = []
        for team_name in teams[:2]:
            team_score = {"title": team_name, "r": "-", "w": "-", "o": "-"}
            for s in score_list:
                if team_name in s.get('inning', ''):
                    team_score["r"] = str(s.get('r', '-'))
                    team_score["w"] = str(s.get('w', '-'))
                    team_score["o"] = str(s.get('o', '-'))
                    break
            score.append(team_score)
            
        while len(score) < 2:
            score.append({"title": f"Team {len(score) + 1}", "r": "-", "w": "-", "o": "-"})
            
        # Generate Google Search URL for match details (fallback)
        try:
            search_query = urllib.parse.quote(f"{name} cricket score")
            match_url = f"https://www.google.com/search?q={search_query}"
        except:
             match_url = ""

        final_list.append({
            "id": match_id,
            "name": name,
            "matchType": m.get('matchType', ''),
            "status": status_text,
            "venue": m.get('venue', ''),
            "date": m.get('date', ''),
            "score": score,
            "is_premium": False, # Official
            "source": "official",
            "details_url": match_url
        })
        
    # 4. Append Scraped Matches (Premium)
    for sm in scraped_data:
        # Check duplicate by name (fuzzy)
        s_name_norm = sm["name"].lower().replace(" ", "")
        
        # Simple fuzzy check: if one is substring of another
        is_duplicate = False
        for o_name in official_match_names:
            if s_name_norm in o_name or o_name in s_name_norm:
                is_duplicate = True
                break
        
        if is_duplicate:
            # Optimization: If we find a match in scraper that corresponds to official,
            # we COULD attach the Cricbuzz ID to the official match to enable commentary!
            # But let's keep it simple for now. Duplicate prevention is good.
            # Actually, user WANTS commentary. If existing match lacks commentary, we fail.
            # Strategy: If duplicate, we ADD `cricbuzz_id` to the EXISTING official match in `final_list`.
            # Find the match in final_list
            for fm in final_list:
                fm_norm = fm["name"].lower().replace(" ", "")
                if s_name_norm in fm_norm or fm_norm in s_name_norm:
                    fm["cricbuzz_id"] = sm["id"]
                    fm["is_premium"] = True # Enable commentary!
                    break
            continue

        # If not duplicate, add as new Premium Match
        # Format score string "120/4 (15.2)" to object?
        # Scraper returns single string score "120/4". We put it in first team?
        # Use extracted team names
        t1 = sm.get("team1", "Team 1")
        t2 = sm.get("team2", "Team 2")
        
        # Simple score assignment (put full score string in Team 1 for now, 
        # as splitting it requires complex parsing of "120/4 & 50/2")
        score_obj = [
            {"title": t1, "r": sm["score"], "w": "", "o": ""}, 
            {"title": t2, "r": "", "w": "", "o": ""}
        ]
        
        final_list.insert(0, { # Add to top!
            "id": sm["id"],
            "name": sm["name"],
            "matchType": "premium",
            "status": sm["status"],
            "venue": "Cricbuzz Data",
            "date": "Today",
            "teams": [t1, t2], 
            "score": score_obj,
            "is_premium": True,
            "source": "cricbuzz",
            "cricbuzz_id": sm["id"]
        })

    return jsonify(final_list)

@app.route('/commentary/<match_id>')
def get_commentary(match_id):
    """Get commentary for a match."""
    # Cache key
    cache_key = f"comm_{match_id}"
    cached = cache.get(cache_key, 60)
    if cached:
         return jsonify({"status": "success", "data": cached})
         
    try:
        data = scraper.get_commentary(match_id)
        cache.set(cache_key, data)
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})




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
    # 1. Define constants
    categories = {'batting': 'Batsmen', 'bowling': 'Bowlers', 'allrounder': 'All-Rounders'}
    formats = ['test', 'odi', 't20']

    # 2. Check Cache
    cache_key = "rankings_all" 
    
    cached = cache.get(cache_key, RANKINGS_TTL)
    if cached is not None:
         return jsonify(cached)
         
    all_rankings = []
    
    # Scrape each category
    # categories keys: batting, bowling, allrounder
    # formats: test, odi, t20
    
    # Optimization: 'batting' page has all formats. So we only fetch URL 4 times total.
    # get_icc_rankings handles the fetching.
    
    for api_cat, display_cat in categories.items():
        # api_cat: batting, bowling, etc.
        # But get_icc_rankings takes (category, format).
        # And slicing logic implies we can reuse the fetch?
        # get_icc_rankings does fetching internally. 
        # So calling it 3 times for batting/test, batting/odi, batting/t20 results in 3 fetches effectively?
        # No, requests are cached by OS? No.
        # We should optimize scraper to cache the page? 
        # For MVP, just call it. 12 requests is okay for 24h cache.
        
        for fmt in formats:
            # Map api_cat 'allrounder' to scraper 'all-rounder'
            scrape_cat = 'all-rounder' if api_cat == 'allrounder' else api_cat
            
            data = scraper.get_icc_rankings(scrape_cat, fmt)
            
            # Fallback to Static JSON if Scraper Fails
            if not data:
                print(f"Scraper failed for {display_cat} {fmt}, checking localized snapshot...")
                try:
                    import json
                    with open("rankings.json", "r") as f:
                        snapshot = json.load(f)
                        # snapshot is list of {type, format, rank}
                        # Find matching entry
                        for entry in snapshot:
                            if entry['type'] == display_cat and entry['format'] == fmt.upper():
                                data = entry['rank']
                                print(f"Loaded snapshot for {display_cat} {fmt}")
                                break
                except Exception as e:
                    print(f"Snapshot load failed: {e}")
            
            # If still no data, use old mock or empty?
            if not data:
                 print(f"No data available for {display_cat} {fmt}")
                 
            all_rankings.append({
                "type": display_cat,
                "format": fmt.upper(),
                "rank": data or []
            })
            time.sleep(0.5) # Be nice to Cricbuzz

            
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
