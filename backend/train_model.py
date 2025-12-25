import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

def create_dummy_data(n_samples=1000):
    np.random.seed(42)
    cgpa = np.random.uniform(6.0, 10.0, n_samples)
    backlogs = np.random.choice([0, 1, 2], n_samples, p=[0.7, 0.2, 0.1])
    skill_count = np.random.randint(1, 10, n_samples)
    project_count = np.random.randint(0, 5, n_samples)
    leetcode_problems = np.random.randint(0, 300, n_samples)

    score = (cgpa * 10) - (backlogs * 5) + (skill_count * 2) + (project_count * 5) + (leetcode_problems * 0.1)
    threshold = np.percentile(score, 40)
    placed = (score > threshold).astype(int)

    df = pd.DataFrame({
        'cgpa': cgpa,
        'backlogs': backlogs,
        'skill_count': skill_count,
        'project_count': project_count,
        'leetcode_problems': leetcode_problems,
        'placed': placed
    })
    return df

def train_model():
    print("Generating dummy data...")
    df = create_dummy_data()
    X = df.drop('placed', axis=1)
    y = df['placed']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy:.2f}")

    joblib.dump(model, 'career_model.pkl')
    print("Model saved to career_model.pkl")

if __name__ == "__main__":
    train_model()
