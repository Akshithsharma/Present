from flask import Blueprint, request, jsonify
import jwt
import datetime
from werkzeug.security import check_password_hash
from models import User, Student, db

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = 'dev-secret-key-123' 

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # SQL Lookup
            current_user = User.query.filter_by(user_id=data['user_id']).first()
           
            if not current_user:
                return jsonify({'message': 'Token is invalid'}), 401
            
            # Convert to dict for compatibility with existing decorators expecting dict
            current_user_dict = current_user.to_dict()

        except Exception as e:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user_dict, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
        
    print(f"DEBUG: Login Attempt for {data['username']}")
    user = User.query.filter_by(username=data['username']).first()
    
    if not user:
        print(f"DEBUG: User {data['username']} NOT FOUND in DB.")
        return jsonify({'message': 'User not found'}), 401
        
    if check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'user_id': user.user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'token': token,
            'role': user.role,
            'student_id': user.student_id,
            'username': user.username
        })
    
    return jsonify({'message': 'Invalid password'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    print("DEBUG: Registration Endpoint Hit")
    from werkzeug.security import generate_password_hash
    import uuid

    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400

    try:
        # 1. Create Student Profile first
        new_student_id = str(uuid.uuid4())
        new_student = Student(
            name=data['username'],
            email=data.get('email', ''), 
            student_id=new_student_id
        )
        db.session.add(new_student)
        
        # 2. Create User linked to Student
        new_user = User(
            user_id=str(uuid.uuid4()),
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='student',
            student_id=new_student_id
        )
        db.session.add(new_user)
        db.session.commit()
        
        print(f"DEBUG: Saved new user: {new_user.username}")
        return jsonify({'message': 'Registration successful'}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration Error: {e}")
        return jsonify({'message': str(e)}), 500

def init_admin():
    from werkzeug.security import generate_password_hash
    import uuid
    
    # Check if ANY admin exists
    admin_exist = User.query.filter_by(role='admin').first()
    
    if not admin_exist:
        print("--- SETUP: No Admin Found. Creating 'admin' user... ---")
        try:
            new_user = User(
                user_id=str(uuid.uuid4()),
                username='admin',
                password=generate_password_hash('admin123'),
                role='admin',
                student_id=None
            )
            db.session.add(new_user)
            db.session.commit()
            print("--- SETUP: Default Admin (admin/admin123) Created Successfully ---")
        except Exception as e:
            print(f"--- SETUP ERROR: Could not create admin: {e} ---")
            db.session.rollback()
    else:
        print("--- SETUP: Admin user already exists. Skipping creation. ---")
