// 1. --- FIX 1: Import useState and useEffect ---
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  const [trackedSkills, setTrackedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackedSkills() {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // 2. --- FIX 2: Removed 'color' from the query ---
        const { data, error } = await supabase
          .from('user_tracked_skills')
          .select(`
            skill_id,
            skills (
              id,
              name
            )
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setTrackedSkills(data);
        
      } catch (error) {
        console.error('Error fetching tracked skills:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrackedSkills();
  }, [user]);
  
  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* (ThemeToggle is now in MainLayout, so it's gone from here) */}

      <div className="dashboard-header">
        <h1>Your Skill Dashboard</h1>
        <p>Select a skill below to start your assessment or manage your list.</p>
      </div>

      {trackedSkills.length === 0 ? (
        // --- EMPTY STATE ---
        <div className="empty-dashboard">
          <p>No skills added.</p>
          <Link to="/manage-skills" className="add-skill-button">
            Click here to add a skill
          </Link>
        </div>
      ) : (
        // --- SKILLS_EXIST STATE ---
        <>
          <div className="skill-test-grid">
            {trackedSkills.map((item) => {
              const skill = item.skills; 
              if (!skill) return null; 
              
              return (
                <div key={skill.id} className="skill-card">
                  {/* 3. --- FIX 3: Removed the color bar --- */}
                  <div className="skill-card-content">
                    <h3 className="skill-card-name">{skill.name}</h3>
                    <p className="skill-card-score">
                      Latest Score: <strong>Not Taken</strong>
                    </p>
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
          
          <div className="edit-skills-footer">
            <Link to="/manage-skills" className="edit-skills-button">
              Edit Skill List
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;