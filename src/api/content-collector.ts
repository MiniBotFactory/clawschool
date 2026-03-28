import { supabase } from './supabase';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  thumbnails: { default: { url: string } };
}

interface BlogPost {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface CommunityPost {
  title: string;
  description: string;
  url: string;
  source: string;
  score: number;
  created: string;
}

function isRelevantToOpenClaw(text: string): boolean {
  const keywords = ['openclaw', 'open claw', 'claw-skill', 'claw skill', 'opencode', 'open code'];
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

export const youtubeCollector = {
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) return [];

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: `${query} openclaw`,
        type: 'video',
        maxResults: String(maxResults),
        key: apiKey
      });

      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
      const data = await response.json();

      if (!data.items) return [];

      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails
      }));
    } catch {
      return [];
    }
  },

  toResource(video: YouTubeVideo) {
    return {
      title: video.title,
      description: video.description.slice(0, 500),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      source: 'youtube',
      category: 'video',
      likes: 0,
      views: 0,
      publishedat: video.publishedAt,
      tags: ['video', 'tutorial']
    };
  }
};

export const blogCollector = {
  async fetchRSS(feedUrl: string): Promise<BlogPost[]> {
    try {
      const response = await fetch(feedUrl);
      const text = await response.text();

      const posts: BlogPost[] = [];
      const titleMatches = text.matchAll(/<title>(.*?)<\/title>/gs);
      const descMatches = text.matchAll(/<description>(.*?)<\/description>/gs);
      const linkMatches = text.matchAll(/<link>(.*?)<\/link>/gs);

      const titles = [...titleMatches].map(m => m[1]);
      const descs = [...descMatches].map(m => m[1]);
      const links = [...linkMatches].map(m => m[1]);

      for (let i = 0; i < Math.min(titles.length, 10); i++) {
        posts.push({
          title: titles[i] || '',
          description: descs[i] || '',
          url: links[i] || '',
          publishedAt: new Date().toISOString(),
          source: feedUrl
        });
      }

      return posts;
    } catch {
      return [];
    }
  },

  toResource(post: BlogPost) {
    return {
      title: post.title,
      description: post.description.slice(0, 500),
      url: post.url,
      source: 'blog',
      category: 'article',
      likes: 0,
      views: 0,
      publishedat: post.publishedAt,
      tags: ['blog', 'article']
    };
  }
};

export const communityCollector = {
  async fetchReddit(subreddit: string, query: string): Promise<CommunityPost[]> {
    try {
      const params = new URLSearchParams({
        q: `${query} openclaw`,
        restrict_sr: 'on',
        sort: 'relevance',
        limit: '10'
      });

      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?${params}`
      );
      const data = await response.json();

      if (!data.data?.children) return [];

      return data.data.children.map((child: any) => ({
        title: child.data.title,
        description: child.data.selftext?.slice(0, 500) || '',
        url: `https://reddit.com${child.data.permalink}`,
        source: `reddit/r/${subreddit}`,
        score: child.data.score,
        created: new Date(child.data.created_utc * 1000).toISOString()
      }));
    } catch {
      return [];
    }
  },

  toResource(post: CommunityPost) {
    return {
      title: post.title,
      description: post.description.slice(0, 500),
      url: post.url,
      source: 'community',
      category: 'discussion',
      likes: post.score,
      views: 0,
      publishedat: post.created,
      tags: ['community', 'discussion']
    };
  }
};

export async function collectFromAllSources(): Promise<{
  resources: any[];
  stats: { github: number; youtube: number; blog: number; community: number };
}> {
  const resources: any[] = [];
  const stats = { github: 0, youtube: 0, blog: 0, community: 0 };

  let { data: sources } = await supabase
    .from('content_sources')
    .select('*')
    .eq('enabled', true);

  if (!sources || sources.length === 0) {
    sources = [
      { source_type: 'github', search_query: 'openclaw skill' },
      { source_type: 'github', search_query: 'claw-skill' },
      { source_type: 'github', search_query: 'claw-plugin' },
      { source_type: 'community', url: 'subreddit:openclaw', search_query: 'openclaw' }
    ];
  }

  for (const source of sources) {
    try {
      let items: any[] = [];

      switch (source.source_type) {
        case 'github':
          const searchParams = new URLSearchParams({
            q: `${source.search_query || 'openclaw'} stars:>10`,
            sort: 'stars',
            order: 'desc',
            per_page: '10'
          });
          const ghResponse = await fetch(`https://api.github.com/search/repositories?${searchParams}`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
          });
          const ghData = await ghResponse.json();
          if (ghData.items) {
            items = ghData.items.map((repo: any) => ({
              title: repo.full_name,
              description: repo.description || '',
              url: repo.html_url,
              source: 'github',
              category: 'general',
              likes: repo.stargazers_count,
              views: repo.stargazers_count * 5,
              publishedat: repo.created_at,
              tags: repo.topics || []
            }));
          }
          stats.github += items.length;
          break;

        case 'youtube':
          const videos = await youtubeCollector.searchVideos(source.search_query || 'openclaw');
          items = videos.filter(v => isRelevantToOpenClaw(`${v.title} ${v.description}`))
                       .map(v => youtubeCollector.toResource(v));
          stats.youtube += items.length;
          break;

        case 'rss':
          if (source.url) {
            const posts = await blogCollector.fetchRSS(source.url);
            items = posts.filter(p => isRelevantToOpenClaw(`${p.title} ${p.description}`))
                        .map(p => blogCollector.toResource(p));
            stats.blog += items.length;
          }
          break;

        case 'community':
          if (source.url) {
            const redditPosts = await communityCollector.fetchReddit(
              source.url.replace('subreddit:', ''),
              source.search_query || 'openclaw'
            );
            items = redditPosts.filter(p => isRelevantToOpenClaw(`${p.title} ${p.description}`))
                              .map(p => communityCollector.toResource(p));
            stats.community += items.length;
          }
          break;
      }

      if (items.length > 0) {
        const { error } = await supabase.from('resources').upsert(items, { onConflict: 'url' });
        if (error) {
          console.error(`Error upserting items from ${source.source_type}:`, error);
        }
      }

      resources.push(...items);
    } catch (err) {
      console.error(`Error collecting from ${source.source_type}:`, err);
    }
  }

  return { resources, stats };
}

export async function discoverNewSources(): Promise<any[]> {
  const discovered: any[] = [];

  const { data: keywords } = await supabase
    .from('openclaw_keywords')
    .select('*')
    .eq('category', 'core');

  if (!keywords) return discovered;

  for (const kw of keywords) {
    try {
      const params = new URLSearchParams({
        q: `${kw.keyword} blog OR tutorial OR guide`,
        sort: 'updated',
        order: 'desc',
        per_page: '5'
      });

      const response = await fetch(`https://api.github.com/search/repositories?${params}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      const data = await response.json();

      if (data.items) {
        for (const repo of data.items) {
          if (repo.homepage && repo.homepage.startsWith('http')) {
            discovered.push({
              name: repo.full_name,
              source_type: 'blog',
              url: repo.homepage,
              description: repo.description,
              search_query: kw.keyword
            });
          }
        }
      }
    } catch {
      continue;
    }
  }

  return discovered;
}