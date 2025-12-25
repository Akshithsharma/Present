
import json
import uuid
from werkzeug.security import generate_password_hash

def add_test_admin():
    path = 'users.json'
    with open(path, 'r') as f:
        users = json.load(f)
        
    if any(u['username'] == 'admin_test' for u in users):
        print("admin_test already exists")
        return

    new_user = {
        'user_id': str(uuid.uuid4()),
        'username': 'admin_test',
        'password': generate_password_hash('testadmin123'),
        'role': 'admin'
    }
    users.append(new_user)
    
    with open(path, 'w') as f:
        json.dump(users, f, indent=4)
    print("Added admin_test")

if __name__ == "__main__":
    add_test_admin()
