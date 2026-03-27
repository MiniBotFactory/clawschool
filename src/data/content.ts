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
}

export interface CourseSet {
  id: string;
  title: string;
  description: string;
  icon: string;
  courseCount: number;
  subscribers: number;
  category: 'beginner' | 'intermediate' | 'advanced';
  courses: { id: string; title: string; completed: boolean }[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  githubUrl: string;
  stars: number;
  downloads: number;
  issues: number;
  lastUpdate: string;
  trend: number; // 7-day growth rate
  rank: number;
  category: string;
}

export const resources: Resource[] = [
  {
    id: 'r1',
    title: 'OpenClaw 安装完全指南 (2026)',
    description: '从零开始在 Mac/Windows/Linux 上安装 OpenClaw，包括常见问题解决方案',
    url: 'https://github.com/openclaw/openclaw#readme',
    source: 'github',
    category: 'installation',
    likes: 245,
    views: 12000,
    publishedAt: '2026-02-15',
    tags: ['installation', 'beginner', 'guide']
  },
  {
    id: 'r2',
    title: '如何创建你的第一个 OpenClaw Agent',
    description: '手把手教你从零创建一个 AI Agent，包含完整示例代码',
    url: 'https://www.youtube.com/watch?v=example1',
    source: 'youtube',
    category: 'getting-started',
    likes: 189,
    views: 8500,
    publishedAt: '2026-03-01',
    tags: ['beginner', 'tutorial', 'video']
  },
  {
    id: 'r3',
    title: 'OpenClaw Skill 开发实战',
    description: '深入学习如何开发高质量的 Claw Skill',
    url: 'https://example.com/blog/skill-dev',
    source: 'blog',
    category: 'skill-development',
    likes: 156,
    views: 6800,
    publishedAt: '2026-03-10',
    tags: ['advanced', 'skill', 'development']
  },
  {
    id: 'r4',
    title: 'OpenClaw 安全加固最佳实践',
    description: '保护你的 OpenClaw 免受攻击的完整指南',
    url: 'https://www.bitdoze.com/openclaw-security-guide/',
    source: 'blog',
    category: 'security',
    likes: 312,
    views: 15000,
    publishedAt: '2026-02-20',
    tags: ['security', 'best-practices', 'enterprise']
  },
  {
    id: 'r5',
    title: 'OpenClaw + GitHub Copilot 集成教程',
    description: '如何将 OpenClaw 与 GitHub Copilot 结合使用',
    url: 'https://www.youtube.com/watch?v=example2',
    source: 'youtube',
    category: 'integration',
    likes: 98,
    views: 4200,
    publishedAt: '2026-03-15',
    tags: ['integration', 'copilot', 'github']
  },
  {
    id: 'r6',
    title: '多 Agent 编排：OpenClaw 实战',
    description: '学习如何使用 OpenClaw 编排多个 Agent 协同工作',
    url: 'https://example.com/blog/multi-agent',
    source: 'blog',
    category: 'advanced',
    likes: 145,
    views: 5900,
    publishedAt: '2026-03-05',
    tags: ['advanced', 'multi-agent', 'orchestration']
  },
  {
    id: 'r7',
    title: 'OpenClaw Troubleshooting 社区讨论',
    description: 'Reddit 社区关于 OpenClaw 常见问题的讨论',
    url: 'https://reddit.com/r/AiForSmallBusiness/example',
    source: 'community',
    category: 'troubleshooting',
    likes: 78,
    views: 3100,
    publishedAt: '2026-03-18',
    tags: ['troubleshooting', 'community', 'help']
  },
  {
    id: 'r8',
    title: 'OpenClaw 自动化工作流指南',
    description: '使用 OpenClaw 创建自动化任务和工作流',
    url: 'https://github.com/example/automation-workflows',
    source: 'github',
    category: 'automation',
    likes: 201,
    views: 9800,
    publishedAt: '2026-03-12',
    tags: ['automation', 'workflow', 'advanced']
  },
  {
    id: 'r9',
    title: 'OpenClaw 企业级部署方案',
    description: '为大型企业环境设计的 OpenClaw 部署方案',
    url: 'https://www.cisco.com/blog/openclaw-enterprise',
    source: 'blog',
    category: 'enterprise',
    likes: 89,
    views: 2800,
    publishedAt: '2026-03-20',
    tags: ['enterprise', 'deployment', 'security']
  },
  {
    id: 'r10',
    title: 'OpenClaw 配置文件完全解析',
    description: '深入理解 openclaw.json 的每一个配置项',
    url: 'https://www.youtube.com/watch?v=example3',
    source: 'youtube',
    category: 'configuration',
    likes: 167,
    views: 7200,
    publishedAt: '2026-03-08',
    tags: ['configuration', 'intermediate', 'tutorial']
  }
];

export const courseSets: CourseSet[] = [
  {
    id: 'cs1',
    title: 'OpenClaw 入门系列',
    description: '从零开始学习 OpenClaw，适合完全没有经验的初学者',
    icon: '🚀',
    courseCount: 5,
    subscribers: 1250,
    category: 'beginner',
    courses: [
      { id: 'c1-1', title: 'OpenClaw 是什么？', completed: false },
      { id: 'c1-2', title: '环境准备与安装', completed: false },
      { id: 'c1-3', title: '第一个 Agent', completed: false },
      { id: 'c1-4', title: '基础配置详解', completed: false },
      { id: 'c1-5', title: '调试与故障排除', completed: false }
    ]
  },
  {
    id: 'cs2',
    title: 'Skill 开发实战系列',
    description: '学习如何为 OpenClaw 开发高质量的 Skill',
    icon: '🔧',
    courseCount: 6,
    subscribers: 890,
    category: 'intermediate',
    courses: [
      { id: 'c2-1', title: 'Skill 架构解析', completed: false },
      { id: 'c2-2', title: '创建第一个 Skill', completed: false },
      { id: 'c2-3', title: 'Skill 配置与管理', completed: false },
      { id: 'c2-4', title: 'Skill 测试方法', completed: false },
      { id: 'c2-5', title: '发布与版本管理', completed: false },
      { id: 'c2-6', title: '社区贡献指南', completed: false }
    ]
  },
  {
    id: 'cs3',
    title: '安全加固系列',
    description: '学习如何保护你的 OpenClaw 免受攻击',
    icon: '🛡️',
    courseCount: 4,
    subscribers: 560,
    category: 'advanced',
    courses: [
      { id: 'c3-1', title: '安全威胁概览', completed: false },
      { id: 'c3-2', title: '配置安全加固', completed: false },
      { id: 'c3-3', title: 'API Key 安全管理', completed: false },
      { id: 'c3-4', title: '运行时安全监控', completed: false }
    ]
  },
  {
    id: 'cs4',
    title: '企业级部署系列',
    description: '面向企业用户的 OpenClaw 部署与管理',
    icon: '🏢',
    courseCount: 5,
    subscribers: 320,
    category: 'advanced',
    courses: [
      { id: 'c4-1', title: '企业环境评估', completed: false },
      { id: 'c4-2', title: '高可用架构设计', completed: false },
      { id: 'c4-3', title: '多租户配置', completed: false },
      { id: 'c4-4', title: '监控与日志管理', completed: false },
      { id: 'c4-5', title: '合规与审计', completed: false }
    ]
  }
];

export const skills: Skill[] = [
  {
    id: 's1',
    name: 'github-integration',
    description: '将 OpenClaw 与 GitHub 深度集成',
    author: 'openclaw-contributors',
    githubUrl: 'https://github.com/openclaw-contributors/skill-github',
    stars: 1247,
    downloads: 45230,
    issues: 12,
    lastUpdate: '2026-03-25',
    trend: 15.2,
    rank: 1,
    category: 'integration'
  },
  {
    id: 's2',
    name: 'file-system-tools',
    description: '扩展文件系统操作能力',
    author: 'openclaw-contributors',
    githubUrl: 'https://github.com/openclaw-contributors/skill-fs',
    stars: 987,
    downloads: 38560,
    issues: 8,
    lastUpdate: '2026-03-24',
    trend: 12.8,
    rank: 2,
    category: 'core'
  },
  {
    id: 's3',
    name: 'code-execution',
    description: '安全的代码执行环境',
    author: 'security-team',
    githubUrl: 'https://github.com/security-team/skill-execution',
    stars: 856,
    downloads: 32100,
    issues: 5,
    lastUpdate: '2026-03-23',
    trend: 18.5,
    rank: 3,
    category: 'execution'
  },
  {
    id: 's4',
    name: 'web-search',
    description: '实时网络搜索能力',
    author: 'web-tools',
    githubUrl: 'https://github.com/web-tools/skill-search',
    stars: 745,
    downloads: 28900,
    issues: 15,
    lastUpdate: '2026-03-22',
    trend: 22.3,
    rank: 4,
    category: 'search'
  },
  {
    id: 's5',
    name: 'database-connector',
    description: '连接各种数据库',
    author: 'data-team',
    githubUrl: 'https://github.com/data-team/skill-db',
    stars: 623,
    downloads: 24500,
    issues: 9,
    lastUpdate: '2026-03-21',
    trend: 8.7,
    rank: 5,
    category: 'data'
  },
  {
    id: 's6',
    name: 'api-gateway',
    description: 'API 网关集成',
    author: 'api-team',
    githubUrl: 'https://github.com/api-team/skill-gateway',
    stars: 589,
    downloads: 22300,
    issues: 11,
    lastUpdate: '2026-03-20',
    trend: 10.1,
    rank: 6,
    category: 'integration'
  },
  {
    id: 's7',
    name: 'docker-integration',
    description: 'Docker 容器化操作',
    author: 'devops-team',
    githubUrl: 'https://github.com/devops-team/skill-docker',
    stars: 512,
    downloads: 19800,
    issues: 6,
    lastUpdate: '2026-03-19',
    trend: 14.2,
    rank: 7,
    category: 'devops'
  },
  {
    id: 's8',
    name: 'slack-notifications',
    description: 'Slack 集成与通知',
    author: 'communication-tools',
    githubUrl: 'https://github.com/communication-tools/skill-slack',
    stars: 478,
    downloads: 18200,
    issues: 7,
    lastUpdate: '2026-03-18',
    trend: 9.5,
    rank: 8,
    category: 'communication'
  },
  {
    id: 's9',
    name: 'email-sender',
    description: '邮件发送能力',
    author: 'email-team',
    githubUrl: 'https://github.com/email-team/skill-mail',
    stars: 445,
    downloads: 17100,
    issues: 4,
    lastUpdate: '2026-03-17',
    trend: 7.8,
    rank: 9,
    category: 'communication'
  },
  {
    id: 's10',
    name: 'task-scheduler',
    description: '定时任务调度',
    author: 'scheduler-team',
    githubUrl: 'https://github.com/scheduler-team/skill-cron',
    stars: 412,
    downloads: 15800,
    issues: 3,
    lastUpdate: '2026-03-16',
    trend: 11.4,
    rank: 10,
    category: 'automation'
  }
];