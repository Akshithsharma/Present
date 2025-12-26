from app import app, db
from models import User, Student

def view_data():
    with app.app_context():
        print("\n--- USERS ---")
        users = User.query.all()
        for u in users:
            print(f"ID: {u.id} | Username: {u.username} | Role: {u.role} | StudentID: {u.student_id}")

        print("\n--- STUDENTS ---")
        students = Student.query.all()
        for s in students:
            print(f"ID: {s.id} | Name: {s.name} | StudentID: {s.student_id}")
            print(f"   Skills: {s.skills}")
            print(f"   Habits: {s.coding_habits}")
            print("-" * 30)

if __name__ == "__main__":
    view_data()
