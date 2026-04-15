import { useState, useEffect } from 'react';

// --- MOCK DATA ---
const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. John Smith', specialization: 'Cardiologist', department_name: 'Cardiology', available: true },
  { id: 3, name: 'Dr. Rahul Sharma', specialization: 'Pediatrician', department_name: 'Pediatrics', available: true }
];

const INITIAL_TOKENS = [
  { id: 1, token_number: 101, patient_name: 'Amit Patel', patient_age: 45, patient_phone: '9876543210', doctor_name: 'Dr. John Smith', department_name: 'Cardiology', status: 'waiting' },
  { id: 2, token_number: 102, patient_name: 'Suman Lata', patient_age: 29, patient_phone: '9123456789', doctor_name: 'Dr. Rahul Sharma', department_name: 'Pediatrics', status: 'in-progress' }
];

function BookToken() {
  const [doctors] = useState(MOCK_DOCTORS);
  const [form, setForm] = useState({ patient_name: '', patient_age: '', patient_phone: '', doctor_id: '' });
  const [msg, setMsg] = useState(null);
  const [booked, setBooked] = useState(null);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 5000); };

  const submit = (e) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === parseInt(form.doctor_id));
    const newToken = {
      token_number: Math.floor(100 + Math.random() * 900),
      patient_name: form.patient_name,
      doctor_name: doc ? doc.name : 'Unknown',
      status: 'waiting'
    };
    setBooked(newToken);
    flash(`Token #${newToken.token_number} booked successfully!`);
    setForm({ patient_name: '', patient_age: '', patient_phone: '', doctor_id: '' });
  };

  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctor_id));

  return (
    <div className="card">
      <h2>🎫 Book New Token</h2>
      {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
      {booked && (
        <div style={{ background: '#e0f2f1', border: '2px solid #00897b', borderRadius: 10, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="token-number"><span className="num">{booked.token_number}</span><span className="label">Token</span></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#00695c' }}>{booked.patient_name}</div>
            <div style={{ color: '#555', fontSize: '.88rem' }}>Doctor: <strong>{booked.doctor_name}</strong></div>
          </div>
        </div>
      )}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group"><label>Patient Full Name</label><input value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} required /></div>
          <div className="form-group"><label>Age</label><input type="number" value={form.patient_age} onChange={e => setForm(f => ({ ...f, patient_age: e.target.value }))} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Phone Number</label><input value={form.patient_phone} onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))} required /></div>
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} required>
              <option value="">— choose doctor —</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">🎫 Book Token</button>
      </form>
    </div>
  );
}

function TodaysTokens() {
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [filter, setFilter] = useState('all');

  const updateStatus = (id, status) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, status } : t));
  };

  const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-in-progress', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  const filtered = filter === 'all' ? tokens : tokens.filter(t => t.status === filter);

  return (
    <div className="card">
      <h2>📋 Today's Tokens ({tokens.length})</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'waiting', 'in-progress', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td><strong>#{t.token_number}</strong></td>
                <td>{t.patient_name}</td>
                <td>{t.doctor_name}</td>
                <td><span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                <td>{t.status === 'waiting' && <button className="btn btn-danger btn-sm" onClick={() => updateStatus(t.id, 'cancelled')}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState('book');
  return (
    <div className="container">
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', padding: 6, borderRadius: 10 }}>
        <button className={`btn btn-sm ${tab === 'book' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('book')}>🎫 Book Token</button>
        <button className={`btn btn-sm ${tab === 'tokens' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('tokens')}>📋 Today's Tokens</button>
      </div>
      {tab === 'book' ? <BookToken /> : <TodaysTokens />}
    </div>
  );
}