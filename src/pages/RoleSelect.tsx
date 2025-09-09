import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
        <h1 style={{ marginTop: 0, marginBottom: 16 }}>Choose Login Type</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn" onClick={() => navigate('/login/user')}>User Login</button>
          <button className="btn" onClick={() => navigate('/login/official')}>Officials Login</button>
          <button className="btn" onClick={() => navigate('/login/teacher')}>Teachers Login</button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;



