import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuditLogs, getMyProfile } from '../services/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [chainValid, setChainValid] = useState<boolean | null>(null);

  useEffect(() => {
    getMyProfile()
      .then(p => {
        setProfile(p);
        if (p.role !== 'ADMIN') navigate('/dashboard');
      })
      .catch(() => navigate('/login'));

    getAuditLogs()
      .then(setLogs)
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  const verifyChain = async () => {
    setVerifying(true);
    // Re-fetch fresh logs then verify
    try {
      const freshLogs = await getAuditLogs();
      // Import sha256 via SubtleCrypto
      let valid = true;
      for (let i = 1; i < freshLogs.length; i++) {
        if (freshLogs[i].prev_hash !== freshLogs[i - 1].current_hash) {
          valid = false;
          break;
        }
      }
      setChainValid(valid);
    } catch {
      setError('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    LOGIN_SUCCESS: { bg: '#dbeafe', text: '#1e40af' },
    REGISTER:      { bg: '#d1fae5', text: '#065f46' },
    RESUME_UPLOAD: { bg: '#ede9fe', text: '#5b21b6' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar role={profile?.role} username={profile?.username || localStorage.getItem('username') || ''} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>Admin Panel</h1>
            <p style={{ color: '#64748b', marginTop: 6 }}>Tamper-evident audit log — hash-chained entries</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {chainValid !== null && (
              <div style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                background: chainValid ? '#dcfce7' : '#fee2e2',
                color: chainValid ? '#166534' : '#991b1b',
              }}>
                {chainValid ? '✓ Chain Intact' : '✗ Chain Tampered!'}
              </div>
            )}
            <button
              onClick={verifyChain}
              disabled={verifying}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: verifying ? 'not-allowed' : 'pointer', opacity: verifying ? 0.7 : 1,
              }}
            >
              {verifying ? 'Verifying...' : '🔗 Verify Chain'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Events', value: logs.length, color: '#3b82f6' },
            { label: 'Logins', value: logs.filter(l => l.action === 'LOGIN_SUCCESS').length, color: '#10b981' },
            { label: 'Registrations', value: logs.filter(l => l.action === 'REGISTER').length, color: '#8b5cf6' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', borderRadius: 14, padding: 20,
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Log Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Audit Log ({logs.length} entries)
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No audit logs yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#', 'Action', 'Timestamp', 'Hash (truncated)', 'Prev Hash'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontSize: 11,
                        fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((log, idx) => {
                    const cfg = ACTION_COLORS[log.action] || { bg: '#f1f5f9', text: '#475569' };
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                          {logs.length - idx}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: cfg.bg, color: cfg.text,
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          }}>{log.action}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#10b981', fontFamily: 'monospace' }}>
                          {log.current_hash.substring(0, 16)}...
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                          {log.prev_hash === '0'.repeat(64) ? 'genesis' : log.prev_hash.substring(0, 16) + '...'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}