import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  role?: string;
  username?: string;
}

export default function Navbar({ role, username }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Dashboard', path: '/dashboard', roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
    { label: 'Browse Jobs', path: '/jobs', roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
    { label: 'My Applications', path: '/applications', roles: ['CANDIDATE'] },
    { label: 'Post a Job', path: '/recruiter', roles: ['RECRUITER'] },
    { label: 'Admin Panel', path: '/admin-panel', roles: ['ADMIN'] },
    { label: 'Settings', path: '/settings', roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
  ];

  const visible = links.filter(l => !role || l.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('username');
    document.cookie = 'access_token=; Max-Age=0; path=/';
    document.cookie = 'refresh_token=; Max-Age=0; path=/';
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>S</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            SecureJobs
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {visible.map(link => {
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {username && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '4px 12px 4px 4px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 700,
              }}>
                {username[0].toUpperCase()}
              </div>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{username}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(239,68,68,0.25)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}