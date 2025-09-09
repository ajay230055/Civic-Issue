import React from 'react';
import { useParams } from 'react-router-dom';
import { Issue } from '../types';
import { addComment, assignOfficial, fetchIssueById, updateIssueStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState('');
  const [updating, setUpdating] = React.useState(false);
  const { role } = useAuth();

  React.useEffect(() => {
    const fetchIssue = async () => {
      try {
        if (!id) {
          setError('Invalid issue id.');
          return;
        }
        const fetchedIssue = await fetchIssueById(id);
        setIssue(fetchedIssue);
      } catch (err) {
        setError('Failed to fetch issue details.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!issue) {
    return <div>No issue found.</div>;
  }

  return (
    <div>
      <h1>Issue Detail</h1>
      <p>{issue.description}</p>
      <div className="meta" style={{ margin: '8px 0' }}>
        <span className="badge">Category: {issue.category}</span>
        <span className="badge">Priority: {issue.priority}</span>
        <span className="badge">Status: {issue.status.replace('_',' ')}</span>
      </div>
      <div style={{ margin: '8px 0' }}>
        <a
          href={`https://www.google.com/maps?q=${encodeURIComponent(issue.location.coordinates.lat)},${encodeURIComponent(issue.location.coordinates.lng)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="badge badge-aqua"
        >
          {issue.location.address}
        </a>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span className="stat">{issue.status.replace('_', ' ')}</span>
        {typeof issue.rewardPoints === 'number' && <span className="stat">Reward: {issue.rewardPoints}</span>}
      </div>
      {issue.images && issue.images.length > 0 && (
        <img src={issue.images[0]} alt={issue.description} />
      )}
      {role === 'official' && (
        <div style={{ marginTop: 16 }}>
          <h3>Official Controls</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={issue.status}
              onChange={async (e) => {
                setUpdating(true);
                try {
                  const updated = await updateIssueStatus(issue.id, e.target.value as any);
                  setIssue(updated);
                } finally {
                  setUpdating(false);
                }
              }}
              disabled={updating}
            >
              <option value="in_progress">In Progress</option>
              <option value="not_completed">Not Completed</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={async () => {
                const name = prompt('Assign to official name');
                const id = name ? name.toLowerCase().replace(/\s+/g, '-') : '';
                if (!name) return;
                setUpdating(true);
                try {
                  const updated = await assignOfficial(issue.id, id, name);
                  setIssue(updated);
                } finally {
                  setUpdating(false);
                }
              }}
              disabled={updating}
            >
              Assign Official
            </button>
            {issue.assignedOfficialName && <span>Assigned: {issue.assignedOfficialName}</span>}
          </div>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <h3>Comments</h3>
        <ul>
          {issue.comments.map((c) => (
            <li key={c.id}>
              <strong>{c.authorName}</strong>: {c.content}
            </li>
          ))}
        </ul>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const updated = await addComment(issue.id, {
                issueId: issue.id,
                authorId: 'me',
                authorName: 'Current User',
                authorRole: 'user',
                content: comment,
                isOfficial: false,
              });
              setIssue(updated);
              setComment('');
            } catch (e) {
              alert('Failed to add comment');
            }
          }}
        >
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" required />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

export default IssueDetail;