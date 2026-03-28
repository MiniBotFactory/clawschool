# ClawSchool 产品需求文档 (PRD)

> 版本：1.0  
> 更新日期：2026-03-28  
> 状态：MVP 开发完成

---

## 1. 产品概述

### 1.1 产品定位

ClawSchool 是面向 OpenClaw AI Agent 开发者的**一站式学习、评估与聚合平台**。我们聚合全网优质学习资源，提供系统化课程，建立 Skill 排行榜，并提供 Claw 安全评估服务。

### 1.2 目标用户

| 用户画像 | 需求 |
|---------|------|
| **初学者** | 不知道如何入门 OpenClaw，需要系统化学习路径 |
| **开发者** | 需要发现优质 Claws 和 Skills，快速集成到项目 |
| **安全研究员** | 需要评估 Claws 的安全风险和代码质量 |
| **内容创作者** | 希望分享教程和资源，获得曝光和反馈 |

### 1.3 核心问题解决

| 问题 | 解决方案 |
|------|---------|
| 学习门槛高 | 系统化课程 + 实操实验室 |
| 资源分散 | 聚合 GitHub/YouTube/博客/社区资源 |
| 质量参差 | Skill 排行榜 + 用户评价 |
| 安全风险 | 一键 Claw 评估服务 |

---

## 2. 功能架构

### 2.1 产品结构

```
ClawSchool
├── 首页 (/)
│   ├── 平台数据概览
│   ├── 功能入口
│   ├── 最新资源
│   └── Skill 热榜
│
├── 学习资源库 (/resources)
│   ├── 多源筛选（GitHub/YouTube/博客/社区）
│   ├── 分类筛选
│   ├── 点赞/收藏
│   └── 资源详情
│
├── 课程系统 (/course-sets, /course/:id)
│   ├── 课程集列表（入门/进阶/高级）
│   ├── 课程详情
│   ├── 实操实验室
│   └── 学习进度追踪
│
├── Skill 排行榜 (/skills)
│   ├── 多维度排名（Star/下载量/趋势）
│   ├── 分类筛选
│   └── Skill 详情
│
├── Claw 评估 (/evaluation)
│   ├── GitHub 仓库提交
│   ├── 安全检查报告
│   ├── 代码质量分析
│   ├── 依赖分析
│   └── 活跃度评估
│
├── 用户中心 (/user)
│   ├── 个人信息
│   ├── 学习统计
│   ├── 订阅课程
│   ├── 收藏资源
│   └── 评估历史
│
└── 管理后台 (/admin)
    ├── 仪表盘
    ├── 内容收集管理
    ├── 定时任务配置
    ├── 系统配置
    └── 管理员管理
```

### 2.2 用户流程

#### 2.2.1 游客浏览流程

```
首页 → 浏览资源/课程/Skills → 注册/登录 → 收藏/订阅/评估
```

#### 2.2.2 学习流程

```
注册 → 浏览课程集 → 订阅课程集 → 开始学习 → 标记完成 → 查看进度
```

#### 2.2.3 评估流程

```
登录 → 提交 GitHub 仓库 → 系统分析 → 查看报告 → 保存记录
```

---

## 3. 功能详细说明

### 3.1 首页

**功能：**
- 展示平台统计数据（资源数、课程数、Skill 数）
- 显示最新资源（最新 3 条）
- Skill 热榜 Top 3
- 快速导航入口

**数据来源：**
- `fetchResources({ limit: 10 })`
- `fetchSkills({ limit: 10 })`
- `fetchCourseSets()`

### 3.2 学习资源库

**功能：**
- 按来源筛选：全部 / GitHub / YouTube / 博客 / 社区
- 按分类筛选
- 资源列表展示（标题、描述、来源、标签、点赞数）
- 点赞/收藏功能（需登录）

**数据结构：**
```typescript
interface Resource {
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
```

**用户交互：**
- `useInteractions` hook 管理点赞/收藏状态
- 点击后调用 `toggleLike()` / `toggleCollect()`
- 乐观更新 + 错误回滚

### 3.3 课程系统

#### 3.3.1 课程集列表 (/course-sets)

**功能：**
- 按难度筛选：全部 / 入门 / 进阶 / 高级
- 课程集卡片展示
- 显示课程数量和订阅数
- 订阅按钮
- 开始学习按钮

**数据结构：**
```typescript
interface CourseSet {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  subscribers: number;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}
```

#### 3.3.2 课程详情 (/course/:id)

**功能：**
- 课程标题和描述
- 学习进度
- Markdown 内容渲染
- 步骤导航
- 标记完成按钮

