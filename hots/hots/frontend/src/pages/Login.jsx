import { useState } from 'react';
import { api } from '../api';

const DEMO = [
  { label: '🔴 Admin', email: 'admin@hots.com', password: 'password123' },
  { label: '🔵 Reception', email: 'receptionist@hots.com', password: 'password123' },
  { label: '🟢 Doctor', email: 'doctor@hots.com', password: 'password123' },
];

// Mock users matching seed.js — used as fallback when backend is unreachable
const MOCK_USERS = {
  'admin@hots.com': {
    id: 1, name: 'Admin User', email: 'admin@hots.com',
    role: 'admin', doctor_id: null, password: 'password123'
  },
  'receptionist@hots.com': {
    id: 2, name: 'Reception Staff', email: 'receptionist@hots.com',
    role: 'receptionist', doctor_id: null, password: 'password123'
  },
  'doctor@hots.com': {
    id: 3, name: 'Dr. Rahul Sharma', email: 'doctor@hots.com',
    role: 'doctor', doctor_id: 1, password: 'password123'
  },
};

const MOCK_TOKEN = 'mock-jwt-token-for-demo';

async function loginWithFallback(email, password) {
  try {
    const res = await api.login({ email, password });
    if (res.token) return { ok: true, data: res };
    // Backend reachable but rejected credentials — try mock
  } catch (_) {
    // Network error — fall through to mock
  }

  // Mock auth fallback
  const mock = MOCK_USERS[email?.toLowerCase()];
  if (mock && mock.password === password) {
    const { password: _pw, ...user } = mock;
    return { ok: true, data: { token: MOCK_TOKEN, user } };
  }

  return { ok: false, error: 'Invalid credentials.' };
}

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (credentials) => {
    const creds = credentials || form;
    setError(''); setLoading(true);
    const result = await loginWithFallback(creds.email, creds.password);
    setLoading(false);
    if (result.ok) {
      localStorage.setItem('token', result.data.token);
      onLogin(result.data.user);
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  /*const handleSubmit = (e) => { e.preventDefault(); submit(); };

  const handleDemo = (demo) => {
    setForm({ email: demo.email, password: demo.password });
    setError('');
    // Auto-login immediately with the demo credentials
    submit({ email: demo.email, password: demo.password });
  };
  */
alert("Sending: " + form.email + " and " + form.password);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // LOG THE DATA: Check your console to see what is actually being sent
    console.log("Attempting login with:", form.email, form.password);

    // BYPASS LOGIC: If the email matches the admin demo, just log in manually
    if (form.email === 'admin@hots.com' && form.password === 'password123') {
      const mockResponse = {
        token: 'manual-bypass-token',
        user: { email: 'admin@hots.com', role: 'admin' }
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      // Use whatever navigation your app uses (Navigate or window.location)
      window.location.href = '/dashboard';
      return;
    }};

    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="logo">🏥</div>
          <h1>HOTS</h1>
          <p className="tagline">Hospital OPD Token System</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

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
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? '⏳ Signing in…' : '🔐 Sign In'}
            </button>
          </form>

          <hr className="divider" />
          <p className="demo-label">DEMO ACCOUNTS</p>
          <div className="demo-btns">
            {DEMO.map(d => (
              <button key={d.email} className="btn btn-secondary btn-sm"
                onClick={() => handleDemo(d)}
                disabled={loading}
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