import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './ManageSkills.css';
import { IonIcon } from '@ionic/react';
import { searchOutline, checkmarkCircle, addCircleOutline } from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function ManageSkills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [masterSkillList, setMasterSkillList] = useState([]);
  const [trackedSkillIds, setTrackedSkillIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState(''); // 1. Search State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSkills() {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch ALL skills (ordered alphabetically)
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, job_count') // Grab the count too
          .order('job_count', { ascending: false }) // Highest numbers first
          .limit(1000); // Fetch top 1000 most popular skills
          
        if (skillsError) throw skillsError;
        setMasterSkillList(skillsData);
        // Fetch User's Tracked Skills
        
        const { data: trackedData, error: trackedError } = await supabase
          .from('user_tracked_skills')
          .select('skill_id')
          .eq('user_id', user.id);
          
        if (trackedError) throw trackedError;
        
        const idSet = new Set(trackedData.map(item => item.skill_id));
        setTrackedSkillIds(idSet);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSkills();
  }, [user]);

  const handleSkillToggle = async (skillId, isTracked) => {
    try {
      // Optimistic Update (Update UI immediately)
      setTrackedSkillIds(prev => {
        const newSet = new Set(prev);
        if (isTracked) newSet.delete(skillId);
        else newSet.add(skillId);
        return newSet;
      });

      if (isTracked) {
        // Untrack
        const { error } = await supabase
          .from('user_tracked_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
        if (error) throw error;
      } else {
        // Track
        const { error } = await supabase
          .from('user_tracked_skills')
          .insert({ user_id: user.id, skill_id: skillId });
        if (error) throw error;
      }
    } catch (err) {
      alert(`Error updating skill: ${err.message}`);
      // Revert on error would go here
    }
  };

  // 2. Filter Logic
  const filteredSkills = masterSkillList.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="manage-container loading">Loading skills library...</div>;
  if (error) return <div className="manage-container error">Error: {error}</div>;

  return (
    <div className="manage-skills-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="manage-box">
        <div className="manage-header">
          <h1>Manage Skills</h1>
          <p>Search and select the skills you want to track.</p>
        </div>

        {/* 3. Search Bar UI */}
        <div className="search-bar-wrapper">
            <IonIcon icon={searchOutline} className="search-icon"/>
            <input 
                type="text" 
                className="skill-search-input"
                placeholder="Search skills (e.g. Python, SQL, React)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
            />
        </div>

        <div className="skills-list-container">
          {filteredSkills.length === 0 ? (
             <div className="no-results">No skills found matching "{searchTerm}"</div>
          ) : (
            <ul className="skill-list">
              {/* Show only top 100 results to prevent lag if query is empty */}
              {filteredSkills.slice(0, 100).map(skill => {
                const isTracked = trackedSkillIds.has(skill.id);
                return (
                  <li key={skill.id} className={`skill-item ${isTracked ? 'tracked' : ''}`}>
                    <span className="skill-name">{skill.name}</span>
                    <button
                      onClick={() => handleSkillToggle(skill.id, isTracked)}
                      className={`toggle-btn ${isTracked ? 'remove' : 'add'}`}
                    >
                      <IonIcon icon={isTracked ? checkmarkCircle : addCircleOutline} />
                      {isTracked ? 'Tracked' : 'Add'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {filteredSkills.length > 100 && (
              <div className="more-results">And {filteredSkills.length - 100} more... keep typing to refine.</div>
          )}
        </div>
        
        <div className="manage-footer">
          <button className="done-btn" onClick={() => navigate('/dashboard')}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageSkills;