# 🚀 ClawSchool 自动运营系统设置指南

## 📋 前置条件

1. [Supabase](https://supabase.com) 账号（免费）
2. [OpenRouter.ai](https://openrouter.ai) 账号（免费）
3. [GitHub](https://github.com) 账号（用于 API Token）

---

## 1️⃣ 设置 Supabase

### 步骤 1: 创建项目
1. 登录 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 输入项目名称: `clawschool`
4. 选择区域: `Northeast Asia (Seoul)` 或 `Southeast Asia (Singapore)`
5. 设置数据库密码
6. 点击 "Create new project"

### 步骤 2: 获取 API 密钥
1. 进入项目设置: `Settings` → `API`
2. 复制以下信息:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 步骤 3: 创建数据库表
1. 进入 SQL Editor: `SQL Editor` → `New query`
2. 复制 `supabase/schema.sql` 的内容
3. 点击 "Run" 执行

### 步骤 4: 配置认证
1. 进入 `Authentication` → `Providers`
2. 启用 `Email` provider
3. (可选) 启用 `GitHub` OAuth:
   - 在 GitHub 创建 OAuth App
   - 回调 URL: `https://your-project.supabase.co/auth/v1/callback`
   - 将 Client ID 和 Secret 填入 Supabase

---

## 2️⃣ 设置 OpenRouter.ai

### 步骤 1: 获取 API Key
1. 登录 [OpenRouter.ai](https://openrouter.ai)
2. 进入 `Keys` 页面
3. 点击 "Create Key"
4. 复制 API Key → `VITE_OPENROUTER_API_KEY`

### 步骤 2: 选择模型
支持的模型:
- `anthropic/claude-3.5-sonnet` - 最佳质量，付费
- `anthropic/claude-3-haiku` - 快速，付费
- `openai/gpt-4o` - OpenAI 最新，付费
- `openai/gpt-4o-mini` - 快速便宜，付费
- `google/gemini-2.0-flash-exp:free` - 免费！
- `google/gemini-pro-1.5` - 高质量，付费

**推荐**: 先用免费模型测试，生产环境用 Claude 3.5 Sonnet

---

## 3️⃣ 设置 GitHub API

### 步骤 1: 创建 Personal Access Token
1. 进入 GitHub Settings: `Settings` → `Developer settings` → `Personal access tokens` → `Tokens (classic)`
2. 点击 "Generate new token"
3. 选择权限:
   - `public_repo` (读取公开仓库)
   - `read:org` (读取组织信息)
4. 复制 Token → `VITE_GITHUB_TOKEN`

### 速率限制
- 未认证: 60 请求/小时
- 已认证: 5,000 请求/小时

---

## 4️⃣ 配置环境变量

### 本地开发
1. 复制 `.env.example` 为 `.env`
2. 填入你的密钥:

```bash
cp .env.example .env
```

编辑 `.env`:
```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### Vercel 部署
1. 进入 Vercel 项目设置: `Settings` → `Environment Variables`
2. 添加以上 4 个环境变量
3. 重新部署

---

## 5️⃣ 测试

### 本地测试
```bash
npm run dev
```

### 检查功能
1. **资源加载**: 访问 `/resources`，应该从 Supabase 加载数据
2. **用户注册**: 点击注册，应该能创建账号
3. **评估功能**: 访问 `/evaluation`，提交 GitHub URL
4. **AI 功能**: 检查 OpenRouter.ai 调用是否正常

---

## 📊 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                      ClawSchool 架构                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   前端       │    │   API 层    │    │   数据库    │     │
│  │  React      │───►│  Services   │───►│  Supabase   │     │
│  │  (Vite)     │    │  (TypeScript)│    │  (PostgreSQL)│     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OpenRouter.ai                         │   │
│  │         (Claude, GPT-4, Gemini)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              GitHub API                            │   │
│  │      (自动收集 OpenClaw 仓库和 Skill)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 自动运营流程

### 内容收集 (每6小时)
1. GitHub API 搜索 OpenClaw 相关仓库
2. AI 分析资源质量和分类
3. 自动保存到 Supabase
4. 更新排行榜

### 课程生成 (按需)
1. 基于热门资源生成课程大纲
2. AI 生成课程内容
3. 自动创建课程集

### 安全评估 (用户触发)
1. 用户提交 GitHub URL
2. 获取仓库信息和 README
3. AI 分析安全性和代码质量
4. 生成评估报告

---

## 🛠️ 常见问题

### Q: Supabase 连接失败
A: 检查环境变量是否正确，确保 URL 格式为 `https://xxx.supabase.co`

### Q: OpenRouter.ai 调用失败
A: 检查 API Key 是否有效，确保账户有足够余额

### Q: GitHub API 速率限制
A: 使用认证 Token（5000 请求/小时），或等待限制重置

### Q: 数据不显示
A: 检查 Supabase 表是否创建成功，检查 RLS 策略

---

## 📝 下一步

1. 配置 Vercel Cron Jobs 实现定时收集
2. 添加更多内容源（YouTube, 博客）
3. 实现实时更新（Supabase Realtime）
4. 添加用户反馈系统

---

## 🔗 相关链接

- [Supabase 文档](https://supabase.com/docs)
- [OpenRouter.ai 文档](https://openrouter.ai/docs)
- [GitHub API 文档](https://docs.github.com/rest)
- [Vercel 文档](https://vercel.com/docs)