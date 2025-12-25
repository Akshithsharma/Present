import uuid
from datetime import datetime

class Student:
    def __init__(self, name, email, academic_details, skills, projects, coding_habits, student_id=None, leetcode_username=None, hackerrank_username=None, coding_history=None):
        self.student_id = student_id if student_id else str(uuid.uuid4())
        self.name = name
        self.email = email
        self.academic_details = academic_details  
        self.skills = skills  
        self.projects = projects  
        self.coding_habits = coding_habits  
        self.leetcode_username = leetcode_username
        self.hackerrank_username = hackerrank_username
        self.coding_history = coding_history if coding_history is not None else []
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "academic_details": self.academic_details,
            "skills": self.skills,
            "projects": self.projects,
            "coding_habits": self.coding_habits,
            "leetcode_username": self.leetcode_username,
            "hackerrank_username": self.hackerrank_username,
            "coding_history": self.coding_history,
            "created_at": self.created_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        return Student(
            student_id=data.get('student_id'),
            name=data.get('name'),
            email=data.get('email'),
            academic_details=data.get('academic_details', {}),
            skills=data.get('skills', []),
            projects=data.get('projects', []),
            coding_habits=data.get('coding_habits', {}),
            leetcode_username=data.get('leetcode_username'),
            hackerrank_username=data.get('hackerrank_username'),
            coding_history=data.get('coding_history', [])
        )
