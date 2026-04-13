export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <h1>🏥 HOTS — Hospital OPD Token System</h1>
      <div className="nav-info">
        <span className="nav-name">{user.name}</span>
        <span className={`role-badge role-${user.role}`}>{user.role}</span>
        <button className="btn btn-logout btn-sm" onClick={onLogout}>⏏ Logout</button>
      </div>
    </nav>
  );
}
