from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import datetime
import uuid

# Internal Modules
from auth import auth_bp, init_admin, token_required
# Removed legacy file imports
from ml_model import CareerPredictor
from integrations import fetch_leetcode_stats, fetch_hackerrank_stats, get_daily_question
from coach import analyze_progress, generate_recommendations

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config['SECRET_KEY'] = 'dev-secret-key-123'

# --- Initialization ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///local.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from models import db, User, Student
db.init_app(app)
with app.app_context():
    db.create_all()
    init_admin()

app.register_blueprint(auth_bp, url_prefix='/api/auth')
predictor = CareerPredictor()

@app.before_request
def log_request_info():
    print(f"[{datetime.datetime.now()}] {request.method} {request.url}")

# --- Profile Routes ---
@app.route('/api/profiles', methods=['GET'])
@token_required
def get_profiles(current_user):
    if current_user['role'] == 'admin':
        students = Student.query.all()
    else:
        # Student sees only their own
        my_id = current_user.get('student_id')
        students = Student.query.filter_by(student_id=my_id).all()
    
    return jsonify([s.to_dict() for s in students])

@app.route('/api/profile/<student_id>', methods=['GET'])
@token_required
def get_profile(current_user, student_id):
    # Security Check
    if current_user['role'] != 'admin' and current_user.get('student_id') != student_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'message': 'Not found'}), 404
    return jsonify(student.to_dict())

@app.route('/api/profile', methods=['POST'])
@token_required
def save_profile(current_user):
    data = request.json
    student_id = data.get('student_id')
    
    # Validation
    if current_user['role'] != 'admin':
        if current_user.get('student_id') != student_id:
             if not student_id:
                 student_id = current_user['student_id']
                 data['student_id'] = student_id
             else:
                 return jsonify({'message': 'Unauthorized'}), 403
                 
    student = Student.query.filter_by(student_id=student_id).first()
    
    if student:
        # Update existing
        for key, value in data.items():
            if hasattr(student, key) and key != 'student_id': # Protect ID
                setattr(student, key, value)
    else:
        # Create new
        # Note: In real app, we usually create student during registration. 
        # But for profile editing robustness:
        student = Student(student_id=student_id, name=data.get('name', 'Unknown'))
        for key, value in data.items():
             if hasattr(student, key):
                setattr(student, key, value)
        db.session.add(student)
        
    db.session.commit()
    return jsonify({'message': 'Profile saved', 'student': student.to_dict()})

@app.route('/api/profile/<student_id>', methods=['DELETE'])
@token_required
def delete_profile(current_user, student_id):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    student = Student.query.filter_by(student_id=student_id).first()
    if student:
        db.session.delete(student)
        
        # Clean up Linked User
        user = User.query.filter_by(student_id=student_id).first()
        if user:
            db.session.delete(user)
            
        db.session.commit()
        return jsonify({'message': 'Profile deleted successfully'})
        
    return jsonify({'message': 'Student not found'}), 404

