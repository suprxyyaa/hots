import { useState } from 'react';
import Login                from './pages/Login';
import AdminDashboard       from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard      from './pages/DoctorDashboard';
import Analytics            from './pages/Analytics';
import Navbar               from './components/Navbar';

const NAV = {
  admin:        [{ id: 'manage', label: '⚙️ Manage' }, { id: 'analytics', label: '📈 Analytics' }],
  receptionist: [{ id: 'reception', label: '🎫 Tokens' }],
  doctor:       [{ id: 'queue', label: '🏥 My Queue' }],
};

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('hots_user') || 'null'));
  const [page, setPage] = useState(() => {
    const u = JSON.parse(localStorage.getItem('hots_user') || 'null');
    if (!u) return 'login';
    return u.role === 'admin' ? 'manage' : u.role === 'receptionist' ? 'reception' : 'queue';
  });

  const handleLogin = (userData) => {
    localStorage.setItem('hots_user', JSON.stringify(userData));
    setUser(userData);
    setPage(userData.role === 'admin' ? 'manage' : userData.role === 'receptionist' ? 'reception' : 'queue');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hots_user');
    setUser(null); setPage('login');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const navItems = NAV[user.role] || [];

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="page-tabs">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex' }}>
          {navItems.map(n => (
            <button key={n.id} className={`page-tab ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}>{n.label}</button>
          ))}
        </div>
      </div>
      <div style={{ paddingTop: 8 }}>
        {page === 'manage'    && <AdminDashboard />}
        {page === 'analytics' && <Analytics />}
        {page === 'reception' && <ReceptionistDashboard />}
        {page === 'queue'     && <DoctorDashboard user={user} />}
      </div>
    </>
  );
}
