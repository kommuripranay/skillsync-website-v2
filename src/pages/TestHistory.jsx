import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './TestHistory.css'; // We'll make this simple CSS next
import { IonIcon } from '@ionic/react';
import { 
    timeOutline, 
    chevronForwardOutline, 
    searchOutline,
    filterOutline
} from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function TestHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSkill, setFilterSkill] = useState('');

    useEffect(() => {
        async function fetchHistory() {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('test_results')
                    .select(`
                        id, 
                        score, 
                        created_at, 
                        duration_seconds, 
                        skills ( name )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTests(data || []);
            } catch (err) {
                console.error("Error loading history:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [user]);

    // Helper: Color code scores
    const getScoreClass = (score) => {
        if (score >= 800) return 'score-high';
        if (score >= 600) return 'score-mid';
        return 'score-low';
    };

    // Helper: Format Duration (e.g. 120s -> 2m 0s)
    const formatDuration = (seconds) => {
        if (!seconds) return "N/A";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    // Filter Logic
    const filteredTests = tests.filter(t => 
        t.skills?.name.toLowerCase().includes(filterSkill.toLowerCase())
    );

    if (loading) return <div className="history-page-container loading">Loading history...</div>;

    return (
        <div className="history-page-container">
            <div className="theme-toggle-wrapper"><ThemeToggle /></div>
            
            <div className="history-content">
                <div className="history-header">
                    <h1>Test History</h1>
                    <p>View detailed analysis of your past assessments.</p>
                </div>

                {/* Toolbar */}
                <div className="history-toolbar">
                    <div className="search-wrapper">
                        <IonIcon icon={searchOutline} />
                        <input 
                            type="text" 
                            placeholder="Filter by skill..." 
                            value={filterSkill}
                            onChange={(e) => setFilterSkill(e.target.value)}
                        />
                    </div>
                    <div className="stats-badge">
                        <span>Total Tests: <strong>{tests.length}</strong></span>
                    </div>
                </div>

                {/* Table */}
                <div className="full-history-table-wrapper">
                    {filteredTests.length === 0 ? (
                        <div className="empty-history">
                            <p>No test records found.</p>
                        </div>
                    ) : (
                        <table className="full-history-table">
                            <thead>
                                <tr>
                                    <th>Skill</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Score</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTests.map((test) => (
                                    <tr 
                                        key={test.id} 
                                        onClick={() => navigate(`/test/result/${test.id}`)}
                                        className="clickable-row"
                                    >
                                        <td>
                                            <div className="skill-cell">
                                                <div className="skill-icon-letter">
                                                    {test.skills?.name?.[0] || '?'}
                                                </div>
                                                <span className="skill-name">{test.skills?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(test.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                            <span className="time-sub">
                                                {new Date(test.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
                                        <td className="duration-cell">
                                            <IonIcon icon={timeOutline} />
                                            {formatDuration(test.duration_seconds)}
                                        </td>
                                        <td>
                                            <span className={`score-pill ${getScoreClass(test.score)}`}>
                                                {test.score}
                                            </span>
                                        </td>
                                        <td className="arrow-cell">
                                            <IonIcon icon={chevronForwardOutline} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestHistory;