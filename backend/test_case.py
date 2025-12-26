from integrations import fetch_leetcode_stats

user = "P_A_R_L_Sharma"
print(f"Testing: {user}")
res = fetch_leetcode_stats(user)
print(f"Result: {res}")
