import React from 'react';
import { IssueCategory, IssuePriority, IssueStatus } from '../types';

export interface Filters {
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
}

const FilterBar: React.FC<{ value: Filters; onChange: (next: Filters) => void }> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <select value={value.category || ''} onChange={(e) => onChange({ ...value, category: (e.target.value || undefined) as IssueCategory | undefined })}>
        <option value="">All Categories</option>
        <option value="infrastructure">Infrastructure</option>
        <option value="sanitation">Sanitation</option>
        <option value="water_supply">Water Supply</option>
        <option value="electricity">Electricity</option>
        <option value="roads">Roads</option>
        <option value="parks">Parks</option>
        <option value="education">Education</option>
        <option value="healthcare">Healthcare</option>
        <option value="waste_management">Waste Management</option>
        <option value="security">Security</option>
        <option value="other">Other</option>
      </select>

      <select value={value.status || ''} onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as IssueStatus | undefined })}>
        <option value="">All Statuses</option>
        <option value="not_completed">Not Completed</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select value={value.priority || ''} onChange={(e) => onChange({ ...value, priority: (e.target.value || undefined) as IssuePriority | undefined })}>
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>
  );
};

export default FilterBar;


