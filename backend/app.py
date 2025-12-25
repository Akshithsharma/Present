from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from models import Student
from logic import calculate_readiness_score
from ml_model import CareerPredictor
import os
import json
import jwt
import datetime
import uuid
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

from integrations import fetch_leetcode_stats, fetch_hackerrank_stats, get_daily_question
from coach import analyze_progress, generate_recommendations

# Serve React App
app = Flask(__name__, static_folder='../frontend/dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Enable CORS for all domains for simplicity (Production Note: Restrict this for higher security)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_prod')
DATA_FILE = 'student_data.json'
USERS_FILE = 'users.json'
predictor = CareerPredictor()

# --- Helper Functions for Data ---

def load_json(filename):
    if not os.path.exists(filename):
        return []
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def save_json(filename, data):
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error saving {filename}: {e}")

def load_data():
    return load_json(DATA_FILE)

def save_data(data):
    save_json(DATA_FILE, data)

def load_users():
    users = load_json(USERS_FILE)
    # Pre-seed Admin if not exists
    if not any(u['role'] == 'admin' for u in users):
        admin_user = {
            'user_id': str(uuid.uuid4()),
            'username': 'admin',
            'password': generate_password_hash('admin123'),
            'role': 'admin'
        }
        users.append(admin_user)
        save_users(users)
    return users

def save_users(data):
    save_json(USERS_FILE, data)

