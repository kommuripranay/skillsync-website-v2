import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './CareerPath.css';
import { IonIcon } from '@ionic/react';
import { 
    compassOutline, 
    checkmarkCircle, 
    closeCircle, 
    trendingUpOutline, 
    briefcaseOutline, 
    arrowForward,
    refreshOutline,
    ribbonOutline
} from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { Link } from 'react-router-dom';

const ROLE_CATEGORIES = [
    { id: 'Frontend', label: 'Frontend Developer', icon: '🎨' },
    { id: 'Backend', label: 'Backend Engineer', icon: '⚙️' },
    { id: 'Full Stack', label: 'Full Stack Developer', icon: '🚀' },
    { id: 'Data Science', label: 'Data Scientist', icon: '📊' },
    { id: 'DevOps', label: 'DevOps Engineer', icon: '☁️' },
    { id: 'Mobile', label: 'Mobile Developer', icon: '📱' },
    { id: 'Cybersecurity', label: 'Cybersecurity Analyst', icon: '🔒' },
    { id: 'QA/Testing', label: 'QA Engineer', icon: '🐞' }
];

function CareerPath() {
    const { user } = useAuth();
    const [targetRole, setTargetRole] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Analysis Data
    const [marketSkills, setMarketSkills] = useState([]); // Top 10 skills for this role
    const [userSkills, setUserSkills] = useState({}); // Skills user has tracked + scores
    const [readiness, setReadiness] = useState(0);

    // 1. Load User's Goal
    useEffect(() => {
        async function fetchGoal() {
            if (!user) return;
            try {
                // Get Goal
                const { data: goal } = await supabase
                    .from('user_career_goals')
                    .select('target_role')
                    .eq('user_id', user.id)
                    .single();

                if (goal) {
                    setTargetRole(goal.target_role);
                    await analyzePath(goal.target_role);
                }
            } catch (err) {
                console.error("Error fetching goal", err);
            } finally {
                setLoading(false);
            }
        }
        fetchGoal();
    }, [user]);

    // 2. The Heavy Analysis Logic
    const analyzePath = async (role) => {
        setLoading(true);
        try {
            // A. Get Market Data (RPC call)
            const { data: topSkills } = await supabase.rpc('get_category_skills', { 
                target_category: role 
            });

            // B. Get User's Verified Skills & Scores
            const { data: mySkills } = await supabase
                .from('test_results')
                .select('skill_id, score, skills(name)')
                .eq('user_id', user.id)
                // Get highest score per skill (simplified logic)
                .order('score', { ascending: false });

            // Transform user skills into a lookup map: { "Python": 750, "SQL": 400 }
            const skillMap = {};
            if (mySkills) {
                mySkills.forEach(record => {
                    const name = record.skills.name;
                    // Keep max score
                    if (!skillMap[name] || record.score > skillMap[name]) {
                        skillMap[name] = record.score;
                    }
                });
            }

            setMarketSkills(topSkills || []);
            setUserSkills(skillMap);

            // C. Calculate Readiness Score
            // Formula: (Matched Skills / Top 10) * Average Score Factor
            if (topSkills && topSkills.length > 0) {
                let matches = 0;
                let scoreSum = 0;
                
                topSkills.forEach(mSkill => {
                    // Check loosely by name
                    const userScore = skillMap[mSkill.skill_name] || 0;
                    if (userScore > 0) {
                        matches++;
                        scoreSum += Math.min(1000, userScore);
                    }
                });

                // Weight: 70% based on coverage, 30% based on competency
                const coveragePct = (matches / topSkills.length) * 100;
                const competencyPct = matches > 0 ? (scoreSum / matches) / 10 : 0;
                
                const finalReadiness = Math.round((coveragePct * 0.7) + (competencyPct * 0.3));
                setReadiness(finalReadiness);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Save Goal
    const handleSelectRole = async (role) => {
        setTargetRole(role);
        try {
            // Upsert goal
            await supabase.from('user_career_goals').upsert({
                user_id: user.id,
                target_role: role
            });
            analyzePath(role);
        } catch (err) {
            alert("Failed to save goal");
        }
    };

    const handleReset = async () => {
        setTargetRole(null);
        setReadiness(0);
        // Optional: Delete from DB or just let them overwrite
    };

    if (loading) return <div className="career-container loading">Analyzing Career Data...</div>;

    // --- VIEW A: ONBOARDING (Select Role) ---
    if (!targetRole) {
        return (
            <div className="career-container">
                <div className="theme-toggle-wrapper"><ThemeToggle /></div>
                <div className="onboarding-box">
                    <h1>Where do you want to go?</h1>
                    <p>Select your target career path. We will analyze the market to show you exactly what to learn.</p>
                    
                    <div className="role-grid">
                        {ROLE_CATEGORIES.map((role) => (
                            <div key={role.id} className="role-card" onClick={() => handleSelectRole(role.id)}>
                                <span className="role-icon">{role.icon}</span>
                                <h3>{role.label}</h3>
                                <IonIcon icon={arrowForward} className="role-arrow"/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW B: ANALYSIS DASHBOARD ---
    return (
        <div className="career-container">
            <div className="theme-toggle-wrapper"><ThemeToggle /></div>
            
            <div className="analysis-dashboard">
                <div className="analysis-header">
                    <div className="header-left">
                        <span className="sub-label">Target Career</span>
                        <h1>{targetRole}</h1>
                    </div>
                    <button className="reset-btn" onClick={handleReset}>
                        <IonIcon icon={refreshOutline}/> Change Path
                    </button>
                </div>

                {/* 1. READINESS METER */}
                <div className="readiness-section">
                    <div className="readiness-card">
                        <div className="readiness-info">
                            <h3>Role Readiness</h3>
                            <p>Based on verified skills vs. market demand</p>
                        </div>
                        <div className="readiness-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path 
                                    className="circle" 
                                    strokeDasharray={`${readiness}, 100`} 
                                    stroke={readiness > 70 ? '#27ae60' : readiness > 40 ? '#f39c12' : '#e74c3c'}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                            </svg>
                            <span className="readiness-text">{readiness}%</span>
                        </div>
                    </div>

                    <div className="insight-card">
                         <IonIcon icon={compassOutline} className="insight-icon"/>
                         <div>
                            <h3>Next Step</h3>
                            <p>
                                {readiness < 30 ? "Start with the basics. The most critical skill missing is key." : 
                                 readiness < 70 ? "You're building momentum. Focus on filling the gaps." :
                                 "You are job ready! Start applying to Senior roles."}
                            </p>
                         </div>
                    </div>
                </div>

                {/* 2. GAP ANALYSIS TABLE */}
                <div className="gap-analysis">
                    <h2>Market Skill Requirements</h2>
                    <p className="section-desc">Top 10 skills requested in <strong>{targetRole}</strong> job listings.</p>
                    
                    <div className="gap-grid">
                        {marketSkills.map((mSkill, index) => {
                            const userScore = userSkills[mSkill.skill_name];
                            const hasSkill = userScore !== undefined;
                            
                            return (
                                <div key={index} className={`gap-card ${hasSkill ? 'acquired' : 'missing'}`}>
                                    <div className="gap-header">
                                        <span className="skill-name">{mSkill.skill_name}</span>
                                        {hasSkill ? (
                                            <span className="score-badge">{userScore} pts</span>
                                        ) : (
                                            <span className="status-missing">Missing</span>
                                        )}
                                    </div>
                                    <div className="gap-footer">
                                        <div className="freq-bar-bg">
                                            <div className="freq-bar-fill" style={{width: `${(index < 3 ? 90 : 60 - (index*5))}%`}}></div>
                                        </div>
                                        {hasSkill ? (
                                            <IonIcon icon={checkmarkCircle} className="icon-check"/>
                                        ) : (
                                            <Link to={`/test/instructions/${mSkill.skill_id}`} className="test-link">
                                                Take Test
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CareerPath;