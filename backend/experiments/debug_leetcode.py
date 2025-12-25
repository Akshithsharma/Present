
import requests
import json
import sys

def debug_leetcode(username):
    print(f"Fetching stats for: {username}")
    url = "https://leetcode.com/graphql"
    query = """
    query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }
    """
    
    try:
        response = requests.post(
            url, 
            json={'query': query, 'variables': {'username': username}},
            headers={
                'Content-Type': 'application/json', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("--- Raw JSON Data ---")
            print(json.dumps(data, indent=2))
            
            if 'errors' in data:
                print("GRAPHQL ERRORS DETECTED")
                return

            if 'data' not in data or not data['data']:
                 print("NO DATA FIELD")
                 return
                 
            stats = data.get('data', {}).get('matchedUser', {}).get('submitStats', {}).get('acSubmissionNum', [])
            total = 0
            for item in stats:
                if item['difficulty'] == 'All':
                    total = item['count']
                    break
            print(f"--- Parsed Total: {total} ---")
        else:
            print("Request failed")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        debug_leetcode(sys.argv[1])
    else:
        print("Usage: python debug_leetcode.py <username>")
