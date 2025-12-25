
import requests
import json

def check_backend():
    try:
        # Check health
        resp = requests.get('http://127.0.0.1:5000/')
        print(f"Backend Health: {resp.status_code}")
        
        # Check if we can hit the API (login to get token)
        # Note: We need a valid user. 
        # I'll try to login as 'admin' 
        login_resp = requests.post('http://127.0.0.1:5000/api/auth/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        print(f"Login Status: {login_resp.status_code}")
        
        if login_resp.status_code == 200:
            token = login_resp.json().get('token')
            print("Token acquired.")
    except Exception as e:
        print(f"Backend Check Failed: {e}")
        print("Suggestion: Please restart the backend server to pick up new dependencies (requests).")

if __name__ == "__main__":
    check_backend()
