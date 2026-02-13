from flask import Flask, jsonify
from flask_cors import CORS
import re
import cricket_server as cs

app = Flask(__name__)
CORS(app)

def parse_teams(description):
    # Try to find "Team A vs Team B"
    match = re.search(r'(.+?)\s+vs\s+(.+?)(?:\s+-\s+|$)', description, re.IGNORECASE)
    if match:
        return [match.group(1).strip(), match.group(2).strip()]
    return [description, "TBA"]

@app.route('/live')
def get_live():
    matches = cs.get_live_matches()
    transformed = []
    for i, m in enumerate(matches):
        if "error" in m: continue
        
        teams = parse_teams(m['match'])
        transformed.append({
            "id": i + 1,
            "teams": teams,
            "score": [
                {"r": "0", "w": "0", "o": "0.0"},
                {"r": "0", "w": "0", "o": "0.0"}
            ],
            "status": "Live" if "Live" in m['match'] else "Upcoming",
            "venue": "International Stadium",
            "url": m.get('url', '')
        })
    return jsonify(transformed)

@app.route('/schedule')
def get_schedule():
    schedule = cs.get_cricket_schedule()
    transformed = []
    for i, s in enumerate(schedule):
        if "error" in s: continue
        
        teams = parse_teams(s['description'])
        transformed.append({
            "id": i,
            "name": s['description'],
            "date": s['date'],
            "teams": teams,
            "venue": s.get('venue', 'TBA')
        })
    return jsonify(transformed)

@app.route('/rankings')
def get_rankings():
    categories = ["batting", "bowling", "teams"]
    all_rankings = []
    
    for cat in categories:
        data = cs.get_icc_rankings(cat)
        if "error" in data: continue
        
        display_type = cat.capitalize()
        if cat == "batting": display_type = "Batsmen"
        if cat == "bowling": display_type = "Bowlers"
        
        for fmt in ["test", "odi", "t20"]:
            if fmt in data:
                # Format ranking list to match frontend expectation
                rank_list = []
                for item in data[fmt]:
                    rank_list.append({
                        "rank": int(item.get("position", 0)) if item.get("position") else 0,
                        "player": item.get("player") or item.get("team"),
                        "team": item.get("country") or item.get("team"),
                        "rating": int(item.get("rating", 0)) if item.get("rating") else 0
                    })
                
                all_rankings.append({
                    "type": display_type,
                    "format": fmt.upper(),
                    "rank": rank_list
                })
                
    return jsonify(all_rankings)

@app.route('/news')
def get_news():
    news = cs.get_cricket_news()
    transformed = []
    for i, n in enumerate(news):
        if "error" in n: continue
        transformed.append({
            "title": n.get('headline', ''),
            "description": n.get('description', ''),
            "url": n.get('url', '')
        })
    return jsonify(transformed)

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
