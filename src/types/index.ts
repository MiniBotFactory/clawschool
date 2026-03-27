// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  stats: {
    coursesCompleted: number;
    resourcesLiked: number;
    resourcesCollected: number;
    evaluationsSubmitted: number;
    courseSetsSubscribed: number;
  };
}

export interface UserProgress {
  courseId: string;
  progress: number; // 0-100
  completed: boolean;
  lastAccessed: string;
}

// 资源相关类型
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'github' | 'youtube' | 'blog' | 'community';
  category: string;
  likes: number;
  views: number;
  publishedAt: string;
  tags: string[];
  author?: string;
  thumbnail?: string;
}

// 课程相关类型
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'installation' | 'basic' | 'advanced';
  duration: string;
  content: string;
  order: number;
}

export interface CourseSet {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  courses: Course[];
  subscribers: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  courseSetId: string;
  subscribedAt: string;
}

// Skill 相关类型
export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  githubUrl: string;
  stars: number;
  forks: number;
  downloads: number;
  issues: number;
  lastUpdate: string;
  trend: number; // 7-day growth rate
  category: string;
  license?: string;
  language?: string;
  topics?: string[];
}

// 评估相关类型
export interface Evaluation {
  id: string;
  url: string;
  repositoryName: string;
  submittedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: EvaluationResult;
}

export interface EvaluationResult {
  score: number;
  securityCheck: {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  };
  codeQuality: {
    score: number;
    issues: string[];
  };
  dependencies: {
    total: number;
    vulnerable: number;
    outdated: number;
  };
  activity: {
    lastCommit: string;
    openIssues: number;
    closedIssues: number;
  };
}

// 用户交互相关类型
export interface UserInteraction {
  resourceId?: string;
  skillId?: string;
  courseSetId?: string;
  type: 'like' | 'collect' | 'subscribe' | 'view';
  timestamp: string;
}

// 社区贡献相关类型
export interface CommunitySubmission {
  id: string;
  type: 'resource' | 'skill' | 'course';
  userId: string;
  data: Partial<Resource> | Partial<Skill> | Partial<Course>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 筛选和排序
export interface ResourceFilter {
  source?: string;
  category?: string;
  sortBy?: 'date' | 'likes' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface SkillFilter {
  category?: string;
  sortBy?: 'rank' | 'stars' | 'downloads' | 'trend';
  sortOrder?: 'asc' | 'desc';
}

// 统计数据
export interface PlatformStats {
  totalResources: number;
  totalCourseSets: number;
  totalSkills: number;
  totalEvaluations: number;
  totalUsers: number;
}