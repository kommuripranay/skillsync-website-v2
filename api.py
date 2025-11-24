from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import re
import random

from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from supabase import create_client, Client

# --- SETUP ---
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not google_api_key or not supabase_url or not supabase_key:
    raise ValueError("Missing API Keys in .env")

app = FastAPI(title="Adaptive Skill Evaluation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(
    api_key=google_api_key,
    model="gemini-2.0-flash",
    temperature=0.8 
)

supabase: Client = create_client(supabase_url, supabase_key)

# --- MODELS ---
class StartTestRequest(BaseModel):
    user_id: str
    skill: str
    self_rating: int 

class AnswerRequest(BaseModel):
    user_id: str
    question_id: int 
    selected_option: str
    time_taken: float 
    previous_level: float
    correct_answer: str

class EndTestRequest(BaseModel):
    user_id: str
    skill: str

class ExplainRequest(BaseModel):
    question_title: str
    user_answer: str
    correct_answer: str
    correct_option_text: str
    user_option_text: str

# --- SESSION STORE ---
active_sessions = {}

# --- HELPERS ---
def clean_llm_json(llm_text: str) -> str:
    llm_text = re.sub(r'^```json\s*', '', llm_text.strip(), flags=re.MULTILINE)
    llm_text = re.sub(r'```$', '', llm_text.strip(), flags=re.MULTILINE)
    return llm_text

def normalize_difficulty(level: float) -> int:
    lvl = int(level)
    if lvl <= 20: return 20
    if lvl <= 40: return 40
    if lvl <= 60: return 60
    if lvl <= 80: return 80
    return 100

async def get_or_create_question(skill: str, raw_level: float, history: list):
    difficulty_bucket = normalize_difficulty(raw_level)
    
    seen_ids = set()
    if history:
        for item in history:
            if "question_id" in item:
                seen_ids.add(str(item["question_id"]))

    try:
        # DB CHECK
        response = supabase.table('question_bank')\
            .select('question_data')\
            .eq('skill_name', skill)\
            .eq('difficulty_level', difficulty_bucket)\
            .execute()
        
        existing_questions = [r['question_data'] for r in response.data]
        existing_titles = [q.get('question_title', '')[:100] for q in existing_questions]
        
        # PATH A: FETCH FROM DB (If deep enough)
        if len(existing_questions) >= 15: 
            candidates = []
            for q_data in existing_questions:
                q_id = str(q_data.get('question_id'))
                if q_id not in seen_ids:
                    candidates.append(q_data)
            
            if candidates:
                return random.choice(candidates)

        # PATH B: GENERATE NEW
        print(f"DEBUG: Generating FRESH question (Level {difficulty_bucket})...")

        for attempt in range(2):
            question_types = [
                "Conceptual Understanding",
                "Code Output Prediction",
                "Debugging",
                "Real-world Application",
                "Best Practices"
            ]
            selected_type = random.choice(question_types)
            
            negative_constraint = ""
            if existing_titles:
                sample = random.sample(existing_titles, min(3, len(existing_titles)))
                negative_constraint = f"DO NOT generate questions similar to: {json.dumps(sample)}"

            prompt = ChatPromptTemplate.from_template("""
            You are an expert technical interviewer.
            Target Skill: **{skill}**
            Target Level: **{level}/100**
            Question Style: **{q_type}**
            
            Instructions:
            1. Generate ONE multiple choice question.
            2. {exclusions}
            3. MANDATORY: If code is involved, wrap it in markdown code blocks inside 'question_title'.
            4. **Include a short 'explanation' field** (max 2 sentences) describing why the correct answer is right.
            5. Return ONLY JSON.

            JSON Structure:
            {{
                "question_id": {qid}, 
                "question_title": "Question... \\n\\n ```lang\\n code \\n```",
                "options": {{ "opt1": "...", "opt2": "...", "opt3": "...", "opt4": "..." }},
                "correct_answer": "optX",
                "explanation": "Brief explanation of why optX is correct.",
                "difficulty": {level}
            }}
            """)

            temp_qid = random.randint(100000, 999999) 
            
            formatted_prompt = prompt.format_messages(
                skill=skill,
                level=difficulty_bucket,
                q_type=selected_type,
                exclusions=negative_constraint,
                qid=temp_qid
            )
            
            ai_response = llm.invoke(formatted_prompt)
            cleaned_json = clean_llm_json(ai_response.content)
            question_data = json.loads(cleaned_json)
            question_data["difficulty"] = difficulty_bucket

            # Check Duplicates
            is_duplicate = False
            new_title_clean = question_data['question_title'].replace(' ', '').lower()
            for existing in existing_questions:
                existing_title_clean = existing.get('question_title', '').replace(' ', '').lower()
                if new_title_clean in existing_title_clean:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                try:
                    supabase.table('question_bank').insert({
                        "skill_name": skill,
                        "difficulty_level": difficulty_bucket,
                        "question_data": question_data
                    }).execute()
                except Exception:
                    pass
                return question_data
            
        return question_data # Fallback

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise e

