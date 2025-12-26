import joblib
import pandas as pd
import os

class CareerPredictor:
    def __init__(self, model_path='career_model.pkl'):
        self.model_path = model_path
        self.model = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        # 1. Try Loading
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                # 2. Verify Compatibility
                self._verify_model()
                print("Model loaded successfully.")
                return
        except Exception as e:
            print(f"Model Load Failed: {e}")

        # 3. Fallback: Train Fresh Model
        print("Training fresh model for compatibility...")
        self._train_fresh_model()

    def _verify_model(self):
        # Dummy prediction to check if valid
        test_features = pd.DataFrame([{
            'cgpa': 7.0, 'backlogs': 0, 'skill_count': 3, 
            'project_count': 1, 'leetcode_problems': 30
        }])
        self.model.predict_proba(test_features)

    def _train_fresh_model(self):
        from sklearn.ensemble import RandomForestClassifier
        # Mock Data (Same as train_model.py)
        data = [
            {'cgpa': 9.5, 'backlogs': 0, 'skill_count': 10, 'project_count': 5, 'leetcode_problems': 500, 'placed': 1},
            {'cgpa': 6.0, 'backlogs': 2, 'skill_count': 2, 'project_count': 0, 'leetcode_problems': 10, 'placed': 0},
            {'cgpa': 8.0, 'backlogs': 0, 'skill_count': 5, 'project_count': 2, 'leetcode_problems': 100, 'placed': 1},
            {'cgpa': 7.5, 'backlogs': 0, 'skill_count': 4, 'project_count': 1, 'leetcode_problems': 50, 'placed': 0},
            {'cgpa': 8.5, 'backlogs': 0, 'skill_count': 6, 'project_count': 3, 'leetcode_problems': 150, 'placed': 1},
            {'cgpa': 5.5, 'backlogs': 3, 'skill_count': 1, 'project_count': 0, 'leetcode_problems': 0, 'placed': 0},
            {'cgpa': 7.0, 'backlogs': 1, 'skill_count': 3, 'project_count': 1, 'leetcode_problems': 30, 'placed': 0},
            {'cgpa': 7.2, 'backlogs': 0, 'skill_count': 4, 'project_count': 2, 'leetcode_problems': 80, 'placed': 1},
        ]
        df = pd.DataFrame(data)
        X = df.drop('placed', axis=1)
        y = df['placed']

        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        print("Fresh model trained in memory.")

    def predict_placement_probability(self, student):
        if not self.model:
            # Should not happen with auto-train, but safe fallback
            return 0.5, "System Error: Model missing"

        # Check if student is a dict or object
        if isinstance(student, dict):
            # Handle dict case (safeguard)
            features = pd.DataFrame([{
                'cgpa': student.get('academic_details', {}).get('cgpa', 0),
                'backlogs': student.get('academic_details', {}).get('backlogs', 0),
                'skill_count': len(student.get('skills', [])),
                'project_count': len(student.get('projects', [])),
                'leetcode_problems': student.get('coding_habits', {}).get('leetcode_problems', 0)
            }])
        else:
             # Handle Object case
             features = pd.DataFrame([{
                'cgpa': student.academic_details.get('cgpa', 0),
                'backlogs': student.academic_details.get('backlogs', 0),
                'skill_count': len(student.skills),
                'project_count': len(student.projects),
                'leetcode_problems': student.coding_habits.get('leetcode_problems', 0)
            }])

        try:
            prob = self.model.predict_proba(features)[0][1]
            return prob, "Success"
        except Exception as e:
            print(f"Model Prediction Error: {e}")
            return 0.0, f"Error: {str(e)}"
