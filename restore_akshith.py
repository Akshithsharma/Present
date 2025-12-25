import json
import uuid
from werkzeug.security import generate_password_hash

USERS_FILE = 'backend/users.json'
DATA_FILE = 'backend/student_data.json'

def load_json(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return []

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def restore_akshith():
    users = load_json(USERS_FILE)
    students = load_json(DATA_FILE)

    # Check if Akshith already exists
    if any(u.get('username') == 'Akshith' for u in users):
        print("Akshith already exists in users.json.")
        return

    print("Restoring Akshith...")
    
    # Generate IDs
    user_id = str(uuid.uuid4())
    student_id = str(uuid.uuid4())

    # Create User Entry
    new_user = {
        "user_id": user_id,
        "username": "Akshith",
        "password": generate_password_hash("student123"), # Default password
        "role": "student",
        "student_id": student_id
    }
    users.append(new_user)

    # Create Student Entry
    new_student = {
        "student_id": student_id,
        "name": "Akshith",
        "email": "",
        "academic_details": {},
        "skills": [],
        "projects": [],
        "coding_habits": {},
        "coding_history": []
    }
    students.append(new_student)

    # Save
    save_json(USERS_FILE, users)
    save_json(DATA_FILE, students)
    print("Successfully restored Akshith with password 'student123'.")

if __name__ == "__main__":
    restore_akshith()
