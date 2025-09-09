import React from 'react';
import IssueList from '../components/IssueList';
import IssueForm from '../components/IssueForm';
import { Issue } from '../types';
import { fetchIssues } from '../services/api';
import FilterBar, { Filters } from '../components/FilterBar';
import SearchBar from '../components/SearchBar';

const Home: React.FC = () => {
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<Filters>({});
  const [query, setQuery] = React.useState('');
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'completed').length;
  const critical = issues.filter((i) => i.priority === 'critical').length;

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
      } catch (e) {
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = issues.filter((i) => {
    if (filters.category && i.category !== filters.category) return false;
    if (filters.status && i.status !== filters.status) return false;
    if (filters.priority && i.priority !== filters.priority) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!i.description.toLowerCase().includes(q) && !i.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="container">
      <h1>Civic Issue Addressing Application</h1>
      <p>Report civic issues in your area by submitting a description and an image.</p>
      <div style={{ display: 'flex', gap: 16, margin: '12px 0' }}>
        <div className="stat">Total: {total}</div>
        <div className="stat">Resolved: {resolved}</div>
        <div className="stat">Critical: {critical}</div>
      </div>
      <IssueForm />
      <h2>Submitted Issues</h2>
      <SearchBar value={query} onChange={setQuery} />
      <FilterBar value={filters} onChange={setFilters} />
      {error && <div>{error}</div>}
      {loading ? <div>Loading...</div> : <IssueList issues={filtered} />}
    </div>
  );
};

export default Home;