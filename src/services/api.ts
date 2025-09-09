import { Issue, LoginCredentials, RegistrationData, Comment, IssueStatus, IssuePriority, IssueCategory } from '../types';

const STORAGE_ISSUES = 'issues_store_v1';

function readIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(STORAGE_ISSUES);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Issue[];
    return arr.map((i) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      updatedAt: new Date(i.updatedAt),
      resolvedAt: i.resolvedAt ? new Date(i.resolvedAt) : undefined,
      estimatedResolutionDate: i.estimatedResolutionDate ? new Date(i.estimatedResolutionDate) : undefined,
      comments: (i.comments || []).map((c) => ({ ...c, createdAt: new Date(c.createdAt) })),
    }));
  } catch {
    return [];
  }
}

function writeIssues(issues: Issue[]): void {
  localStorage.setItem(STORAGE_ISSUES, JSON.stringify(issues));
}

export const fetchIssues = async (): Promise<Issue[]> => {
  return readIssues();
};

export const submitIssue = async (issueData: Partial<Issue>): Promise<Issue> => {
  const issues = readIssues();
  const id = issueData.id || Math.random().toString(36).slice(2);
  const now = new Date();
  const computeRewardPoints = (category: IssueCategory): number => {
    switch (category) {
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
  const newIssue: Issue = {
    id,
    title: issueData.title || 'Issue',
    description: issueData.description || '',
    category: (issueData.category as IssueCategory) || 'other',
    priority: (issueData.priority as IssuePriority) || 'low',
    status: (issueData.status as IssueStatus) || 'not_completed',
    location: issueData.location || { address: 'Unknown', coordinates: { lat: 0, lng: 0 } },
    images: issueData.images || [],
    reporterId: issueData.reporterId || 'me',
    reporterName: issueData.reporterName || 'Current User',
    assignedOfficialId: issueData.assignedOfficialId,
    assignedOfficialName: issueData.assignedOfficialName,
    createdAt: now,
    updatedAt: now,
    resolvedAt: issueData.resolvedAt,
    estimatedResolutionDate: issueData.estimatedResolutionDate,
    comments: issueData.comments || [],
    tags: issueData.tags || [],
    upvotes: issueData.upvotes || 0,
    downvotes: issueData.downvotes || 0,
    isPublic: issueData.isPublic ?? true,
    rewardPoints: ((issueData.status as IssueStatus) === 'completed' && (issueData.images?.length || 0) > 0)
      ? computeRewardPoints((issueData.category as IssueCategory) || 'other') + 10
      : computeRewardPoints((issueData.category as IssueCategory) || 'other'),
  };
  issues.unshift(newIssue);
  writeIssues(issues);
  return newIssue;
};

export const fetchIssueById = async (id: string): Promise<Issue> => {
  const issues = readIssues();
  const found = issues.find((i) => i.id === id);
  if (!found) throw new Error('Issue not found');
  return found;
};

export const addComment = async (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Issue> => {
  const issues = readIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) throw new Error('Issue not found');
  const newComment: Comment = { id: Math.random().toString(36).slice(2), createdAt: new Date(), ...comment };
  issues[idx] = { ...issues[idx], comments: [...issues[idx].comments, newComment], updatedAt: new Date() };
  writeIssues(issues);
  return issues[idx];
};

export const voteIssue = async (issueId: string, delta: 1 | -1): Promise<Issue> => {
  const issues = readIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) throw new Error('Issue not found');
  const issue = issues[idx];
  const updated = {
    ...issue,
    upvotes: issue.upvotes + (delta === 1 ? 1 : 0),
    downvotes: issue.downvotes + (delta === -1 ? 1 : 0),
    updatedAt: new Date(),
  };
  issues[idx] = updated;
  writeIssues(issues);
  return updated;
};

export const updateIssueStatus = async (issueId: string, status: IssueStatus): Promise<Issue> => {
  const issues = readIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) throw new Error('Issue not found');
  const updated = { ...issues[idx], status, updatedAt: new Date() };
  issues[idx] = updated;
  writeIssues(issues);
  return updated;
};

export const assignOfficial = async (issueId: string, officialId: string, officialName: string): Promise<Issue> => {
  const issues = readIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) throw new Error('Issue not found');
  const updated = { ...issues[idx], assignedOfficialId: officialId, assignedOfficialName: officialName, updatedAt: new Date() };
  issues[idx] = updated;
  writeIssues(issues);
  return updated;
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
};

export const login = async (credentials: LoginCredentials) => {
  return { token: 'fake-token', role: credentials.role };
};

export const registerUser = async (data: RegistrationData) => {
  return { success: true };
};