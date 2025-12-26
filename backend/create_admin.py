import json
import uuid
from werkzeug.security import generate_password_hash

users_file = 'users.json'

def create_admin():
    try:
        with open(users_file, 'r') as f:
            users = json.load(f)
    except FileNotFoundError:
        users = []

    # Check if admin exists
    if any(u['username'] == 'admin' for u in users):
        print("Admin user already exists.")
        # Update password just in case
        for u in users:
            if u['username'] == 'admin':
                u['password'] = generate_password_hash('admin123')
                print("Admin password reset to 'admin123'")
    else:
        new_admin = {
            "user_id": str(uuid.uuid4()),
            "username": "admin",
            "password": generate_password_hash("admin123"),
            "role": "admin",
            "student_id": None # Admins don't strictly need a student_id
        }
        users.append(new_admin)
        print("Admin user created.")

    with open(users_file, 'w') as f:
        json.dump(users, f, indent=4)

if __name__ == "__main__":
    create_admin()
