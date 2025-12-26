from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
import uuid
import datetime
import os

# Initialize SQLAlchemy with no settings (will be init_app'd in app.py)
db = SQLAlchemy()

# Helper for JSON type compatibility (SQLite uses generic JSON, Postgres uses specific JSON)
# We can use the generic db.JSON for cross-compatibility if using Flask-SQLAlchemy >= 3.0
# But for explicit clarity:
JsonType = db.JSON

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'admin' or 'student'
    student_id = db.Column(db.String(36), nullable=True) # Linked Student UUID

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'role': self.role,
            'student_id': self.student_id
        }

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Complex Data stored as JSON
    academic_details = db.Column(JsonType, default={})
    skills = db.Column(JsonType, default=[])
    projects = db.Column(JsonType, default=[])
    coding_habits = db.Column(JsonType, default={})
    coding_history = db.Column(JsonType, default=[])
    
    # External Platform Usernames
    leetcode_username = db.Column(db.String(100), nullable=True)
    hackerrank_username = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "academic_details": self.academic_details or {},
            "skills": self.skills or [],
            "projects": self.projects or [],
            "coding_habits": self.coding_habits or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "leetcode_username": self.leetcode_username,
            "hackerrank_username": self.hackerrank_username,
            "coding_history": self.coding_history or []
        }

# Legacy Loader/Saver placeholders removed. 
# Code should now use db.session directly.
