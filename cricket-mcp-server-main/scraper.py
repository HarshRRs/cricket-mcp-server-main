import requests
from bs4 import BeautifulSoup
import re
import time
import json

# Use mimic headers to avoid basic bot detection
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def get_cricbuzz_matches():
    try:
        url = "https://www.cricbuzz.com/cricket-match/live-scores"
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return []
        soup = BeautifulSoup(response.content, "html.parser")
        matches = []
        match_links = soup.find_all("a", href=lambda href: href and "/live-cricket-scores/" in href)
        seen_ids = set()
        for link in match_links:
            try:
                href = link.get("href")
                match_match = re.search(r"/live-cricket-scores/(\d+)/", href)
                if not match_match: continue
                match_id = match_match.group(1)
                if match_id in seen_ids: continue
                seen_ids.add(match_id)
                match_name = link.text.strip()
                status_text = ""
                score_text = ""
                header_container = link.parent
                match_item_container = header_container.parent
                score_div = match_item_container.find("div", class_="cb-scr-wll-chvrn")
                if not score_div: score_div = match_item_container.find_next("div", class_="cb-scr-wll-chvrn")
                if score_div:
                    raw_text = score_div.get_text(" ", strip=True) 
                    extracted = raw_text.split("•") 
                    if extracted:
                        status_text = extracted[-1].strip()
                        if len(extracted) > 1: score_text = extracted[0].strip()
                        else: score_text = raw_text
                
                # Parse Teams from Name
                # Name format: "India vs Pakistan, 1st Test"
                team1, team2 = "Team 1", "Team 2"
                try:
                    # Remove comma suffix (e.g. ", 1st Test")
                    clean_name = match_name.split(",")[0].strip()
                    if " vs " in clean_name:
                        t_parts = clean_name.split(" vs ")
                        team1 = t_parts[0].strip()
                        team2 = t_parts[1].strip()
                    elif " v " in clean_name:
                        t_parts = clean_name.split(" v ")
                        team1 = t_parts[0].strip()
                        team2 = t_parts[1].strip()
                except: pass

                matches.append({
                    "id": match_id, 
                    "name": match_name, 
                    "status": status_text or "Live/Upcoming", 
                    "score": score_text, 
                    "team1": team1,
                    "team2": team2,
                    "source": "cricbuzz"
                })
            except: continue
        return matches
    except: return []

def get_commentary(match_id):
    try:
        url = f"https://www.cricbuzz.com/live-cricket-scores/{match_id}/commentary"
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return [f"Could not load commentary (Status {response.status_code})"]
        soup = BeautifulSoup(response.content, "html.parser")
        commentary_lines = []
        comm_elements = soup.find_all("p", class_="cb-com-ln")
        if not comm_elements: comm_elements = soup.select(".cb-col.cb-col-100 .cb-com-ln")
        for el in comm_elements:
            text = el.get_text(strip=True)
            if text: commentary_lines.append(text)
        return commentary_lines[:25]
    except Exception as e: return [f"Could not load commentary: {str(e)}"]

def get_icc_rankings(category, format_type):
    try:
        cat_map = {'batting':'batting', 'bowling':'bowling', 'all-rounder':'all-rounder', 'teams':'teams'}
        url_cat = cat_map.get(category, 'batting')
        url = f"https://www.cricbuzz.com/cricket-stats/icc-rankings/men/{url_cat}"
        
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return []
        soup = BeautifulSoup(response.content, 'html.parser')
        
        rankings = []
        
        # Strategy: Find all player links.
        player_links = soup.find_all('a', href=re.compile(r"/profiles/\d+/"))
        
        if not player_links and category == 'teams':
            # Teams logic: Look for divs with country names?
            # Or table structure.
            # Teams usually have 'cb-rank-tbl' or similar?
            # Let's try to find numeric ranks.
            pass

        for link in player_links:
            try:
                # Debug HTML structure
                # print(f"Link HTML: {link}") 
                
                # Attempt to split name and country
                # Typically country is in a separate span or div if inside anchor?
                # Or maybe it's just text?
                
                # Use get_text with separator to see boundaries
                full_text = link.get_text("|", strip=True) # "Joe Root|England"
                parts = full_text.split("|")
                
                name = parts[0].strip()
                country = ""
                if len(parts) > 1:
                    country = parts[1].strip()
                
                # Fallback if no separator found (just text)
                if not country and name:
                     # Check if country is in name? No, risky.
                     pass
                
                if not name: continue
                
                # Navigate to Row
                # Usually Link -> Div -> Div (Row)
                # Level 1 Parent (Cell) -> Level 2 Parent (Row)
                
                # Heuristic: The row text usually starts with a digit (Rank)
                # We check the parent chain for a "Row" candidate.
                
                row_candidate = None
                curr = link.parent
                for _ in range(3):
                    if not curr: break
                    txt = curr.get_text(" ", strip=True)
                    # aggressive check: does it start with digit?
                    if txt and txt[0].isdigit():
                        row_candidate = curr
                        # Don't break immediately, higher up might be better?
                        # Usually the row is the first container that has Rank + Name + Rating
                        # Check if "Rating" is present? Rating is usually 3-4 digits at end.
                        if re.search(r"\d{3,4}$", txt):
                             break
                    curr = curr.parent
                
                if row_candidate:
                     row_text = row_candidate.get_text(" ", strip=True)
                     parts = row_text.split()
                     if len(parts) >= 3:
                         rank = parts[0]
                         rating = parts[-1]
                         # Filter out if rank is not digit (header?)
                         if not rank.isdigit(): continue
                         
                         rankings.append({
                            "rank": rank,
                            "name": name,
                            "rating": rating,
                            "country": "", 
                            "trend": "flat"
                         })
            except:
                continue
                
        # Slicing Logic
        total = len(rankings)
        if total > 0:
            section = total // 3
            start = 0
            end = total
            if format_type.lower() == 'test': end = section
            elif format_type.lower() == 'odi': start = section; end = section * 2
            elif format_type.lower() == 't20': start = section * 2
            
            # Bound checks
            if start >= total: start = 0; end = 0
            if end > total: end = total
            
            return rankings[start:end]
            
        return rankings[:10]

    except Exception as e:
        print(f"Scraper Error: {e}")
        return []

if __name__ == "__main__":
    print("Testing extraction...")
    r = get_icc_rankings('batting', 'test')
    print(f"Test Batting: Found {len(r)}")
    for i in r[:5]: print(i)
    
    print("\nTesting ODI...")
    r = get_icc_rankings('batting', 'odi')
    print(f"ODI Batting: Found {len(r)}")
    for i in r[:5]: print(i)
