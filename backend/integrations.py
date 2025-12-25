import requests
import json

def fetch_leetcode_stats(username):
    """
    Fetches LeetCode statistics for a given username using GraphQL.
    Returns a dict with 'solved' (total) or None if failed.
    """
    if not username:
        return None
        
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
            headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                print(f"LeetCode Error: {data['errors']}")
                return None
                
            stats = data.get('data', {}).get('matchedUser', {}).get('submitStats', {}).get('acSubmissionNum', [])
            total_solved = 0
            easy_solved = 0
            medium_solved = 0
            hard_solved = 0

            # stats is a list: [{'difficulty': 'All', 'count': 123}, {'difficulty': 'Easy', ...}]
            for item in stats:
                if item['difficulty'] == 'All':
                    total_solved = item['count']
                elif item['difficulty'] == 'Easy':
                    easy_solved = item['count']
                elif item['difficulty'] == 'Medium':
                    medium_solved = item['count']
                elif item['difficulty'] == 'Hard':
                    hard_solved = item['count']
            
            return {
                'total_solved': total_solved,
                'easy_solved': easy_solved,
                'medium_solved': medium_solved,
                'hard_solved': hard_solved
            }
        else:
            print(f"LeetCode Request Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error fetching LeetCode stats for {username}: {e}")
        
    return None

def fetch_hackerrank_stats(username):
    """
    Fetches HackerRank statistics using public endpoints.
    Uses 'recent_challenges' total as a proxy for activity/solved count.
    """
    if not username:
        return None
        
    headers = {'User-Agent': 'Mozilla/5.0'}
    stats = {}
    
    try:
        # 1. Get Activity Count (Proxy for solved/progress)
        url_recent = f"https://www.hackerrank.com/rest/hackers/{username}/recent_challenges?limit=1"
        res = requests.get(url_recent, headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            stats['total_solved'] = data.get('total', 0)
        else:
            return None # If we can't get basic stats, return None

        # 2. Get Badges (optional, for fun)
        url_badges = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
        res_badges = requests.get(url_badges, headers=headers, timeout=5)
        if res_badges.status_code == 200:
            badges_data = res_badges.json()
            stats['badges_count'] = len(badges_data.get('models', []))
            
        return stats
        
    except Exception as e:
        print(f"Error fetching HackerRank stats for {username}: {e}")
        return None

def get_daily_question():
    """
    Fetches the daily challenge question from LeetCode GraphQL API.
    """
    url = "https://leetcode.com/graphql"
    query = """
    query questionOfToday {
        activeDailyCodingChallengeQuestion {
            date
            link
            question {
                title
                titleSlug
                difficulty
            }
        }
    }
    """
    
    try:
        response = requests.post(
            url, 
            json={'query': query},
            headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            challenge = data.get('data', {}).get('activeDailyCodingChallengeQuestion', {})
            question = challenge.get('question', {})
            
            return {
                'title': question.get('title'),
                'difficulty': question.get('difficulty'),
                'link': "https://leetcode.com" + challenge.get('link', ''),
                'date': challenge.get('date')
            }
    except Exception as e:
        print(f"Error fetching daily question: {e}")
        
    return None