# --- ENDPOINTS ---

@app.post("/start_test")
async def start_test(req: StartTestRequest):
    user_session = {
        "user_id": req.user_id,
        "skill": req.skill,
        "current_level": float(req.self_rating), 
        "questions_asked": 0,
        "correct_answers": 0,
        "history": [] 
    }
    active_sessions[req.user_id] = user_session

    try:
        question = await get_or_create_question(req.skill, req.self_rating, [])
        user_session["history"].append({
            "question_id": question["question_id"],
            "question_title": question["question_title"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
            "explanation": question.get("explanation", "No explanation available."), # Save explanation
            "user_answer": None,
            "difficulty": question["difficulty"]
        })
        user_session["last_question"] = question
        user_session["questions_asked"] += 1
        return question
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Start failed: {str(e)}")


@app.post("/next_question")
async def next_question(req: AnswerRequest):
    session = active_sessions.get(req.user_id)
    if not session:
        raise HTTPException(status_code=404, detail="No active test found.")

    for q in session["history"]:
        if str(q["question_id"]) == str(req.question_id):
            q["user_answer"] = req.selected_option
            break

    level = float(session["current_level"])
    time_factor = max(0.5, min(1.5, 30 / (req.time_taken + 1)))

    if req.selected_option == req.correct_answer:
        increase = 10.0 * time_factor
        new_level = min(100.0, level + increase)
        session["correct_answers"] += 1
    else:
        decrease = 5.0 / time_factor
        new_level = max(0.0, level - decrease)

    session["current_level"] = new_level

    try:
        question = await get_or_create_question(session["skill"], new_level, session["history"])
        session["history"].append({
            "question_id": question["question_id"],
            "question_title": question["question_title"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
            "explanation": question.get("explanation", "No explanation available."), # Save explanation
            "user_answer": None,
            "difficulty": question["difficulty"]
        })
        session["last_question"] = question
        session["questions_asked"] += 1
        return question
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Next question failed: {str(e)}")

@app.post("/end_test")
async def end_test(req: EndTestRequest):
    session = active_sessions.pop(req.user_id, None)
    if not session:
        raise HTTPException(status_code=404, detail="No active test found.")
    
    accuracy = (session["correct_answers"] / max(1, session["questions_asked"])) * 50
    difficulty_bonus = (session["current_level"] / 100) * 50
    final_score = min(100.0, accuracy + difficulty_bonus)

    return {
        "user_id": req.user_id,
        "skill": req.skill,
        "final_score": final_score,
        "questions_attempted": session["questions_asked"],
        "history": session["history"]
    }

# --- NEW: ON-DEMAND EXPLANATION ---
@app.post("/explain_mistake")
async def explain_mistake(req: ExplainRequest):
    """
    Generates a personalized explanation for why the user was wrong.
    """
    prompt = ChatPromptTemplate.from_template("""
    The user answered a technical interview question incorrectly.
    
    Question: {question}
    
    Correct Answer: {correct_text}
    User's Wrong Answer: {user_text}
    
    Task:
    Explain VERY BRIEFLY (max 2 sentences) why the user's answer is wrong and why the correct answer is the right choice.
    Be encouraging but precise.
    """)
    
    formatted_prompt = prompt.format_messages(
        question=req.question_title,
        correct_text=req.correct_option_text,
        user_text=req.user_option_text
    )
    
    response = llm.invoke(formatted_prompt)
    return {"explanation": response.content}