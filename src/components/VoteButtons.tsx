import React from 'react';
import { voteIssue } from '../services/api';

const VoteButtons: React.FC<{ issueId: string; upvotes: number; downvotes: number; onChange?: () => void }>
  = ({ issueId, upvotes, downvotes, onChange }) => {
  const [busy, setBusy] = React.useState(false);
  const vote = async (delta: 1 | -1) => {
    if (busy) return;
    setBusy(true);
    try {
      await voteIssue(issueId, delta);
      onChange?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={() => vote(1)} disabled={busy}>⬆ {upvotes}</button>
      <button onClick={() => vote(-1)} disabled={busy}>⬇ {downvotes}</button>
    </div>
  );
};

export default VoteButtons;


