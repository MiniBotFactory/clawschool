import type {
  User,
  UserProgress,
  UserInteraction,
  Evaluation,
  ApiResponse
} from '../types';

// 存储键名
const STORAGE_KEYS = {
  USER: 'clawschool_user',
  PROGRESS: 'clawschool_progress',
  INTERACTIONS: 'clawschool_interactions',
  SUBSCRIPTIONS: 'clawschool_subscriptions',
  EVALUATIONS: 'clawschool_evaluations',
  AUTH_TOKEN: 'clawschool_auth_token'
};

// 通用存储操作
const storage = {
  get: <T>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// 用户认证
export const auth = {
  // 模拟注册
  register: async (email: string, _password: string, name: string): Promise<ApiResponse<User>> => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
      stats: {
        coursesCompleted: 0,
        resourcesLiked: 0,
        resourcesCollected: 0,
        evaluationsSubmitted: 0,
        courseSetsSubscribed: 0
      }
    };
    
    storage.set(STORAGE_KEYS.USER, user);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, `mock_token_${user.id}`);
    
    return {
      success: true,
      data: user,
      message: 'Registration successful'
    };
  },
  
  // 模拟登录
  login: async (email: string, _password: string): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 简化：直接创建/返回用户
    let user = storage.get<User>(STORAGE_KEYS.USER);
    
    if (!user || user.email !== email) {
      user = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        stats: {
          coursesCompleted: 0,
          resourcesLiked: 0,
          resourcesCollected: 0,
          evaluationsSubmitted: 0,
          courseSetsSubscribed: 0
        }
      };
      storage.set(STORAGE_KEYS.USER, user);
    }
    
    storage.set(STORAGE_KEYS.AUTH_TOKEN, `mock_token_${user.id}`);
    
    return {
      success: true,
      data: user,
      message: 'Login successful'
    };
  },
  
  // 登出
  logout: (): void => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },
  
  // 获取当前用户
  getCurrentUser: (): User | null => {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;
    return storage.get<User>(STORAGE_KEYS.USER);
  },
  
  // 检查是否已登录
  isAuthenticated: (): boolean => {
    return !!storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }
};

// 用户进度管理
export const progress = {
  // 获取用户进度
  getUserProgress: (userId: string): UserProgress[] => {
    return storage.get<UserProgress[]>(`${STORAGE_KEYS.PROGRESS}_${userId}`) || [];
  },
  
  // 更新课程进度
  updateProgress: (userId: string, courseId: string, progressValue: number): ApiResponse<UserProgress> => {
    const userProgress = progress.getUserProgress(userId);
    const existingIndex = userProgress.findIndex(p => p.courseId === courseId);
    
    const newProgress: UserProgress = {
      courseId,
      progress: progressValue,
      completed: progressValue >= 100,
      lastAccessed: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      userProgress[existingIndex] = newProgress;
    } else {
      userProgress.push(newProgress);
    }
    
    storage.set(`${STORAGE_KEYS.PROGRESS}_${userId}`, userProgress);
    
    return {
      success: true,
      data: newProgress
    };
  },
  
  // 获取特定课程进度
  getCourseProgress: (userId: string, courseId: string): UserProgress | null => {
    const userProgress = progress.getUserProgress(userId);
    return userProgress.find(p => p.courseId === courseId) || null;
  }
};

