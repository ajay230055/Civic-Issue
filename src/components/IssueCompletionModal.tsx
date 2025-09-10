import React, { useState } from 'react';
import { Issue } from '../types';
import { useRewards } from '../context/RewardsContext';
import { useToast } from '../context/ToastContext';
import UploadImage from './UploadImage';

interface IssueCompletionModalProps {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (completionProof: string[], reward: number) => void;
}

const IssueCompletionModal: React.FC<IssueCompletionModalProps> = ({
  issue,
  isOpen,
  onClose,
  onComplete
}) => {
  const [completionProof, setCompletionProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const rewards = useRewards();
  const toast = useToast();

  // Calculate completion reward based on category and priority
  const getCompletionReward = (): number => {
    const baseReward = (() => {
      switch (issue.category) {
        case 'sanitation': return 15;
        case 'waste_management': return 18;
        case 'water_supply': return 20;
        case 'electricity': return 20;
        case 'roads': return 25;
        case 'infrastructure': return 22;
        case 'parks': return 12;
        case 'education': return 15;
        case 'healthcare': return 30;
        case 'security': return 35;
        default: return 10;
      }
    })();

    const priorityMultiplier = (() => {
      switch (issue.priority) {
        case 'critical': return 1.5;
        case 'high': return 1.3;
        case 'medium': return 1.1;
        case 'low': return 1.0;
        default: return 1.0;
      }
    })();

    return Math.round(baseReward * priorityMultiplier);
  };

  const completionReward = getCompletionReward();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!completionProof) {
      toast.push('Please upload completion proof');
      return;
    }

    setSubmitting(true);
    try {
      const proofUrl = URL.createObjectURL(completionProof);
      onComplete([proofUrl], completionReward);
      
      // Add reward to user's total
      rewards.add(completionReward);
      toast.push(`Issue completed! +${completionReward} points earned`);
      
      onClose();
    } catch (error) {
      toast.push('Failed to complete issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Issue</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="issue-summary">
            <h3>{issue.title}</h3>
            <p className="issue-description">{issue.description}</p>
            <div className="issue-meta">
              <span className="badge">{issue.category}</span>
              <span className="badge priority-{issue.priority}">{issue.priority}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="completion-proof">Upload Completion Proof *</label>
              <UploadImage 
                onImageUpload={(file) => setCompletionProof(file)}
              />
              <div className="hint">
                Upload a photo showing that the issue has been resolved. This is required to complete the issue.
              </div>
            </div>

            <div className="reward-preview">
              <div className="reward-info">
                <span className="reward-label">Completion Reward:</span>
                <span className="reward-amount">+{completionReward} points</span>
              </div>
              <div className="reward-breakdown">
                <small>
                  Base reward: {Math.round(completionReward / (issue.priority === 'critical' ? 1.5 : issue.priority === 'high' ? 1.3 : issue.priority === 'medium' ? 1.1 : 1.0))} pts
                  {issue.priority !== 'low' && ` × ${issue.priority === 'critical' ? 1.5 : issue.priority === 'high' ? 1.3 : 1.1} (${issue.priority} priority)`}
                </small>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!completionProof || submitting}
              >
                {submitting ? 'Completing...' : 'Complete Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueCompletionModal;
