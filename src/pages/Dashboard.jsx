import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IonIcon } from '@ionic/react';
import { 
  addOutline, 
  arrowForwardOutline,
  chevronForwardOutline,
  briefcaseOutline,
  compassOutline, // <--- NEW ICON
  timeOutline     // <--- NEW ICON
} from 'ionicons/icons';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trackedSkills, setTrackedSkills] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [avgScore, setAvgScore] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      
      try {
        const { data: skillsData } = await supabase
          .from('user_tracked_skills')
          .select(`skill_id, skills ( id, name )`)
          .eq('user_id', user.id);
        
        setTrackedSkills(skillsData || []);

        const { data: testData } = await supabase
            .from('test_results')
            .select('id, score, created_at, skills(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }); 

        if (testData && testData.length > 0) {
            setRecentTests(testData.slice(0, 5));
            setTotalTests(testData.length);
            const avg = testData.reduce((acc, curr) => acc + curr.score, 0) / testData.length;
            setAvgScore(Math.round(avg));
        }

      } catch (error) {
        console.error('Error loading dashboard:', error.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const getScoreClass = (score) => {
      if (score >= 800) return 'score-high';
      if (score >= 600) return 'score-mid';
      return 'score-low';
  };

  const getPosition = (score) => Math.min(100, Math.max(0, (score / 1000) * 100));

  if (loading) return <div className="dashboard-container" style={{paddingTop:'4rem', textAlign:'center'}}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <p>Your market value based on {totalTests} assessments.</p>
      </div>

      {/* --- MARKET DENSITY (Your Standing) --- */}
      <div className="market-density-section">
        {totalTests === 0 ? (
            <div className="empty-density-state">
                <IonIcon icon={briefcaseOutline} className="empty-icon"/>
                <h3>Where do you stand?</h3>
                <p>Take your first test to see your position in the global talent pool.</p>
                <Link to="/manage-skills" className="hero-cta">Start Assessment <IonIcon icon={arrowForwardOutline}/></Link>
            </div>
        ) : (
            <div className="density-chart-container">
                <div className="density-header">
                    <div className="density-title">
                        <h3>Industry Standing</h3>
                        <p>Score vs. Hiring Demand Density</p>
                    </div>
                    <div className="current-score-badge">
                        <span className="label">Your Avg</span>
                        <span className="value">{avgScore}</span>
                    </div>
                </div>

                <div className="chart-wrapper">
                    <svg viewBox="0 0 1000 200" className="density-curve" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <path 
                            d="M0,200 C200,200 300,50 500,20 C700,50 800,200 1000,200" 
                            fill="url(#curveGradient)" stroke="var(--accent-color)" strokeWidth="2"
                        />
                    </svg>
                    <div className="axis-labels">
                        <span style={{left: '25%'}}>Junior</span>
                        <span style={{left: '50%'}}>Mid-Level</span>
                        <span style={{left: '75%'}}>Senior</span>
                        <span style={{left: '90%'}}>Principal</span>
                    </div>
                    <div className="user-position-marker" style={{ left: `${getPosition(avgScore)}%` }}>
                        <div className="marker-line"></div>
                        <div className="marker-dot pulse"></div>
                        <div className="marker-tooltip">You</div>
                    </div>
                    <div className="market-marker" style={{left: '30%'}} title="Startups / Entry"><div className="market-dot"></div></div>
                    <div className="market-marker" style={{left: '55%'}} title="Corporate / Mid"><div className="market-dot"></div></div>
                    <div className="market-marker" style={{left: '85%'}} title="Top Tech / Expert"><div className="market-dot"></div></div>
                </div>
            </div>
        )}
      </div>

      {/* --- NEW: CAREER TOOLS SECTION --- */}
      {/* This connects to the CareerPath.jsx you just built */}
      <div className="career-tools-section" style={{marginBottom: '3rem'}}>
        <div className="section-header"><h2>Career Tools</h2></div>
        <div className="tools-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
            
            {/* 1. Career Navigator Card */}
            <div className="tool-card" onClick={() => navigate('/career-path')} style={{
                background: 'var(--navbar-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s'
            }}>
                <div className="tool-icon" style={{
                    fontSize: '2rem', color: '#fff', background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    padding: '12px', borderRadius: '12px', display: 'flex'
                }}>
                    <IonIcon icon={compassOutline} />
                </div>
                <div className="tool-info">
                    <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-color)'}}>Career Navigator</h3>
                    <p style={{margin: 0, color: 'var(--text-light)', fontSize: '0.9rem'}}>Set a target role (e.g. Data Scientist) and see your skill gaps.</p>
                </div>
                <IonIcon icon={chevronForwardOutline} style={{marginLeft: 'auto', color: 'var(--text-light)'}}/>
            </div>

            {/* 2. Full History Card (Optional alternate link) */}
             <div className="tool-card" onClick={() => navigate('/test/history')} style={{
                background: 'var(--navbar-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s'
            }}>
                <div className="tool-icon" style={{
                    fontSize: '2rem', color: '#fff', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    padding: '12px', borderRadius: '12px', display: 'flex'
                }}>
                    <IonIcon icon={timeOutline} />
                </div>
                <div className="tool-info">
                    <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-color)'}}>Test History</h3>
                    <p style={{margin: 0, color: 'var(--text-light)', fontSize: '0.9rem'}}>View detailed analysis for all your past assessments.</p>
                </div>
                <IonIcon icon={chevronForwardOutline} style={{marginLeft: 'auto', color: 'var(--text-light)'}}/>
            </div>

        </div>
      </div>

      {/* --- MY SKILLS --- */}
      <div className="section-header">
        <h2>My Skills</h2>
        <Link to="/manage-skills" className="add-skill-link"><IonIcon icon={addOutline} /> Manage Skills</Link>
      </div>

      {trackedSkills.length === 0 ? (
        <div className="empty-dashboard">
          <p>You aren't tracking any skills yet.</p>
          <Link to="/manage-skills" className="add-skill-button">Add a Skill</Link>
        </div>
      ) : (
        <div className="skill-test-grid">
            {trackedSkills.map((item) => {
              const skill = item.skills;
              if (!skill) return null;
              return (
                <div key={skill.id} className="skill-card">
                  <div className="skill-card-content">
                    <h3 className="skill-card-name">{skill.name}</h3>
                    <Link to={`/test/instructions/${skill.id}`} className="skill-test-button">Attempt Test</Link>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* --- RECENT ACTIVITY --- */}
      {totalTests > 0 && (
          <div className="history-section" style={{marginTop: '3rem'}}>
            <div className="section-header">
                <h2>Recent Activity</h2>
                {/* NEW LINK TO FULL HISTORY */}
                <Link to="/test/history" style={{color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'}}>
                    View All
                </Link>
            </div>
            <div className="history-table-wrapper" style={{
                background: 'var(--navbar-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden'
            }}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{textAlign: 'left', background: 'rgba(0,0,0,0.02)'}}>
                            <th style={{padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.85rem'}}>Skill</th>
                            <th style={{padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.85rem'}}>Score</th>
                            <th style={{padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.85rem'}}>Date</th>
                            <th style={{padding: '1rem', borderBottom: '1px solid var(--border-color)'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTests.map((result) => (
                            <tr key={result.id} className="history-row" onClick={() => navigate(`/test/result/${result.id}`)} style={{cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}>
                                <td style={{padding: '1rem', color: 'var(--text-color)', fontWeight: '500'}}>{result.skills?.name || 'Unknown'}</td>
                                <td style={{padding: '1rem'}}>
                                    <span className={`score-badge ${getScoreClass(result.score)}`}>{result.score}</span>
                                </td>
                                <td style={{padding: '1rem', color: 'var(--text-color)'}}>{new Date(result.created_at).toLocaleDateString()}</td>
                                <td style={{padding: '1rem', textAlign: 'right'}}><IonIcon icon={chevronForwardOutline} style={{color: 'var(--text-light)'}}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}
    </div>
  );
}

export default Dashboard;