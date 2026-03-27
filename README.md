# 🦞 ClawSchool

**OpenClaw 一站式学习、评估与聚合平台**

聚合全网优质学习资源，发现最热门 Skill，系统化学习 Claw 技能，AI 驱动自动运营。

> 🌐 线上地址：[https://clawschool-five.vercel.app](https://clawschool-five.vercel.app)

---

## ✨ 功能特色

### 📚 资源聚合
- 从 GitHub、YouTube、博客、社区自动收集 OpenClaw 学习资源
- 按来源 / 分类筛选，按热度 / 时间排序
- 用户点赞、收藏

### 📖 课程集
- 系统化课程系列（入门 / 进阶 / 高级）
- AI 自动生成课程大纲与内容
- 课程集订阅，学习进度追踪

### 🏆 Skill 排行榜
- 多维度排名：Stars、下载量、7 天增长趋势
- 分类筛选、多种排序
- 数据自动更新

### 🛡️ 安全评估
- 输入 GitHub 仓库地址一键评估
- AI 多维度分析：安全检查、代码质量、依赖审计
- 生成详细评估报告

### 👤 用户系统
- 注册 / 登录（Supabase Auth）
- 收藏、订阅、评估记录管理
- 个人中心仪表盘

### ⚙️ 管理后台
- **仪表盘**：系统统计概览
- **系统配置**：LLM 模型选择、收集参数设置
- **Job 调度**：定时任务管理，手动触发
- **内容收集**：一键触发 GitHub 收集、AI 课程生成、排名更新
- **管理员管理**：添加 / 删除管理员，角色权限控制
- 默认管理员：`wmango@hotmail.com`

### 🤖 AI 自动运营
- 基于 **OpenRouter.ai** 接入多种 LLM（Claude、GPT-4、Gemini）
- 自动收集 GitHub 资源并 AI 分析质量
- 自动生成课程大纲
- 自动更新 Skill 排行榜
- 支持通过环境变量切换模型

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 路由 | React Router v7 |
| 状态管理 | React Context + Hooks |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| AI/LLM | OpenRouter.ai (Claude / GPT-4 / Gemini) |
| SEO | react-helmet-async + JSON-LD |
| 部署 | Vercel |

---

## 📁 项目结构

```
mvp/
├── src/
│   ├── api/
│   │   ├── supabase.ts          # Supabase 客户端
│   │   ├── openrouter.ts        # OpenRouter.ai LLM 集成
│   │   ├── llm-config.ts        # LLM 模型配置
│   │   ├── github-collector.ts  # GitHub 自动收集
│   │   ├── services.ts          # 统一 API 服务层
│   │   ├── admin.ts             # 管理后台 API
│   │   ├── admin-auth.ts        # 管理员权限
│   │   ├── storage.ts           # 本地存储 (备用)
│   │   └── github.ts            # GitHub API (基础)
│   ├── components/
│   │   ├── Navbar.tsx            # 导航栏
│   │   └── SEO.tsx               # SEO 组件
│   ├── contexts/
│   │   └── AuthContext.tsx        # 认证上下文
│   ├── hooks/
│   │   └── useUserData.ts        # 用户数据 Hook
│   ├── pages/
│   │   ├── Home.tsx               # 首页
│   │   ├── Resources.tsx          # 资源聚合
│   │   ├── CourseSets.tsx         # 课程集
│   │   ├── Skills.tsx             # Skill 排行
│   │   ├── Learning.tsx           # 学习中心
│   │   ├── CourseDetail.tsx       # 课程详情
│   │   ├── Evaluation.tsx         # 评估中心
│   │   ├── User.tsx               # 用户中心
│   │   ├── UserEvaluations.tsx    # 评估记录
│   │   ├── UserCollections.tsx    # 我的收藏
│   │   └── admin/
│   │       ├── AdminLayout.tsx    # 管理后台布局
│   │       ├── AdminDashboard.tsx # 仪表盘
│   │       ├── AdminConfig.tsx    # 系统配置
│   │       ├── AdminJobs.tsx      # Job 调度
│   │       ├── AdminCollection.tsx# 内容收集
│   │       └── AdminAdmins.tsx    # 管理员管理
│   ├── types/index.ts             # TypeScript 类型
│   ├── data/                      # 静态数据 (备用)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql                 # 数据库 Schema (18 个对象)
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── .env.example                   # 环境变量模板
├── vercel.json
├── BACKEND_SETUP.md               # 后端配置指南
└── package.json
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:MiniBotFactory/clawschool.git
cd clawschool/mvp
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 填入你的密钥（详见 [BACKEND_SETUP.md](./BACKEND_SETUP.md)）：

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx
VITE_GITHUB_TOKEN=ghp_xxx
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/schema.sql`。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 5. 构建

```bash
npm run build
```

---

## ⚙️ LLM 模型配置

通过环境变量为不同任务配置不同模型：

```env
VITE_CONTENT_ANALYSIS_MODEL=google/gemini-2.0-flash-exp:free
VITE_COURSE_GENERATION_MODEL=anthropic/claude-3.5-sonnet
VITE_REPOSITORY_EVALUATION_MODEL=anthropic/claude-3.5-sonnet
VITE_CHAT_MODEL=openai/gpt-4o-mini
```

可用模型：

| 模型 | 价格 | 适合场景 |
|------|------|----------|
| `google/gemini-2.0-flash-exp:free` | 免费 | 测试、大量内容处理 |
| `openai/gpt-4o-mini` | $0.15/1M tokens | 快速对话 |
| `anthropic/claude-3-haiku` | $0.25/1M tokens | 平衡质量 |
| `openai/gpt-4o` | $2.50/1M tokens | 高质量 |
| `anthropic/claude-3.5-sonnet` | $3/1M tokens | 最高质量 |

---

## 🚢 部署

### Vercel 部署

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. Framework Preset: **Vite**
3. 添加环境变量（4 个 `VITE_` 开头的变量）
4. 部署

### 管理后台访问

1. 用 `wmango@hotmail.com` 注册 / 登录
2. 进入用户中心 → 点击「⚙️ 管理后台」
3. 或直接访问 `/admin`

### 管理员角色

| 角色 | 查看数据 | 修改配置 | 触发任务 | 管理员管理 |
|------|----------|----------|----------|------------|
| super_admin | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ❌ |
| editor | ✅ | ❌ | ✅ | ❌ |

---

## 🔄 自动运营流程

```
GitHub/YouTube/博客
      ↓
 自动收集 (每 6 小时)
      ↓
 AI 分析质量 + 分类
      ↓
 存入 Supabase 数据库
      ↓
 前端实时展示
      ↓
 排名自动更新 (每小时)
```

---

## 📊 SEO

- 每个页面独立 `<title>` / `<meta description>` / `<meta keywords>`
- Open Graph + Twitter Cards 社交分享优化
- JSON-LD 结构化数据（WebSite、Organization、Course、ItemList）
- `robots.txt` + `sitemap.xml`
- 语义化 HTML 标题层级

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**ClawSchool** — 让 OpenClaw 学习更简单 🦞