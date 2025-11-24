import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './ManageSkills.css';
import { IonIcon } from '@ionic/react';
import { 
  searchOutline, 
  checkmarkCircle, 
  addCircleOutline, 
  closeCircleOutline // 1. Import new icon
} from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function ManageSkills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [masterSkillList, setMasterSkillList] = useState([]);
  const [trackedSkillIds, setTrackedSkillIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSkills() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, job_count')
          .order('job_count', { ascending: false })
          .limit(1000); 
          
        if (skillsError) throw skillsError;
        setMasterSkillList(skillsData);

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
      setTrackedSkillIds(prev => {
        const newSet = new Set(prev);
        if (isTracked) newSet.delete(skillId);
        else newSet.add(skillId);
        return newSet;
      });

      if (isTracked) {
        const { error } = await supabase
          .from('user_tracked_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_tracked_skills')
          .insert({ user_id: user.id, skill_id: skillId });
        if (error) throw error;
      }
    } catch (err) {
      alert(`Error updating skill: ${err.message}`);
    }
  };

  const filteredSkills = masterSkillList
    .filter(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aTracked = trackedSkillIds.has(a.id);
      const bTracked = trackedSkillIds.has(b.id);
      if (aTracked && !bTracked) return -1;
      if (!aTracked && bTracked) return 1;
      return 0;
    });

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
              {filteredSkills.slice(0, 100).map(skill => {
                const isTracked = trackedSkillIds.has(skill.id);
                return (
                  <li key={skill.id} className={`skill-item ${isTracked ? 'tracked' : ''}`}>
                    <span className="skill-name">{skill.name}</span>
                    
                    {/* 2. Updated Button Logic for Hover Swap */}
                    <button
                      onClick={() => handleSkillToggle(skill.id, isTracked)}
                      className={`toggle-btn ${isTracked ? 'remove' : 'add'}`}
                    >
                      {isTracked ? (
                        <>
                          {/* We render BOTH sets of text/icons, CSS handles visibility */}
                          <span className="btn-content default">
                             <IonIcon icon={checkmarkCircle} /> Tracked
                          </span>
                          <span className="btn-content hover">
                             <IonIcon icon={closeCircleOutline} /> Remove
                          </span>
                        </>
                      ) : (
                        <>
                          <IonIcon icon={addCircleOutline} /> Add
                        </>
                      )}
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