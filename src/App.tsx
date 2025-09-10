import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import IssueDetail from './pages/IssueDetail';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';
import './styles/App.css';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RewardsProvider, useRewards } from './context/RewardsContext';
import { ToastProvider } from './context/ToastContext';
import MyIssues from './pages/MyIssues';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import OfficialDashboard from './pages/OfficialDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

const Header: React.FC = () => {
  const { token, role, username, logout } = useAuth();
  const { total } = useRewards();
  return (
    <div className="appbar">
      <h1>Civic Issue Application</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {token ? (
          <>
            <Link className="btn" to="/issues/new">Report Issue</Link>
            <Link className="btn" to="/home">Home</Link>
            <Link className="btn" to="/my">My Issues</Link>
            <Link className="btn" to="/leaderboard">Leaderboard</Link>
            <span className="badge badge-aqua">Rewards: {total}</span>
            <span style={{ color: 'var(--muted)' }}>{role}{username ? ` · ${username}` : ''}</span>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link className="btn" to="/login">Login</Link>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RewardsProvider>
          <ToastProvider>
            <div className="App">
              <Header />
              <Routes>
                <Route path="/" element={<RoleSelect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/issues" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/issues/new" element={<ProtectedRoute><IssueForm /></ProtectedRoute>} />
                <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
                <Route path="/my" element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/official" element={<ProtectedRoute><OfficialDashboard /></ProtectedRoute>} />
                <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
              </Routes>
            </div>
          </ToastProvider>
        </RewardsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;