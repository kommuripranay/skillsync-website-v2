// 1. --- FIX: Import useState and useEffect ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './ManageSkills.css';

function ManageSkills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // These lines need 'useState'
  const [masterSkillList, setMasterSkillList] = useState([]);
  const [trackedSkillIds, setTrackedSkillIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This line needs 'useEffect'
  useEffect(() => {
    async function fetchSkills() {
      if (!user) return;
      
      setLoading(true);
      try {
        // 1. Fetches all skills from the 'skills' table
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name'); 
          
        if (skillsError) throw skillsError;
        setMasterSkillList(skillsData);

        // 2. Fetches the skills this user is tracking
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
    // ... (rest of the function is unchanged)
    try {
      if (isTracked) {
        // --- User wants to UNTRACK (delete) ---
        const { error } = await supabase
          .from('user_tracked_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
          
        if (error) throw error;
        
        setTrackedSkillIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(skillId);
          return newSet;
        });

      } else {
        // --- User wants to TRACK (insert) ---
        const { error } = await supabase
          .from('user_tracked_skills')
          .insert({ user_id: user.id, skill_id: skillId });
          
        if (error) throw error;
        
        setTrackedSkillIds(prev => new Set(prev).add(skillId));
      }
    } catch (err) {
      alert(`Error updating skill: ${err.message}`);
    }
  };

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="manage-skills-container">
      <div className="manage-skills-box">
        <h1>Manage Your Skills</h1>
        <p>Select the skills you want to track on your dashboard.</p>
        
        <ul className="skill-list">
          {/* 3. This map will now show the skills */}
          {masterSkillList.map(skill => {
            const isTracked = trackedSkillIds.has(skill.id);
            return (
              <li key={skill.id} className="skill-item">
                <span className="skill-name">{skill.name}</span>
                <button
                  onClick={() => handleSkillToggle(skill.id, isTracked)}
                  className={`skill-toggle-btn ${isTracked ? 'remove' : 'add'}`}
                >
                  {isTracked ? 'Remove' : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
        
        <button 
          className="done-btn" 
          onClick={() => navigate('/dashboard')}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default ManageSkills;