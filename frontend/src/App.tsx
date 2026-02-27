import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { API_BASE_URL } from './services/api';

// helper component that performs an auth check
function PrivateRoute({ children }: { children: JSX.Element }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/auth-check/`, {
          credentials: 'include',
        });
        setAuthed(res.ok);
      } catch (e) {
        setAuthed(false);
      }
    };
    check();
  }, []);

  if (authed === null) {
    return <div className="p-4">Checking authentication…</div>;
  }
  return authed ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;