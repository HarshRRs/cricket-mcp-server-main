import os
import requests
import json
import time
from flask import Flask, jsonify, render_template
from flask_cors import CORS
from bs4 import BeautifulSoup
from googlesearch import search
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("CRICKET_API_KEY")
BASE_URL = "https://api.cricapi.com/v1"

# Simple in-memory cache
cache = {
    "live": {"data": None, "timestamp": 0},
    "schedule": {"data": None, "timestamp": 0}
}
CACHE_DURATION = 300  # 5 minutes

@app.route('/live')
def live_matches():
    current_time = time.time()
    if cache["live"]["data"] and (current_time - cache["live"]["timestamp"] < CACHE_DURATION):
        return jsonify(cache["live"]["data"])

    try:
        response = requests.get(f"{BASE_URL}/currentMatches?apikey={API_KEY}&offset=0")
        data = response.json()
        
        if data.get("status") == "success":
            # Extract only the necessary info to keep it lean
            matches = []
            for m in data.get("data", []):
                matches.append({
                    "id": m.get("id"),
                    "name": m.get("name"),
                    "status": m.get("status"),
                    "score": m.get("score"),
                    "teams": m.get("teams"),
                    "venue": m.get("venue")
                })
            cache["live"] = {"data": matches, "timestamp": current_time}
            return jsonify(matches)
        return jsonify({"error": "Failed to fetch from API", "details": data}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/schedule')
def schedule():
    current_time = time.time()
    if cache["schedule"]["data"] and (current_time - cache["schedule"]["timestamp"] < CACHE_DURATION):
        return jsonify(cache["schedule"]["data"])

    try:
        # Fetching upcoming matches
        response = requests.get(f"{BASE_URL}/matches?apikey={API_KEY}&offset=0")
        data = response.json()
        
        if data.get("status") == "success":
            upcoming = []
            for m in data.get("data", []):
                if m.get("matchStarted") is False:
                    upcoming.append({
                        "id": m.get("id"),
                        "name": m.get("name"),
                        "date": m.get("date"),
                        "venue": m.get("venue"),
                        "teams": m.get("teams")
                    })
            cache["schedule"] = {"data": upcoming, "timestamp": current_time}
            return jsonify(upcoming)
        return jsonify({"error": "Failed to fetch from API"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/players/<player_name>', methods=['GET'])
def get_player(player_name):
    # Keep the original scraper logic for player details as it provides more rich content than free API tier
    query = f"{player_name} cricbuzz"
    profile_link = None
    try:
        results = search(query, num_results=5)
        for link in results:
            if "cricbuzz.com/profiles/" in link:
                profile_link = link
                break
                
        if not profile_link:
            return jsonify({"error": "No player profile found"}), 404
            
        c = requests.get(profile_link).text
        cric = BeautifulSoup(c, "html.parser")
        profile = cric.find("div", id="playerProfile")
        pc = profile.find("div", class_="cb-col cb-col-100 cb-bg-white")
        
        name = pc.find("h1", class_="cb-font-40").text
        country = pc.find("h3", class_="cb-font-18 text-gray").text
        
        image_url = None
        images = pc.findAll('img')
        for image in images:
            image_url = image['src']
            break

        personal = cric.find_all("div", class_="cb-col cb-col-60 cb-lst-itm-sm")
        role = personal[2].text.strip() if len(personal) > 2 else "Unknown"
        
        # Summary of the stats
        summary = cric.find_all("div", class_="cb-plyr-tbl")
        batting_stats = {}
        if len(summary) > 0:
            bat_rows = summary[0].find("tbody").find_all("tr")
            for row in bat_rows:
                cols = row.find_all("td")
                format_name = cols[0].text.strip().lower()
                batting_stats[format_name] = {
                    "matches": cols[1].text.strip(),
                    "runs": cols[3].text.strip(),
                    "avg": cols[6].text.strip(),
                    "sr": cols[7].text.strip()
                }

        return jsonify({
            "name": name,
            "country": country,
            "image": image_url,
            "role": role,
            "batting_stats": batting_stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/rankings')
def get_rankings():
    try:
        response = requests.get(f"{BASE_URL}/rankings?apikey={API_KEY}")
        data = response.json()
        if data.get("status") == "success":
            return jsonify(data.get("data", []))
        return jsonify({"error": "Failed to fetch rankings"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/news')
def get_news():
    try:
        # Note: Free tier might not have news endpoint, using matches info as a fallback or a simple scraper
        # For now, let's try the api or a dummy response if it fails
        response = requests.get(f"{BASE_URL}/news?apikey={API_KEY}")
        data = response.json()
        if data.get("status") == "success":
            return jsonify(data.get("data", []))
        
        # Fallback news if API endpoint doesn't exist in free tier
        return jsonify([
            {"title": "India retains top spot in ICC Rankings", "description": "Latest update shows India leading across all formats.", "url": "#"},
            {"title": "IPL 2026 Schedule Announced", "description": "The upcoming season promises to be bigger and better.", "url": "#"},
            {"title": "World Cup Qualifiers: Round Up", "description": "Key results from the latest matches.", "url": "#"}
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def website():
    return "Cricket Kelega API Proxy is running."

if __name__ == "__main__":
    app.run(port=5000, debug=True)
