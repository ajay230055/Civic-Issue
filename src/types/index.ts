export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  rewardPoints?: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    ward?: string;
    district?: string;
  };
  images: string[]; // Issue proof images
  completionProof?: string[]; // Completion proof images
  reporterId: string;
  reporterName: string;
  completedById?: string; // User who completed the issue
  completedByName?: string; // Name of user who completed the issue
  completedByRole?: 'user' | 'official' | 'teacher'; // Role of who completed it
  completionReward?: number; // Reward given to the completer
  assignedOfficialId?: string;
  assignedOfficialName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  completedAt?: Date; // When the issue was marked as completed
  estimatedResolutionDate?: Date;
  comments: Comment[];
  tags: string[];
  upvotes: number;
  downvotes: number;
  isPublic: boolean;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: AuthRole;
  content: string;
  createdAt: Date;
  isOfficial: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AuthRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Official extends User {
  department: string;
  designation: string;
  jurisdiction: string[];
  employeeId: string;
}

export interface Teacher extends User {
  schoolName: string;
  subject: string;
  employeeId: string;
  classTaught?: string;
}

export type AuthRole = 'user' | 'official' | 'teacher';

export type IssueCategory = 
  | 'infrastructure'
  | 'sanitation'
  | 'water_supply'
  | 'electricity'
  | 'roads'
  | 'parks'
  | 'education'
  | 'healthcare'
  | 'waste_management'
  | 'security'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'completed' | 'not_completed' | 'in_progress';

export interface LoginCredentials {
  role: AuthRole;
  id?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
  password: string;
}

export interface RegistrationData {
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface IssueFilters {
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedOfficial?: string;
}

export interface DashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  criticalIssues: number;
  averageResolutionTime: number;
  categoryBreakdown: Record<IssueCategory, number>;
  statusBreakdown: Record<IssueStatus, number>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'issue_update' | 'comment' | 'assignment' | 'resolution';
  title: string;
  message: string;
  issueId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CivicHour {
  id: string;
  title: string;
  description: string;
  schoolName: string;
  teacherId: string;
  teacherName: string;
  images: string[]; // Civic hour activity images
  proofImages: string[]; // Proof of civic hour completion
  date: Date;
  duration: number; // Duration in hours
  category: 'community_service' | 'environmental' | 'education' | 'health' | 'other';
  status: 'pending' | 'verified' | 'rejected';
  verifiedById?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  rewardPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}