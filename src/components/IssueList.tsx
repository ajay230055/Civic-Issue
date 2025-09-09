import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types';
import VoteButtons from './VoteButtons';

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <div className="container">
      <h2 style={{ textAlign: 'left' }}>Submitted Civic Issues</h2>
      <ul className="list">
        {issues.map((issue) => (
          <li key={issue.id}>
            <div className="row">
              <h3 style={{ margin: 0 }}>
                <Link to={`/issues/${issue.id}`}>{issue.description}</Link>
              </h3>
              {typeof issue.rewardPoints === 'number' && <span className="badge badge-aqua">{issue.rewardPoints} pts</span>}
            </div>
            <div className="meta">
              <span className={`badge ${issue.status === 'completed' ? 'badge-green' : issue.status === 'in_progress' ? 'badge-yellow' : 'badge-red'}`}>{issue.status.replace('_',' ')}</span>
              <span className="badge">{issue.category}</span>
              <span className="badge">Priority: {issue.priority}</span>
            </div>
            <VoteButtons issueId={issue.id} upvotes={issue.upvotes} downvotes={issue.downvotes} />
            {issue.images && issue.images.length > 0 && (
              <img
                src={issue.images[0]}
                alt={issue.description}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueList;