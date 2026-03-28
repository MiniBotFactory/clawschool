import { supabase, TABLES } from './supabase';

export async function fetchResources(filters?: { source?: string; category?: string; limit?: number }) {
  let query = supabase.from(TABLES.RESOURCES).select('*').order('published_at', { ascending: false });
  if (filters?.source) query = query.eq('source', filters.source);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data } = await query;
  return (data || []).map(r => ({
    id: r.id, title: r.title, description: r.description || '', url: r.url, source: r.source,
    category: r.category || '', likes: r.likes || 0, views: r.views || 0,
    publishedAt: r.published_at?.split('T')[0] || '', tags: r.tags || []
  }));
}

export async function fetchSkills(filters?: { category?: string; sortBy?: string; limit?: number }) {
  let query = supabase.from(TABLES.SKILLS).select('*');
  if (filters?.category) query = query.eq('category', filters.category);
  switch (filters?.sortBy) {
    case 'stars': query = query.order('stars', { ascending: false }); break;
    case 'downloads': query = query.order('downloads', { ascending: false }); break;
    case 'trend': query = query.order('trend', { ascending: false }); break;
    default: query = query.order('rank', { ascending: true });
  }
  if (filters?.limit) query = query.limit(filters.limit);
  const { data } = await query;
  return (data || []).map(s => ({
    id: s.id, name: s.name, description: s.description || '', author: s.author || '',
    githubUrl: s.github_url || '', stars: s.stars || 0, forks: s.forks || 0,
    downloads: s.downloads || 0, issues: s.issues || 0, lastUpdate: s.last_update || '',
    trend: Number(s.trend) || 0, rank: s.rank || 0, category: s.category || ''
  }));
}

export async function fetchCourseSets(filters?: { category?: string }) {
  let query = supabase.from(TABLES.COURSE_SETS).select('*');
  if (filters?.category) query = query.eq('category', filters.category);
  const { data } = await query;
  return (data || []).map(cs => ({
    id: cs.id, title: cs.title, description: cs.description || '', icon: cs.icon || '📚',
    category: cs.category, subscribers: cs.subscribers || 0, courseCount: 0, courses: []
  }));
}

export async function fetchStats() {
  const [r, s, cs, e] = await Promise.all([
    supabase.from(TABLES.RESOURCES).select('*', { count: 'exact', head: true }),
    supabase.from(TABLES.SKILLS).select('*', { count: 'exact', head: true }),
    supabase.from(TABLES.COURSE_SETS).select('*', { count: 'exact', head: true }),
    supabase.from(TABLES.EVALUATIONS).select('*', { count: 'exact', head: true })
  ]);
  return { resources: r.count || 0, skills: s.count || 0, courseSets: cs.count || 0, evaluations: e.count || 0 };
}