
import json
from werkzeug.security import generate_password_hash

def fix_credentials():
    try:
        with open('users.json', 'r') as f:
            users = json.load(f)
        
        target = "Akshith"
        new_pass = "admin123"
        
        # Update or Create
        user = next((u for u in users if u['username'] == target), None)
        if user:
            print(f"Found user {target}, updating password...")
            user['password'] = generate_password_hash(new_pass)
        else:
            print(f"User {target} not found!")
            return

        with open('users.json', 'w') as f:
            json.dump(users, f, indent=4)
        
        print("SUCCESS: users.json updated.")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    fix_credentials()
