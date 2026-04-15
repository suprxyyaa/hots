import { useState } from 'react';

const MOCK_QUEUE = {
  total_waiting: 2,
  in_progress: 1,
  date: new Date().toLocaleDateString(),
  queue: [
    { id: 1, token_number: 101, patient_name: 'Amit Patel', patient_age: 45, patient_phone: '9876543210', status: 'in-progress' },
    { id: 3, token_number: 103, patient_name: 'Neha Gupta', patient_age: 12, patient_phone: '9988776655', status: 'waiting' },
    { id: 4, token_number: 104, patient_name: 'Vikram Singh', patient_age: 62, patient_phone: '8877665544', status: 'waiting' }
  ]
};

export default function DoctorDashboard({ user }) {
  const [data, setData] = useState(MOCK_QUEUE);

  const updateStatus = (id, status) => {
    const updatedQueue = data.queue.map(t => t.id === id ? { ...t, status } : t);
    setData({
      ...data,
      queue: updatedQueue,
      total_waiting: updatedQueue.filter(t => t.status === 'waiting').length,
      in_progress: updatedQueue.filter(t => t.status === 'in-progress').length
    });
  };

  const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-in-progress', completed: 'badge-completed', cancelled: 'badge-cancelled' };

  return (
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{data.total_waiting}</div><div className="stat-label">Waiting</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#1565c0' }}>{data.in_progress}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-value">{data.queue.length}</div><div className="stat-label">Total Active</div></div>
      </div>

      <div className="card">
        <h2>🏥 My OPD Queue — {data.date}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.queue.map(t => (
            <div key={t.id} style={{
              border: `2px solid ${t.status === 'in-progress' ? '#1565c0' : '#e0f2f1'}`,
              borderRadius: 10, padding: '14px 18px',
              background: t.status === 'in-progress' ? '#e3f2fd' : 'white',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div className="token-number" style={{ width: 60, height: 60 }}><span className="num">#{t.token_number}</span></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{t.patient_name} (Age: {t.patient_age})</div>
                <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {t.status === 'waiting' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(t.id, 'in-progress')}>▶ Call</button>}
                {t.status === 'in-progress' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(t.id, 'completed')}>✅ Done</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}