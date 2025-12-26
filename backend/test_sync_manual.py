import sys
import os

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

try:
    from integrations import fetch_leetcode_stats, fetch_hackerrank_stats
    
    print("--- Testing LeetCode Sync ---")
    lc_user = "P_A_R_L_SHARMA"
    print(f"Fetching for: {lc_user}")
    stats = fetch_leetcode_stats(lc_user)
    print(f"Result: {stats}")
    
    print("\n--- Testing HackerRank Sync ---")
    hr_user = "akshithsharmapo1"
    print(f"Fetching for: {hr_user}")
    stats_hr = fetch_hackerrank_stats(hr_user)
    print(f"Result: {stats_hr}")
    
except ImportError as e:
    print(f"Import Error: {e}")
except Exception as e:
    print(f"Execution Error: {e}")
