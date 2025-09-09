import React, { useState } from 'react';
import UploadImage from './UploadImage';
import { submitIssue } from '../services/api';
import { IssueCategory, IssueStatus, IssuePriority } from '../types';
import { useNavigate } from 'react-router-dom';
import { useRewards } from '../context/RewardsContext';
import { useToast } from '../context/ToastContext';
import LocationCapture from './LocationCapture';

const IssueForm: React.FC = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<IssueCategory>('other');
  const [status, setStatus] = useState<IssueStatus>('not_completed');
  const [priority, setPriority] = useState<IssuePriority>('low');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [hasPhoto, setHasPhoto] = useState(false);
  const rewards = useRewards();
  const toast = useToast();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const baseReward = (cat: IssueCategory): number => {
    switch (cat) {
      case 'sanitation': return 10;
      case 'waste_management': return 12;
      case 'water_supply': return 14;
      case 'electricity': return 14;
      case 'roads': return 16;
      case 'infrastructure': return 15;
      case 'parks': return 8;
      case 'education': return 9;
      case 'healthcare': return 18;
      case 'security': return 20;
      default: return 5;
    }
  };
  const rewardPreview = baseReward(category) + (status === 'completed' && hasPhoto ? 10 : 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const imageUrl = image ? URL.createObjectURL(image) : undefined;
      if (status === 'completed' && !imageUrl) {
        alert('Please capture and upload a photo to mark as completed.');
        setSubmitting(false);
        return;
      }
      const created = await submitIssue({
        id: Math.random().toString(36).slice(2),
        title: description.slice(0, 30) || 'Issue',
        description,
        category,
        priority,
        status,
        location: coords ? {
          address: address || 'Captured',
          coordinates: coords,
        } : {
          address: 'Unknown',
          coordinates: { lat: 0, lng: 0 },
        },
        images: imageUrl ? [imageUrl] : [],
        reporterId: 'me',
        reporterName: 'Current User',
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [],
        tags: [],
        upvotes: 0,
        downvotes: 0,
        isPublic: true,
      } as any);
      if (typeof created.rewardPoints === 'number') {
        rewards.add(created.rewardPoints);
        toast.push(`Issue submitted · +${created.rewardPoints} pts`);
      }
      navigate(`/issues/${created.id}`);
    } catch (e) {
      alert('Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="IssueForm">
      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="description">Issue Title</label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the issue"
            required
          />
        </div>
        <div className="row-compact span-2">
          <div className="field">
            <label>Issue Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)}>
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
          </div>
          <div className="field">
            <label>Urgency Level</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="section">
          <h4 className="section-title">Completion</h4>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)}>
              <option value="not_completed">Not Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="hint">If completed, please capture a photo as proof. Adds +10 reward.</div>
          </div>
        </div>
        <LocationCapture onCapture={(c, addr)=> { setCoords(c); setAddress(addr || null); }} />
        {status === 'completed' && (
          <div className="section span-2">
            <h4 className="section-title">Upload Proof</h4>
            <UploadImage onImageUpload={(f) => { setImage(f); setHasPhoto(!!f); }} />
            <div className="hint">Required when completed. Photos are compressed for faster upload.</div>
          </div>
        )}
        <div className="actions span-2">
          <span className="badge badge-aqua">Reward: {rewardPreview} pts</span>
          <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Submitting…' : 'Report Issue'}</button>
        </div>
      </div>
    </form>
  );
};

export default IssueForm;