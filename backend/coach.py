
from datetime import datetime, timedelta

def analyze_progress(history, current_stats):
    """
    Analyzes coding history to calculate streaks and deltas.
    Returns dict with daily_delta, weekly_delta, current_streak.
    """
    if not current_stats:
        return {'daily_delta': 0, 'weekly_delta': 0, 'streak': 0}

    # HackerRank Stats
    hr_current = current_stats.get('hackerrank', {}).get('total_solved', 0)
    
    # Sort history by timestamp
    # History items: {'date': 'YYYY-MM-DD', 'stats': ..., 'timestamp': ...}
    sorted_hist = sorted(history, key=lambda x: x.get('timestamp', ''))
    
    # 1. Calculate Deltas
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    week_ago_str = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    daily_delta_lc = 0
    weekly_delta_lc = 0
    daily_delta_hr = 0
    weekly_delta_hr = 0
    
    last_day_entry = None
    week_ago_entry = None
    
    for entry in reversed(sorted_hist):
        entry_date = entry.get('date')
        if entry_date < today_str and not last_day_entry:
            last_day_entry = entry
        
        if entry_date <= week_ago_str and not week_ago_entry:
            week_ago_entry = entry
            
    if last_day_entry:
        past_lc = last_day_entry.get('stats', {}).get('leetcode', {}).get('total_solved', 0)
        past_hr = last_day_entry.get('stats', {}).get('hackerrank', {}).get('total_solved', 0)
        daily_delta_lc = max(0, lc_current - past_lc)
        daily_delta_hr = max(0, hr_current - past_hr)
    
    if week_ago_entry:
        past_lc = week_ago_entry.get('stats', {}).get('leetcode', {}).get('total_solved', 0)
        past_hr = week_ago_entry.get('stats', {}).get('hackerrank', {}).get('total_solved', 0)
        weekly_delta_lc = max(0, lc_current - past_lc)
        weekly_delta_hr = max(0, hr_current - past_hr)
    else:
        weekly_delta_lc = daily_delta_lc
        weekly_delta_hr = daily_delta_hr
        
    # 2. Streak Calculation (Consecutive days with at least 1 update or check)
    streak = 0
    active_days = set(entry.get('date') for entry in sorted_hist)
    if today_str in active_days: 
        current_check = datetime.utcnow()
    else:
        current_check = datetime.utcnow() - timedelta(days=1)
        
    while True:
        check_str = current_check.strftime('%Y-%m-%d')
        if check_str in active_days:
            streak += 1
            current_check -= timedelta(days=1)
        else:
             if check_str == today_str:
                 current_check -= timedelta(days=1)
                 continue
             break
             
    return {
        'daily_delta': daily_delta_lc + daily_delta_hr, # Combined activity
        'weekly_delta': weekly_delta_lc + weekly_delta_hr,
        'leetcode': {'daily': daily_delta_lc, 'weekly': weekly_delta_lc},
        'hackerrank': {'daily': daily_delta_hr, 'weekly': weekly_delta_hr},
        'streak': streak
    }

def generate_recommendations(stats, analysis):
    """
    Generates text recommendations based on stats and analysis.
    """
    recs = []
    
    lc = stats.get('leetcode', {})
    total_lc = lc.get('total_solved', 0)
    
    hr = stats.get('hackerrank', {})
    total_hr = hr.get('total_solved', 0)
    
    # Platform Balance
    if total_lc > 0 and total_hr == 0:
        recs.append("Don't forget HackerRank! It's great for fundamental algorithms.")
    elif total_hr > 0 and total_lc == 0:
        recs.append("Try LeetCode for more interview-style questions.")
        
    # Activity
    if analysis['daily_delta'] > 0:
        recs.append("Great consistency today!")
    else:
        recs.append("Solve one challenge on either platform to keep your streak!")
        
    if analysis['weekly_delta'] > 10:
         recs.append("Productive week! Make sure to review your solutions.")
         
    return recs
