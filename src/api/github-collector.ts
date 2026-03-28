const GITHUB_API_URL = 'https://api.github.com';

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
  owner: { login: string; avatar_url: string };
}

function getGitHubToken(): string | undefined {
  return import.meta.env.VITE_GITHUB_TOKEN;
}

async function githubFetch<T>(endpoint: string): Promise<T> {
  const token = getGitHubToken();
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ClawSchool/1.0',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

function categorizeRepo(repo: GitHubRepo): string {
  const desc = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();
  const topics = repo.topics.join(' ').toLowerCase();
  const all = `${desc} ${name} ${topics}`;

  if (all.includes('install') || all.includes('setup') || all.includes('getting-started')) return 'installation';
  if (all.includes('security') || all.includes('auth') || all.includes('vulnerability')) return 'security';
  if (all.includes('skill') || all.includes('plugin') || all.includes('extension')) return 'skill-development';
  if (all.includes('agent') || all.includes('bot') || all.includes('automation')) return 'agent-development';
  if (all.includes('tutorial') || all.includes('guide') || all.includes('example')) return 'getting-started';
  if (all.includes('enterprise') || all.includes('production') || all.includes('deploy')) return 'enterprise';

  return 'general';
}

function repoToResource(repo: GitHubRepo) {
  const category = categorizeRepo(repo);
  return {
    title: repo.full_name,
    description: repo.description || `GitHub repository: ${repo.full_name}`,
    url: repo.html_url,
    source: 'github',
    category,
    likes: repo.stargazers_count,
    views: repo.stargazers_count * 5,
    published_at: repo.created_at,
    tags: repo.topics.slice(0, 8)
  };
}

function repoToSkill(repo: GitHubRepo, rank: number) {
  return {
    name: repo.name,
    description: repo.description || '',
    author: repo.owner.login,
    github_url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    downloads: 0,
    issues: repo.open_issues_count,
    last_update: repo.pushed_at,
    trend: 0,
    rank,
    category: categorizeRepo(repo)
  };
}

export async function collectFromGitHub(): Promise<{
  resources: any[];
  skills: any[];
  stats: { total: number; errors: number };
}> {
  const resources: any[] = [];
  const skills: any[] = [];
  let errors = 0;

  const queries = [
    'ai-agent framework stars:>100',
    'llm agent orchestration stars:>50',
    'claude agent automation stars:>30',
    'gpt agent tools stars:>50',
    'autogen OR crewai OR langgraph agent'
  ];

  for (const query of queries) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: '20'
      });

      const data = await githubFetch<{ items: GitHubRepo[] }>(
        `/search/repositories?${searchParams}`
      );

      if (data.items) {
        for (let i = 0; i < data.items.length; i++) {
          const repo = data.items[i];
          try {
            resources.push(repoToResource(repo));
            skills.push(repoToSkill(repo, resources.length));
          } catch {
            errors++;
          }
        }
      }
    } catch (err) {
      console.error(`GitHub search error for "${query}":`, err);
      errors++;
    }
  }

  return {
    resources,
    skills,
    stats: { total: resources.length, errors }
  };
}

export async function getRepository(owner: string, repo: string): Promise<GitHubRepo> {
  return githubFetch(`/repos/${owner}/${repo}`);
}

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