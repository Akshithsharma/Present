
import requests
import json
import uuid

def test_sync():
    # Login
    try:
        login_resp = requests.post('http://127.0.0.1:5000/api/auth/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        token = login_resp.json().get('token')
        student_id = login_resp.json().get('student_id') # Admin might not have one? 
        # Actually admin was created with one in my previous view of app.py?
        # Let's check.
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # Admin might not have a student profile created by default in the old code, 
        # but in the new code I see "student_id" is added to user.
        
        # Let's try to sync for a random ID if we don't have one, just to see the HTTP status code.
        # If headers are valid, we should get 400 or 404 or 500 (if code error).
        # We shouldn't get 404 Not Found (URL) if the route exists.
        
        target_id = student_id if student_id else str(uuid.uuid4())
        
        print(f"Testing sync for ID: {target_id}")
        
        resp = requests.post('http://127.0.0.1:5000/api/student/sync-coding-stats', 
            json={'student_id': target_id},
            headers=headers
        )
        
        print(f"Sync Endpoint Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
    except Exception as e:
        print(f"Test Failed: {e}")

if __name__ == "__main__":
    test_sync()
