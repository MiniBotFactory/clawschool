import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { courses } from '../data/courses';
import './CourseDetail.css';

const courseContent: Record<string, string> = {
  '1': `# OpenClaw 安装全攻略

## 前置要求

在开始安装 OpenClaw 之前，请确保你的系统满足以下要求：

- **Node.js**: 版本 18.0 或更高
- **包管理器**: npm 或 yarn
- **API Key**: 可选，但推荐获取

## 安装步骤

### 1. 安装 OpenClaw CLI

\`\`\`bash
npm install -g openclaw
\`\`\`

### 2. 初始化项目

\`\`\`bash
openclaw init my-agent
cd my-agent
\`\`\`

### 3. 配置 API Key

编辑 \`openclaw.json\` 文件：

\`\`\`json
{
  "api_key": "your-api-key-here"
}
\`\`\`

### 4. 启动 Agent

\`\`\`bash
openclaw start
\`\`\`

## 常见问题

### Q: 安装失败怎么办？
A: 确保 Node.js 版本正确，尝试清除 npm 缓存。

### Q: 找不到 API Key？
A: 访问 Anthropic 官网获取 API Key。`,
  
  '2': `# 第一个 Agent 快速上手

## 创建你的第一个 Agent

### 1. 使用模板创建

\`\`\`bash
openclaw create agent my-first-agent --template basic
\`\`\`

### 2. 定义 Agent 行为

编辑 \`agent.yaml\`：

\`\`\`yaml
name: my-first-agent
description: 我的第一个 AI 助手
instructions: |
  你是一个有帮助的助手，可以回答问题并完成任务。
\`\`\`

### 3. 运行 Agent

\`\`\`bash
openclaw run my-first-agent
\`\`\`

## 交互示例

你可以通过终端与 Agent 对话，它会帮助你完成各种任务。`,
  
  '3': `# Skill 开发实战指南

## 什么是 Skill？

Skill 是 OpenClaw 的扩展机制，让你为 Agent 添加自定义能力。

## 创建自定义 Skill

### 1. Skill 结构

\`\`\`bash
my-skill/
├── skill.yaml
├── handler.ts
└── README.md
\`\`\`

### 2. 定义 Skill 元数据

\`\`\`yaml
name: my-skill
version: 1.0.0
description: 我的自定义技能
\`\`\`

### 3. 实现处理器

\`\`\`typescript
export async function handle(input: string) {
  // 处理逻辑
  return result;
}
\`\`\`

## 注册 Skill

在 \`openclaw.json\` 中注册：

\`\`\`json
{
  "skills": ["my-skill"]
}
\`\`\``,
};

export default function CourseDetail() {
  const { id } = useParams();
  const course = courses.find(c => c.id === id);
  const [completed, setCompleted] = useState(false);
  
  const content = courseContent[id || '1'] || '# 课程内容\n\ncoming soon...';
  
  if (!course) {
    return (
      <div className="learning">
        <Navbar />
        <div className="container mt-xl">
          <h2>课程未找到</h2>
          <Link to="/learning">返回学习中心</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-detail">
      <Navbar />
      
      <main className="course-detail-main">
        <div className="container">
          <Link to="/learning" className="back-link">← 返回学习中心</Link>
          
          <div className="course-detail-header">
            <div>
              <span className="course-tag">
                {course.category === 'installation' && '📦 安装指南'}
                {course.category === 'basic' && '🔧 基础技能'}
                {course.category === 'advanced' && '🚀 进阶技能'}
              </span>
              <h1>{course.title}</h1>
              <p className="text-gray">{course.description}</p>
            </div>
            <button 
              className={`btn ${completed ? 'btn-success' : 'btn-primary'}`}
              onClick={() => setCompleted(!completed)}
            >
              {completed ? '✅ 已完成' : '标记完成'}
            </button>
          </div>
          
          <div className="course-content">
            <article className="markdown-content">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                if (line.startsWith('```')) return null;
                if (line.trim() === '') return <br key={i} />;
                if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
                return <p key={i}>{line}</p>;
              })}
            </article>
          </div>
          
          <div className="course-nav">
            <span className="text-gray">这是第 {id} 课</span>
          </div>
        </div>
      </main>
    </div>
  );
}