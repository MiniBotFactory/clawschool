import type { ApiResponse } from '../types';

// GitHub API 基础配置
const GITHUB_API_BASE = 'https://api.github.com';

// 速率限制处理
let requestCount = 0;
let resetTime = Date.now() + 60 * 60 * 1000; // 1 小时后重置

const checkRateLimit = () => {
  const now = Date.now();
  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 60 * 60 * 1000;
  }
  if (requestCount >= 60) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  requestCount++;
};

// 通用 GitHub API 调用
const githubFetch = async <T>(endpoint: string): Promise<T> => {
  checkRateLimit();
  
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ClawSchool/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// 搜索 OpenClaw 相关仓库
export interface GitHubRepository {
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
  license: {
    key: string;
    name: string;
  } | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export const searchRepositories = async (
  query: string,
  sort: 'stars' | 'forks' | 'updated' = 'stars',
  order: 'desc' | 'asc' = 'desc',
  perPage: number = 30
): Promise<ApiResponse<GitHubRepository[]>> => {
  try {
    const data = await githubFetch<{ items: GitHubRepository[] }>(
      `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=${perPage}`
    );
    
    return {
      success: true,
      data: data.items
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search repositories'
    };
  }
};

// 获取 OpenClaw 相关仓库（特定主题）
export const getOpenClawRepositories = async (perPage: number = 30): Promise<ApiResponse<GitHubRepository[]>> => {
  return searchRepositories('topic:openclaw OR topic:claw-skill OR topic:claw-agent', 'stars', 'desc', perPage);
};

// 获取仓库详情
export const getRepositoryDetails = async (owner: string, repo: string): Promise<ApiResponse<GitHubRepository>> => {
  try {
    const data = await githubFetch<GitHubRepository>(`/repos/${owner}/${repo}`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository details'
    };
  }
};

// 获取仓库 README
export const getRepositoryReadme = async (owner: string, repo: string): Promise<ApiResponse<string>> => {
  try {
    const data = await githubFetch<{ content: string; encoding: string }>(
      `/repos/${owner}/${repo}/readme`
    );
    
    if (data.encoding === 'base64') {
      return {
        success: true,
        data: atob(data.content)
      };
    }
    
    return {
      success: true,
      data: data.content
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository README'
    };
  }
};

// 获取仓库 releases
export const getRepositoryReleases = async (owner: string, repo: string): Promise<ApiResponse<any[]>> => {
  try {
    const data = await githubFetch<any[]>(`/repos/${owner}/${repo}/releases?per_page=5`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository releases'
    };
  }
};

// 获取仓库贡献者
export const getRepositoryContributors = async (owner: string, repo: string): Promise<ApiResponse<any[]>> => {
  try {
    const data = await githubFetch<any[]>(`/repos/${owner}/${repo}/contributors?per_page=10`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository contributors'
    };
  }
};

// 获取仓库语言统计
export const getRepositoryLanguages = async (owner: string, repo: string): Promise<ApiResponse<Record<string, number>>> => {
  try {
    const data = await githubFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository languages'
    };
  }
};

// 获取仓库提交活动
export const getRepositoryCommitActivity = async (owner: string, repo: string): Promise<ApiResponse<any[]>> => {
  try {
    const data = await githubFetch<any[]>(`/repos/${owner}/${repo}/stats/commit_activity`);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository commit activity'
    };
  }
};

// 导出所有函数
export default {
  searchRepositories,
  getOpenClawRepositories,
  getRepositoryDetails,
  getRepositoryReadme,
  getRepositoryReleases,
  getRepositoryContributors,
  getRepositoryLanguages,
  getRepositoryCommitActivity
};