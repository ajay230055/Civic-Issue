import { Issue, LoginCredentials, RegistrationData, Comment, IssueStatus, IssuePriority, IssueCategory, CivicHour } from '../types';

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

export const completeIssue = async (
  issueId: string, 
  completionProof: string[], 
  completedById: string, 
  completedByName: string,
  completedByRole: 'user' | 'official' | 'teacher' = 'user'
): Promise<Issue> => {
  const issues = readIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) throw new Error('Issue not found');
  
  const issue = issues[idx];
  
  // Calculate completion reward
  const getCompletionReward = (): number => {
    const baseReward = (() => {
      switch (issue.category) {
        case 'sanitation': return 15;
        case 'waste_management': return 18;
        case 'water_supply': return 20;
        case 'electricity': return 20;
        case 'roads': return 25;
        case 'infrastructure': return 22;
        case 'parks': return 12;
        case 'education': return 15;
        case 'healthcare': return 30;
        case 'security': return 35;
        default: return 10;
      }
    })();

    const priorityMultiplier = (() => {
      switch (issue.priority) {
        case 'critical': return 1.5;
        case 'high': return 1.3;
        case 'medium': return 1.1;
        case 'low': return 1.0;
        default: return 1.0;
      }
    })();

    return Math.round(baseReward * priorityMultiplier);
  };

  const completionReward = getCompletionReward();
  const now = new Date();
  
  const updated: Issue = {
    ...issue,
    status: 'completed' as IssueStatus,
    completionProof,
    completedById,
    completedByName,
    completedByRole,
    completionReward,
    completedAt: now,
    updatedAt: now,
  };
  
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

// Civic Hour API functions
const STORAGE_CIVIC_HOURS = 'civic_hours_store_v1';

function readCivicHours(): CivicHour[] {
  try {
    const raw = localStorage.getItem(STORAGE_CIVIC_HOURS);
    if (!raw) return [];
    const arr = JSON.parse(raw) as CivicHour[];
    return arr.map((ch) => ({
      ...ch,
      date: new Date(ch.date),
      createdAt: new Date(ch.createdAt),
      updatedAt: new Date(ch.updatedAt),
      verifiedAt: ch.verifiedAt ? new Date(ch.verifiedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function writeCivicHours(civicHours: CivicHour[]): void {
  localStorage.setItem(STORAGE_CIVIC_HOURS, JSON.stringify(civicHours));
}

export const fetchCivicHours = async (): Promise<CivicHour[]> => {
  return readCivicHours();
};

export const submitCivicHour = async (civicHourData: Omit<CivicHour, 'id' | 'createdAt' | 'updatedAt'>): Promise<CivicHour> => {
  const civicHours = readCivicHours();
  const id = Math.random().toString(36).slice(2);
  const now = new Date();
  
  const newCivicHour: CivicHour = {
    id,
    ...civicHourData,
    createdAt: now,
    updatedAt: now,
  };
  
  civicHours.unshift(newCivicHour);
  writeCivicHours(civicHours);
  return newCivicHour;
};

export const verifyCivicHour = async (
  civicHourId: string,
  status: 'verified' | 'rejected',
  verifiedById: string,
  verifiedByName: string,
  verificationNotes?: string
): Promise<CivicHour> => {
  const civicHours = readCivicHours();
  const idx = civicHours.findIndex((ch) => ch.id === civicHourId);
  if (idx === -1) throw new Error('Civic hour not found');
  
  const now = new Date();
  const updated: CivicHour = {
    ...civicHours[idx],
    status,
    verifiedById,
    verifiedByName,
    verifiedAt: now,
    verificationNotes,
    updatedAt: now,
  };
  
  civicHours[idx] = updated;
  writeCivicHours(civicHours);
  return updated;
};