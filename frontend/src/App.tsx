import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

// A placeholder for the dashboard you'll build later
const DashboardPlaceholder = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold text-green-600">✅ You are successfully logged in!</h1>
    <p className="mt-4">Your keys are generated and session is secured.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;