import React, { useState } from 'react';
import UploadImage from '../components/UploadImage';
import { useRewards } from '../context/RewardsContext';
import { useToast } from '../context/ToastContext';
import { CivicHour } from '../types';
import { submitCivicHour, fetchCivicHours } from '../services/api';

const TeacherDashboard: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [activityImages, setActivityImages] = useState<File[]>([]);
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(1);
  const [category, setCategory] = useState<CivicHour['category']>('community_service');
  const [submitting, setSubmitting] = useState(false);
  
  const rewards = useRewards();
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title || !description || !schoolName || activityImages.length === 0 || proofImages.length === 0) {
      toast.push('Please fill all required fields and upload images');
      return;
    }

    setSubmitting(true);
    try {
      // Create civic hour entry
      const civicHourData = {
        title,
        description,
        schoolName,
        teacherId: 'current-teacher',
        teacherName: 'Current Teacher',
        images: activityImages.map(file => URL.createObjectURL(file)),
        proofImages: proofImages.map(file => URL.createObjectURL(file)),
        date: new Date(date),
        duration,
        category,
        status: 'pending' as const,
        rewardPoints: duration * 10, // 10 points per hour
      };

      await submitCivicHour(civicHourData);
      toast.push(`Civic hour submitted! ${duration * 10} points will be awarded after verification`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSchoolName('');
      setActivityImages([]);
      setProofImages([]);
      setDuration(1);
      setCategory('community_service');
      
    } catch (error) {
      toast.push('Failed to submit civic hour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivityImageUpload = (file: File) => {
    setActivityImages(prev => [...prev, file]);
  };

  const handleProofImageUpload = (file: File) => {
    setProofImages(prev => [...prev, file]);
  };

  return (
    <div className="container">
      <h1>Teacher Dashboard</h1>
      <p>Upload your civic hour activities and proof for verification by officials.</p>
      
      <div className="stats-row">
        <div className="stat">Total Points: {rewards.total}</div>
        <div className="stat">Pending Verification: {JSON.parse(localStorage.getItem('civic_hours') || '[]').filter((ch: CivicHour) => ch.status === 'pending').length}</div>
      </div>

      <form onSubmit={handleSubmit} className="IssueForm">
        <div className="form-grid">
          <div className="field span-2">
            <label htmlFor="title">Activity Title *</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Community Cleanup Drive"
              required
            />
          </div>

          <div className="field span-2">
            <label htmlFor="description">Activity Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the civic hour activity in detail..."
              rows={4}
              required
            />
          </div>

          <div className="row-compact span-2">
            <div className="field">
              <label htmlFor="schoolName">School Name *</label>
              <input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Your school name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="date">Activity Date *</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row-compact span-2">
            <div className="field">
              <label htmlFor="duration">Duration (Hours) *</label>
              <input
                id="duration"
                type="number"
                min="1"
                max="24"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CivicHour['category'])}
                required
              >
                <option value="community_service">Community Service</option>
                <option value="environmental">Environmental</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="section span-2">
            <h4 className="section-title">Activity Images *</h4>
            <UploadImage onImageUpload={handleActivityImageUpload} />
            <div className="hint">Upload photos showing the civic hour activity in progress</div>
            {activityImages.length > 0 && (
              <div className="uploaded-images">
                <p>Uploaded: {activityImages.length} image(s)</p>
              </div>
            )}
          </div>

          <div className="section span-2">
            <h4 className="section-title">Proof Images *</h4>
            <UploadImage onImageUpload={handleProofImageUpload} />
            <div className="hint">Upload photos proving the completion of the civic hour activity</div>
            {proofImages.length > 0 && (
              <div className="uploaded-images">
                <p>Uploaded: {proofImages.length} image(s)</p>
              </div>
            )}
          </div>

          <div className="actions span-2">
            <span className="badge badge-aqua">Potential Reward: {duration * 10} pts</span>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Civic Hour'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherDashboard;
