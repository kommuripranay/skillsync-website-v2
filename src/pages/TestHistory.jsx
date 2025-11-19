import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './TestHistory.css';
import { IonIcon } from '@ionic/react';
import { timeOutline } from 'ionicons/icons';

const TestHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('test_results')
          .select(`id, score, created_at, duration_seconds, skills ( name )`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return <div className="history-container">Loading...</div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Test History</h1>
        <p>Review your past assessments.</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-history"><p>No tests taken yet.</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Score (/1000)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="skill-cell"><strong>{item.skills?.name || 'Unknown'}</strong></td>
                  <td className="date-cell">{formatDate(item.created_at)}</td>
                  <td className="duration-cell">
                    <IonIcon icon={timeOutline} style={{verticalAlign:'middle', marginRight:'4px'}}/>
                    {formatDuration(item.duration_seconds)}
                  </td>
                  <td className="score-cell">
                    <span className={`score-badge ${item.score >= 800 ? 'high' : item.score >= 500 ? 'mid' : 'low'}`}>
                      {item.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestHistory;