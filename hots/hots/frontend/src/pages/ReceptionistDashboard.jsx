import { useState, useEffect } from 'react';
import { api } from '../api';

function BookToken() {
  const [doctors, setDoctors] = useState([]);
  const [form,    setForm]    = useState({ patient_name: '', patient_age: '', patient_phone: '', doctor_id: '' });
  const [msg,     setMsg]     = useState(null);
  const [booked,  setBooked]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDoctors().then(d => setDoctors(Array.isArray(d) ? d.filter(doc => doc.available) : []));
  }, []);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 5000); };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setBooked(null);
    const res = await api.bookToken({
      ...form,
      patient_age: parseInt(form.patient_age),
      doctor_id:   parseInt(form.doctor_id)
    });
    setLoading(false);
    if (res.error) return flash(res.error, false);
    setBooked(res);
    flash(`Token #${res.token_number} booked for ${res.patient_name}!`);
    setForm({ patient_name: '', patient_age: '', patient_phone: '', doctor_id: '' });
  };

  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctor_id));

  return (
    <div className="card">
      <h2>🎫 Book New Token</h2>
      {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}

      {booked && (
        <div style={{ background: '#e0f2f1', border: '2px solid #00897b', borderRadius: 10, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="token-number">
            <span className="num">{booked.token_number}</span>
            <span className="label">Token</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#00695c' }}>{booked.patient_name}</div>
            <div style={{ color: '#555', fontSize: '.88rem', marginTop: 4 }}>Doctor: <strong>{booked.doctor_name}</strong></div>
            <div style={{ color: '#555', fontSize: '.88rem' }}>Status: <span className="badge badge-waiting">Waiting</span></div>
          </div>
        </div>
      )}

      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Patient Full Name</label>
            <input value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="e.g. Ramesh Kumar" required />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" value={form.patient_age} onChange={e => setForm(f => ({ ...f, patient_age: e.target.value }))} placeholder="e.g. 35" min="1" max="120" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.patient_phone} onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))} placeholder="e.g. 9876543210" required />
          </div>
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} required>
              <option value="">— choose available doctor —</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization} ({d.department_name})</option>)}
            </select>
          </div>
        </div>
        {selectedDoctor && (
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '.85rem', color: '#065f46' }}>
            🏥 <strong>{selectedDoctor.department_name}</strong> → {selectedDoctor.name} ({selectedDoctor.specialization})
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '⏳ Booking…' : '🎫 Book Token'}
        </button>
      </form>
    </div>
  );
}

function TodaysTokens() {
  const [tokens,  setTokens]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  const load = async () => {
    setLoading(true);
    const d = await api.getTokens();
    setTokens(Array.isArray(d) ? d : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.updateStatus(id, status); load();
  };

  const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-in-progress', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  const filtered = filter === 'all' ? tokens : tokens.filter(t => t.status === filter);

  return (
    <div className="card">
      <h2>📋 Today's Tokens ({tokens.length})</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'waiting', 'in-progress', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button className="btn btn-sm btn-secondary" onClick={load} style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
      </div>
      {loading ? <div className="loading">Loading…</div> : filtered.length === 0 ? <div className="empty">No tokens found.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Token</th><th>Patient</th><th>Age</th><th>Phone</th><th>Doctor</th><th>Dept</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><strong style={{ color: '#00695c', fontSize: '1.1rem' }}>#{t.token_number}</strong></td>
                  <td><strong>{t.patient_name}</strong></td>
                  <td>{t.patient_age}</td>
                  <td>{t.patient_phone}</td>
                  <td>{t.doctor_name}</td>
                  <td>{t.department_name}</td>
                  <td><span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                  <td>
                    {t.status === 'waiting' && (
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(t.id, 'cancelled')}>Cancel</button>
                    )}
                    {t.status === 'completed' && <span style={{ color: '#aaa', fontSize: '.8rem' }}>Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState('book');
  return (
    <div className="container">
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', padding: 6, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
        <button className={`btn btn-sm ${tab === 'book' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('book')}>🎫 Book Token</button>
        <button className={`btn btn-sm ${tab === 'tokens' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('tokens')}>📋 Today's Tokens</button>
      </div>
      {tab === 'book'   && <BookToken />}
      {tab === 'tokens' && <TodaysTokens />}
    </div>
  );
}
