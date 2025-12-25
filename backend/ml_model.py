import joblib
import pandas as pd
import os

class CareerPredictor:
    def __init__(self, model_path='career_model.pkl'):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            print("Model file not found. Please run train_model.py first.")
            self.model = None

    def predict_placement_probability(self, student):
        if not self.model:
            return 0.0, "Model not loaded"

        features = pd.DataFrame([{
            'cgpa': student.academic_details.get('cgpa', 0),
            'backlogs': student.academic_details.get('backlogs', 0),
            'skill_count': len(student.skills),
            'project_count': len(student.projects),
            'leetcode_problems': student.coding_habits.get('leetcode_problems', 0)
        }])

        prob = self.model.predict_proba(features)[0][1]
        return prob, "Success"
