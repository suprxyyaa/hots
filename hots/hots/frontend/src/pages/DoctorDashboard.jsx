import { useState, useEffect } from 'react';
import { api } from '../api';

export default function DoctorDashboard({ user }) {
  const [queue,   setQueue]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    if (!user.doctor_id) { setError('Your account is not linked to a doctor record.'); setLoading(false); return; }
    setLoading(true);
    const data = await api.getQueue(user.doctor_id);
    if (data.error) setError(data.error);
    else setQueue(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id, status) => {
    await api.updateStatus(id, status); load();
  };

  if (loading) return <div className="loading" style={{ paddingTop: 80 }}>Loading your queue…</div>;
  if (error)   return <div className="container"><div className="alert alert-error">⚠️ {error}</div></div>;
  if (!queue)  return null;

  const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-in-progress', completed: 'badge-completed', cancelled: 'badge-cancelled' };

  return (
    <div className="container">
      {/* Summary stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{queue.total_waiting}</div>
          <div className="stat-label">Waiting</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1565c0' }}>{queue.in_progress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{queue.queue.length}</div>
          <div className="stat-label">Total Active</div>
        </div>
      </div>

      {/* Queue */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>🏥 My OPD Queue — {queue.date}</h2>
          <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {queue.queue.length === 0 ? (
          <div className="empty">No patients in queue right now.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {queue.queue.map(t => (
              <div key={t.id} style={{
                border: `2px solid ${t.status === 'in-progress' ? '#1565c0' : '#e0f2f1'}`,
                borderRadius: 10, padding: '14px 18px',
                background: t.status === 'in-progress' ? '#e3f2fd' : 'white',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
              }}>
                <div className="token-number" style={{ width: 60, height: 60 }}>
                  <span className="num" style={{ fontSize: '1.4rem' }}>#{t.token_number}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.patient_name}</div>
                  <div style={{ fontSize: '.83rem', color: '#666', marginTop: 3 }}>
                    Age: {t.patient_age} &nbsp;|&nbsp; 📞 {t.patient_phone}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {t.status === 'waiting' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(t.id, 'in-progress')}>
                      ▶ Call Patient
                    </button>
                  )}
                  {t.status === 'in-progress' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(t.id, 'completed')}>
                        ✅ Complete
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(t.id, 'cancelled')}>
                        ❌ Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
