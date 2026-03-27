export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'installation' | 'basic' | 'advanced';
  progress: number;
  duration: string;
}

export interface Evaluation {
  id: string;
  url: string;
  date: string;
  score: number;
  issues: string[];
  status: 'completed' | 'pending';
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'OpenClaw 安装全攻略',
    description: '从零开始在 Mac/Windows/Linux 上安装 OpenClaw',
    category: 'installation',
    progress: 0,
    duration: '15 分钟'
  },
  {
    id: '2',
    title: '第一个 Agent 快速上手',
    description: '手把手创建你的第一个 AI Agent',
    category: 'basic',
    progress: 0,
    duration: '20 分钟'
  },
  {
    id: '3',
    title: 'Skill 开发实战指南',
    description: '学习如何开发自定义 Skill 扩展 Agent 能力',
    category: 'advanced',
    progress: 0,
    duration: '30 分钟'
  },
  {
    id: '4',
    title: '配置文件的艺术',
    description: '深入理解 openclaw.json 各配置项',
    category: 'installation',
    progress: 0,
    duration: '25 分钟'
  },
  {
    id: '5',
    title: '多 Agent 编排入门',
    description: '学习如何让多个 Agent 协同工作',
    category: 'advanced',
    progress: 0,
    duration: '35 分钟'
  },
  {
    id: '6',
    title: '安全加固最佳实践',
    description: '保护你的 OpenClaw 免受攻击',
    category: 'basic',
    progress: 0,
    duration: '20 分钟'
  }
];

export const evaluations: Evaluation[] = [];

export const categories = [
  { id: 'installation', name: '安装指南', icon: '📦' },
  { id: 'basic', name: '基础技能', icon: '🔧' },
  { id: 'advanced', name: '进阶技能', icon: '🚀' }
];