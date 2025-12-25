
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def login(username, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={'username': username, 'password': password})
    if res.status_code == 200:
        return res.json()['token']
    else:
        print(f"Login failed: {res.text}")
        return None

def create_student(token, username, password):
    headers = {'Authorization': f'Bearer {token}'}
    data = {'username': username, 'password': password}
    print(f"Creating student {username}...")
    res = requests.post(f"{BASE_URL}/admin/create-student", json=data, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

def main():
    # Login as admin
    token = login('admin_test', 'testadmin123') 
    if not token:
        # Maybe use the known hash from previous steps or reset it?
        # The hash in users.json is scrypt...
        # Wait, I don't know the plain password!
        # The user said "password: admin123" in previous conversation summary!
        pass
    
    if token:
        create_student(token, 'test_student_v3', 'testpass')

if __name__ == "__main__":
    main()
