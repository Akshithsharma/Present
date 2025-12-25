
import json

def cleanup():
    # Clean users.json
    with open('users.json', 'r') as f:
        users = json.load(f)
    
    users = [u for u in users if u['username'] not in ('admin_test', 'test_student_v3')]
    
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)
        
    # Clean student_data.json
    with open('student_data.json', 'r') as f:
        students = json.load(f)
        
    students = [s for s in students if s['name'] != 'test_student_v3']
    
    with open('student_data.json', 'w') as f:
        json.dump(students, f, indent=4)
        
    print("Cleanup done")

if __name__ == "__main__":
    cleanup()
