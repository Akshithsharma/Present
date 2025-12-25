def calculate_readiness_score(student):
    score = 0
    explanations = []

    # 1. Academic Performance (Max 30)
    cgpa = student.academic_details.get('cgpa', 0)
    backlogs = student.academic_details.get('backlogs', 0)
    
    if cgpa >= 9.0:
        score += 30
        explanations.append("Excellent academic performance (CGPA > 9.0).")
    elif cgpa >= 8.0:
        score += 25
        explanations.append("Good academic performance (CGPA > 8.0).")
    elif cgpa >= 7.0:
        score += 20
        explanations.append("Average academic performance (CGPA > 7.0).")
    else:
        score += 10
        explanations.append("Academic performance needs improvement.")

    if backlogs > 0:
        score -= min(backlogs * 5, 15)
        explanations.append(f"Penalty for {backlogs} active backlogs.")

    # 2. Skills (Max 30)
    skill_count = len(student.skills)
    if skill_count >= 5:
        score += 30
        explanations.append("Strong skill set detected.")
    elif skill_count >= 3:
        score += 20
        explanations.append("Decent skill set, but more specialization recommended.")
    else:
        score += 10
        explanations.append("Few skills listed. Recommend learning more technologies.")

    # 3. Coding Habits (Max 20)
    leetcode = student.coding_habits.get('leetcode_problems', 0)
    if leetcode > 100:
        score += 20
        explanations.append("Excellent coding practice (>100 problems).")
    elif leetcode > 50:
        score += 15
        explanations.append("Good coding practice (>50 problems).")
    elif leetcode > 10:
        score += 5
        explanations.append("Started coding practice, but consistency is key.")
    else:
        explanations.append("Minimal coding practice detected. Solve more problems!")

    # 4. Projects (Max 20)
    project_count = len(student.projects)
    if project_count >= 3:
        score += 20
        explanations.append("Strong project portfolio.")
    elif project_count >= 1:
        score += 10
        explanations.append("Has built projects, but more complex ones are better.")
    else:
        explanations.append("No projects listed. Build something!")

    score = max(0, min(100, score))

    return {
        "score": score,
        "details": explanations,
        "risk_level": "Low" if score > 75 else "Medium" if score > 50 else "High"
    }