# --- Authentication Decorator ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = next((u for u in load_users() if u['username'] == data['username']), None)
            if not current_user:
                 return jsonify({'message': 'User invalid!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# --- Auth Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    users = load_users()
    
    if any(u['username'] == data['username'] for u in users):
        return jsonify({'message': 'Username already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    # Force role to be student for public registration
    role = 'student'
    
    new_user = {
        'user_id': str(uuid.uuid4()),
        'username': data['username'],
        'password': hashed_password,
        'role': role
    }
    
    student_id = str(uuid.uuid4())
    new_user['student_id'] = student_id
    
    # Create empty student profile
    new_student = Student(
        name=data['username'],
        email="",
        academic_details={},
        skills=[],
        projects=[],
        coding_habits={},
        student_id=student_id
    )
    
    students = load_data()
    students.append(new_student.to_dict())
    save_data(students)

    users.append(new_user)
    save_users(users)
    
    return jsonify({'message': 'User registered successfully'})

@app.route('/api/admin/create-student', methods=['POST'])
@token_required
def admin_create_student(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    users = load_users()
    
    if any(u['username'] == data['username'] for u in users):
        return jsonify({'message': 'Username already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    role = 'student'
    
    new_user = {
        'user_id': str(uuid.uuid4()),
        'username': data['username'],
        'password': hashed_password,
        'role': role
    }
    
    student_id = str(uuid.uuid4())
    new_user['student_id'] = student_id
    
    new_student = Student(
        name=data['username'], # Default name to username
        email="",
        academic_details={},
        skills=[],
        projects=[],
        coding_habits={},
        student_id=student_id
    )
    
    students = load_data()
    students.append(new_student.to_dict())
    save_data(students)

    users.append(new_user)
    save_users(users)
    
    return jsonify({'message': 'Student created successfully'})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    users = load_users()
    user = next((u for u in users if u['username'] == data['username']), None)
    
    if not user:
        return jsonify({'message': 'User does not exist'}), 401
        
    if check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'username': user['username'],
            'role': user['role'],
            'student_id': user.get('student_id'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'role': user['role'],
            'student_id': user.get('student_id'),
            'username': user['username']
        })
        
    return jsonify({'message': 'Invalid password'}), 401

# --- Protected Data Routes ---



@app.route('/api/profiles', methods=['GET'])
@token_required
def get_profiles(current_user):
    all_profiles = load_data()
    
    if current_user['role'] == 'admin':
        return jsonify(all_profiles)
    else:
        # Student sees only their own profile
        student_id = current_user.get('student_id')
        my_profile = [p for p in all_profiles if p['student_id'] == student_id]
        return jsonify(my_profile)

@app.route('/api/profile/<student_id>', methods=['GET'])
@token_required
def get_profile(current_user, student_id):
    # Authorization Check
    if current_user['role'] != 'admin' and current_user.get('student_id') != student_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = load_data()
    student_data = next((item for item in data if item["student_id"] == student_id), None)
    if not student_data:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(student_data)

@app.route('/api/profile', methods=['POST'])
@token_required
def save_profile(current_user):
    new_data = request.json
    all_data = load_data()
    
    student_id = new_data.get('student_id')
    
    # Authorization Check
    if current_user['role'] != 'admin':
        # Student must provide their OWN ID or no ID (implies update own)
        if hasattr(current_user, 'student_id') and current_user['student_id'] != student_id:
             # Force it to be their ID
             student_id = current_user['student_id']
             new_data['student_id'] = student_id
        elif not student_id:
             student_id = current_user.get('student_id')
             new_data['student_id'] = student_id
    
    if not student_id:
        if current_user['role'] == 'admin':
            student_id = str(uuid.uuid4())
            new_data['student_id'] = student_id
        else:
             return jsonify({'message': 'Profile ID missing'}), 400

    # Update Logic
    index = next((i for i, item in enumerate(all_data) if item["student_id"] == student_id), -1)
    
    student_obj = Student.from_dict(new_data)
    student_obj.student_id = student_id # Ensure persistence
    
    if index != -1:
        # Preserve existing history if not provided (though from_dict handles defaults, it might overwrite with empty if we are not careful)
        # Actually from_dict will default to empty list if key missing.
        # Ideally we merge? For simplicity now, we assume frontend sends everything or we accept the overwrite.
        # But for 'coding_history' which might be backend managed mostly, let's be careful.
        existing = all_data[index]
        if not new_data.get('coding_history') and 'coding_history' in existing:
            student_obj.coding_history = existing['coding_history']

        all_data[index] = student_obj.to_dict()
    else:
        all_data.append(student_obj.to_dict())
    
    save_data(all_data)
    return jsonify({"message": "Profile saved", "student": student_obj.to_dict()})

@app.route('/api/student/sync-coding-stats', methods=['POST'])
@token_required
def sync_coding_stats(current_user):
    data = request.json
    student_id = data.get('student_id')
    
    # Auth Check
    if current_user['role'] != 'admin':
        # Students can only sync themselves
        if current_user.get('student_id') != student_id:
            return jsonify({'message': 'Unauthorized'}), 403
            
    if not student_id:
        return jsonify({'message': 'Student ID required'}), 400
        
    all_data = load_data()
    index = next((i for i, item in enumerate(all_data) if item["student_id"] == student_id), -1)
    
    if index == -1:
         return jsonify({'message': 'Student not found'}), 404
         
    student_data = all_data[index]
    
    # Get usernames
    lc_user = student_data.get('leetcode_username')
    hr_user = student_data.get('hackerrank_username')
    
    reports = {}
    
    if lc_user:
        lc_stats = fetch_leetcode_stats(lc_user)
        if lc_stats:
            reports['leetcode'] = lc_stats
            
    if hr_user:
        hr_stats = fetch_hackerrank_stats(hr_user)
        if hr_stats:
            reports['hackerrank'] = hr_stats
            
    previous_lc_count = student_data.get('coding_habits', {}).get('leetcode_problems', 0)

    # Update History
    if reports:
        today_str = datetime.datetime.utcnow().strftime('%Y-%m-%d')
        new_entry = {
            'date': today_str,
            'stats': reports,
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        
        # Add to history
        current_history = student_data.get('coding_history', [])
        current_history.append(new_entry)
        
        # Update snapshot "coding_habits"
        if 'coding_habits' not in student_data: student_data['coding_habits'] = {}
        
        if 'leetcode' in reports:
             lc = reports['leetcode']
             student_data['coding_habits']['leetcode_problems'] = lc.get('total_solved', 0)
             student_data['coding_habits']['leetcode_easy'] = lc.get('easy_solved', 0)
             student_data['coding_habits']['leetcode_medium'] = lc.get('medium_solved', 0)
             student_data['coding_habits']['leetcode_hard'] = lc.get('hard_solved', 0)
        
        if 'hackerrank' in reports:
             hr = reports['hackerrank']
             student_data['coding_habits']['hackerrank_problems'] = hr.get('total_solved', 0)
             student_data['coding_habits']['hackerrank_badges'] = hr.get('badges_count', 0)
             
        student_data['coding_history'] = current_history
        all_data[index] = student_data
        save_data(all_data)
        
    new_lc_count = student_data.get('coding_habits', {}).get('leetcode_problems', 0)
    new_hr_count = student_data.get('coding_habits', {}).get('hackerrank_problems', 0)
    
    # Run Coach Analysis
    analysis = analyze_progress(student_data.get('coding_history', []), reports)
    recommendations = generate_recommendations(reports, analysis)

    return jsonify({
        'message': 'Sync complete', 
        'reports': reports,
        'stats_summary': {
            'leetcode': {
                'old': previous_lc_count,
                'new': new_lc_count
            }
        },
        'analysis': analysis,
        'recommendations': recommendations,
        'updated_history_len': len(student_data.get('coding_history', []))
    })

@app.route('/api/profile/<student_id>', methods=['DELETE'])
@token_required
def delete_profile(current_user, student_id):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    # 1. Delete Student Profile
    all_data = load_data()
    all_data = [s for s in all_data if s['student_id'] != student_id]
    save_data(all_data)

    # 2. Delete User Login (Cascading Delete)
    users = load_users()
    users = [u for u in users if u.get('student_id') != student_id]
    save_users(users)

    return jsonify({"message": "Profile and User account deleted"})

@app.route('/api/predict', methods=['POST'])
@token_required
def predict(current_user):
    data = request.json
    if not data:
        return jsonify({"error": "No student data provided"}), 400

    try:
        student = Student.from_dict(data)
        rule_result = calculate_readiness_score(student)
        prob, msg = predictor.predict_placement_probability(student)
        
        return jsonify({
            "readiness_score": rule_result['score'],
            "readiness_details": rule_result['details'],
            "risk_level": rule_result['risk_level'],
            "placement_probability": prob,
            "ml_message": msg
        })
    except Exception as e:
        print("Error in predict:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/simulate', methods=['POST'])
@token_required
def simulate(current_user):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        student = Student.from_dict(data)
        rule_result = calculate_readiness_score(student)
        prob, msg = predictor.predict_placement_probability(student)
        
        return jsonify({
            "simulated_score": rule_result['score'],
            "simulated_probability": prob,
            "improvements": rule_result['details'],
            "risk_level": rule_result['risk_level']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/practice/daily', methods=['GET'])
def daily_question():
    try:
        data = get_daily_question()
        if data:
            return jsonify(data)
        else:
            return jsonify({"error": "Failed to fetch daily question"}), 500
    except Exception as e:
         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
