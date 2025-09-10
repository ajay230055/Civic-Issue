import React from 'react';
import { Issue } from '../types';
import IssueCard from './IssueCard';

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <div className="container">
      <h2 style={{ textAlign: 'left', marginBottom: '24px' }}>Submitted Civic Issues</h2>
      <div className="issues-list">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default IssueList;