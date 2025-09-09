import React from 'react';
import { Issue } from '../types';
import { fetchIssues } from '../services/api';
import IssueList from '../components/IssueList';

const MyIssues: React.FC = () => {
  const [issues, setIssues] = React.useState<Issue[]>([]);
  React.useEffect(()=>{ fetchIssues().then((all)=> setIssues(all.filter(i=> i.reporterId === 'me'))); },[]);
  return (
    <div className="container">
      <h1>My Issues</h1>
      <IssueList issues={issues} />
    </div>
  );
};

export default MyIssues;


