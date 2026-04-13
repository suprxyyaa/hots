import { useState, useEffect } from 'react';
import { api } from '../api';

// ── Departments Tab ───────────────────────────────────────────────────────────
function DepartmentsTab() {
  const [depts,   setDepts]   = useState([]);
  const [form,    setForm]    = useState({ name: '', description: '' });
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load  = async () => { setLoading(true); const d = await api.getDepartments(); setDepts(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.addDepartment(form);
    if (res.error) return flash(res.error, false);
    flash('Department added!'); setForm({ name: '', description: '' }); load();
  };

  const del = async (id) => {
    if (!confirm('Delete department? All doctors in it will also be deleted.')) return;
    await api.deleteDepartment(id); flash('Deleted.'); load();
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
        {loading ? <div className="loading">Loading…</div> : depts.length === 0 ? <div className="empty">No departments yet.</div> : (
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
        )}
      </div>
    </>
  );
}

// ── Doctors Tab ───────────────────────────────────────────────────────────────
function DoctorsTab() {
  const [doctors,  setDoctors]  = useState([]);
  const [depts,    setDepts]    = useState([]);
  const [form,     setForm]     = useState({ name: '', specialization: '', department_id: '' });
  const [editing,  setEditing]  = useState(null);
  const [msg,      setMsg]      = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    setLoading(true);
    const [d, dep] = await Promise.all([api.getDoctors(), api.getDepartments()]);
    setDoctors(Array.isArray(d) ? d : []);
    setDepts(Array.isArray(dep) ? dep : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const submit = async (e) => {
    e.preventDefault();
    const res = editing
      ? await api.updateDoctor(editing, { ...form, available: true })
      : await api.addDoctor(form);
    if (res.error) return flash(res.error, false);
    flash(editing ? 'Doctor updated!' : 'Doctor added!');
    setForm({ name: '', specialization: '', department_id: '' }); setEditing(null); load();
  };

  const toggleAvail = async (doc) => {
    await api.updateDoctor(doc.id, { ...doc, available: !doc.available });
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete doctor?')) return;
    await api.deleteDoctor(id); flash('Deleted.'); load();
  };

  return (
    <>
      <div className="card">
        <h2>👨‍⚕️ {editing ? 'Edit Doctor' : 'Add Doctor'}</h2>
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
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit">{editing ? '💾 Update' : '➕ Add Doctor'}</button>
            {editing && <button className="btn btn-secondary" type="button" onClick={() => { setEditing(null); setForm({ name: '', specialization: '', department_id: '' }); }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h2>📋 All Doctors ({doctors.length})</h2>
        {loading ? <div className="loading">Loading…</div> : doctors.length === 0 ? <div className="empty">No doctors added yet.</div> : (
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
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-warning btn-sm" onClick={() => toggleAvail(d)}>
                        {d.available ? '🔴 Disable' : '🟢 Enable'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(d.id); setForm({ name: d.name, specialization: d.specialization, department_id: d.department_id }); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(d.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── Register User Tab ─────────────────────────────────────────────────────────
function RegisterTab() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'receptionist', doctor_id: '' });
  const [doctors, setDoctors] = useState([]);
  const [msg,     setMsg]     = useState(null);

  useEffect(() => { api.getDoctors().then(d => setDoctors(Array.isArray(d) ? d : [])); }, []);
  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (form.role !== 'doctor') delete payload.doctor_id;
    const res = await api.register(payload);
    if (res.error) return flash(res.error, false);
    flash(`Account "${res.name}" created as ${res.role}!`);
    setForm({ name: '', email: '', password: '', role: 'receptionist', doctor_id: '' });
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
        {form.role === 'doctor' && (
          <div className="form-group">
            <label>Link to Doctor Record</label>
            <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} required>
              <option value="">— select doctor —</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
            </select>
          </div>
        )}
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
