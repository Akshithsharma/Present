import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Mock Data for Training
data = [
    {'cgpa': 9.5, 'backlogs': 0, 'skill_count': 10, 'project_count': 5, 'leetcode_problems': 500, 'placed': 1},
    {'cgpa': 6.0, 'backlogs': 2, 'skill_count': 2, 'project_count': 0, 'leetcode_problems': 10, 'placed': 0},
    {'cgpa': 8.0, 'backlogs': 0, 'skill_count': 5, 'project_count': 2, 'leetcode_problems': 100, 'placed': 1},
    {'cgpa': 7.5, 'backlogs': 0, 'skill_count': 4, 'project_count': 1, 'leetcode_problems': 50, 'placed': 0},
    {'cgpa': 8.5, 'backlogs': 0, 'skill_count': 6, 'project_count': 3, 'leetcode_problems': 150, 'placed': 1},
    {'cgpa': 5.5, 'backlogs': 3, 'skill_count': 1, 'project_count': 0, 'leetcode_problems': 0, 'placed': 0},
    # Add some middle cases
    {'cgpa': 7.0, 'backlogs': 1, 'skill_count': 3, 'project_count': 1, 'leetcode_problems': 30, 'placed': 0},
    {'cgpa': 7.2, 'backlogs': 0, 'skill_count': 4, 'project_count': 2, 'leetcode_problems': 80, 'placed': 1},
]

df = pd.DataFrame(data)

X = df.drop('placed', axis=1)
y = df['placed']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, 'career_model.pkl')
print("Model trained and saved as career_model.pkl")
