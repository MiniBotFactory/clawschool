-- ClawSchool 数据库 Schema
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 资源表
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT CHECK (source IN ('github', 'youtube', 'blog', 'community')),
  category TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  publishedat TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills 表
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  author TEXT,
  githuburl TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  issues INTEGER DEFAULT 0,
  lastupdate TIMESTAMPTZ,
  trend DECIMAL(5,2) DEFAULT 0,
  rank INTEGER,
  category TEXT,
  license TEXT,
  language TEXT,
  topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, author)
);

-- 3. 课程集表
CREATE TABLE IF NOT EXISTS course_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('beginner', 'intermediate', 'advanced')),
  subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 课程表
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_set_id UUID REFERENCES course_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('installation', 'basic', 'advanced')),
  duration TEXT,
  content TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 用户表 (扩展 Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  courses_completed INTEGER DEFAULT 0,
  resources_liked INTEGER DEFAULT 0,
  resources_collected INTEGER DEFAULT 0,
  evaluations_submitted INTEGER DEFAULT 0,
  course_sets_subscribed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 用户交互表
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'collect', 'subscribe', 'view')),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  course_set_id UUID REFERENCES course_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, resource_id, skill_id, course_set_id)
);

-- 7. 评估表
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  repositoryName TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  submittedAt TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 内容队列表（用于自动收集）
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  metadata JSONB,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 创建索引
CREATE INDEX IF NOT EXISTS idx_resources_source ON resources(source);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_publishedAt ON resources(publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_rank ON skills(rank);
CREATE INDEX IF NOT EXISTS idx_skills_stars ON skills(stars DESC);
CREATE INDEX IF NOT EXISTS idx_course_sets_category ON course_sets(category);
CREATE INDEX IF NOT EXISTS idx_courses_course_set_id ON courses(course_set_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);

-- 10. 创建 RLS 策略
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read resources" ON resources;
DROP POLICY IF EXISTS "Public read skills" ON skills;
DROP POLICY IF EXISTS "Public read course_sets" ON course_sets;
DROP POLICY IF EXISTS "Public read courses" ON courses;
DROP POLICY IF EXISTS "Service can insert resources" ON resources;
DROP POLICY IF EXISTS "Service can insert skills" ON skills;
DROP POLICY IF EXISTS "Service can update skills" ON skills;
DROP POLICY IF EXISTS "Service can insert course_sets" ON course_sets;
DROP POLICY IF EXISTS "Service can insert courses" ON courses;
DROP POLICY IF EXISTS "Public read evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can read own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON evaluations;

CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read course_sets" ON course_sets FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

CREATE POLICY "Service can insert resources" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert skills" ON skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update skills" ON skills FOR UPDATE USING (true);
CREATE POLICY "Service can insert course_sets" ON course_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert courses" ON courses FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read evaluations" ON evaluations FOR SELECT USING (true);

CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own interactions" ON user_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interactions" ON user_interactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can read own evaluations" ON evaluations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own evaluations" ON evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. 创建函数
CREATE OR REPLACE FUNCTION increment_likes(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources SET likes = likes + 1 WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_subscribers(course_set_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_sets SET subscribers = subscribers + 1 WHERE id = course_set_id;
END;
$$ LANGUAGE plpgsql;

-- 12. 创建触发器（自动更新 updated_at）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
DROP TRIGGER IF EXISTS update_course_sets_updated_at ON course_sets;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_course_sets_updated_at BEFORE UPDATE ON course_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== 管理后台表 ====================

-- 13. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'editor')) DEFAULT 'admin',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. 定时任务表
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  schedule TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  status TEXT CHECK (status IN ('idle', 'running', 'failed', 'success')) DEFAULT 'idle',
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理员表索引
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_name ON scheduled_jobs(name);

-- 管理员表 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admins" ON admins;
DROP POLICY IF EXISTS "Super admin can insert" ON admins;
DROP POLICY IF EXISTS "Super admin can update" ON admins;
DROP POLICY IF EXISTS "Super admin can delete" ON admins;
DROP POLICY IF EXISTS "Anyone can read config" ON system_config;
DROP POLICY IF EXISTS "Super admin can update config" ON system_config;
DROP POLICY IF EXISTS "Anyone can read jobs" ON scheduled_jobs;
DROP POLICY IF EXISTS "Super admin can update jobs" ON scheduled_jobs;

CREATE POLICY "Anyone can read admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Super admin can insert" ON admins FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'wmango@hotmail.com');
CREATE POLICY "Super admin can update" ON admins FOR UPDATE USING (auth.jwt() ->> 'email' = 'wmango@hotmail.com');
CREATE POLICY "Super admin can delete" ON admins FOR DELETE USING (auth.jwt() ->> 'email' = 'wmango@hotmail.com');

CREATE POLICY "Anyone can read config" ON system_config FOR SELECT USING (true);
CREATE POLICY "Super admin can update config" ON system_config FOR UPDATE USING (auth.jwt() ->> 'email' = 'wmango@hotmail.com');

CREATE POLICY "Anyone can read jobs" ON scheduled_jobs FOR SELECT USING (true);
CREATE POLICY "Super admin can update jobs" ON scheduled_jobs FOR UPDATE USING (auth.jwt() ->> 'email' = 'wmango@hotmail.com');

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
DROP TRIGGER IF EXISTS update_system_config_updated_at ON system_config;
DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON scheduled_jobs;

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scheduled_jobs_updated_at BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 16. 插入默认管理员
INSERT INTO admins (email, name, role) VALUES ('wmango@hotmail.com', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 17. 插入默认系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('llm_model', 'google/gemini-2.0-flash-exp:free', '默认 LLM 模型'),
  ('content_analysis_model', 'google/gemini-2.0-flash-exp:free', '内容分析模型'),
  ('course_generation_model', 'anthropic/claude-3.5-sonnet', '课程生成模型'),
  ('repository_evaluation_model', 'anthropic/claude-3.5-sonnet', '仓库评估模型'),
  ('chat_model', 'openai/gpt-4o-mini', '聊天对话模型'),
  ('github_search_query', 'topic:openclaw OR topic:claw-skill', 'GitHub 搜索查询'),
  ('github_search_limit', '100', 'GitHub 搜索结果数量限制'),
  ('auto_collect_enabled', 'true', '启用自动收集'),
  ('auto_course_generation', 'true', '启用自动课程生成')
ON CONFLICT (key) DO NOTHING;

-- 18. 插入默认定时任务
INSERT INTO scheduled_jobs (name, description, schedule) VALUES
  ('collect_github', '从 GitHub 收集 OpenClaw 相关仓库和 Skill', '0 */6 * * *'),
  ('generate_courses', '基于热门资源自动生成课程', '0 3 * * *'),
  ('update_rankings', '更新 Skill 排行榜', '0 * * * *')
ON CONFLICT (name) DO NOTHING;

-- 19. 执行日志表
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  status TEXT CHECK (status IN ('running', 'success', 'failed')) NOT NULL,
  message TEXT,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_execution_logs_action ON execution_logs(action);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created_at ON execution_logs(created_at DESC);

ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read logs" ON execution_logs;
DROP POLICY IF EXISTS "Service can insert logs" ON execution_logs;

CREATE POLICY "Anyone can read logs" ON execution_logs FOR SELECT USING (true);
CREATE POLICY "Service can insert logs" ON execution_logs FOR INSERT WITH CHECK (true);