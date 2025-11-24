import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. SETUP
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY") # Must be Service Role Key

if not url or not key:
    raise ValueError("Missing credentials")

supabase: Client = create_client(url, key)

# 2. DEFINITIONS
CATEGORIES = {
    "Data Science": ["data scientist", "data analyst", "machine learning", "ai engineer", "computer vision", "nlp", "deep learning", "big data"],
    "Frontend": ["frontend", "front-end", "react", "angular", "vue", "web developer", "ui developer", "javascript developer", "html"],
    "Backend": ["backend", "back-end", "java developer", "python developer", "golang", "rust", "node", "ruby", "php", "django", "flask", "spring boot"],
    "Full Stack": ["full stack", "fullstack", "mern", "mean stack"],
    "Mobile": ["ios", "android", "flutter", "react native", "swift", "kotlin", "mobile app"],
    "DevOps": ["devops", "sre", "site reliability", "cloud engineer", "aws engineer", "azure", "kubernetes", "terraform", "ci/cd"],
    "Cybersecurity": ["security", "cyber", "penetration", "infosec"],
    "QA/Testing": ["qa ", "quality assurance", "test engineer", "automation tester", "selenium"]
}

def get_category(title):
    title_lower = title.lower()
    
    # Priority check (Full Stack overrides Front/Back usually)
    for keyword in CATEGORIES["Full Stack"]:
        if keyword in title_lower: return "Full Stack"
        
    for cat, keywords in CATEGORIES.items():
        if cat == "Full Stack": continue
        for keyword in keywords:
            if keyword in title_lower:
                return cat
                
    return "General Software Engineering" # Fallback

def run_categorization():
    print("Fetching jobs...")
    response = supabase.table('jobs').select('job_id, title').limit(10000).execute()
    jobs = response.data
    
    print(f"Categorizing {len(jobs)} jobs...")
    
    updates = []
    stats = {k: 0 for k in CATEGORIES.keys()}
    stats["General Software Engineering"] = 0
    
    for job in jobs:
        category = get_category(job['title'])
        stats[category] += 1
        
        updates.append({
            "job_id": job['job_id'],
            "role_category": category
        })
    
    # Print stats so you see the distribution
    print("\n--- Job Market Distribution ---")
    for cat, count in stats.items():
        print(f"{cat}: {count}")
    print("-------------------------------\n")

    print("Writing to DB...")
    chunk_size = 100
    for i in range(0, len(updates), chunk_size):
        chunk = updates[i:i + chunk_size]
        try:
            supabase.table('jobs').upsert(chunk).execute()
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run_categorization()