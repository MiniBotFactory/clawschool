# 🦞 ClawSchool

**OpenClaw 一站式学习 & 评估平台**

聚合全网优质学习资源，发现最热门 Skill，系统化学习 Claw 技能。

## ✨ 功能特色

### 📚 资源聚合
- 从 GitHub、YouTube、博客、社区聚合 OpenClaw 学习资源
- 按来源、分类筛选
- 用户点赞/收藏功能

### 📖 课程集
- 系统化课程系列（入门/进阶/高级）
- 可订阅课程系列
- 学习进度追踪

### 🏆 Skill 排行榜
- 多维度排名（Stars/下载/趋势）
- 支持筛选和排序
- 实时数据更新

### 🛡️ 安全评估
- 提交 Claw 进行安全评估
- 多维度分析（安全/代码质量/依赖）
- 详细的评估报告

### 👤 用户系统
- 注册/登录
- 收藏/订阅管理
- 评估记录查看

## 🚀 快速开始

### 安装依赖

```bash
cd mvp
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: React Router v6
- **样式**: CSS (CSS Variables)
- **状态管理**: React Context + Hooks
- **数据持久化**: localStorage
- **API**: GitHub REST API

## 📁 项目结构

```
mvp/
├── src/
│   ├── api/              # API 层
│   │   ├── github.ts     # GitHub API 集成
│   │   └── storage.ts    # 本地存储 API
│   ├── components/       # 公共组件
│   │   ├── Navbar.tsx    # 导航栏
│   │   └── Navbar.css
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx
│   ├── data/             # 静态数据
│   │   ├── content.ts    # 资源、课程集、Skill 数据
│   │   └── courses.ts    # 课程数据
│   ├── hooks/            # 自定义 Hooks
│   │   └── useUserData.ts
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页
│   │   ├── Resources.tsx # 资源聚合
│   │   ├── CourseSets.tsx # 课程集
│   │   ├── Skills.tsx    # Skill 排行
│   │   ├── Evaluation.tsx # 评估
│   │   ├── User.tsx      # 用户中心
│   │   └── ...
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx           # 应用入口
│   ├── main.tsx          # 主入口
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json           # Vercel 配置
```

## 🎨 设计规范

### 颜色系统
- **主色**: #0D47A1 (深海蓝)
- **次色**: #1E88E5 (科技蓝)
- **强调色**: #00BFA5 (青绿)
- **警告色**: #FF6D00 (橙)
- **错误色**: #D32F2F (红)

### 字体系统
- **标题字体**: JetBrains Mono
- **正文字体**: Inter
- **代码字体**: Fira Code

## 📊 数据与埋点

### 核心事件
- `user_register`: 用户注册
- `resource_view`: 查看资源
- `resource_like`: 点赞资源
- `resource_collect`: 收藏资源
- `course_subscribe`: 订阅课程
- `skill_view`: 查看 Skill
- `evaluation_submit`: 提交评估

## 🚢 部署

### Vercel 部署

1. Fork 或克隆此仓库
2. 在 Vercel 中导入项目
3. 配置构建设置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 部署

### GitHub Pages 部署

1. 修改 `vite.config.ts` 中的 `base` 为你的仓库名
2. 运行 `npm run build`
3. 将 `dist` 目录部署到 `gh-pages` 分支

## 📝 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/pages/` 创建对应的 CSS 文件
3. 在 `src/App.tsx` 添加路由
4. 在 `src/components/Navbar.tsx` 添加导航链接

### 添加新功能

1. 在 `src/types/index.ts` 定义类型
2. 在 `src/api/` 实现 API 逻辑
3. 在 `src/hooks/` 创建自定义 Hook
4. 在页面组件中使用

### 数据持久化

项目使用 `localStorage` 进行数据持久化，所有数据存储在浏览器中。

存储键名：
- `clawschool_user`: 用户信息
- `clawschool_auth_token`: 认证令牌
- `clawschool_progress`: 学习进度
- `clawschool_interactions`: 用户交互（点赞/收藏）
- `clawschool_evaluations`: 评估记录

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**ClawSchool** - 让 OpenClaw 学习更简单 🦞