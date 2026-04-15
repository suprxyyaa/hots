import { useState, useEffect } from 'react';

// --- MOCK DATA (Shows up when backend fails) ---
const MOCK_DEPTS = [
  { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular' },
  { id: 2, name: 'Neurology', description: 'Brain and nervous system' },
  { id: 3, name: 'Pediatrics', description: 'Child healthcare' }
];

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. John Smith', specialization: 'Cardiologist', department_id: 1, department_name: 'Cardiology', available: true },
  { id: 2, name: 'Dr. Sarah Connor', specialization: 'Neurologist', department_id: 2, department_name: 'Neurology', available: false },
  { id: 3, name: 'Dr. Rahul Sharma', specialization: 'Pediatrician', department_id: 3, department_name: 'Pediatrics', available: true }
];

// ── Departments Tab ───────────────────────────────────────────────────────────
function DepartmentsTab() {
  const [depts, setDepts] = useState(MOCK_DEPTS);
  const [form, setForm] = useState({ name: '', description: '' });
  const [msg, setMsg] = useState(null);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const submit = (e) => {
    e.preventDefault();
    const newDept = { ...form, id: Date.now() };
    setDepts([...depts, newDept]);
    flash('Department added (Local Only)!');
    setForm({ name: '', description: '' });
  };

  const del = (id) => {
    if (!confirm('Delete department?')) return;
    setDepts(depts.filter(d => d.id !== id));
    flash('Deleted locally.');
  };

  return (
    <>
      <div className="card">
        <h2>🏢 Add Department</h2>
        {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Department Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cardiology" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Heart and cardiovascular" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">➕ Add Department</button>
        </form>
      </div>
      <div className="card">
        <h2>📋 All Departments ({depts.length})</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Action</th></tr></thead>
            <tbody>
              {depts.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.description}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(d.id)}>🗑️ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Doctors Tab ───────────────────────────────────────────────────────────────
function DoctorsTab() {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [depts] = useState(MOCK_DEPTS);
  const [form, setForm] = useState({ name: '', specialization: '', department_id: '' });
  const [msg, setMsg] = useState(null);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const submit = (e) => {
    e.preventDefault();
    const selectedDept = depts.find(dep => dep.id == form.department_id);
    const newDoc = { 
      ...form, 
      id: Date.now(), 
      department_name: selectedDept ? selectedDept.name : 'Unknown',
      available: true 
    };
    setDoctors([...doctors, newDoc]);
    flash('Doctor added (Local Only)!');
    setForm({ name: '', specialization: '', department_id: '' });
  };

  const toggleAvail = (id) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, available: !d.available } : d));
  };

  return (
    <>
      <div className="card">
        <h2>👨‍⚕️ Add Doctor</h2>
        {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-row-3">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. John Smith" required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Cardiologist" required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))} required>
                <option value="">— select —</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit">➕ Add Doctor</button>
        </form>
      </div>
      <div className="card">
        <h2>📋 All Doctors ({doctors.length})</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Specialization</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialization}</td>
                  <td>{d.department_name}</td>
                  <td>
                    <span className={`badge badge-${d.available ? 'available' : 'unavailable'}`}>
                      {d.available ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm" onClick={() => toggleAvail(d.id)}>
                      {d.available ? '🔴 Disable' : '🟢 Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Register User Tab ─────────────────────────────────────────────────────────
function RegisterTab() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' });
  const [msg, setMsg] = useState(null);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const submit = (e) => {
    e.preventDefault();
    flash(`Account "${form.name}" created locally as ${form.role}!`);
    setForm({ name: '', email: '', password: '', role: 'receptionist' });
  };

  return (
    <div className="card">
      <h2>🔐 Create User Account</h2>
      {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
        </div>
        <button className="btn btn-success" type="submit">➕ Create Account</button>
      </form>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'departments', label: '🏢 Departments' },
  { id: 'doctors',     label: '👨‍⚕️ Doctors' },
  { id: 'register',    label: '🔐 User Accounts' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('departments');
  return (
    <div className="container">
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', padding: 6, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,.07)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'doctors'     && <DoctorsTab />}
      {tab === 'register'    && <RegisterTab />}
    </div>
  );
}