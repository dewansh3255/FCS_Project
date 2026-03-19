import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getApplications, getMyProfile } from '../services/api';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  APPLIED:     { label: 'Applied',     bg: '#dbeafe', text: '#1e40af', icon: '📨' },
  REVIEWED:    { label: 'Reviewed',    bg: '#fef9c3', text: '#854d0e', icon: '👀' },
  INTERVIEWED: { label: 'Interviewed', bg: '#ede9fe', text: '#5b21b6', icon: '🎤' },
  REJECTED:    { label: 'Rejected',    bg: '#fee2e2', text: '#991b1b', icon: '❌' },
  OFFER:       { label: 'Offer',       bg: '#dcfce7', text: '#166534', icon: '🎉' },
};

const STATUS_ORDER = ['APPLIED', 'REVIEWED', 'INTERVIEWED', 'REJECTED', 'OFFER'];

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => navigate('/login'));
    getApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL'
    ? applications
    : applications.filter(a => a.status === filter);

  const counts: Record<string, number> = { ALL: applications.length };
  STATUS_ORDER.forEach(s => {
    counts[s] = applications.filter(a => a.status === s).length;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar role={profile?.role} username={profile?.username || localStorage.getItem('username') || ''} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>My Applications</h1>
          <p style={{ color: '#64748b', marginTop: 6 }}>Track the status of your job applications</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          {STATUS_ORDER.map(status => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} style={{
                background: '#fff', borderRadius: 12,
                padding: '16px', textAlign: 'center',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                border: filter === status ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }} onClick={() => setFilter(filter === status ? 'ALL' : status)}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                  {counts[status] || 0}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
          {['ALL', ...STATUS_ORDER].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === s ? '#3b82f6' : '#e2e8f0',
                color: filter === s ? '#fff' : '#475569',
              }}
            >
              {s === 'ALL' ? `All (${counts.ALL})` : `${STATUS_CONFIG[s].label} (${counts[s] || 0})`}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 60,
            background: '#fff', borderRadius: 16,
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#64748b', fontSize: 16 }}>
              {applications.length === 0
                ? "You haven't applied to any jobs yet."
                : 'No applications with this status.'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={() => navigate('/jobs')}
                style={{
                  marginTop: 12, background: '#3b82f6', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '10px 24px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            {filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
              const currentIdx = STATUS_ORDER.indexOf(app.status);
              return (
                <div key={app.id} style={{
                  background: '#fff', borderRadius: 16,
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  padding: 24, border: '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                        {app.job_title}
                      </h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span style={{
                      background: cfg.bg, color: cfg.text,
                      fontSize: 12, fontWeight: 700, padding: '5px 14px',
                      borderRadius: 20,
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {app.status !== 'REJECTED' && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        {['APPLIED', 'REVIEWED', 'INTERVIEWED', 'OFFER'].map((s, i) => {
                          const stepIdx = STATUS_ORDER.indexOf(s);
                          const done = currentIdx >= stepIdx && app.status !== 'REJECTED';
                          return (
                            <div key={s} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', flex: 1 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: done ? '#3b82f6' : '#e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, color: done ? '#fff' : '#94a3b8',
                                fontWeight: 700, transition: 'all 0.3s',
                              }}>
                                {done ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: 10, color: done ? '#3b82f6' : '#94a3b8', marginTop: 4, fontWeight: 600 }}>
                                {STATUS_CONFIG[s].label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {app.cover_note && (
                    <div style={{
                      background: '#f8fafc', borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, color: '#475569', marginBottom: 12,
                      borderLeft: '3px solid #cbd5e1',
                    }}>
                      <span style={{ fontWeight: 600 }}>Your note: </span>{app.cover_note}
                    </div>
                  )}
                  {app.recruiter_notes && (
                    <div style={{
                      background: '#f0fdf4', borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, color: '#166534', borderLeft: '3px solid #86efac',
                    }}>
                      <span style={{ fontWeight: 600 }}>Recruiter feedback: </span>{app.recruiter_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}