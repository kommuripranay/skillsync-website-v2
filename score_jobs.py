import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. SETUP
load_dotenv()
url = os.getenv("SUPABASE_URL")
# CRITICAL: Use SERVICE_ROLE key to bypass RLS and write to all rows
key = os.getenv("SUPABASE_KEY") 

if not url or not key:
    raise ValueError("Missing Supabase credentials in .env")

supabase: Client = create_client(url, key)

# --- 2. MARKET RESEARCH DATA ---

# Tier 1: FAANG, High Frequency Trading, Unicorns, Major Tech
TIER_1_COMPANIES = [
    "google", "amazon", "microsoft", "apple", "netflix", "meta", "facebook",
    "uber", "airbnb", "stripe", "coinbase", "databricks", "snowflake", 
    "salesforce", "adobe", "oracle", "cisco", "nvidia", "intel", "amd",
    "goldman sachs", "jpmorgan", "morgan stanley", "two sigma", "citadel",
    "hewlett packard", "hpe", "dell", "ibm", "accenture", "deloitte"
]

# High Value Skills (High Demand / Lower Supply / High Complexity)
SKILL_WEIGHTS = {
    # AI/ML/Data - Worth 25 pts
    "tensorflow": 25, "pytorch": 25, "machine learning": 25, "deep learning": 25,
    "nlp": 25, "computer vision": 25, "llm": 28, "generative ai": 28,
    "spark": 22, "hadoop": 20, "kafka": 22, "airflow": 20,
    
    # Cloud/DevOps - Worth 22 pts
    "kubernetes": 25, "docker": 15, "aws": 18, "azure": 18, "gcp": 18,
    "terraform": 22, "ansible": 18, "jenkins": 15, "ci/cd": 15,
    
    # Backend/Systems - Worth 18 pts
    "rust": 25, "golang": 20, "go": 20, "c++": 20, "java": 15, "c#": 15,
    "microservices": 20, "distributed systems": 25, "system design": 25,
    "graphql": 18, "redis": 15, "postgres": 15, "postgresql": 15,
    
    # Frontend - Worth 12 pts
    "react": 12, "angular": 12, "vue": 12, "typescript": 14, "next.js": 14,
    "redux": 10, "javascript": 10, "html": 5, "css": 5,
    
    # General - Worth 8 pts
    "python": 12, "agile": 5, "scrum": 5, "communication": 5, "git": 8
}

# Role Seniority Baseline
ROLE_BASE_SCORES = {
    "intern": 150,
    "trainee": 180,
    "junior": 250,
    "fresher": 220,
    "associate": 350,
    "senior": 650,
    "sr": 650,
    "lead": 750,
    "manager": 780,
    "staff": 820,
    "principal": 880,
    "architect": 920,
    "head": 950,
    "director": 980
}

# --- 3. THE SCORING ENGINE ---

def calculate_granular_score(job):
    score = 0
    
    # A. BASELINE
    base_score = 450 
    
    # --- SAFETY FIX: Handle None values safely ---
    # Use (value or "") to ensure it's always a string, even if DB has NULL
    title = (job.get('title') or "").lower()
    company = (job.get('company') or "").lower()
    # Use (value or []) to ensure it's always a list
    skills = job.get('skills_array') or []
    
    # B. ROLE HIERARCHY ANALYSIS
    role_matched = False
    for keyword, value in ROLE_BASE_SCORES.items():
        if keyword in title:
            base_score = value
            role_matched = True
            # We don't break here, we let it find the "highest" match if multiple exist
            # (e.g. "Senior Principal" might trigger both, we take the last one or rely on order)
    
    if not role_matched and "analyst" in title:
        base_score = 400

    score += base_score

    # C. COMPANY PRESTIGE
    for tech_giant in TIER_1_COMPANIES:
        if tech_giant in company:
            score += 150 
            break

    # D. SKILL STACK VALUATION
    skill_points = 0
    for skill in skills:
        if not skill: continue # Skip empty/null entries inside array
        
        s_clean = skill.lower().strip()
        if s_clean in SKILL_WEIGHTS:
            skill_points += SKILL_WEIGHTS[s_clean]
        else:
            # Default points for unknown skills
            skill_points += 8 
    
    # Cap skill points so huge lists don't break the scale
    skill_points = min(300, skill_points)
    score += skill_points

    # E. EDUCATION BONUS
    pg_req = job.get('education_PG') or ""
    if pg_req and 'any postgraduate' not in pg_req.lower() and 'not required' not in pg_req.lower():
         score += 43 

    # F. CLAMPING (Ensure 0-1000)
    final_score = int(min(1000, max(0, score)))
    
    return final_score

# --- 4. EXECUTION ---

def run_evaluation():
    print("Fetching jobs from Supabase...")
    
    # Fetch UP TO 10,000 jobs (Supabase defaults to 1000 if you don't set limit)
    response = supabase.table('jobs').select('*').limit(10000).execute()
    jobs = response.data
    
    print(f"Analyzing {len(jobs)} jobs...")
    
    updates = []
    
    for job in jobs:
        precise_score = calculate_granular_score(job)
        
        updates.append({
            "job_id": job['job_id'],
            "target_score": precise_score
        })
        
    print(f"Prepared scores for {len(updates)} jobs. Starting batch update...")

    # Write to DB in chunks of 100 to avoid timeouts
    chunk_size = 100
    for i in range(0, len(updates), chunk_size):
        chunk = updates[i:i + chunk_size]
        try:
            # Upsert updates existing rows based on Primary Key (job_id)
            supabase.table('jobs').upsert(chunk).execute()
            print(f"Updated records {i} to {i + len(chunk)}")
        except Exception as e:
            print(f"Error on chunk starting at {i}: {e}")

if __name__ == "__main__":
    run_evaluation()