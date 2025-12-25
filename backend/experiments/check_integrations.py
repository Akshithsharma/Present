
import json
import urllib.request
import urllib.error

def check_leetcode(username):
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
    data = json.dumps({
        "query": query,
        "variables": {"username": username}
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"LeetCode ({username}): Success")
            # print(json.dumps(result, indent=2))
            return True
    except Exception as e:
        print(f"LeetCode ({username}): Failed - {e}")
        return False

def check_hackerrank(username):
    # Try the undocumented REST endpoint
    url = f"https://www.hackerrank.com/rest/hackers/{username}/submission_histories"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"HackerRank ({username}): Success (History endpoint)")
            return True
    except urllib.error.HTTPError as e:
        # print(f"HackerRank ({username}): Failed History - {e}")
        pass
    except Exception as e:
        print(f"HackerRank ({username}): Failed History - {e}")
    
    # Try another one
    url = f"https://www.hackerrank.com/rest/hackers/{username}/scores_elo"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"HackerRank ({username}): Success (Scores endpoint)")
            return True
    except Exception as e:
        print(f"HackerRank ({username}): Failed Scores - {e}")
        return False

if __name__ == "__main__":
    print("Checking LeetCode...")
    check_leetcode("tourist") # known user? or just "lee215"
    check_leetcode("akshith") # maybe?

    print("\nChecking HackerRank...")
    check_hackerrank("tourist") 
    check_hackerrank("akshith")
