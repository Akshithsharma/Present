
import json
from werkzeug.security import generate_password_hash

def reset_password(username, new_password):
    try:
        with open('users.json', 'r') as f:
            users = json.load(f)
        
        found = False
        for u in users:
            if u['username'] == username:
                u['password'] = generate_password_hash(new_password)
                print(f"Updated password for {username}")
                found = True
                break
        
        if not found:
            print(f"User {username} not found!")
            return

        with open('users.json', 'w') as f:
            json.dump(users, f, indent=4)
        print("users.json saved successfully.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_password("Akshith", "admin123")
