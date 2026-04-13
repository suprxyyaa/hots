import { useState, useEffect } from 'react';
import { api } from '../api';

function Bar({ value, max, color = '#00897b' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 12, background: '#e0f2f1', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6, transition: 'width .5s ease' }} />
      </div>
      <span style={{ minWidth: 28, fontSize: '.82rem', fontWeight: 700, color: '#444' }}>{value}</span>
    </div>
  );
}

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getAnalytics().then(d => {
      if (d.error) setError(d.error);
      else setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading" style={{ paddingTop: 80 }}>Loading analytics…</div>;
  if (error)   return <div className="container"><div className="alert alert-error">⚠️ {error}</div></div>;
  if (!data)   return null;

  const { summary, by_department, busiest_doctors, weekly_trend, date } = data;
  const total = parseInt(summary.total_today) || 0;

  return (
    <div className="container">
      <p style={{ color: '#888', fontSize: '.85rem', marginBottom: 16 }}>📅 Data for: <strong>{date}</strong></p>

      {/* Summary */}
      <div className="stats-grid">
        {[
          { label: 'Total Today',  value: summary.total_today,  color: '#00695c' },
          { label: 'Waiting',      value: summary.waiting,       color: '#e65100' },
          { label: 'In Progress',  value: summary.in_progress,   color: '#1565c0' },
          { label: 'Completed',    value: summary.completed,     color: '#2e7d32' },
          { label: 'Cancelled',    value: summary.cancelled,     color: '#b71c1c' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value" style={{ color: s.color }}>{s.value || 0}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* By Department */}
      <div className="card">
        <h2>🏢 Tokens by Department</h2>
        {by_department.length === 0 ? <div className="empty">No data yet.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {by_department.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.85rem' }}>
                  <strong>{d.name}</strong>
                  <span style={{ color: '#888' }}>{d.completed} done / {d.total} total</span>
                </div>
                <Bar value={parseInt(d.total)} max={total || 1} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Busiest Doctors */}
      <div className="card">
        <h2>👨‍⚕️ Busiest Doctors Today</h2>
        {busiest_doctors.length === 0 ? <div className="empty">No data yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Rank</th><th>Doctor</th><th>Specialization</th><th>Total Tokens</th><th>Completed</th></tr></thead>
              <tbody>
                {busiest_doctors.map((d, i) => (
                  <tr key={d.doctor_name}>
                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                    <td><strong>{d.doctor_name}</strong></td>
                    <td>{d.specialization}</td>
                    <td>
                      <Bar value={parseInt(d.total_tokens)} max={parseInt(busiest_doctors[0].total_tokens)} />
                    </td>
                    <td><span className="badge badge-completed">{d.completed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Trend */}
      <div className="card">
        <h2>📈 Last 7 Days Trend</h2>
        {weekly_trend.length === 0 ? <div className="empty">No historical data yet.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weekly_trend.map(t => (
              <div key={t.date}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.83rem', marginBottom: 4 }}>
                  <span>{t.date}</span><span style={{ color: '#888' }}>{t.total} tokens</span>
                </div>
                <Bar value={parseInt(t.total)} max={Math.max(...weekly_trend.map(x => parseInt(x.total)))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
