
import requests
import json
import os

def load_local_data():
    try:
        with open('student_data.json', 'r') as f:
            return json.load(f)
    except:
        return []

def reproduction_test():
    # 1. Get a valid Student ID
    data = load_local_data()
    if not data:
        print("No student data found!")
        return

    target_student = data[0]
    student_id = target_student['student_id']
    print(f"Target Student: {target_student.get('name')} ({student_id})")
    print(f"LeetCode: {target_student.get('leetcode_username')}")
    
    # 2. Login as admin to perform the action
    try:
        login_resp = requests.post('http://127.0.0.1:5000/api/auth/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        token = login_resp.json().get('token')
        headers = {'Authorization': f'Bearer {token}'}
        
        # 3. Call Sync
        print("Sending Sync Request...")
        resp = requests.post('http://127.0.0.1:5000/api/student/sync-coding-stats', 
            json={'student_id': student_id},
            headers=headers
        )
        
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")
        
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == '__main__':
    reproduction_test()