**数据结构：**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: 'installation' | 'basic' | 'advanced';
  duration: string;
  content: string; // Markdown
  order: number;
}
```

#### 3.3.3 课程生成

**触发方式：**
- 管理员手动触发（Admin → 内容收集 → 生成课程）
- 定时任务自动生成（每日 3:00 AM）

**生成逻辑：**
1. 获取热门资源 Top 10
2. 使用 LLM 生成课程大纲
3. 创建课程集
4. 生成实操实验室内容

### 3.4 Skill 排行榜

**功能：**
- 多维度排序：排名 / Star 数 / 下载量 / 趋势
- 分类筛选
- 搜索功能
- 列表展示（名称、作者、描述、Star、趋势）

**数据结构：**
```typescript
interface Skill {
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
  rank: number;
  category: string;
  license?: string;
  language?: string;
  topics?: string[];
}
```

### 3.5 Claw 评估

**功能：**
- 输入 GitHub 仓库 URL
- 提交评估任务
- 查看评估结果

**评估维度：**

| 维度 | 权重 | 指标 |
|------|------|------|
| 安全检查 | 30% | API Key 泄露、依赖漏洞、配置风险 |
| 代码质量 | 25% | 代码结构、注释完整性、测试覆盖率 |
| 依赖分析 | 25% | 总依赖数、漏洞数、过期数 |
| 活跃度 | 20% | 最近提交、开放 Issue、关闭 Issue |

**评估结果：**
```typescript
interface EvaluationResult {
  score: number; // 0-100
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
```

**评估流程：**
1. 用户提交 GitHub URL
2. 系统克隆仓库（模拟）
3. 分析代码结构（模拟）
4. 生成评估报告
5. 保存评估记录

### 3.6 用户中心

**功能：**
- 个人信息展示（头像、昵称、邮箱、加入时间）
- 学习统计数据（已完成课程、订阅课程、点赞资源、提交评估）
- 我的订阅课程列表
- 已完成课程列表
- 快速导航

**数据结构：**
```typescript
interface User {
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
```

### 3.7 管理后台

#### 3.7.1 仪表盘 (/admin)

- 系统运行状态
- 数据统计（资源数、用户数、评估数）
- 最近活动

#### 3.7.2 内容收集 (/admin/collection)

**功能：**
- 查看已配置的数据源
- 添加/编辑/删除数据源
- 手动触发采集任务
- 查看采集统计

**数据源类型：**
- GitHub 搜索
- YouTube 搜索
- RSS 订阅
- Reddit 社区

#### 3.7.3 定时任务 (/admin/jobs)

**预定义任务：**

| 任务 | 描述 | 调度 |
|------|------|------|
| collect_github | 从 GitHub 收集资源 | 每 6 小时 |
| generate_courses | 基于资源生成课程 | 每日 3:00 |
| update_rankings | 更新 Skill 排行榜 | 每小时 |

**功能：**
- 查看任务状态
- 启用/禁用任务
- 手动触发执行
- 查看执行历史

#### 3.7.4 系统配置 (/admin/config)

**LLM 模型配置：**
- 默认 LLM 模型
- 内容分析模型
- 课程生成模型
- 仓库评估模型
- 聊天对话模型

**数据收集配置：**
- GitHub 搜索查询
- GitHub 搜索数量限制
- 启用自动收集
- 启用自动课程生成

#### 3.7.5 管理员管理 (/admin/admins)

- 查看管理员列表
- 添加/移除管理员（仅超级管理员）

---

## 4. 数据模型

### 4.1 ER 图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  resources  │────<│   skills    │>────│   users     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       v                   v                   v
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│user_interact│     │course_sets │     │user_interactions│
│   ions      │     └─────────────┘     └─────────────────┘
└─────────────┘           │                   │
       │                   │                   │
       v                   v                   v
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│evaluations  │     │  courses    │     │ user_profiles   │
└─────────────┘     └─────────────┘     └─────────────────┘
```

### 4.2 数据库表

#### 4.2.1 resources（资源表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| url | TEXT | 资源链接 |
| source | TEXT | 来源（github/youtube/blog/community） |
| category | TEXT | 分类 |
| likes | INTEGER | 点赞数 |
| views | INTEGER | 浏览数 |
| publishedat | TIMESTAMPTZ | 发布时间 |
| tags | TEXT[] | 标签数组 |
| author | TEXT | 作者 |
| thumbnail | TEXT | 缩略图 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### 4.2.2 skills（Skill 表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | Skill 名称 |
| description | TEXT | 描述 |
| author | TEXT | 作者 |
| githuburl | TEXT | GitHub 地址 |
| stars | INTEGER | Star 数 |
| forks | INTEGER | Fork 数 |
| downloads | INTEGER | 下载量 |
| issues | INTEGER | Issue 数 |
| lastupdate | TIMESTAMPTZ | 最后更新 |
| trend | DECIMAL | 7日增长趋势 |
| rank | INTEGER | 排名 |
| category | TEXT | 分类 |
| license | TEXT | 许可证 |
| language | TEXT | 主要语言 |
| topics | TEXT[] | 主题标签 |

#### 4.2.3 course_sets（课程集表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| icon | TEXT | 图标 |
| category | TEXT | 分类（beginner/intermediate/advanced） |
| subscribers | INTEGER | 订阅数 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### 4.2.4 courses（课程表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| course_set_id | UUID | 所属课程集 |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| category | TEXT | 分类 |
| duration | TEXT | 时长 |
| content | TEXT | Markdown 内容 |
| order | INTEGER | 排序 |

#### 4.2.5 user_interactions（用户交互表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| type | TEXT | 类型（like/collect/subscribe/view/complete） |
| resource_id | UUID | 资源 ID（可选） |
| skill_id | UUID | Skill ID（可选） |
| course_set_id | UUID | 课程集 ID（可选） |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 4.2.6 evaluations（评估表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| url | TEXT | 仓库 URL |
| repositoryName | TEXT | 仓库名 |
| status | TEXT | 状态（pending/processing/completed/failed） |
| result | JSONB | 评估结果 |
| submittedAt | TIMESTAMPTZ | 提交时间 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 4.2.7 user_profiles（用户资料表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键（关联 auth.users） |
| name | TEXT | 昵称 |
| avatar_url | TEXT | 头像 URL |
| courses_completed | INTEGER | 已完成课程数 |
| resources_liked | INTEGER | 点赞资源数 |
| resources_collected | INTEGER | 收藏资源数 |
| evaluations_submitted | INTEGER | 提交评估数 |
| course_sets_subscribed | INTEGER | 订阅课程数 |

#### 4.2.8 content_sources（内容来源表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 名称 |
| source_type | TEXT | 类型（github/youtube/rss/community） |
| url | TEXT | URL（可选） |
| description | TEXT | 描述 |
| search_query | TEXT | 搜索查询 |
| enabled | BOOLEAN | 是否启用 |
| last_collected | TIMESTAMPTZ | 最后采集时间 |
| collection_count | INTEGER | 采集数量 |
| error_count | INTEGER | 错误次数 |

#### 4.2.9 system_config（系统配置表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| key | TEXT | 配置键 |
| value | TEXT | 配置值 |
| description | TEXT | 描述 |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### 4.2.10 scheduled_jobs（定时任务表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 任务名 |
| description | TEXT | 描述 |
| schedule | TEXT | Cron 表达式 |
| enabled | BOOLEAN | 是否启用 |
| status | TEXT | 状态 |
| last_run | TIMESTAMPTZ | 最后运行时间 |
| next_run | TIMESTAMPTZ | 下次运行时间 |

---

## 5. 安全策略

### 5.1 Row Level Security (RLS)

| 表 | 读取策略 | 写入策略 |
|----|---------|---------|
| resources | 公开读取 | 服务账户写入 |
| skills | 公开读取 | 服务账户写入 |
| course_sets | 公开读取 | 服务账户写入 |
| courses | 公开读取 | 服务账户写入 |
| user_interactions | 用户只能读写自己的 | 用户只能操作自己的 |
| evaluations | 公开读取 | 用户只能操作自己的 |
| user_profiles | 用户只能读写自己的 | 用户只能操作自己的 |
| content_sources | 公开读取 | 服务账户写入 |
| system_config | 公开读取 | 超级管理员写入 |
| scheduled_jobs | 公开读取 | 超级管理员写入 |

### 5.2 管理员权限

- 超级管理员（super_admin）：全部权限
- 管理员（admin）：日常管理权限
- 编辑（editor）：内容编辑权限

---

## 6. 技术实现

### 6.1 前端技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **React Router 7** - 路由管理
- **Supabase JS SDK** - 后端服务
- **Vercel** - 部署托管

### 6.2 后端技术栈

- **Supabase** - 数据库和认证
- **OpenRouter API** - LLM 调用
- **GitHub API** - 资源采集

### 6.3 环境变量

```env
VITE_SUPABASE_URL=          # Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=     # Supabase 匿名密钥
VITE_OPENROUTER_API_KEY=    # OpenRouter API 密钥
VITE_GITHUB_TOKEN=           # GitHub 访问令牌
```

---

## 7. 未来规划

### 7.1 v1.1 - 增强评估

- [ ] 接入真实代码分析（使用 GitHub API 获取仓库内容）
- [ ] 添加更多评估维度
- [ ] 评估报告分享功能

### 7.2 v1.2 - 社交功能

- [ ] 用户评论和评分
- [ ] 资源推荐
- [ ] 关注其他用户

### 7.3 v1.3 - 高级课程

- [ ] 视频课程支持
- [ ] 课程测验
- [ ] 学习证书

### 7.4 v2.0 - 开放平台

- [ ] Claw 上架市场
- [ ] 开发者 API
- [ ] Webhook 通知

---

## 8. 附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| Claw | OpenClaw 框架的 AI Agent |
| Skill | Claw 的能力插件 |
| 课程集 | 多个相关课程的集合 |
| 实操实验室 | 包含动手练习的课程内容 |

### 8.2 参考资料

- [OpenClaw 官方文档](https://openclaw.dev)
- [Supabase 文档](https://supabase.com/docs)
- [React Router 文档](https://reactrouter.com/docs)

---

**文档维护：**
- 作者：ClawSchool Team
- 最后更新：2026-03-28
- 版本：1.0
