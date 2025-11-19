import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IonIcon } from '@ionic/react';
import { 
  trendingUpOutline, 
  ribbonOutline, 
  addOutline, 
  barChartOutline,
  arrowForwardOutline 
} from 'ionicons/icons';

function Dashboard() {
  const { user } = useAuth();
  
  const [trackedSkills, setTrackedSkills] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ totalTests: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      
      try {
        // 1. Fetch Tracked Skills
        const { data: skillsData } = await supabase
          .from('user_tracked_skills')
          .select(`skill_id, skills ( id, name )`)
          .eq('user_id', user.id);
        
        setTrackedSkills(skillsData || []);

        // 2. Fetch Test Results
        const { data: testData } = await supabase
            .from('test_results')
            .select('score, created_at, skills(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }); // Newest first

        if (testData && testData.length > 0) {
            const total = testData.length;
            const avg = testData.reduce((acc, curr) => acc + curr.score, 0) / total;
            
            setStats({
                totalTests: total,
                avgScore: Math.round(avg)
            });
            
            setRecentTests(testData.slice(0, 3)); // Top 3 for list

            // Prepare Chart Data (Take last 7, reverse to show chronological left-to-right)
            const dataForChart = testData.slice(0, 7).reverse();
            setChartData(dataForChart);
        }

      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back</h1>
        <p>Track your growth and assess your technical skills.</p>
      </div>

      {/* --- ANALYTICS SECTION --- */}
      <div className="analytics-section">
        {stats.totalTests === 0 ? (
            // STATE A: No Analytics Yet
            <div className="no-analytics-hero">
                <div className="hero-icon">
                    <IonIcon icon={barChartOutline} />
                </div>
                <h2>No Analytics to Show Yet</h2>
                <p>Take your first skill assessment to unlock performance insights and score tracking.</p>
                {trackedSkills.length > 0 ? (
                    <Link to={`/test/instructions/${trackedSkills[0].skills.id}`} className="hero-cta">
                        Take a Test <IonIcon icon={arrowForwardOutline} />
                    </Link>
                ) : (
                    <Link to="/manage-skills" className="hero-cta">
                        Add a Skill First <IonIcon icon={arrowForwardOutline} />
                    </Link>
                )}
            </div>
        ) : (
            // STATE B: Show Graph & Stats
            <div className="analytics-grid">
                {/* Left: The Graph */}
                <div className="chart-container">
                    <h3>Score Performance</h3>
                    <div className="simple-bar-chart">
                        {chartData.map((item, index) => (
                            <div key={index} className="bar-group">
                                <div 
                                    className="bar" 
                                    style={{ height: `${(item.score / 1000) * 100}%` }}
                                    title={`Score: ${item.score} - ${item.skills?.name}`}
                                >
                                    <span className="bar-tooltip">{item.score}</span>
                                </div>
                                <span className="bar-label">
                                    {new Date(item.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: The Stat Cards */}
                <div className="stats-column">
                    <div className="stat-card">
                        <div className="stat-icon"><IonIcon icon={ribbonOutline} /></div>
                        <div className="stat-info">
                            <h3>{stats.totalTests}</h3>
                            <span>Tests Taken</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><IonIcon icon={trendingUpOutline} /></div>
                        <div className="stat-info">
                            <h3>{stats.avgScore}</h3>
                            <span>Avg Score</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* --- MY SKILLS SECTION --- */}
      <div className="section-header">
        <h2>My Skills</h2>
        <Link to="/manage-skills" className="add-skill-link">
            <IonIcon icon={addOutline} /> Manage Skills
        </Link>
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
                    <Link
                      to={`/test/instructions/${skill.id}`} 
                      className="skill-test-button"
                    >
                      Attempt Test
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;