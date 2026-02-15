import os
import re
import time
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
import cricket_server as cs

app = Flask(__name__)
CORS(app)

# =============================================================================
# CACHING SYSTEM — so 100K users don't each trigger a scrape
# =============================================================================
class Cache:
    """Thread-safe TTL cache for API responses."""
    def __init__(self):
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key, ttl_seconds=120):
        """Get cached value if not expired. Returns None if missing/expired."""
        with self._lock:
            entry = self._store.get(key)
            if entry and (time.time() - entry["timestamp"] < ttl_seconds):
                return entry["data"]
            return None

    def set(self, key, data):
        """Store data with current timestamp."""
        with self._lock:
            self._store[key] = {"data": data, "timestamp": time.time()}

    def clear(self):
        """Clear all cached data."""
        with self._lock:
            self._store.clear()

cache = Cache()

# Cache TTLs (in seconds)
LIVE_TTL = 120        # 2 minutes — live scores refresh
SCHEDULE_TTL = 600    # 10 minutes — schedule rarely changes
RANKINGS_TTL = 3600   # 1 hour — rankings change daily at most
NEWS_TTL = 300        # 5 minutes — news updates moderately
PLAYER_TTL = 3600     # 1 hour — player stats don't change often
COMMENTARY_TTL = 60   # 1 minute — commentary needs freshness


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def parse_teams(description):
    """Extract team names from match description like 'Team A vs Team B, 1st T20I'."""
    match = re.search(r'(.+?)\s+vs\s+(.+?)(?:\s*[-,]|$)', description, re.IGNORECASE)
    if match:
        return [match.group(1).strip(), match.group(2).strip()]
    return [description, "TBA"]


def extract_score_from_details(match_url):
    """Try to get actual score from match details page."""
    try:
        details = cs.get_match_details(match_url)
        if "error" in details:
            return None

        scores = []
        scorecard = details.get("scorecard", {})

        for inning_key in sorted(scorecard.keys()):
            inning = scorecard[inning_key]
            title = inning.get("title", "")
            # Parse title like "India Innings 185/4 (18.2 Ov)"
            score_match = re.search(r'(\d+)/(\d+)\s*\((\d+\.?\d*)\s*[Oo]v', title)
            if score_match:
                scores.append({
                    "r": score_match.group(1),
                    "w": score_match.group(2),
                    "o": score_match.group(3),
                    "title": title.split("Innings")[0].strip() if "Innings" in title else title
                })
            else:
                # Try simpler pattern
                num_match = re.search(r'(\d+)/(\d+)', title)
                if num_match:
                    scores.append({
                        "r": num_match.group(1),
                        "w": num_match.group(2),
                        "o": "0.0",
                        "title": title
                    })

        return scores if scores else None
    except Exception:
        return None


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.route('/')
def index():
    """Health check and API info."""
    return jsonify({
        "name": "Cricket Khelega API",
        "version": "2.0",
        "status": "running",
        "endpoints": {
            "/live": "Live cricket matches with scores",
            "/schedule": "Upcoming match schedule",
            "/rankings": "ICC player & team rankings",
            "/news": "Latest cricket news",
            "/players/<name>": "Player statistics",
            "/match-details": "Match scorecard (pass ?url=CRICBUZZ_URL)",
            "/commentary": "Live commentary (pass ?url=CRICBUZZ_URL)",
            "/health": "Health check"
        }
    })


@app.route('/health')
def health():
    """Simple health check for monitoring."""
    return jsonify({"status": "ok", "timestamp": int(time.time())})


# ---- LIVE MATCHES ----
@app.route('/live')
def get_live():
    """Get live cricket matches with real scores."""
    cached = cache.get("live", LIVE_TTL)
    if cached is not None:
        return jsonify(cached)

    matches = cs.get_live_matches()
    transformed = []

    for i, m in enumerate(matches):
        if "error" in m:
            continue

        teams = parse_teams(m.get('match', ''))
        match_url = m.get('url', '')

        # Try to get real scores
        real_scores = None
        if match_url:
            real_scores = extract_score_from_details(match_url)

        # Build score data
        if real_scores and len(real_scores) >= 1:
            score = real_scores
        else:
            score = [
                {"r": "-", "w": "-", "o": "-", "title": teams[0]},
                {"r": "-", "w": "-", "o": "-", "title": teams[1]}
            ]

        # Determine match status
        status_text = "Live"
        match_text = m.get('match', '')
        if "result" in match_text.lower() or "won" in match_text.lower():
            status_text = "Completed"
        elif "upcoming" in match_text.lower() or "starts" in match_text.lower():
            status_text = "Upcoming"

        transformed.append({
            "id": i + 1,
            "name": match_text,
            "teams": teams,
            "score": score,
            "status": status_text,
            "url": match_url
        })

    cache.set("live", transformed)
    return jsonify(transformed)