# --- Admin Factory ---
@app.route('/api/admin/create-student', methods=['POST'])
@token_required
def admin_create_student(current_user):
    from werkzeug.security import generate_password_hash
    if current_user['role'] != 'admin': return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    new_user_id = str(uuid.uuid4())
    new_student_id = str(uuid.uuid4())
    
    try:
        # 1. Create Student
        new_student = Student(
            student_id=new_student_id,
            name=data['username'],
            email=""
        )
        db.session.add(new_student)
        
        # 2. Create User
        new_user = User(
            user_id=new_user_id,
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='student',
            student_id=new_student_id
        )
        db.session.add(new_user)
        
        db.session.commit()
        return jsonify({'message': 'Student created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# --- ML & Simulation ---
def calculate_readiness(student):
    # Rule Based Fallback
    score = 0
    details = []
    
    cgpa = student.academic_details.get('cgpa', 0)
    if cgpa >= 8: score += 30
    elif cgpa >= 7: score += 20
    
    if len(student.skills) >= 5: score += 20
    
    lc = student.coding_habits.get('leetcode_problems', 0)
    if lc > 100: score += 30
    
    risk = 'Low' if score > 70 else 'Medium' if score > 40 else 'High'
    return {'score': score, 'details': details, 'risk_level': risk}

@app.route('/api/predict', methods=['POST'])
@token_required
def predict(current_user):
    try:
        data = request.json
        # Convert dict to object for ease of use
        student = Student.from_dict(data)
        
        prob, msg = predictor.predict_placement_probability(student)
        readiness = calculate_readiness(student)
        
        return jsonify({
            "placement_probability": prob,
            "readiness_score": readiness['score'],
            "risk_level": readiness['risk_level'],
            "ml_message": msg
        })
    except Exception as e:
        print(f"Predict Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/simulate', methods=['POST'])
@token_required
def simulate(current_user):
    # Simulation uses the same logic, just separate endpoint for clarity
    try:
        data = request.json
        student = Student.from_dict(data)
        prob, msg = predictor.predict_placement_probability(student)
        
        # Calculate improvements based on specific changes (simple logic)
        improvements = []
        if len(student.skills) > 5: improvements.append("Adding skills increased versatility score.")
        if student.coding_habits.get('leetcode_problems', 0) > 100: improvements.append("High problem count improved technical score.")
        
        return jsonify({
            "simulated_probability": prob,
            "improvements": improvements
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Practice Hub Sync ---
@app.route('/api/student/sync-coding-stats', methods=['POST'])
@token_required
def sync_coding_stats(current_user):
    try:
        data = request.json
        student_id = data.get('student_id')
        
        student = Student.query.filter_by(student_id=student_id).first()
        if not student: return jsonify({'message': 'Student not found'}), 404
        
        # 1. Fetch
        lc_user = student.leetcode_username
        hr_user = student.hackerrank_username
        
        reports = {}
        # Important: For JSON updates in SQLAlchemy, we often need to clone/copy if partial updates
        habits = dict(student.coding_habits) if student.coding_habits else {}

        if lc_user:
            s = fetch_leetcode_stats(lc_user)
            if s:
                reports['leetcode'] = s
                habits.update({
                    'leetcode_problems': s['total_solved'],
                    'leetcode_easy': s['easy_solved'],
                    'leetcode_medium': s['medium_solved'],
                    'leetcode_hard': s['hard_solved']
                })

        if hr_user:
            s = fetch_hackerrank_stats(hr_user)
            if s:
                reports['hackerrank'] = s
                habits.update({
                    'hackerrank_problems': s['total_solved'],
                    'hackerrank_badges': s['badges_count']
                })
        
        # Assign back to trigger update
        student.coding_habits = habits
        
        # 2. History
        history = list(student.coding_history) if student.coding_history else []
        history.append({
            'date': datetime.datetime.utcnow().strftime('%Y-%m-%d'),
            'stats': reports
        })
        student.coding_history = history
        
        # 3. Analyze
        analysis = analyze_progress(history, reports)
        recommendations = generate_recommendations(reports, analysis)
        
        # 4. Save
        db.session.commit()
        
        return jsonify({
            'message': 'Sync complete',
            'stats_summary': {'leetcode': {'new': reports.get('leetcode', {}).get('total_solved', 0), 'old': 0}}, 
            'analysis': analysis,
            'recommendations': recommendations
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Sync Crash: {e}")
        return jsonify({'message': f"Sync Failed: {str(e)}"}), 500

@app.route('/api/practice/daily', methods=['GET'])
def daily_question():
    return jsonify(get_daily_question())

# --- Frontend ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    print("================================================================")
    print("   STUDENT DIGITAL TWIN - BACKEND STARTED SUCCESSFULLY")
    print("   VERSION ID: CHECK-123-FIXED")
    print("   LISTENING ON PORT 5000")
    print("   READY FOR FRONTEND CONNECTIONS")
    print("================================================================")
    app.run(debug=True, port=5000, host='0.0.0.0')


