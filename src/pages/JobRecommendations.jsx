import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './JobRecommendations.css';
import { IonIcon } from '@ionic/react';
import { briefcaseOutline, checkmarkCircle, alertCircleOutline, arrowForward } from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function JobRecommendations() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // We expect the skill name to be passed, or we default to one
    const skillName = location.state?.skill || "Python"; 

    const [userScore, setUserScore] = useState(0);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setLoading(true);

            try {
                // 1. Get User's Best Score for this Skill
                // We need the Skill ID first
                const { data: skillData } = await supabase
                    .from('skills')
                    .select('id')
                    .ilike('name', skillName)
                    .single();

                if (skillData) {
                    const { data: scoreData } = await supabase
                        .from('test_results')
                        .select('score')
                        .eq('user_id', user.id)
                        .eq('skill_id', skillData.id)
                        .order('score', { ascending: false })
                        .limit(1)
                        .single();
                    
                    if (scoreData) setUserScore(scoreData.score);
                }

                // 2. Get Jobs to Plot (A mix of levels)
                // We want some below the user, some matching, some above (Reach)
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('job_id, title, company, target_score, seniority_level')
                    .contains('skills_array', [skillName]) // Filter by skill
                    .order('target_score', { ascending: true })
                    .limit(50); // Fetch a batch to pick representatives from

                setJobs(jobsData || []);

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, skillName]);

    // Helper: Select ~5 representative jobs to show on the line chart to avoid clutter
    const getChartMarkers = () => {
        if (jobs.length === 0) return [];
        // Simple logic: Pick a few jobs spread across the range
        const step = Math.floor(jobs.length / 5);
        const markers = [];
        for (let i = 0; i < jobs.length; i += step) {
            markers.push(jobs[i]);
        }
        return markers.slice(0, 5); // Ensure max 5
    };

    const chartMarkers = getChartMarkers();

    // Helper: Determine "Gap" or "Match"
    const getMatchStatus = (jobScore) => {
        const diff = userScore - jobScore;
        if (diff >= -50) return { label: "Qualified", class: "match-good" }; // User is equal or better
        if (diff >= -150) return { label: "Reach", class: "match-reach" };   // User is close
        return { label: "Gap", class: "match-gap" };                         // User is far
    };

    if (loading) return <div className="job-rec-container loading">Scanning Industry Data...</div>;

    return (
        <div className="job-rec-container">
            <div className="theme-toggle-wrapper"><ThemeToggle /></div>

            <div className="job-rec-content">
                <div className="rec-header">
                    <h1>Industry Positioning</h1>
                    <p>Comparing your <strong>{skillName}</strong> score ({userScore}) against real market requirements.</p>
                </div>

                {/* --- THE INDUSTRY RADAR (Line Chart) --- */}
                <div className="radar-section">
                    <div className="radar-track-container">
                        <div className="radar-track">
                            {/* Gradient Background representing Seniority */}
                            <div className="track-gradient"></div>
                            
                            {/* Grid Lines */}
                            <div className="grid-line" style={{left: '0%'}}><span>0</span></div>
                            <div className="grid-line" style={{left: '50%'}}><span>500</span></div>
                            <div className="grid-line" style={{left: '100%'}}><span>1000</span></div>

                            {/* USER MARKER (YOU) */}
                            <div 
                                className="radar-marker user-marker" 
                                style={{ left: `${(userScore / 1000) * 100}%` }}
                            >
                                <div className="marker-dot user"></div>
                                <div className="marker-label user">
                                    You ({userScore})
                                </div>
                            </div>

                            {/* COMPANY MARKERS */}
                            {chartMarkers.map((job) => (
                                <div 
                                    key={job.job_id} 
                                    className="radar-marker company-marker"
                                    style={{ left: `${(job.target_score / 1000) * 100}%` }}
                                >
                                    <div className="marker-dot company"></div>
                                    <div className="marker-label company">
                                        <strong>{job.company}</strong>
                                        <span>{job.target_score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="radar-legend">
                        <span>Intern (0-300)</span>
                        <span>Mid-Level (300-600)</span>
                        <span>Senior (600-800)</span>
                        <span>Expert (800+)</span>
                    </div>
                </div>

                {/* --- JOB LISTINGS --- */}
                <div className="job-listings">
                    <h2>Available Roles</h2>
                    <div className="jobs-grid">
                        {jobs.slice(0, 10).map((job) => {
                            const status = getMatchStatus(job.target_score);
                            return (
                                <div key={job.job_id} className={`job-card ${status.class}`}>
                                    <div className="job-score-badge" title="Difficulty Score">{job.target_score}</div>
                                    <div className="job-details">
                                        <h3>{job.title}</h3>
                                        <p className="company-name"><IonIcon icon={briefcaseOutline}/> {job.company}</p>
                                        <span className="seniority-tag">{job.seniority_level}</span>
                                    </div>
                                    <div className="match-indicator">
                                        {status.label === "Qualified" && <span className="tag-qualified"><IonIcon icon={checkmarkCircle}/> Good Fit</span>}
                                        {status.label === "Reach" && <span className="tag-reach">Reach Role</span>}
                                        {status.label === "Gap" && <span className="tag-gap"><IonIcon icon={alertCircleOutline}/> {job.target_score - userScore} pts gap</span>}
                                        <button className="apply-btn"><IonIcon icon={arrowForward}/></button>
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

export default JobRecommendations;