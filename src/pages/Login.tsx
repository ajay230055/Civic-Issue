import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthRole } from '../types';
import { login, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const params = useParams<{ role?: AuthRole }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [role, setRole] = React.useState<AuthRole>(params.role ?? 'user');
  const [isFirstTime, setIsFirstTime] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const [username, setUsername] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [id, setId] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (role === 'user' && isFirstTime) {
        await registerUser({ username, phoneNumber, email, password });
        setMessage('Registration successful. You can now log in.');
        setIsFirstTime(false);
      } else {
        const res = await login({ role, id, email, username, password });
        auth.login({ token: res.token, role: res.role, username });
        setMessage('Logged in as ' + res.role);
        if (res.role === 'official') {
          navigate('/official');
        } else if (res.role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      setMessage('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card login-card">
        <h1 className="login-title">
          {role === 'user' ? 'User Login' : role === 'official' ? 'Officials Login' : 'Teachers Login'}
        </h1>
        <p className="login-subtitle">Welcome back. Please {isFirstTime && role === 'user' ? 'register to continue' : 'sign in to your account'}.</p>
        {!params.role && (
          <div className="tabs">
            <button className={`tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>User</button>
            <button className={`tab ${role === 'official' ? 'active' : ''}`} onClick={() => setRole('official')}>Officials</button>
            <button className={`tab ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>Teachers</button>
          </div>
        )}

        {role === 'user' && (
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="checkbox-row">
              <span>First time login (register)</span>
              <input type="checkbox" checked={isFirstTime} onChange={(e) => setIsFirstTime(e.target.checked)} />
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          {role === 'user' && isFirstTime ? (
            <>
              <div className="field">
                <label>Name *</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="field">
                <label>Phone Number *</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </>
          ) : (
            <>
              {(role === 'official' || role === 'teacher') && (
                <div className="field">
                  <label>ID</label>
                  <input value={id} onChange={(e) => setId(e.target.value)} required />
                </div>
              )}
              {role === 'user' && (
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              )}
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </>
          )}

          <button className="btn block" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isFirstTime && role === 'user' ? 'Register' : 'Login'}
          </button>
        </form>

        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;


