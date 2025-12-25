import requests
import json
import sys

def debug_hackerrank(username):
    print(f"Fetching HackerRank stats for: {username}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Endpoint 1: Recent Challenges (often holds total count)
    try:
         url_recent = f"https://www.hackerrank.com/rest/hackers/{username}/recent_challenges?limit=1"
         print(f"Trying: {url_recent}")
         res = requests.get(url_recent, headers=headers, timeout=10)
         if res.status_code == 200:
             data = res.json()
             # The response usually looks like { models: [...], total: 123 }
             # 'total' here usually represents total submissions or unique solved? 
             # Let's assume it's "total interactions" which is a good proxy for activity.
             total_attempts = data.get('total', 0)
             print(f"Recent Challenges Total Field: {total_attempts}")
    except Exception as e:
        print(f"Error 1: {e}")

    # Endpoint 2: Badges (for fun/details)
    try:
        url_badges = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
        print(f"Trying: {url_badges}")
        res = requests.get(url_badges, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            print(f"Badges Count: {len(data.get('models', []))}")
    except Exception as e:
        print(f"Error 2: {e}")
    
if __name__ == "__main__":
    if len(sys.argv) > 1:
        debug_hackerrank(sys.argv[1])
    else:
        debug_hackerrank('shashank21j')