# ---- SCHEDULE ----
@app.route('/schedule')
def get_schedule():
    """Get upcoming cricket match schedule."""
    cached = cache.get("schedule", SCHEDULE_TTL)
    if cached is not None:
        return jsonify(cached)

    schedule = cs.get_cricket_schedule()
    transformed = []

    for i, s in enumerate(schedule):
        if "error" in s:
            continue

        desc = s.get('description', '')
        teams = parse_teams(desc)

        transformed.append({
            "id": i,
            "name": desc,
            "date": s.get('date', 'TBA'),
            "teams": teams,
            "venue": s.get('venue', 'TBA'),
            "url": s.get('url', '')
        })

    cache.set("schedule", transformed)
    return jsonify(transformed)


# ---- RANKINGS ----
@app.route('/rankings')
def get_rankings():
    """Get ICC rankings for batting, bowling, all-rounders, and teams."""
    category = request.args.get('category', None)
    categories = [category] if category else ["batting", "bowling", "all-rounder", "teams"]

    cache_key = f"rankings_{'_'.join(categories)}"
    cached = cache.get(cache_key, RANKINGS_TTL)
    if cached is not None:
        return jsonify(cached)

    all_rankings = []

    for cat in categories:
        data = cs.get_icc_rankings(cat)
        if "error" in data:
            continue

        display_type = cat.capitalize()
        if cat == "batting":
            display_type = "Batsmen"
        elif cat == "bowling":
            display_type = "Bowlers"
        elif cat == "all-rounder":
            display_type = "All-Rounders"
        elif cat == "teams":
            display_type = "Teams"

        for fmt in ["test", "odi", "t20"]:
            if fmt in data:
                rank_list = []
                for item in data[fmt]:
                    entry = {
                        "rank": item.get("position", "0"),
                        "rating": item.get("rating", "0"),
                    }
                    if cat == "teams":
                        entry["team"] = item.get("team", "")
                        entry["points"] = item.get("points", "0")
                    else:
                        entry["player"] = item.get("player", "Unknown")
                        entry["country"] = item.get("country", "")

                    rank_list.append(entry)

                all_rankings.append({
                    "type": display_type,
                    "format": fmt.upper(),
                    "rank": rank_list
                })

    cache.set(cache_key, all_rankings)
    return jsonify(all_rankings)


# ---- NEWS ----
@app.route('/news')
def get_news():
    """Get latest cricket news."""
    cached = cache.get("news", NEWS_TTL)
    if cached is not None:
        return jsonify(cached)

    news = cs.get_cricket_news()
    transformed = []

    for i, n in enumerate(news):
        if "error" in n:
            continue
        transformed.append({
            "id": i,
            "title": n.get('headline', ''),
            "description": n.get('description', ''),
            "url": n.get('url', ''),
            "timestamp": n.get('timestamp', ''),
            "category": n.get('category', 'Cricket')
        })

    cache.set("news", transformed)
    return jsonify(transformed)


# ---- PLAYER STATS (NEW!) ----
@app.route('/players/<path:player_name>')
def get_player(player_name):
    """Get detailed player statistics."""
    cache_key = f"player_{player_name.lower().replace(' ', '_')}"
    cached = cache.get(cache_key, PLAYER_TTL)
    if cached is not None:
        return jsonify(cached)

    match_format = request.args.get('format', None)

    try:
        data = cs.get_player_stats(player_name, match_format)
        if "error" in data:
            return jsonify(data), 404

        cache.set(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to get player stats: {str(e)}"}), 500


# ---- MATCH DETAILS / SCORECARD (NEW!) ----
@app.route('/match-details')
def get_match_details():
    """Get detailed match scorecard. Pass match URL as ?url=..."""
    match_url = request.args.get('url', '')
    if not match_url:
        return jsonify({"error": "Please provide a match URL via ?url=CRICBUZZ_MATCH_URL"}), 400

    cache_key = f"match_{match_url}"
    cached = cache.get(cache_key, LIVE_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        data = cs.get_match_details(match_url)
        if "error" in data:
            return jsonify(data), 404

        cache.set(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to get match details: {str(e)}"}), 500


# ---- LIVE COMMENTARY (NEW!) ----
@app.route('/commentary')
def get_commentary():
    """Get live ball-by-ball commentary. Pass match URL as ?url=..."""
    match_url = request.args.get('url', '')
    limit = request.args.get('limit', '20')

    if not match_url:
        return jsonify({"error": "Please provide a match URL via ?url=CRICBUZZ_MATCH_URL"}), 400

    try:
        limit = int(limit)
    except ValueError:
        limit = 20

    cache_key = f"commentary_{match_url}_{limit}"
    cached = cache.get(cache_key, COMMENTARY_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        data = cs.get_live_commentary(match_url, limit)
        if "error" in data:
            return jsonify(data), 404

        cache.set(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to get commentary: {str(e)}"}), 500


# ---- CACHE MANAGEMENT ----
@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all cached data (admin endpoint)."""
    cache.clear()
    return jsonify({"status": "cache cleared"})


# =============================================================================
# SERVER STARTUP
# =============================================================================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f"🏏 Cricket Khelega API v2.0 starting on port {port}")
    print(f"📊 Endpoints: /live, /schedule, /rankings, /news, /players/<name>, /match-details, /commentary")
    app.run(host='0.0.0.0', port=port, debug=debug)
