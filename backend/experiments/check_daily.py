
import requests
import json

def test_daily():
    try:
        resp = requests.get('http://127.0.0.1:5000/api/practice/daily')
        print(f"Status: {resp.status_code}")
        print(json.dumps(resp.json(), indent=2))
        
        if resp.status_code == 200 and 'title' in resp.json():
            print("SUCCESS: Fetched daily question.")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    test_daily()
