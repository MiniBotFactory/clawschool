// GitHub 内容自动收集服务

import { analyzeResourceQuality } from './openrouter';

const GITHUB_API_URL = 'https://api.github.com';

// 仓库信息
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// 搜索参数
export interface SearchParams {
  query: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'desc' | 'asc';
  perPage?: number;
  page?: number;
}

// 获取 GitHub Token
function getGitHubToken(): string | undefined {
  return import.meta.env.VITE_GITHUB_TOKEN;
}

// GitHub API 请求
async function githubFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getGitHubToken();
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ClawSchool/1.0',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // 检查速率限制
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining === '0') {
    const waitTime = (Number(reset) * 1000) - Date.now();
    console.warn(`GitHub API rate limited. Reset in ${Math.ceil(waitTime / 1000)}s`);
    throw new Error('GitHub API rate limit exceeded');
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 搜索仓库
export async function searchRepositories(params: SearchParams): Promise<{
  items: GitHubRepo[];
  total_count: number;
}> {
  const { query, sort = 'stars', order = 'desc', perPage = 30, page = 1 } = params;
  
  const searchParams = new URLSearchParams({
    q: query,
    sort,
    order,
    per_page: String(perPage),
    page: String(page)
  });

  return githubFetch(`/search/repositories?${searchParams}`);
}

// 搜索 OpenClaw 相关仓库
export async function searchOpenClawRepositories(perPage = 30): Promise<GitHubRepo[]> {
  const result = await searchRepositories({
    query: 'topic:openclaw OR topic:claw-skill OR topic:claw-agent OR "openclaw" in:name,description',
    sort: 'stars',
    order: 'desc',
    perPage
  });
  
  return result.items;
}

// 搜索特定主题的仓库
export async function searchByTopic(topic: string, perPage = 30): Promise<GitHubRepo[]> {
  const result = await searchRepositories({
    query: `topic:${topic}`,
    sort: 'stars',
    order: 'desc',
    perPage
  });
  
  return result.items;
}

// 获取仓库详情
export async function getRepository(owner: string, repo: string): Promise<GitHubRepo> {
  return githubFetch(`/repos/${owner}/${repo}`);
}

// 获取仓库 README
export async function getRepositoryReadme(owner: string, repo: string): Promise<string> {
  try {
    const data = await githubFetch<{ content: string; encoding: string }>(
      `/repos/${owner}/${repo}/readme`
    );
    
    if (data.encoding === 'base64') {
      return atob(data.content);
    }
    
    return data.content;
  } catch {
    return '';
  }
}

// 获取仓库语言统计
export async function getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return githubFetch(`/repos/${owner}/${repo}/languages`);
}

// 获取仓库 releases
export async function getRepositoryReleases(owner: string, repo: string, perPage = 5): Promise<any[]> {
  return githubFetch(`/repos/${owner}/${repo}/releases?per_page=${perPage}`);
}

// 将 GitHub 仓库转换为 Resource 格式
export async function convertRepoToResource(repo: GitHubRepo): Promise<{
  title: string;
  description: string;
  url: string;
  source: 'github';
  category: string;
  tags: string[];
}> {
  // 使用 AI 分析资源质量
  const analysis = await analyzeResourceQuality(
    repo.name,
    repo.description || ''
  );

  return {
    title: repo.full_name,
    description: repo.description || analysis.summary,
    url: repo.html_url,
    source: 'github',
    category: analysis.category,
    tags: [...repo.topics, ...analysis.tags].slice(0, 10)
  };
}

// 批量收集 OpenClaw 资源
export async function collectOpenClawResources(): Promise<{
  resources: any[];
  skills: any[];
  stats: { total: number; new: number; errors: number };
}> {
  const resources: any[] = [];
  const skills: any[] = [];
  let errors = 0;

  try {
    // 搜索 OpenClaw 相关仓库
    const repos = await searchOpenClawRepositories(100);
    
    for (const repo of repos) {
      try {
        // 转换为资源
        const resource = await convertRepoToResource(repo);
        resources.push({
          ...resource,
          likes: repo.stargazers_count,
          views: repo.stargazers_count * 10,
          publishedAt: repo.created_at
        });

        // 如果是 skill 类型，也添加到 skills
        if (repo.topics.includes('claw-skill') || repo.topics.includes('openclaw-skill')) {
          skills.push({
            name: repo.name,
            description: repo.description || '',
            author: repo.owner.login,
            githubUrl: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            downloads: 0, // 需要从 npm API 获取
            issues: repo.open_issues_count,
            lastUpdate: repo.pushed_at,
            trend: 0, // 需要计算
            category: repo.topics.find(t => ['integration', 'core', 'execution', 'search', 'data', 'devops', 'communication', 'automation'].includes(t)) || 'other'
          });
        }

        // 避免触发速率限制
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error processing repo ${repo.full_name}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error('Error collecting resources:', err);
    errors++;
  }

  return {
    resources,
    skills,
    stats: {
      total: resources.length + skills.length,
      new: resources.length + skills.length,
      errors
    }
  };
}

// 获取趋势仓库
export async function getTrendingRepositories(
  language?: string,
  since: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<GitHubRepo[]> {
  // GitHub 没有官方的 trending API，使用搜索模拟
  const date = new Date();
  if (since === 'daily') {
    date.setDate(date.getDate() - 1);
  } else if (since === 'weekly') {
    date.setDate(date.getDate() - 7);
  } else {
    date.setMonth(date.getMonth() - 1);
  }

  const dateStr = date.toISOString().split('T')[0];
  let query = `created:>${dateStr} stars:>10`;
  
  if (language) {
    query += ` language:${language}`;
  }

  const result = await searchRepositories({
    query,
    sort: 'stars',
    order: 'desc',
    perPage: 30
  });

  return result.items;
}