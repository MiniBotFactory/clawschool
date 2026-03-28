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

function calculateTrend(repo: GitHubRepo): number {
  const now = new Date();
  const pushed = new Date(repo.pushed_at);
  const daysSinceUpdate = (now.getTime() - pushed.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 7) return 25;
  if (daysSinceUpdate < 30) return 15;
  if (daysSinceUpdate < 90) return 5;
  return 0;
}

function isSkillRepo(repo: GitHubRepo): boolean {
  const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
  return (
    text.includes('skill') ||
    text.includes('plugin') ||
    text.includes('extension') ||
    text.includes('tool') ||
    repo.topics.some(t => ['skill', 'plugin', 'extension', 'tool'].includes(t))
  );
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
    publishedat: repo.created_at,
    tags: repo.topics.slice(0, 8)
  };
}

function repoToSkill(repo: GitHubRepo, rank: number) {
  return {
    name: repo.name,
    description: repo.description || '',
    author: repo.owner.login,
    githuburl: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    downloads: repo.stargazers_count,
    issues: repo.open_issues_count,
    lastupdate: repo.pushed_at,
    trend: calculateTrend(repo),
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
  const seenResources = new Set<string>();
  const seenSkills = new Set<string>();
  let errors = 0;

  const resourceQueries = [
    'ai-agent framework',
    'llm agent',
    'autonomous agent',
    'ai assistant framework',
    'chatbot framework',
    'langchain',
    'autogen',
    'crewai',
    'semantic-kernel',
    'multi-agent'
  ];

  const skillQueries = [
    'openclaw skill',
    'claw-skill',
    'ai-agent plugin',
    'llm-tool extension',
    'langchain tool',
    'crewai tool',
    'autogen tool'
  ];

  for (const query of resourceQueries) {
    try {
      const searchParams = new URLSearchParams({
        q: `${query} stars:>100`,
        sort: 'stars',
        order: 'desc',
        per_page: '10'
      });

      const data = await githubFetch<{ items: GitHubRepo[] }>(
        `/search/repositories?${searchParams}`
      );

      if (data.items) {
        for (const repo of data.items) {
          if (seenResources.has(repo.html_url)) continue;
          seenResources.add(repo.html_url);
          try {
            resources.push(repoToResource(repo));
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

  for (const query of skillQueries) {
    try {
      const searchParams = new URLSearchParams({
        q: `${query} stars:>10`,
        sort: 'stars',
        order: 'desc',
        per_page: '10'
      });

      const data = await githubFetch<{ items: GitHubRepo[] }>(
        `/search/repositories?${searchParams}`
      );

      if (data.items) {
        for (const repo of data.items) {
          if (seenSkills.has(repo.html_url)) continue;
          if (!isSkillRepo(repo)) continue;
          seenSkills.add(repo.html_url);
          try {
            skills.push(repoToSkill(repo, skills.length + 1));
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
    stats: { total: resources.length + skills.length, errors }
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