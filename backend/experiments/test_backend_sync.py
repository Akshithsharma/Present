
import unittest
import json
import os
import sys

# Add parent dir to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, save_data, load_data, save_users, load_users

class TestSync(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
        # Backup data
        self.original_data = load_data()
        self.original_users = load_users()
        
    def tearDown(self):
        # Restore data
        save_data(self.original_data)
        save_users(self.original_users)

    def test_sync_flow(self):
        # 1. Register a user
        username = "test_coder"
        password = "password"
        
        # Ensure user doesn't exist
        save_users([u for u in load_users() if u['username'] != username])
        
        reg_resp = self.app.post('/api/auth/register', json={
            'username': username,
            'password': password
        })
        self.assertEqual(reg_resp.status_code, 200)
        
        # 2. Login to get token
        login_resp = self.app.post('/api/auth/login', json={
            'username': username,
            'password': password
        })
        data = login_resp.get_json()
        token = data['token']
        student_id = data['student_id']
        headers = {'Authorization': f'Bearer {token}'}
        
        # 3. Update profile with LeetCode username
        # distinct valid user for test
        lc_user = "lee215" 
        
        profile_update = {
            'student_id': student_id,
            'leetcode_username': lc_user,
            'name': 'Test Coder'
        }
        
        update_resp = self.app.post('/api/profile', json=profile_update, headers=headers)
        self.assertEqual(update_resp.status_code, 200)
        
        # 4. Sync Stats
        sync_resp = self.app.post('/api/student/sync-coding-stats', json={'student_id': student_id}, headers=headers)
        self.assertEqual(sync_resp.status_code, 200)
        sync_data = sync_resp.get_json()
        
        print("Sync Response:", json.dumps(sync_data, indent=2))
        
        self.assertIn('leetcode', sync_data['reports'])
        self.assertTrue(sync_data['reports']['leetcode']['total_solved'] > 0)
        
        # 5. Verify persistence
        # Reload data
        curr_data = load_data()
        student = next(s for s in curr_data if s['student_id'] == student_id)
        self.assertTrue(len(student['coding_history']) > 0)
        self.assertEqual(student['coding_habits']['leetcode_problems'], sync_data['reports']['leetcode']['total_solved'])

if __name__ == '__main__':
    unittest.main()
