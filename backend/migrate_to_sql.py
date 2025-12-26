import json
import os
from app import app, db
from models import User, Student

# Define files to migrate
USERS_FILE = 'users.json'
STUDENT_FILE = 'student_data.json'

def load_json(filename):
    if not os.path.exists(filename):
        return []
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def migrate():
    print("--- Starting Data Migration ---")
    
    with app.app_context():
        # Ensure fresh DB tables
        db.create_all()
        print("DB Tables Created.")
        
        # 1. Migrate Students
        students_data = load_json(STUDENT_FILE)
        print(f"Found {len(students_data)} students to migrate.")
        
        for s_data in students_data:
            # Check if exists
            if Student.query.filter_by(student_id=s_data['student_id']).first():
                print(f"Skipping existing student: {s_data.get('name')}")
                continue
                
            new_student = Student(
                student_id=s_data.get('student_id'),
                name=s_data.get('name'),
                email=s_data.get('email'),
                academic_details=s_data.get('academic_details', {}),
                skills=s_data.get('skills', []),
                projects=s_data.get('projects', []),
                coding_habits=s_data.get('coding_habits', {}),
                coding_history=s_data.get('coding_history', []),
                leetcode_username=s_data.get('leetcode_username'),
                hackerrank_username=s_data.get('hackerrank_username')
            )
            # Handle date creation parsing if needed, or rely on default
            db.session.add(new_student)
            
        # 2. Migrate Users
        users_data = load_json(USERS_FILE)
        print(f"Found {len(users_data)} users to migrate.")
        
        for u_data in users_data:
            if User.query.filter_by(username=u_data['username']).first():
                print(f"Skipping existing user: {u_data['username']}")
                continue
                
            new_user = User(
                user_id=u_data.get('user_id'),
                username=u_data.get('username'),
                password=u_data.get('password'),
                role=u_data.get('role'),
                student_id=u_data.get('student_id')
            )
            db.session.add(new_user)
            
        try:
            db.session.commit()
            print("--- Migration Successful ---")
            print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
        except Exception as e:
            db.session.rollback()
            print(f"Migration Failed: {e}")

if __name__ == '__main__':
    migrate()
