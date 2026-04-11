import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getAuditLogs,
  getMyProfile,
  getAdminUsers,
  toggleUserSuspend,
  deleteUser,
  getAdminPosts,
  deleteAdminPost,
  getAdminReports,
  resolveAdminReport
} from '../services/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  
  // Data States
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'reports' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Audit Chain
  const [verifying, setVerifying] = useState(false);
  const [chainValid, setChainValid] = useState<boolean | null>(null);

  useEffect(() => {
    getMyProfile().then(p => {
      setProfile(p);
      if (p.role !== 'ADMIN') navigate('/dashboard');
    }).catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    if (!profile || profile.role !== 'ADMIN') return;
    setLoading(true);
    
    const fetchers = {
      users: getAdminUsers().then(setUsers),
      posts: getAdminPosts().then(setPosts),
      reports: getAdminReports().then(setReports),
      logs: getAuditLogs().then(l => {
         setLogs(l);
         // Auto verify chain on load
         let valid = true;
         for (let i = 1; i < l.length; i++) {
           if (l[i].prev_hash !== l[i - 1].current_hash) {
             valid = false;
             break;
           }
         }
         setChainValid(valid);
      })
    };
    
    fetchers[activeTab].catch(() => setError(`Failed to load ${activeTab}.`)).finally(() => setLoading(false));

  }, [activeTab, profile]);

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const freshLogs = await getAuditLogs();
      setLogs(freshLogs);
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

  const handleSuspend = async (uid: number) => {
    try {
      await toggleUserSuspend(uid);
      setUsers(users.map(u => u.id === uid ? { ...u, is_active: !u.is_active } : u));
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteUser = async (uid: number) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await deleteUser(uid);
      setUsers(users.filter(u => u.id !== uid));
    } catch (e: any) { alert(e.message); }
  };

  const handleDeletePost = async (pid: number) => {
    if (!window.confirm("Permanently delete this post?")) return;
    try {
      await deleteAdminPost(pid);
      setPosts(posts.filter(p => p.id !== pid));
    } catch (e: any) { alert(e.message); }
  };

  const handleResolveReport = async (rid: number) => {
    try {
      await resolveAdminReport(rid);
      setReports(reports.map(r => r.id === rid ? { ...r, is_resolved: true } : r));
    } catch (e: any) { alert(e.message); }
  };

  const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    LOGIN_SUCCESS: { bg: '#dbeafe', text: '#1e40af' },
    REGISTER:      { bg: '#d1fae5', text: '#065f46' },
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role={profile?.role} username={profile?.username} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Admin</h1>
            <p className="text-slate-500 mt-1">Manage users, moderate content, and audit logs.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="border-b border-slate-200 mb-6 flex gap-6">
          {(['users', 'posts', 'reports', 'logs'] as const).map(tab => (
            <button key={tab} 
              onClick={() => { setActiveTab(tab); setError(''); }}
              className={`pb-3 px-1 font-semibold text-sm capitalize border-b-2 transition ${
                activeTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {tab.replace('logs', 'Audit Logs')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* USERS TAB */}
            {activeTab === 'users' && (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4"><div className="font-bold text-slate-900">{u.username}</div><div className="text-slate-500 text-xs">{u.email || 'No email'}</div></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{u.role}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {u.role !== 'ADMIN' && (
                           <>
                            <button onClick={() => handleSuspend(u.id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                              {u.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                           </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* POSTS TAB */}
            {activeTab === 'posts' && (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Content snippet</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 font-bold">{p.author_username}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{p.content}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeletePost(p.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Target</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map(r => (
                    <tr key={r.id} className={r.is_resolved ? "bg-slate-50 opacity-60" : ""}>
                      <td className="px-6 py-4 font-bold">{r.reporter_username}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {r.reported_user && <div>User: <span className="font-semibold">{r.reported_user}</span></div>}
                        {r.reported_post_content && <div className="truncate max-w-[150px]">Post: "{r.reported_post_content}"</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-800">{r.reason}</td>
                      <td className="px-6 py-4 font-bold text-xs">{r.is_resolved ? 'Resolved' : 'Pending'}</td>
                      <td className="px-6 py-4 text-right">
                        {!r.is_resolved && (
                          <button onClick={() => handleResolveReport(r.id)} className="text-emerald-600 hover:text-emerald-800 font-bold">Mark Resolved</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'logs' && (
              <div>
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex gap-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${chainValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                       {chainValid === null ? 'Checking chain...' : chainValid ? '✓ Hash Chain Intact' : '⚠ CHAIN TAMPERED'}
                     </span>
                  </div>
                  <button onClick={verifyChain} disabled={verifying} className="px-4 py-2 bg-slate-800 text-white rounded text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
                    {verifying ? 'Verifying...' : 'Compute Chain'}
                  </button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Prev Hash</th>
                      <th className="px-4 py-3">Current Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-xs">
                    {[...logs].reverse().map((log, idx, arr) => {
                      const cfg = ACTION_COLORS[log.action] || { bg: '#f1f5f9', text: '#475569' };
                      const isLinked = idx < arr.length - 1 ? log.prev_hash === arr[idx+1].current_hash : log.prev_hash === '0'.repeat(64);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-400 font-sans font-bold">{log.id}</td>
                          <td className="px-4 py-3 font-sans">
                            <span style={{ background: cfg.bg, color: cfg.text }} className="px-2 py-0.5 rounded font-bold">{log.action}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-400">
                            {log.prev_hash === '0'.repeat(64) ? <span className="text-slate-300">GENESIS</span> : log.prev_hash.substring(0, 16)}...
                          </td>
                          <td className="px-4 py-3 font-bold flex items-center gap-2">
                             <span className={isLinked ? 'text-emerald-500' : 'text-red-500'}>{log.current_hash.substring(0, 16)}...</span>
                             {!isLinked && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-sans">Broken Link</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}