// 用户交互管理（点赞、收藏、订阅）
export const interactions = {
  // 获取用户交互
  getUserInteractions: (userId: string): UserInteraction[] => {
    return storage.get<UserInteraction[]>(`${STORAGE_KEYS.INTERACTIONS}_${userId}`) || [];
  },
  
  // 添加交互
  addInteraction: (userId: string, interaction: Omit<UserInteraction, 'timestamp'>): ApiResponse<UserInteraction> => {
    const userInteractions = interactions.getUserInteractions(userId);
    
    // 检查是否已存在相同交互
    const exists = userInteractions.some(i => 
      i.type === interaction.type &&
      i.resourceId === interaction.resourceId &&
      i.skillId === interaction.skillId &&
      i.courseSetId === interaction.courseSetId
    );
    
    if (exists) {
      return {
        success: false,
        error: 'Interaction already exists'
      };
    }
    
    const newInteraction: UserInteraction = {
      ...interaction,
      timestamp: new Date().toISOString()
    };
    
    userInteractions.push(newInteraction);
    storage.set(`${STORAGE_KEYS.INTERACTIONS}_${userId}`, userInteractions);
    
    return {
      success: true,
      data: newInteraction
    };
  },
  
  // 移除交互
  removeInteraction: (userId: string, interaction: Omit<UserInteraction, 'timestamp'>): ApiResponse<void> => {
    const userInteractions = interactions.getUserInteractions(userId);
    
    const filtered = userInteractions.filter(i => 
      !(i.type === interaction.type &&
        i.resourceId === interaction.resourceId &&
        i.skillId === interaction.skillId &&
        i.courseSetId === interaction.courseSetId)
    );
    
    if (filtered.length === userInteractions.length) {
      return {
        success: false,
        error: 'Interaction not found'
      };
    }
    
    storage.set(`${STORAGE_KEYS.INTERACTIONS}_${userId}`, filtered);
    
    return {
      success: true
    };
  },
  
  // 检查是否有特定交互
  hasInteraction: (userId: string, interaction: Omit<UserInteraction, 'timestamp'>): boolean => {
    const userInteractions = interactions.getUserInteractions(userId);
    return userInteractions.some(i => 
      i.type === interaction.type &&
      i.resourceId === interaction.resourceId &&
      i.skillId === interaction.skillId &&
      i.courseSetId === interaction.courseSetId
    );
  },
  
  // 获取用户点赞的资源
  getLikedResources: (userId: string): string[] => {
    const userInteractions = interactions.getUserInteractions(userId);
    return userInteractions
      .filter(i => i.type === 'like' && i.resourceId)
      .map(i => i.resourceId!);
  },
  
  // 获取用户收藏的资源
  getCollectedResources: (userId: string): string[] => {
    const userInteractions = interactions.getUserInteractions(userId);
    return userInteractions
      .filter(i => i.type === 'collect' && i.resourceId)
      .map(i => i.resourceId!);
  },
  
  // 获取用户订阅的课程集
  getSubscribedCourseSets: (userId: string): string[] => {
    const userInteractions = interactions.getUserInteractions(userId);
    return userInteractions
      .filter(i => i.type === 'subscribe' && i.courseSetId)
      .map(i => i.courseSetId!);
  }
};

// 评估管理
export const evaluations = {
  // 获取用户评估历史
  getUserEvaluations: (userId: string): Evaluation[] => {
    return storage.get<Evaluation[]>(`${STORAGE_KEYS.EVALUATIONS}_${userId}`) || [];
  },
  
  // 提交评估
  submitEvaluation: (userId: string, url: string): ApiResponse<Evaluation> => {
    const userEvaluations = evaluations.getUserEvaluations(userId);
    
    // 解析仓库名
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    const repositoryName = match ? match[1] : url;
    
    const evaluation: Evaluation = {
      id: `eval_${Date.now()}`,
      url,
      repositoryName,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    userEvaluations.unshift(evaluation);
    storage.set(`${STORAGE_KEYS.EVALUATIONS}_${userId}`, userEvaluations);
    
    // 模拟处理（5秒后完成）
    setTimeout(() => {
      const allEvaluations = evaluations.getUserEvaluations(userId);
      const index = allEvaluations.findIndex(e => e.id === evaluation.id);
      if (index >= 0) {
        allEvaluations[index].status = 'completed';
        allEvaluations[index].result = {
          score: Math.floor(Math.random() * 30) + 70,
          securityCheck: {
            passed: Math.random() > 0.3,
            issues: [
              'No sensitive data exposure detected',
              'Dependencies appear secure',
              'No hardcoded secrets found'
            ],
            recommendations: [
              'Enable two-factor authentication',
              'Regularly update dependencies',
              'Use environment variables for secrets'
            ]
          },
          codeQuality: {
            score: Math.floor(Math.random() * 20) + 80,
            issues: [
              'Consider adding more comments',
              'Some functions could be simplified'
            ]
          },
          dependencies: {
            total: Math.floor(Math.random() * 50) + 10,
            vulnerable: Math.floor(Math.random() * 3),
            outdated: Math.floor(Math.random() * 5)
          },
          activity: {
            lastCommit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            openIssues: Math.floor(Math.random() * 20),
            closedIssues: Math.floor(Math.random() * 100)
          }
        };
        storage.set(`${STORAGE_KEYS.EVALUATIONS}_${userId}`, allEvaluations);
      }
    }, 5000);
    
    return {
      success: true,
      data: evaluation,
      message: 'Evaluation submitted successfully'
    };
  },
  
  // 获取特定评估
  getEvaluation: (userId: string, evaluationId: string): Evaluation | null => {
    const userEvaluations = evaluations.getUserEvaluations(userId);
    return userEvaluations.find(e => e.id === evaluationId) || null;
  }
};

// 导出所有函数
export default {
  auth,
  progress,
  interactions,
  evaluations
};