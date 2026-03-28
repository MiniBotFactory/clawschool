# ClawSchool

> OpenClaw 一站式学习、评估与聚合平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MiniBotFactory/clawschool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 项目简介

ClawSchool 是一个面向 AI Agent (OpenClaw) 开发者的学习平台，解决以下核心问题：

- **学习门槛高** - 用户不知道如何安装和使用 OpenClaw
- **质量参差不齐** - 大量 Claws 能力较弱，需要培训
- **安全隐患** - Claws 存在安全风险，需要评估
- **资源分散** - 优质资源散落在 GitHub、YouTube、博客等平台

## ✨ 核心功能

### 📚 学习资源库
聚合全网优质 OpenClaw 学习资源，支持多来源筛选（GitHub、YouTube、博客、社区），提供点赞、收藏功能。

### 📖 课程系统
系统化课程集，涵盖入门、进阶、高级三个层次。每门课程包含实操实验室，让用户动手实践。

### 🏆 Skill 排行榜
多维度排名，展示最热门和最具潜力的 Claw Skills，帮助用户发现优质工具。

### 🛡️ Claw 评估
一键检测 Claw 安全风险，提供安全检查、代码质量分析、依赖分析、活跃度评估等报告。

### 👤 用户中心
订阅课程、追踪学习进度、管理收藏资源、查看评估历史。

### ⚙️ 管理后台
内容收集管理、定时任务配置、LLM 模型设置、系统参数配置。

## 🏗️ 技术架构

### 前端
- **React 19** + TypeScript
- **React Router** 路由管理
- **Supabase** 身份认证与数据库
- **Vercel** 部署托管

### 后端（云函数）
- **Supabase Edge Functions** 处理评估任务
- **OpenRouter API** 调用多种 LLM 模型

### 数据库
- **Supabase PostgreSQL** 存储用户、资源、课程、评估数据
- **Row Level Security (RLS)** 数据安全策略

### 数据收集
- GitHub API 采集开源项目
- YouTube API 采集教程视频
- RSS 订阅博客文章
- Reddit 社区内容聚合

## 📁 项目结构

```
clawschool/
├── mvp/
│   ├── src/
│   │   ├── api/                 # API 服务
│   │   │   ├── admin.ts         # 管理后台 API
│   │   │   ├── admin-auth.ts    # 管理员权限
│   │   │   ├── content-collector.ts  # 内容收集器
│   │   │   ├── data-service.ts  # 数据服务
│   │   │   ├── github-collector.ts  # GitHub 采集
│   │   │   ├── github.ts        # GitHub API
│   │   │   ├── llm-config.ts    # LLM 配置
│   │   │   ├── openrouter.ts    # OpenRouter API
│   │   │   ├── storage.ts       # 存储服务
│   │   │   ├── supabase.ts      # Supabase 客户端
│   │   │   └── services.ts      # 服务层
│   │   ├── components/          # 通用组件
│   │   │   ├── Navbar.tsx       # 导航栏
│   │   │   └── SEO.tsx          # SEO 优化
│   │   ├── contexts/            # React Context
│   │   │   └── AuthContext.tsx  # 认证上下文
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   └── useUserData.ts   # 用户数据管理
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home.tsx        # 首页
│   │   │   ├── Resources.tsx    # 资源库
│   │   │   ├── CourseSets.tsx   # 课程集列表
│   │   │   ├── CourseDetail.tsx # 课程详情
│   │   │   ├── Skills.tsx       # Skill 排行
│   │   │   ├── Evaluation.tsx   # 评估页面
│   │   │   ├── User.tsx        # 用户中心
│   │   │   ├── Learning.tsx    # 学习页面
│   │   │   ├── UserEvaluations.tsx  # 用户评估历史
│   │   │   ├── UserCollections.tsx   # 用户收藏
│   │   │   └── admin/          # 管理后台
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminConfig.tsx
│   │   │       ├── AdminJobs.tsx
│   │   │       ├── AdminCollection.tsx
│   │   │       └── AdminAdmins.tsx
│   │   ├── types/              # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── data/               # 静态数据
│   │   ├── App.tsx             # 应用入口
│   │   └── main.tsx            # 入口文件
│   └── supabase/
│       └── schema.sql          # 数据库 Schema
├── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账号
- OpenRouter API Key

### 安装

```bash
# 克隆项目
git clone https://github.com/MiniBotFactory/clawschool.git
cd clawschool/mvp

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
```

### 配置环境变量

在 `.env` 文件中配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_GITHUB_TOKEN=your-github-token
```

### 初始化数据库

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 SQL Editor 中执行 `supabase/schema.sql`

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
npm run preview
```

## 🔧 管理后台

访问 `/admin` 进入管理后台（需管理员权限）：

- **仪表盘** - 系统运行状态概览
- **内容收集** - 管理数据来源，触发手动采集
- **定时任务** - 配置和触发自动任务
- **系统配置** - LLM 模型参数配置
- **管理员** - 管理后台用户

## 📊 数据库表

| 表名 | 描述 |
|------|------|
| `resources` | 学习资源 |
| `skills` | Claw Skills |
| `course_sets` | 课程集 |
| `courses` | 课程内容 |
| `user_interactions` | 用户交互（点赞、收藏、订阅） |
| `evaluations` | 评估记录 |
| `user_profiles` | 用户资料 |
| `content_sources` | 内容来源 |
| `system_config` | 系统配置 |
| `scheduled_jobs` | 定时任务 |

## 🔌 API

### 资源

```typescript
fetchResources(filters?: { source?: string; category?: string; limit?: number })
fetchSkills(filters?: { category?: string; sortBy?: string; limit?: number })
fetchCourseSets(filters?: { category?: string })
fetchCourse(courseId: string)
```

### 用户交互

```typescript
// Hooks
useInteractions()  // 点赞、收藏、订阅
useCompletedCourses()  // 已完成课程
useEvaluations()  // 评估记录
```

## 🌐 部署

### Vercel（推荐）

1. Fork 此仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 手动部署

```bash
npm run build
# 将 dist 目录部署到任意静态托管服务
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - see LICENSE file for details

## 👥 团队

ClawSchool Team
