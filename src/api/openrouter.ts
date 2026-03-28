// OpenRouter.ai 集成
// 支持多个 LLM 模型：Claude, GPT-4, Gemini 等

import { LLM_CONFIG, getContentAnalysisModel, getCourseGenerationModel, getRepositoryEvaluationModel } from './llm-config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// 获取 API Key
function getApiKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set');
  }
  return key;
}

// 聊天完成
export async function chatCompletion(
  messages: Message[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = LLM_CONFIG.CHAT,
    temperature = 0.7,
    maxTokens = 4096,
    stream = false
  } = options;

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'ClawSchool'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 流式聊天完成
export async function* streamChatCompletion(
  messages: Message[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string> {
  const {
    model = LLM_CONFIG.CHAT,
    temperature = 0.7,
    maxTokens = 4096
  } = options;

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'ClawSchool'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

// 内容分析：分析资源质量
export async function analyzeResourceQuality(title: string, description: string): Promise<{
  score: number;
  category: string;
  tags: string[];
  summary: string;
}> {
  const config = getContentAnalysisModel();
  
  const prompt = `分析以下 OpenClaw 学习资源的质量和分类：

标题: ${title}
描述: ${description}

请返回 JSON 格式：
{
  "score": 0-100的质量评分,
  "category": "installation|getting-started|skill-development|security|advanced|troubleshooting",
  "tags": ["标签1", "标签2"],
  "summary": "一句话摘要"
}`;

  const response = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { model: config.model, temperature: config.temperature, maxTokens: config.maxTokens }
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 50,
      category: 'getting-started',
      tags: [],
      summary: description.slice(0, 100)
    };
  }
}

// 生成课程大纲
export async function generateCourseOutline(topic: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<{
  title: string;
  description: string;
  lessons: { title: string; description: string }[];
}> {
  const config = getCourseGenerationModel();
  
  const prompt = `为 OpenClaw 生成一个${level}级别的课程大纲：

主题: ${topic}

请返回 JSON 格式：
{
  "title": "课程标题",
  "description": "课程描述",
  "lessons": [
    {"title": "第1课标题", "description": "第1课描述"},
    ...
  ]
}`;

  const response = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { model: config.model, temperature: config.temperature, maxTokens: config.maxTokens }
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      title: topic,
      description: `学习 ${topic}`,
      lessons: [{ title: '入门', description: '基础知识' }]
    };
  }
}

// 评估 GitHub 仓库
export async function evaluateRepository(
  repoName: string,
  readme: string,
  metadata: { stars: number; forks: number; issues: number; language: string }
): Promise<{
  score: number;
  securityCheck: { passed: boolean; issues: string[]; recommendations: string[] };
  codeQuality: { score: number; issues: string[] };
  summary: string;
}> {
  const config = getRepositoryEvaluationModel();
  
  const prompt = `评估以下 GitHub 仓库的质量和安全性：

仓库: ${repoName}
Stars: ${metadata.stars}
Forks: ${metadata.forks}
Issues: ${metadata.issues}
主语言: ${metadata.language}

README 摘要:
${readme.slice(0, 2000)}

请返回 JSON 格式的评估结果：
{
  "score": 0-100的综合评分,
  "securityCheck": {
    "passed": true/false,
    "issues": ["安全问题1", "安全问题2"],
    "recommendations": ["建议1", "建议2"]
  },
  "codeQuality": {
    "score": 0-100,
    "issues": ["代码问题1"]
  },
  "summary": "一句话总结"
}`;

  const response = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { model: config.model, temperature: config.temperature, maxTokens: config.maxTokens }
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 70,
      securityCheck: { passed: true, issues: [], recommendations: [] },
      codeQuality: { score: 70, issues: [] },
      summary: '评估中出现错误'
    };
  }
}

export async function filterResource(title: string, description: string): Promise<{
  isRelevant: boolean;
  relevanceScore: number;
  reason: string;
}> {
  const config = getContentAnalysisModel();
  
  const prompt = `判断以下 GitHub 仓库是否与 AI agent/工具相关。

相关主题包括：
- AI Agent 框架 (OpenClaw, CrewAI, AutoGen, LangGraph, Semantic Kernel)
- AI 代码工具 (OpenCode, Claude, Cursor, Codex, Copilot)
- LLM 应用框架
- AI 自动化工具
- 多 Agent 系统
- AI Skills/Plugins

仓库信息：
标题: ${title}
描述: ${description}

返回 JSON:
{
  "isRelevant": true/false,
  "relevanceScore": 0-100,
  "reason": "判断理由"
}`;

  try {
    const response = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { model: config.model, temperature: 0.2, maxTokens: 500 }
    );
    return JSON.parse(response);
  } catch {
    return { isRelevant: true, relevanceScore: 50, reason: '过滤失败，默认通过' };
  }
}