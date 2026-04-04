import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Recruiter from './pages/Recruiter';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import { API_BASE_URL } from './services/api';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/auth-check/`, { credentials: 'include' })
      .then(res => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>
      Checking authentication…
    </div>
  );
  return authed ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
        <Route path="/recruiter" element={<PrivateRoute><Recruiter /></PrivateRoute>} />
        <Route path="/admin-panel" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;