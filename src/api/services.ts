// API 服务层
// 提供统一的 API 接口给前端使用

import { supabase, TABLES } from './supabase';
import { chatCompletion, analyzeResourceQuality, generateCourseOutline, evaluateRepository } from './openrouter';
import { LLM_CONFIG } from './llm-config';
import { collectOpenClawResources, getRepository, getRepositoryReadme } from './github-collector';

// ==================== 资源 API ====================

export const resourcesApi = {
  // 获取所有资源
  async getAll(filters?: { source?: string; category?: string; limit?: number }) {
    let query = supabase
      .from(TABLES.RESOURCES)
      .select('*')
      .order('publishedAt', { ascending: false });

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // 获取单个资源
  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.RESOURCES)
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // 创建资源
  async create(resource: any) {
    const { data, error } = await supabase
      .from(TABLES.RESOURCES)
      .insert(resource)
      .select()
      .single();
    return { data, error };
  },

  // 批量创建资源
  async bulkCreate(resources: any[]) {
    const { data, error } = await supabase
      .from(TABLES.RESOURCES)
      .insert(resources)
      .select();
    return { data, error };
  },

  // 点赞资源
  async like(id: string) {
    const { data, error } = await supabase.rpc('increment_likes', { resource_id: id });
    return { data, error };
  }
};

// ==================== Skills API ====================

export const skillsApi = {
  // 获取所有 skills
  async getAll(filters?: { category?: string; sortBy?: string; limit?: number }) {
    let query = supabase
      .from(TABLES.SKILLS)
      .select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    // 排序
    switch (filters?.sortBy) {
      case 'stars':
        query = query.order('stars', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads', { ascending: false });
        break;
      case 'trend':
        query = query.order('trend', { ascending: false });
        break;
      default:
        query = query.order('rank', { ascending: true });
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // 创建 skill
  async create(skill: any) {
    const { data, error } = await supabase
      .from(TABLES.SKILLS)
      .insert(skill)
      .select()
      .single();
    return { data, error };
  },

  // 批量更新 skills
  async bulkUpdate(skills: any[]) {
    const { data, error } = await supabase
      .from(TABLES.SKILLS)
      .upsert(skills, { onConflict: 'name' })
      .select();
    return { data, error };
  }
};

// ==================== 课程集 API ====================

export const courseSetsApi = {
  // 获取所有课程集
  async getAll(filters?: { category?: string }) {
    let query = supabase
      .from(TABLES.COURSE_SETS)
      .select('*, courses(*)');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // 获取单个课程集
  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.COURSE_SETS)
      .select('*, courses(*)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // 创建课程集
  async create(courseSet: any) {
    const { data, error } = await supabase
      .from(TABLES.COURSE_SETS)
      .insert(courseSet)
      .select()
      .single();
    return { data, error };
  },

  // 订阅课程集
  async subscribe(id: string) {
    const { data, error } = await supabase.rpc('increment_subscribers', { course_set_id: id });
    return { data, error };
  }
};

// ==================== 评估 API ====================

export const evaluationsApi = {
  // 提交评估
  async submit(url: string) {
    // 解析 GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return { data: null, error: 'Invalid GitHub URL' };
    }

    const [, owner, repo] = match;

    try {
      // 获取仓库信息
      const repoData = await getRepository(owner, repo);
      const readme = await getRepositoryReadme(owner, repo);

      // 使用 AI 评估
      const evaluation = await evaluateRepository(
        `${owner}/${repo}`,
        readme,
        {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          issues: repoData.open_issues_count,
          language: repoData.language || 'Unknown'
        }
      );

      // 保存到数据库
      const { data, error } = await supabase
        .from(TABLES.EVALUATIONS)
        .insert({
          url,
          repositoryName: `${owner}/${repo}`,
          status: 'completed',
          result: evaluation
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      // 保存失败状态
      const { data, error } = await supabase
        .from(TABLES.EVALUATIONS)
        .insert({
          url,
          repositoryName: `${owner}/${repo}`,
          status: 'failed',
          result: { error: String(err) }
        })
        .select()
        .single();

      return { data, error };
    }
  },

  // 获取用户的评估历史
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.EVALUATIONS)
      .select('*')
      .eq('user_id', userId)
      .order('submittedAt', { ascending: false });
    return { data, error };
  }
};

// ==================== 内容收集 API ====================

export const collectionApi = {
  // 手动触发内容收集
  async collectFromGitHub() {
    try {
      const result = await collectOpenClawResources();

      // 保存资源到数据库
      if (result.resources.length > 0) {
        await resourcesApi.bulkCreate(result.resources);
      }

      // 保存 skills 到数据库
      if (result.skills.length > 0) {
        await skillsApi.bulkUpdate(result.skills);
      }

      return { success: true, stats: result.stats };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // 生成课程
  async generateCourse(topic: string, level: 'beginner' | 'intermediate' | 'advanced') {
    try {
      const outline = await generateCourseOutline(topic, level);

      // 创建课程集
      const { data, error } = await courseSetsApi.create({
        title: outline.title,
        description: outline.description,
        icon: level === 'beginner' ? '🚀' : level === 'intermediate' ? '🔧' : '🛡️',
        category: level,
        courses: outline.lessons.map((lesson, index) => ({
          id: `${topic}-${index}`,
          title: lesson.title,
          description: lesson.description,
          order: index
        }))
      });

      return { data, error };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }
};

// ==================== AI API ====================

export const aiApi = {
  // 聊天
  async chat(message: string, model?: string) {
    try {
      const response = await chatCompletion(
        [{ role: 'user', content: message }],
        { model: model || LLM_CONFIG.CHAT }
      );
      return { success: true, response };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // 分析资源
  async analyzeResource(title: string, description: string) {
    try {
      const analysis = await analyzeResourceQuality(title, description);
      return { success: true, analysis };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
};