import React, { useState, useEffect } from 'react';
import { CivicHour, Issue } from '../types';
import { useRewards } from '../context/RewardsContext';
import { useToast } from '../context/ToastContext';
import { fetchCivicHours, verifyCivicHour, fetchIssues } from '../services/api';
import IssueList from '../components/IssueList';

const OfficialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'public'>('teacher');
  const [civicHours, setCivicHours] = useState<CivicHour[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedCivicHour, setSelectedCivicHour] = useState<CivicHour | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const rewards = useRewards();
  const toast = useToast();

  useEffect(() => {
    loadCivicHours();
    loadIssues();
  }, []);

  const loadCivicHours = async () => {
    try {
      const data = await fetchCivicHours();
      setCivicHours(data);
    } catch (error) {
      console.error('Failed to load civic hours:', error);
    }
  };

  const loadIssues = async () => {
    try {
      const data = await fetchIssues();
      setIssues(data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  };

  const handleVerification = async (civicHour: CivicHour, status: 'verified' | 'rejected') => {
    setVerifying(true);
    try {
      await verifyCivicHour(
        civicHour.id,
        status,
        'current-official',
        'Current Official',
        verificationNotes
      );

      // If verified, award points to teacher
      if (status === 'verified' && civicHour.rewardPoints) {
        // In a real app, this would update the teacher's points via API
        toast.push(`Verified! Teacher will receive ${civicHour.rewardPoints} points`);
      } else if (status === 'rejected') {
        toast.push('Civic hour rejected');
      }

      loadCivicHours();
      setSelectedCivicHour(null);
      setVerificationNotes('');
      
    } catch (error) {
      toast.push('Failed to verify civic hour');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'status-resolved';
      case 'rejected': return 'status-pending';
      case 'pending': return 'status-acknowledged';
      default: return 'status-pending';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const pendingCount = civicHours.filter(ch => ch.status === 'pending').length;
  const verifiedCount = civicHours.filter(ch => ch.status === 'verified').length;
  const civicHoursForTeacher = React.useMemo(() => {
    const pending = civicHours.filter(ch => ch.status === 'pending');
    return (pending.length > 0 ? pending : civicHours).slice(0, 1);
  }, [civicHours]);

  return (
    <div className="container">
      <h1>Official Dashboard</h1>
      <div className="tabs" style={{ display: 'flex', gap: 8, margin: '12px 0 20px' }}>
        <button className={`tab ${activeTab === 'teacher' ? 'active' : ''}`} onClick={() => setActiveTab('teacher')}>Teacher Portal</button>
        <button className={`tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>Public Portal</button>
      </div>

      {activeTab === 'teacher' && (
        <>
          <p>Verify teacher civic hour submissions.</p>
          <div className="stats-row">
            <div className="stat">Pending Verification: {pendingCount}</div>
            <div className="stat">Verified: {verifiedCount}</div>
            <div className="stat">Total Submissions: {civicHours.length}</div>
          </div>

          <h2>Civic Hour Verifications</h2>
          
          {civicHours.length === 0 ? (
            <div className="empty-state">
              <p>No civic hour submissions to verify.</p>
            </div>
          ) : (
            <div className="civic-hours-list">
              {civicHoursForTeacher.map((civicHour) => (
                <div key={civicHour.id} className="civic-hour-card">
                  <div className="civic-hour-header">
                    <div className="civic-hour-title-section">
                      <h3>{civicHour.title}</h3>
                      <div className="civic-hour-meta">
                        <span>School: {civicHour.schoolName}</span>
                        <span>Teacher: {civicHour.teacherName}</span>
                        <span>Date: {formatDate(civicHour.date)}</span>
                        <span>Duration: {civicHour.duration}h</span>
                      </div>
                    </div>
                    <div className="civic-hour-status">
                      <span className={`status-badge ${getStatusColor(civicHour.status)}`}>
                        {getStatusDisplayName(civicHour.status)}
                      </span>
                      {civicHour.rewardPoints && (
                        <span className="reward-badge">
                          {civicHour.rewardPoints} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="civic-hour-description">
                    {civicHour.description}
                  </div>

                  <div className="civic-hour-images">
                    <div className="image-section">
                      <h4>Activity Images ({civicHour.images.length})</h4>
                      <div className="image-grid">
                        {civicHour.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Activity ${index + 1}`}
                            className="civic-hour-image"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="image-section">
                      <h4>Proof Images ({civicHour.proofImages.length})</h4>
                      <div className="image-grid">
                        {civicHour.proofImages.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Proof ${index + 1}`}
                            className="civic-hour-image"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {civicHour.status === 'pending' && (
                    <div className="civic-hour-actions">
                      <div className="verification-notes">
                        <label htmlFor={`notes-${civicHour.id}`}>Verification Notes:</label>
                        <textarea
                          id={`notes-${civicHour.id}`}
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="Add any notes about the verification..."
                          rows={2}
                        />
                      </div>
                      <div className="verification-buttons">
                        <button
                          className="btn btn-reject"
                          onClick={() => handleVerification(civicHour, 'rejected')}
                          disabled={verifying}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-verify"
                          onClick={() => handleVerification(civicHour, 'verified')}
                          disabled={verifying}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  {civicHour.status !== 'pending' && civicHour.verificationNotes && (
                    <div className="verification-result">
                      <strong>Verification Notes:</strong> {civicHour.verificationNotes}
                      <br />
                      <small>Verified by {civicHour.verifiedByName} on {formatDate(civicHour.verifiedAt!)}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'public' && (
        <>
          <p>All issues submitted by the public.</p>
          <IssueList issues={issues} />
        </>
      )}

    </div>
  );
};

export default OfficialDashboard;
