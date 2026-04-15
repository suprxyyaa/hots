import { useState } from 'react';

const DEMO = [
  { label: '🔴 Admin', email: 'admin@hots.com', role: 'admin' },
  { label: '🔵 Reception', email: 'receptionist@hots.com', role: 'receptionist' },
  { label: '🟢 Doctor', email: 'doctor@hots.com', role: 'doctor' },
];

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });

  // This updates the text boxes when you type
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
// This handles the manual "Sign In" button
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Determine role based on email typed
    let role = 'admin';
    if (form.email.includes('receptionist')) role = 'receptionist';
    if (form.email.includes('doctor')) role = 'doctor';

    const fakeUserData = {
      email: form.email || 'admin@hots.com',
      role: role,
      name: role.charAt(0).toUpperCase() + role.slice(1) + ' User'
    };

    onLogin(fakeUserData);
  };

  // This handles the 3 colored Demo buttons
  const handleDemo = (d) => {
    // Standardize role names to match your App.jsx logic
    let role = d.label.toLowerCase().includes('admin') ? 'admin' : 
               d.label.toLowerCase().includes('reception') ? 'receptionist' : 'doctor';

    onLogin({
      email: d.email,
      role: role,
      name: d.label
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="logo">🏥</div>
        <h1>HOTS</h1>
        <p className="tagline">Hospital OPD Token System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email}
              onChange={handle} placeholder="you@hospital.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handle} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit">
            🔐 Sign In
          </button>
        </form>

        <hr className="divider" />
        <p className="demo-label">DEMO ACCOUNTS</p>
        <div className="demo-btns">
          {DEMO.map(d => (
            <button key={d.email} className="btn btn-secondary btn-sm"
              onClick={() => handleDemo(d)}
              type="button"
              style={{ fontSize: '.75rem' }}>
              {d.label}
            </button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#bbb', marginTop: '18px' }}>
          IaaS · PaaS · SaaS · DaaS — Cloud Computing Lab Project
        </p>
      </div>
    </div>
  );
}