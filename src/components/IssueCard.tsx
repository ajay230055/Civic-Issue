import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types';
import IssueCompletionModal from './IssueCompletionModal';
import { completeIssue } from '../services/api';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-resolved';
      case 'in_progress':
        return 'status-acknowledged';
      case 'not_completed':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'infrastructure': 'Infrastructure',
      'sanitation': 'Trash & Sanitation',
      'water_supply': 'Water Supply',
      'electricity': 'Streetlights',
      'roads': 'Roads',
      'parks': 'Parks & Recreation',
      'education': 'Education',
      'healthcare': 'Healthcare',
      'waste_management': 'Waste Management',
      'security': 'Security',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      'completed': 'Resolved',
      'in_progress': 'Acknowledged',
      'not_completed': 'Pending'
    };
    return statusMap[status] || status;
  };

  const getDepartmentName = (category: string) => {
    const departmentMap: Record<string, string> = {
      'infrastructure': 'Public Works',
      'sanitation': 'Sanitation',
      'water_supply': 'Water Department',
      'electricity': 'Parks & Recreation',
      'roads': 'Transportation',
      'parks': 'Parks & Recreation',
      'education': 'Education',
      'healthcare': 'Health Department',
      'waste_management': 'Sanitation',
      'security': 'Public Safety',
      'other': 'General Services'
    };
    return departmentMap[category] || 'General Services';
  };

  return (
    <div className="issue-card">
      <div className="issue-card-header">
        <div className="issue-title-section">
          <h3 className="issue-title">{issue.title}</h3>
          <div className="issue-meta">
            <span className="report-id">Report ID: #{issue.id.slice(-4)}</span>
            <span className="category">• {getCategoryDisplayName(issue.category)}</span>
          </div>
        </div>
        {issue.images && issue.images.length > 0 && (
          <div className="image-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
        )}
      </div>

      <div className="issue-location">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>{issue.location.address}</span>
      </div>

      <div className="issue-description">
        {issue.description}
      </div>

      <div className="issue-submission-info">
        <span>Submitted: {formatDate(issue.createdAt)}</span>
        <span>Department: {getDepartmentName(issue.category)}</span>
        {issue.status === 'completed' && issue.completedAt && (
          <>
            <span>Completed: {formatDate(issue.completedAt)}</span>
            {issue.completedByName && (
              <span>
                By: {issue.completedByName} 
                {issue.completedByRole && ` (${issue.completedByRole})`}
              </span>
            )}
          </>
        )}
      </div>

      <div className="issue-card-footer">
        <div className="issue-status-badges">
          <span className={`status-badge ${getStatusColor(issue.status)}`}>
            {getStatusDisplayName(issue.status)}
          </span>
          <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
          </span>
          {issue.status === 'completed' && issue.completionReward && (
            <span className="reward-badge">
              +{issue.completionReward} pts
            </span>
          )}
        </div>

        <div className="issue-actions">
          <Link to={`/issues/${issue.id}`} className="action-btn view-details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Details
          </Link>
          <button className="action-btn add-comment">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Add Comment
          </button>
          {issue.status !== 'completed' && (
            <button 
              className="action-btn complete-issue"
              onClick={() => setShowCompletionModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Complete Issue
            </button>
          )}
        </div>
      </div>
      
      <IssueCompletionModal
        issue={issue}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={async (completionProof, reward) => {
          try {
            await completeIssue(
              issue.id,
              completionProof,
              'current-user', // This would come from auth context
              'Current User', // This would come from auth context
              'user' // This would come from auth context
            );
            setShowCompletionModal(false);
            // Refresh the page to show updated issue status
            window.location.reload();
          } catch (error) {
            console.error('Failed to complete issue:', error);
          }
        }}
      />
    </div>
  );
};

export default IssueCard;
