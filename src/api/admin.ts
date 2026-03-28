import { supabase, TABLES } from './supabase';
import { checkPermission } from './admin-auth';
import { collectFromGitHub } from './github-collector';
import { collectFromAllSources, discoverNewSources } from './content-collector';
import { generateCourseOutline, filterResource } from './openrouter';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'idle' | 'running' | 'failed' | 'success';
}

export const systemConfigApi = {
  async getAll(): Promise<SystemConfig[]> {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching config:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      key: item.key,
      value: item.value,
      description: item.description,
      updatedAt: item.updated_at
    }));
  },

  async get(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value;
  },

  async update(key: string, value: string): Promise<{ success: boolean; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限修改配置' };
    }

    const { error } = await supabase
      .from('system_config')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async bulkUpdate(configs: { key: string; value: string }[]): Promise<{ success: boolean; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限修改配置' };
    }

    const updates = configs.map(config => ({
      key: config.key,
      value: config.value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('system_config')
      .upsert(updates);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
};

export const jobSchedulerApi = {
  async getAll(): Promise<ScheduledJob[]> {
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data.map(job => ({
      id: job.id,
      name: job.name,
      description: job.description,
      schedule: job.schedule,
      enabled: job.enabled,
      lastRun: job.last_run,
      nextRun: job.next_run,
      status: job.status
    }));
  },

  async update(jobId: string, updates: Partial<ScheduledJob>): Promise<{ success: boolean; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限修改 Job' };
    }

    const { error } = await supabase
      .from('scheduled_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async toggle(jobId: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    return this.update(jobId, { enabled });
  },

  async trigger(jobId: string): Promise<{ success: boolean; error?: string; result?: any }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限触发 Job' };
    }

    const { data: job, error: fetchError } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: 'Job 不存在' };
    }

    await supabase
      .from('scheduled_jobs')
      .update({ status: 'running', last_run: new Date().toISOString() })
      .eq('id', jobId);

    try {
      let result;

      switch (job.name) {
        case 'collect_github':
          result = await collectFromGitHubJob();
          break;
        case 'generate_courses':
          result = await generateCoursesJob();
          break;
        case 'update_rankings':
          result = await updateRankingsJob();
          break;
        default:
          throw new Error(`未知的 Job 类型: ${job.name}`);
      }

      await supabase
        .from('scheduled_jobs')
        .update({ status: 'success' })
        .eq('id', jobId);

      return { success: true, result };
    } catch (err) {
      await supabase
        .from('scheduled_jobs')
        .update({ status: 'failed' })
        .eq('id', jobId);

      return { success: false, error: String(err) };
    }
  }
};

export const contentCollectionApi = {
  async collectGitHub(): Promise<{ success: boolean; stats?: any; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限执行内容收集' };
    }

    try {
      const result = await collectFromGitHub();
      let filteredResources = result.resources;
      let filteredSkills = result.skills;
      let filteredCount = 0;

      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (apiKey && result.resources.length > 0) {
        const relevantResources: typeof result.resources = [];
        const relevantSkills: typeof result.skills = [];

        for (let i = 0; i < result.resources.length; i++) {
          const resource = result.resources[i];
          try {
            const filter = await filterResource(resource.title, resource.description);
            if (filter.isRelevant && filter.relevanceScore >= 50) {
              relevantResources.push(resource);
              if (result.skills[i]) {
                relevantSkills.push(result.skills[i]);
              }
            } else {
              filteredCount++;
            }
          } catch {
            relevantResources.push(resource);
            if (result.skills[i]) {
              relevantSkills.push(result.skills[i]);
            }
          }
        }

        filteredResources = relevantResources;
        filteredSkills = relevantSkills;
      }

      if (filteredResources.length > 0) {
        const { error: resErr } = await supabase
          .from(TABLES.RESOURCES)
          .upsert(filteredResources, { onConflict: 'url' });
        if (resErr) throw new Error(`Resources upsert: ${resErr.message}`);
      }

      if (filteredSkills.length > 0) {
        const { error: skillErr } = await supabase
          .from(TABLES.SKILLS)
          .upsert(filteredSkills, { onConflict: 'name,author' });
        if (skillErr) throw new Error(`Skills upsert: ${skillErr.message}`);
      }

      return {
        success: true,
        stats: {
          total: filteredResources.length,
          filtered: filteredCount,
          errors: result.stats.errors
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async collectAllSources(): Promise<{ success: boolean; stats?: any; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限执行内容收集' };
    }

    try {
      const result = await collectFromAllSources();

      return {
        success: true,
        stats: {
          total: result.resources.length,
          github: result.stats.github,
          youtube: result.stats.youtube,
          blog: result.stats.blog,
          community: result.stats.community
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async discoverSources(): Promise<{ success: boolean; sources?: any[]; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限发现新源' };
    }

    try {
      const sources = await discoverNewSources();
      return { success: true, sources };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async generateCourses(): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限执行课程生成' };
    }

    try {
      const count = await generateCoursesJob();
      return { success: true, count };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async updateRankings(): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!(await checkPermission('write'))) {
      return { success: false, error: '没有权限执行排名更新' };
    }

    try {
      const count = await updateRankingsJob();
      return { success: true, count };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
};

async function collectFromGitHubJob() {
  const result = await collectFromGitHub();

  if (result.resources.length > 0) {
    await supabase
      .from(TABLES.RESOURCES)
      .upsert(result.resources, { onConflict: 'url' });
  }

  if (result.skills.length > 0) {
    await supabase
      .from(TABLES.SKILLS)
      .upsert(result.skills, { onConflict: 'name,author' });
  }

  return result.stats;
}

async function generateCoursesJob(): Promise<number> {
  const { data: resources } = await supabase
    .from(TABLES.RESOURCES)
    .select('*')
    .order('likes', { ascending: false })
    .limit(10);

  if (!resources || resources.length === 0) return 0;

  let count = 0;

  for (const resource of resources) {
    const { data: existing } = await supabase
      .from(TABLES.COURSE_SETS)
      .select('*')
      .ilike('title', `%${resource.title}%`)
      .single();

    if (existing) continue;

    const outline = await generateCourseOutline(resource.title, 'beginner');

    await supabase
      .from(TABLES.COURSE_SETS)
      .insert({
        title: outline.title,
        description: outline.description,
        icon: '📚',
        category: 'beginner'
      });

    count++;
  }

  return count;
}

async function updateRankingsJob(): Promise<number> {
  const { data: skills } = await supabase
    .from(TABLES.SKILLS)
    .select('*')
    .order('stars', { ascending: false });

  if (!skills || skills.length === 0) return 0;

  for (let i = 0; i < skills.length; i++) {
    await supabase
      .from(TABLES.SKILLS)
      .update({ rank: i + 1 })
      .eq('id', skills[i].id);
  }

  return skills.length;
}