import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './TestSummary.css';
import { IonIcon } from '@ionic/react';
import { 
    checkmarkCircle, 
    trophyOutline, 
    briefcaseOutline, 
    arrowForward,
    statsChartOutline,
    ribbonOutline,
    closeCircle,
    bulbOutline,
    chevronDownOutline,
    chevronUpOutline
} from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Reuse the FormattedText component
const FormattedText = ({ content }) => (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            code({node, inline, className, children, ...props}) {
                return !inline ? (
                    <div className="code-block-wrapper"><code {...props}>{children}</code></div>
                ) : (
                    <code className="inline-code" {...props}>{children}</code>
                )
            }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
);

function TestSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { 
        skill = "Python", 
        final_score = 0, 
        questions_attempted = 10,
        history = []
    } = location.state || {};

    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    // State for individual AI explanations
    const [aiExplanations, setAiExplanations] = useState({});
    const [explainingId, setExplainingId] = useState(null);

    const accuracy = history.length > 0 
        ? Math.round((history.filter(h => h.user_answer === h.correct_answer).length / history.length) * 100) 
        : 0;

    const getJobTier = (score) => {
        if (score >= 800) return { title: "Principal / Architect", color: "#8e44ad", width: "100%" };
        if (score >= 600) return { title: "Senior Developer", color: "#27ae60", width: "75%" };
        if (score >= 300) return { title: "Junior Developer", color: "#f39c12", width: "50%" };
        return { title: "Intern / Trainee", color: "#95a5a6", width: "25%" };
    };

    const tier = getJobTier(final_score);
    const scorePercent = Math.min(100, (final_score / 1000) * 100);

    // Fetch Recommendations
    useEffect(() => {
        async function fetchRecommendations() {
            if (!skill) return;
            setLoadingRecs(true);
            try {
                const { data: skillData } = await supabase.from('skills').select('id').ilike('name', skill).single();
                if (!skillData) throw new Error("Skill not found");

                const { data: recs } = await supabase
                    .from('skill_pairs')
                    .select(`frequency, score_ratio, skill_b:skills!skill_pairs_skill_b_fkey (name)`)
                    .eq('skill_a', skillData.id)
                    .order('score_ratio', { ascending: false })
                    .limit(3);

                setRecommendations(recs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingRecs(false);
            }
        }
        fetchRecommendations();
    }, [skill]);

    // Handle "Ask AI"
    const handleExplainMistake = async (qItem) => {
        setExplainingId(qItem.question_id);
        try {
            const response = await fetch('http://127.0.0.1:8000/explain_mistake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_title: qItem.question_title,
                    user_answer: qItem.user_answer,
                    correct_answer: qItem.correct_answer,
                    correct_option_text: qItem.options[qItem.correct_answer],
                    user_option_text: qItem.options[qItem.user_answer] || "Skipped"
                })
            });
            const data = await response.json();
            setAiExplanations(prev => ({ ...prev, [qItem.question_id]: data.explanation }));
        } catch (err) {
            alert("Failed to get AI explanation.");
        } finally {
            setExplainingId(null);
        }
    };

    return (
        <div className="summary-container">
            <div className="theme-toggle-wrapper"><ThemeToggle /></div>

            <div className="summary-box">
                {/* HEADER */}
                <div className="summary-header">
                    <div className="score-circle-container">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${scorePercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="score-text">
                            <span className="score-number">{Math.round(final_score)}</span>
                            <span className="score-label">SkillScore</span>
                        </div>
                    </div>
                    <div className="header-text">
                        <h1>Assessment Complete!</h1>
                        <p>You have tested your proficiency in <strong>{skill}</strong>.</p>
                        <div className="badges">
                            <span className="badge"><IonIcon icon={checkmarkCircle} /> {accuracy}% Accuracy</span>
                            <span className="badge"><IonIcon icon={trophyOutline} /> {questions_attempted} Questions</span>
                        </div>
                    </div>
                </div>

                {/* ANALYTICS GRID */}
                <div className="analytics-grid">
                    <div className="analytics-card market-fit">
                        <div className="card-header"><IonIcon icon={briefcaseOutline} className="card-icon"/><h3>Industry Fit</h3></div>
                        <div className="tier-display"><h2 style={{color: tier.color}}>{tier.title}</h2></div>
                        <div className="market-meter">
                            <div className="meter-track">
                                <div className="meter-fill" style={{width: `${scorePercent}%`, backgroundColor: tier.color}}></div>
                                <div className="meter-marker" style={{left: '30%'}}></div>
                                <div className="meter-marker" style={{left: '60%'}}></div>
                                <div className="meter-marker" style={{left: '80%'}}></div>
                            </div>
                            <div className="meter-labels"><span>Intern</span><span>Junior</span><span>Senior</span><span>Principal</span></div>
                        </div>
                    </div>

                    <div className="analytics-card recommendations">
                        <div className="card-header"><IonIcon icon={statsChartOutline} className="card-icon"/><h3>Recommended Path</h3></div>
                        <div className="rec-list">
                            {loadingRecs ? <div className="rec-loading">Analyzing Graph...</div> : recommendations.map((rec, i) => (
                                <div key={i} className="rec-item">
                                    <div className="rec-info">
                                        <span className="rec-name">{rec.skill_b.name}</span>
                                        <span className="rec-match"><IonIcon icon={ribbonOutline}/> {Math.round(rec.score_ratio * 100)}% Match</span>
                                    </div>
                                    <button className="rec-btn" onClick={() => navigate('/dashboard')}><IonIcon icon={arrowForward}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- 3. DETAILED ANALYSIS SECTION --- */}
                <div className="analysis-section">
                    <button className="toggle-analysis-btn" onClick={() => setShowAnalysis(!showAnalysis)}>
                        {showAnalysis ? "Hide Detailed Analysis" : "View Detailed Analysis"}
                        <IonIcon icon={showAnalysis ? chevronUpOutline : chevronDownOutline} />
                    </button>

                    {showAnalysis && (
                        <div className="questions-review-list">
                            {history.map((q, index) => {
                                const isCorrect = q.user_answer === q.correct_answer;
                                return (
                                    <div key={index} className={`review-card ${isCorrect ? 'correct' : 'wrong'}`}>
                                        <div className="review-header">
                                            <span className="q-number">Q{index + 1}</span>
                                            <span className={`status-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                                                <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} />
                                                {isCorrect ? "Correct" : "Incorrect"}
                                            </span>
                                        </div>
                                        
                                        <div className="review-body">
                                            <FormattedText content={q.question_title} />
                                        </div>

                                        <div className="options-review">
                                            <div className={`review-option ${isCorrect ? 'user-correct' : 'user-wrong'}`}>
                                                <strong>Your Answer:</strong> 
                                                <FormattedText content={q.options[q.user_answer] || "Skipped"} />
                                            </div>
                                            {!isCorrect && (
                                                <div className="review-option actual-correct">
                                                    <strong>Correct Answer:</strong> 
                                                    <FormattedText content={q.options[q.correct_answer]} />
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Explanation Area */}
                                        <div className="ai-explanation-box">
                                            {/* Pre-generated generic explanation (if available) */}
                                            {q.explanation && q.explanation !== "No explanation available." && (
                                                 <div className="generic-expl">
                                                    <IonIcon icon={bulbOutline} /> 
                                                    <span>{q.explanation}</span>
                                                 </div>
                                            )}

                                            {/* Button to ask AI for wrong answers */}
                                            {!isCorrect && !aiExplanations[q.question_id] && (
                                                <button 
                                                    className="ask-ai-btn" 
                                                    onClick={() => handleExplainMistake(q)}
                                                    disabled={explainingId === q.question_id}
                                                >
                                                    {explainingId === q.question_id ? "Thinking..." : "Why was I wrong? (Ask AI)"}
                                                </button>
                                            )}

                                            {/* The AI Response */}
                                            {aiExplanations[q.question_id] && (
                                                <div className="ai-response">
                                                    <strong>AI Feedback:</strong>
                                                    <p>{aiExplanations[q.question_id]}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="summary-footer">
                    <Link to="/dashboard" className="primary-btn">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );
}

export default TestSummary;